# Trustora Network - Setup Instructions

## Google OAuth Setup (Required for Google Sign-In)

To enable Google Sign-In functionality, you need to configure Google OAuth in your Supabase project:

1. **Go to Supabase Dashboard**: Navigate to your project dashboard at https://supabase.com/dashboard
2. **Authentication Settings**: Go to Authentication > Providers
3. **Enable Google Provider**: 
   - Toggle on "Google"
   - Follow the setup guide at: https://supabase.com/docs/guides/auth/social-login/auth-google
4. **Get Google OAuth Credentials**:
   - Visit Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs from Supabase
5. **Save Configuration**: Enter your Google Client ID and Secret in Supabase

## Features Overview

### Authentication
- ✅ Email/Password Sign Up and Sign In
- ✅ Google OAuth Sign In (requires setup above)
- ✅ 2 TSR signup bonus automatically credited

### Daily Check-In System
- ✅ 7-day weekly cycle with increasing rewards
- ✅ Day 1: 3 Trust, Day 2: 5 Trust, Day 3: 7 Trust, Day 4: 10 Trust, Day 5: 13 Trust, Day 6: 16 Trust, Day 7: 20 Trust
- ✅ Streak tracking
- ✅ Auto-reset if a day is missed

### Mining System
- ✅ 24-hour mining cycles
- ✅ Real-time countdown timer with progress bar
- ✅ Auto-hide stop button (mining runs for full 24 hours)
- ✅ Claim rewards when mining completes
- ✅ Mining rate increases with referrals (+0.5 Trust/hour per referral)

### Wallet System
- ✅ Unique wallet address (similar to MetaMask)
- ✅ Secure private key storage
- ✅ Show/hide private key toggle
- ✅ Send and receive TSR functionality
- ✅ Transaction history
- ✅ Auto-conversion: 20 Trust = 1 TSR

### Referral System
- ✅ Unique referral codes
- ✅ 10% bonus from direct referrals' earnings
- ✅ +0.5 Trust/hour mining rate increase per referral
- ✅ Team member tracking
- ✅ Share via native share API or copy link

### Profile & KYC
- ✅ Complete user profile
- ✅ KYC verification system
- ✅ Verified badge only after KYC completion
- ✅ Achievement tracking
- ✅ Account settings (notifications, email, mining alerts)
- ✅ Security & privacy settings
- ✅ Password change functionality
- ✅ Private key management

### Data Accuracy
- ✅ All user data stored in Supabase backend
- ✅ Real-time synchronization
- ✅ Persistent data across sessions
- ✅ Accurate transaction logs
- ✅ Secure authentication tokens

## Usage

1. **Sign Up**: Create an account with email or Google
2. **Get Bonus**: Receive 2 TSR automatically on signup
3. **Daily Check-In**: Check in daily to earn Trust points
4. **Start Mining**: Begin 24-hour mining cycle
5. **Invite Friends**: Share your referral code to increase mining rate
6. **Manage Wallet**: Send/receive TSR, view transaction history
7. **Complete KYC**: Get verified badge and unlock all features

## Technical Details

- **Frontend**: React with TypeScript
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Database**: PostgreSQL with key-value storage
- **Authentication**: Supabase Auth with email and OAuth
- **Real-time Updates**: Automatic data synchronization
- **Security**: Private keys encrypted, secure token-based auth

## Support

For issues or questions, please check the application logs in the browser console.
