import { useState } from 'react';
import { Camera, Mail, Calendar, Shield, Settings, LogOut, Award, ChevronRight, User, Lock, Bell, Eye, EyeOff } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import type { UserData } from '../App';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from 'figma:asset/b0a59305518defb1f7d865f6ef70ea53d1f4706f.png';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface ProfileProps {
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  session: any;
  refreshData: () => void;
}

export function Profile({ userData, setUserData, session, refreshData }: ProfileProps) {
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // KYC Form
  const [kycData, setKycData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    idNumber: '',
  });
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailUpdates: false,
    miningAlerts: true,
  });

  // Security
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const accountAge = Math.floor((Date.now() - new Date(userData.joinDate).getTime()) / (1000 * 60 * 60 * 24));

  const achievements = [
    { id: 1, name: 'First Mine', icon: '⛏️', unlocked: true },
    { id: 2, name: 'Team Builder', icon: '👥', unlocked: userData.referrals > 0 },
    { id: 3, name: '100 Trust', icon: '💎', unlocked: userData.totalEarned >= 100 },
    { id: 4, name: '10 Referrals', icon: '🎯', unlocked: userData.referrals >= 10 },
    { id: 5, name: 'Early Adopter', icon: '🚀', unlocked: true },
    { id: 6, name: '1000 Trust', icon: '👑', unlocked: userData.totalEarned >= 1000 },
  ];

  const handleKycSubmit = async () => {
    if (!kycData.fullName || !kycData.dateOfBirth || !kycData.address || !kycData.idNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmittingKyc(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/kyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kycData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('KYC submitted successfully! You are now verified.');
        setShowKycDialog(false);
        refreshData();
      } else {
        toast.error(result.error || 'Failed to submit KYC');
      }
    } catch (error) {
      console.error('KYC error:', error);
      toast.error('Failed to submit KYC. Please try again.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setShowSecurityDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Logged out successfully');
  };

  const copyPrivateKey = () => {
    navigator.clipboard.writeText(userData.privateKey);
    toast.success('Private key copied! Keep it safe!');
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600">
              <AvatarFallback className="bg-transparent text-white text-2xl">
                {userData.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-800">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="text-white text-xl mb-1">{userData.username}</h2>
            <p className="text-slate-400 text-sm mb-2">{userData.email}</p>
            <Badge className={`${
              userData.kycCompleted 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            }`}>
              <Award className="w-3 h-3 mr-1" />
              {userData.kycCompleted ? 'Verified Miner' : 'Unverified'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl text-white mb-1">{accountAge}</p>
            <p className="text-slate-400 text-xs">Days Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-white mb-1">{userData.totalEarned.toFixed(0)}</p>
            <p className="text-slate-400 text-xs">Total Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-white mb-1">{achievements.filter(a => a.unlocked).length}</p>
            <p className="text-slate-400 text-xs">Achievements</p>
          </div>
        </div>
      </Card>

      {/* KYC Verification */}
      {!userData.kycCompleted && (
        <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-700/50 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white mb-1">Complete KYC Verification</h4>
              <p className="text-amber-200 text-sm">Get verified badge and unlock all features</p>
            </div>
            <Button
              onClick={() => setShowKycDialog(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Verify
            </Button>
          </div>
        </Card>
      )}

      {/* Account Info */}
      <div className="mb-6">
        <h3 className="text-white mb-3">Account Information</h3>
        <Card className="bg-slate-800 border-slate-700 divide-y divide-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-sm">Email</p>
              <p className="text-white">{userData.email}</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-sm">Member Since</p>
              <p className="text-white">{new Date(userData.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-sm">Referral Code</p>
              <p className="text-white">{userData.referralCode}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h3 className="text-white mb-3">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-4 text-center ${
                achievement.unlocked
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-slate-900 border-slate-800 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className="text-white text-xs">{achievement.name}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 mb-6">
        <h3 className="text-white mb-3">Settings</h3>
        
        <Card 
          onClick={() => setShowSettingsDialog(true)}
          className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-400" />
              <span className="text-white">Account Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </Card>

        <Card 
          onClick={() => setShowSecurityDialog(true)}
          className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-white">Security & Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </Card>
      </div>

      {/* Logout Button */}
      <Button 
        onClick={handleLogout}
        variant="outline" 
        className="w-full border-red-700 text-red-400 hover:bg-red-950 hover:text-red-300"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      {/* App Info */}
      <div className="mt-6 text-center">
        <img src={logoImage} alt="Trustora" className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-slate-500 text-sm">Trustora Network v1.0.0</p>
        <p className="text-slate-600 text-xs mt-1">© 2024 Trustora. All rights reserved.</p>
      </div>

      {/* KYC Dialog */}
      <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                value={kycData.fullName}
                onChange={(e) => setKycData({ ...kycData, fullName: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white mt-2"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="dob" className="text-white">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={kycData.dateOfBirth}
                onChange={(e) => setKycData({ ...kycData, dateOfBirth: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-white">Address</Label>
              <Input
                id="address"
                value={kycData.address}
                onChange={(e) => setKycData({ ...kycData, address: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white mt-2"
                placeholder="123 Main St, City, Country"
              />
            </div>
            <div>
              <Label htmlFor="idNumber" className="text-white">ID Number</Label>
              <Input
                id="idNumber"
                value={kycData.idNumber}
                onChange={(e) => setKycData({ ...kycData, idNumber: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white mt-2"
                placeholder="ID or Passport Number"
              />
            </div>
            <Button
              onClick={handleKycSubmit}
              disabled={submittingKyc}
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              {submittingKyc ? 'Submitting...' : 'Submit KYC'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Account Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="text-white">Push Notifications</span>
              </div>
              <Switch 
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, pushNotifications: checked });
                  toast.success(`Push notifications ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-white">Email Updates</span>
              </div>
              <Switch 
                checked={settings.emailUpdates}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, emailUpdates: checked });
                  toast.success(`Email updates ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-slate-400" />
                <span className="text-white">Mining Alerts</span>
              </div>
              <Switch 
                checked={settings.miningAlerts}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, miningAlerts: checked });
                  toast.success(`Mining alerts ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Security & Privacy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Private Key */}
            <div>
              <Label className="text-white mb-2 block">Private Key</Label>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Your Private Key</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    {showPrivateKey && (
                      <Button
                        onClick={copyPrivateKey}
                        variant="ghost"
                        size="sm"
                        className="text-amber-400 h-auto p-1"
                      >
                        <Award className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <code className="text-white text-xs break-all block">
                  {showPrivateKey ? userData.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </code>
                <p className="text-red-400 text-xs mt-2">⚠️ Never share your private key!</p>
              </div>
            </div>

            {/* Change Password */}
            <div>
              <Label className="text-white mb-2 block">Change Password</Label>
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
