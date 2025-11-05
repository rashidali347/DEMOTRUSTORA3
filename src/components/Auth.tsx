import { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from 'figma:asset/b0a59305518defb1f7d865f6ef70ea53d1f4706f.png';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Check for referral code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      setIsSignUp(true); // Auto-switch to sign up if there's a referral code
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (error) throw error;
        
        if (data.user) {
          // Auto sign in after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          
          if (signInError) throw signInError;
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoImage} alt="Trustora" className="w-20 h-20 mx-auto mb-4 rounded-full" />
          <h1 className="text-3xl text-white mb-2">Trustora</h1>
          <p className="text-slate-400">Mine Trust, Earn $TSR</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-950 border-red-800 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="name" className="text-white mb-2 block">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              isSignUp ? 'Sign Up & Get 2 TSR Free' : 'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full border-slate-600 text-white hover:bg-slate-700"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Toggle Sign Up/Sign In */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-amber-400 hover:text-amber-300 text-sm"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Bonus Info */}
        {isSignUp && (
          <div className="mt-6 space-y-3">
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-lg p-4">
              <p className="text-amber-200 text-sm text-center">
                🎁 Get 2 TSR tokens free when you sign up!
              </p>
            </div>
            {referralCode && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-4">
                <p className="text-blue-200 text-sm text-center">
                  ✨ Referred by: <span className="text-white">{referralCode}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
