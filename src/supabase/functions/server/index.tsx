import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify user
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', user: null };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Unauthorized', user: null };
  }
  
  return { error: null, user };
}

// Initialize user data on signup
app.post('/make-server-50951e45/init-user', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const existingData = await kv.get(`user:${user!.id}`);
    if (existingData) {
      return c.json({ message: 'User already initialized', data: existingData });
    }

    // Generate unique wallet address and private key
    const walletAddress = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
    
    const privateKey = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();

    const referralCode = 'TSR' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const userData = {
      userId: user!.id,
      email: user!.email,
      username: user!.user_metadata?.name || user!.email?.split('@')[0] || 'User' + Math.floor(Math.random() * 10000),
      trustPoints: 0,
      tsrBalance: 2.0, // 2 TSR signup bonus
      miningRate: 1.0,
      referralCode,
      referrals: 0,
      totalEarned: 0,
      joinDate: new Date().toISOString(),
      walletAddress,
      privateKey,
      kycCompleted: false,
      lastCheckIn: null,
      checkInStreak: 0,
      miningStartTime: null,
      miningEndTime: null,
      isMining: false,
    };

    await kv.set(`user:${user!.id}`, userData);
    await kv.set(`wallet:${walletAddress}`, user!.id);
    await kv.set(`referral:${referralCode}`, user!.id);

    return c.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error initializing user:', error);
    return c.json({ error: 'Failed to initialize user' }, 500);
  }
});

// Get user data
app.get('/make-server-50951e45/user', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const userData = await kv.get(`user:${user!.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if mining completed
    if (userData.isMining && userData.miningEndTime) {
      const now = Date.now();
      if (now >= userData.miningEndTime) {
        userData.isMining = false;
        userData.miningStartTime = null;
        userData.miningEndTime = null;
        await kv.set(`user:${user!.id}`, userData);
      }
    }

    return c.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
});

// Update user data
app.put('/make-server-50951e45/user', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const updates = await c.req.json();
    const userData = await kv.get(`user:${user!.id}`);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedData = { ...userData, ...updates };
    await kv.set(`user:${user!.id}`, updatedData);

    return c.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user data' }, 500);
  }
});

// Daily check-in
app.post('/make-server-50951e45/checkin', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const userData = await kv.get(`user:${user!.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const now = new Date();
    const lastCheckIn = userData.lastCheckIn ? new Date(userData.lastCheckIn) : null;
    
    // Check if already checked in today
    if (lastCheckIn) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDay = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
      
      if (today.getTime() === lastDay.getTime()) {
        return c.json({ error: 'Already checked in today' }, 400);
      }
    }

    const rewards = [3, 5, 7, 10, 13, 16, 20];
    let currentStreak = userData.checkInStreak || 0;
    
    // Check if streak should continue or reset
    if (lastCheckIn) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
      
      if (yesterdayDate.getTime() !== lastDate.getTime()) {
        currentStreak = 0; // Reset streak if missed a day
      }
    }

    const dayIndex = currentStreak % 7;
    const reward = rewards[dayIndex];
    
    userData.trustPoints += reward;
    userData.totalEarned += reward;
    userData.lastCheckIn = now.toISOString();
    userData.checkInStreak = currentStreak + 1;

    await kv.set(`user:${user!.id}`, userData);

    return c.json({ 
      success: true, 
      reward,
      streak: userData.checkInStreak,
      nextReward: rewards[(userData.checkInStreak) % 7]
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    return c.json({ error: 'Failed to check in' }, 500);
  }
});

// Start mining
app.post('/make-server-50951e45/start-mining', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const userData = await kv.get(`user:${user!.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (userData.isMining) {
      return c.json({ error: 'Already mining' }, 400);
    }

    const now = Date.now();
    const endTime = now + (24 * 60 * 60 * 1000); // 24 hours

    userData.isMining = true;
    userData.miningStartTime = now;
    userData.miningEndTime = endTime;

    await kv.set(`user:${user!.id}`, userData);

    return c.json({ 
      success: true,
      miningStartTime: now,
      miningEndTime: endTime
    });
  } catch (error) {
    console.error('Error starting mining:', error);
    return c.json({ error: 'Failed to start mining' }, 500);
  }
});

// Claim mining rewards
app.post('/make-server-50951e45/claim-mining', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const userData = await kv.get(`user:${user!.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (!userData.isMining || !userData.miningEndTime) {
      return c.json({ error: 'Not mining' }, 400);
    }

    const now = Date.now();
    if (now < userData.miningEndTime) {
      return c.json({ error: 'Mining not complete yet' }, 400);
    }

    const reward = userData.miningRate * 24; // 24 hours of mining
    userData.trustPoints += reward;
    userData.totalEarned += reward;
    userData.isMining = false;
    userData.miningStartTime = null;
    userData.miningEndTime = null;

    await kv.set(`user:${user!.id}`, userData);

    return c.json({ success: true, reward });
  } catch (error) {
    console.error('Error claiming mining:', error);
    return c.json({ error: 'Failed to claim mining rewards' }, 500);
  }
});

// Use referral code
app.post('/make-server-50951e45/use-referral', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const { referralCode } = await c.req.json();
    const referrerId = await kv.get(`referral:${referralCode}`);
    
    if (!referrerId) {
      return c.json({ error: 'Invalid referral code' }, 400);
    }

    if (referrerId === user!.id) {
      return c.json({ error: 'Cannot use your own referral code' }, 400);
    }

    const userData = await kv.get(`user:${user!.id}`);
    const referrerData = await kv.get(`user:${referrerId}`);

    if (!userData || !referrerData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Increase referrer's mining rate
    referrerData.referrals += 1;
    referrerData.miningRate += 0.5;

    await kv.set(`user:${referrerId}`, referrerData);
    await kv.set(`referral:${user!.id}:referrer`, referrerId);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error using referral:', error);
    return c.json({ error: 'Failed to use referral code' }, 500);
  }
});

// Get referral team
app.get('/make-server-50951e45/team', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const referrals = await kv.getByPrefix(`referral:`) as Array<{ key: string; value: any }>;
    const teamMembers = referrals
      .filter(r => r.value === user!.id && r.key.endsWith(':referrer'))
      .map(r => r.key.split(':')[1]);

    const team = [];
    for (const memberId of teamMembers) {
      const memberData = await kv.get(`user:${memberId}`);
      if (memberData) {
        team.push({
          username: memberData.username,
          totalEarned: memberData.totalEarned,
          joinDate: memberData.joinDate,
          isMining: memberData.isMining,
        });
      }
    }

    return c.json({ success: true, team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return c.json({ error: 'Failed to fetch team' }, 500);
  }
});

// Send TSR
app.post('/make-server-50951e45/send-tsr', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const { toAddress, amount } = await c.req.json();
    
    if (!toAddress || !amount || amount <= 0) {
      return c.json({ error: 'Invalid parameters' }, 400);
    }

    const senderData = await kv.get(`user:${user!.id}`);
    const recipientId = await kv.get(`wallet:${toAddress}`);

    if (!senderData) {
      return c.json({ error: 'Sender not found' }, 404);
    }

    if (!recipientId) {
      return c.json({ error: 'Recipient wallet not found' }, 404);
    }

    if (senderData.tsrBalance < amount) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    const recipientData = await kv.get(`user:${recipientId}`);
    if (!recipientData) {
      return c.json({ error: 'Recipient not found' }, 404);
    }

    // Update balances
    senderData.tsrBalance -= amount;
    recipientData.tsrBalance += amount;

    await kv.set(`user:${user!.id}`, senderData);
    await kv.set(`user:${recipientId}`, recipientData);

    // Create transaction records
    const txId = crypto.randomUUID();
    const transaction = {
      id: txId,
      from: user!.id,
      to: recipientId,
      amount,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    await kv.set(`tx:${txId}`, transaction);
    await kv.set(`tx:user:${user!.id}:${txId}`, transaction);
    await kv.set(`tx:user:${recipientId}:${txId}`, transaction);

    return c.json({ success: true, transactionId: txId });
  } catch (error) {
    console.error('Error sending TSR:', error);
    return c.json({ error: 'Failed to send TSR' }, 500);
  }
});

// Get transactions
app.get('/make-server-50951e45/transactions', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const txRecords = await kv.getByPrefix(`tx:user:${user!.id}:`) as Array<{ key: string; value: any }>;
    const transactions = txRecords.map(r => r.value);

    return c.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

// Update KYC status
app.post('/make-server-50951e45/kyc', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) return c.json({ error }, 401);

    const { fullName, dateOfBirth, address, idNumber } = await c.req.json();
    
    const userData = await kv.get(`user:${user!.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    userData.kycCompleted = true;
    userData.kycData = {
      fullName,
      dateOfBirth,
      address,
      idNumber,
      verifiedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user!.id}`, userData);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating KYC:', error);
    return c.json({ error: 'Failed to update KYC' }, 500);
  }
});

Deno.serve(app.fetch);
