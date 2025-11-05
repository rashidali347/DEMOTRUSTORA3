# Trustora Network

A fully functional cryptocurrency earning platform similar to Pi Network, Bee Network, and Sidra Chain. Mine Trust points, convert them to $TSR tokens, and build your network.

![Trustora Logo](figma:asset/b0a59305518defb1f7d865f6ef70ea53d1f4706f.png)

## 🚀 Features

### ✅ Authentication System
- **Email/Password Sign Up & Sign In**
- **Google OAuth Integration** (requires Supabase configuration)
- **2 TSR Signup Bonus** - Automatically credited on registration
- **Secure session management**

### ✅ Daily Check-In System
- **7-Day Weekly Cycle** with progressive rewards:
  - Day 1: 3 Trust
  - Day 2: 5 Trust
  - Day 3: 7 Trust
  - Day 4: 10 Trust
  - Day 5: 13 Trust
  - Day 6: 16 Trust
  - Day 7: 20 Trust
- **Streak Tracking** - Maintains your consecutive check-in count
- **Auto Reset** - Resets if you miss a day

### ✅ Mining System
- **24-Hour Mining Cycles** - Set it and forget it
- **Real-Time Countdown** - Live timer showing time remaining
- **Progress Bar** - Visual indicator of mining progress
- **Auto-Hide Controls** - Mining runs automatically for 24 hours
- **Claim Rewards** - Collect your Trust when mining completes
- **Dynamic Mining Rate** - Increases with referrals

### ✅ Wallet System
- **Unique Wallet Address** - MetaMask-style hexadecimal addresses
- **Secure Private Key** - Encrypted storage with show/hide toggle
- **Send TSR** - Transfer tokens to other wallet addresses
- **Receive TSR** - Share your address to receive tokens
- **Transaction History** - Complete log of all transactions
- **Auto-Conversion** - 20 Trust points = 1 $TSR token

### ✅ Referral System
- **Unique Referral Codes** - Each user gets a unique code
- **10% Earnings Bonus** - Earn 10% of your referrals' mining rewards
- **Mining Rate Boost** - +0.5 Trust/hour per referral
- **Team Tracking** - See all your team members and their activity
- **Easy Sharing** - Native share API with fallback to copy
- **URL-Based Referrals** - Share links with ?ref=CODE parameter

### ✅ KYC Verification
- **Complete KYC Process** - Submit personal information
- **Verified Badge** - Get verification badge after KYC approval
- **Secure Data Storage** - Encrypted storage of sensitive information
- **Required for Full Access** - Some features require verification

### ✅ Profile & Settings
- **User Profile** - Complete profile with stats
- **Achievement System** - Unlock achievements based on activity
- **Account Settings** - Manage notifications and preferences
- **Security Settings** - Change password, view private key
- **Privacy Controls** - Manage your data and privacy

## 🔧 Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Database**: Key-Value Store with Supabase
- **Real-Time**: Automatic data synchronization

## 📱 Pages

1. **Home** - Dashboard with balance, stats, and quick actions
2. **Mining** - 24-hour mining interface with countdown
3. **Wallet** - Manage TSR tokens, send/receive, view transactions
4. **Team** - Referral system, team members, rewards
5. **Profile** - User info, KYC, settings, security

## 🎯 How It Works

### 1. Sign Up
- Create account with email or Google
- Receive 2 TSR tokens automatically
- Optional: Use a referral code for bonuses

### 2. Daily Check-In
- Check in daily for 7 days
- Earn progressive Trust rewards
- Build your streak for maximum rewards

### 3. Start Mining
- Click "Start Mining" button
- Mining runs automatically for 24 hours
- Come back to claim your rewards

### 4. Invite Friends
- Share your unique referral code
- Each referral increases your mining rate by 0.5 Trust/hour
- Earn 10% of your referrals' mining rewards

### 5. Manage Your Wallet
- View your TSR and Trust balances
- Send TSR to other users
- Receive TSR from others
- Track all transactions

### 6. Complete KYC
- Submit your personal information
- Get verified badge
- Unlock full platform features

## 🔐 Security Features

- **Encrypted Private Keys** - Secure storage
- **Secure Authentication** - JWT token-based
- **Password Protection** - Minimum 6 characters
- **Private Key Toggle** - Show/hide sensitive data
- **Transaction Verification** - All transfers verified

## 📊 Conversion System

- **20 Trust = 1 TSR** (automatic conversion)
- Mining rewards in Trust points
- Convert to TSR automatically when balance reaches 20 Trust

## 🎁 Referral Rewards

- **Direct Referrals**: Earn 10% of their mining rewards
- **Mining Rate Boost**: +0.5 Trust/hour per referral
- **Team Milestones**: Unlock bonuses at 20, 50, 100 referrals

## ⚙️ Setup Required

### Google OAuth (Optional but Recommended)

To enable Google Sign-In:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Follow the setup guide: [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
5. Add your Google OAuth credentials

**Note**: Email/password authentication works without additional setup!

## 💡 Tips for Users

1. **Check in daily** - Don't break your streak!
2. **Invite friends** - Boost your mining rate
3. **Complete KYC** - Get verified badge
4. **Secure your private key** - Never share it
5. **Mine regularly** - Start new mining cycles promptly

## 📈 Future Enhancements

- Staking system for TSR tokens
- NFT marketplace
- Multi-level referral rewards
- Mobile app version
- Exchange integration
- Advanced analytics dashboard

## 🛠️ Development

All user data is stored securely in Supabase and synced in real-time across devices. The application uses a serverless architecture with edge functions for optimal performance.

## 📝 License

© 2024 Trustora Network. All rights reserved.

---

**Trustora** - Mine Trust, Earn $TSR, Build Your Network 🚀
