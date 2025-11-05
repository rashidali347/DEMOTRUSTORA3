import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { Mining } from './components/Mining';
import { Wallet } from './components/Wallet';
import { Team } from './components/Team';
import { Profile } from './components/Profile';
import { Navigation } from './components/Navigation';
import { DailyCheckIn } from './components/DailyCheckIn';
import { Toaster } from './components/ui/sonner';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

export type Page = 'home' | 'mining' | 'wallet' | 'team' | 'profile';

export interface UserData {
  userId: string;
  email: string;
  username: string;
  trustPoints: number;
  tsrBalance: number;
  miningRate: number;
  referralCode: string;
  referrals: number;
  totalEarned: number;
  joinDate: string;
  walletAddress: string;
  privateKey: string;
  kycCompleted: boolean;
  lastCheckIn: string | null;
  checkInStreak: number;
  miningStartTime: number | null;
  miningEndTime: number | null;
  isMining: boolean;
  kycData?: any;
}

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [session, setSession] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        initializeUser(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        initializeUser(session.access_token);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeUser = async (accessToken: string) => {
    try {
      // Initialize user if first time
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/init-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Check for referral code in URL
      const params = new URLSearchParams(window.location.search);
      const referralCode = params.get('ref');
      if (referralCode) {
        // Apply referral code
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/use-referral`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ referralCode: referralCode.toUpperCase() }),
        });
        
        // Clear referral code from URL
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Fetch user data
      await fetchUserData(accessToken);
    } catch (error) {
      console.error('Error initializing user:', error);
      setLoading(false);
    }
  };

  const fetchUserData = async (accessToken?: string) => {
    try {
      const token = accessToken || session?.access_token;
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setUserData(result.data);
        checkDailyCheckIn(result.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const checkDailyCheckIn = (data: UserData) => {
    if (!data.lastCheckIn) {
      setShowCheckIn(true);
      return;
    }

    const lastCheckIn = new Date(data.lastCheckIn);
    const today = new Date();
    const isSameDay = lastCheckIn.getDate() === today.getDate() &&
                     lastCheckIn.getMonth() === today.getMonth() &&
                     lastCheckIn.getFullYear() === today.getFullYear();

    if (!isSameDay) {
      setShowCheckIn(true);
    }
  };

  // Auto-convert Trust to TSR when reaching 20 Trust
  useEffect(() => {
    if (userData && userData.trustPoints >= 20) {
      const tsrToAdd = Math.floor(userData.trustPoints / 20);
      const remainingTrust = userData.trustPoints % 20;
      
      const updatedData = {
        ...userData,
        tsrBalance: userData.tsrBalance + tsrToAdd,
        trustPoints: remainingTrust,
      };
      
      setUserData(updatedData);
      
      // Update on server
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
    }
  }, [userData?.trustPoints]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Trustora...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Initializing your account...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home userData={userData} onNavigate={setCurrentPage} refreshData={() => fetchUserData()} />;
      case 'mining':
        return <Mining userData={userData} setUserData={setUserData} session={session} refreshData={() => fetchUserData()} />;
      case 'wallet':
        return <Wallet userData={userData} session={session} refreshData={() => fetchUserData()} />;
      case 'team':
        return <Team userData={userData} session={session} refreshData={() => fetchUserData()} />;
      case 'profile':
        return <Profile userData={userData} setUserData={setUserData} session={session} refreshData={() => fetchUserData()} />;
      default:
        return <Home userData={userData} onNavigate={setCurrentPage} refreshData={() => fetchUserData()} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md mx-auto min-h-screen bg-slate-900 shadow-2xl relative pb-20">
        {renderPage()}
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        <Toaster />
        
        {showCheckIn && (
          <DailyCheckIn 
            userData={userData}
            session={session}
            onClose={() => setShowCheckIn(false)}
            onCheckIn={() => fetchUserData()}
          />
        )}
      </div>
    </div>
  );
}
