import { useState, useEffect } from 'react';
import { Users, Copy, Check, UserPlus, Gift, TrendingUp, Share2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import type { UserData } from '../App';
import { projectId } from '../utils/supabase/info';

interface TeamProps {
  userData: UserData;
  session: any;
  refreshData: () => void;
}

interface TeamMember {
  username: string;
  totalEarned: number;
  joinDate: string;
  isMining: boolean;
}

export function Team({ userData, session, refreshData }: TeamProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [applying, setApplying] = useState(false);

  const referralLink = `${window.location.origin}?ref=${userData.referralCode}`;

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/team`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setTeamMembers(result.team);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Trustora Network',
        text: `Join me on Trustora and start mining $TSR tokens! Use my referral code: ${userData.referralCode}`,
        url: referralLink,
      }).catch(() => {
        copyReferralCode();
      });
    } else {
      copyReferralCode();
    }
  };

  const handleApplyReferral = async () => {
    if (!referralCodeInput.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setApplying(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/use-referral`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode: referralCodeInput.trim().toUpperCase(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Referral code applied successfully!');
        setShowReferralDialog(false);
        setReferralCodeInput('');
        refreshData();
      } else {
        toast.error(result.error || 'Invalid referral code');
      }
    } catch (error) {
      console.error('Apply referral error:', error);
      toast.error('Failed to apply referral code. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const totalTeamEarnings = teamMembers.reduce((sum, member) => sum + member.totalEarned, 0);
  const activeMembers = teamMembers.filter(m => m.isMining).length;

  const nextMilestone = 20;
  const milestoneProgress = (userData.referrals / nextMilestone) * 100;

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-white text-2xl">My Team</h1>
          <p className="text-slate-400 text-sm">Grow your network</p>
        </div>
      </div>

      {/* Referral Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-6 h-6 text-white" />
          <h3 className="text-white">Your Referral Code</h3>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <p className="text-blue-100 text-sm mb-2">Referral Code</p>
          <p className="text-white text-2xl mb-3">{userData.referralCode}</p>
          
          <div className="bg-white/10 rounded p-2 mb-3">
            <code className="text-white text-sm break-all">{referralLink}</code>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={copyReferralCode}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white"
            >
              {copiedCode ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copiedCode ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={shareReferral}
              className="flex-1 bg-white hover:bg-white/90 text-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <p className="text-blue-100 text-sm">
            • Earn 10% of your referrals' mining rewards<br />
            • Get +0.5 Trust/hour mining rate per referral
          </p>
        </div>

        <Button
          onClick={() => setShowReferralDialog(true)}
          variant="outline"
          className="w-full border-white/30 text-white hover:bg-white/10"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Enter Referral Code
        </Button>
      </Card>

      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-slate-800 border-slate-700 p-4 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl text-white mb-1">{userData.referrals}</p>
          <p className="text-slate-400 text-xs">Total Team</p>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4 text-center">
          <div className="w-5 h-5 rounded-full bg-green-500 mx-auto mb-2" />
          <p className="text-2xl text-white mb-1">{activeMembers}</p>
          <p className="text-slate-400 text-xs">Active</p>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <p className="text-2xl text-white mb-1">{totalTeamEarnings.toFixed(0)}</p>
          <p className="text-slate-400 text-xs">Team Trust</p>
        </Card>
      </div>

      {/* Milestone Progress */}
      <Card className="bg-slate-800 border-slate-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white">Next Milestone</h3>
          <span className="text-amber-400">{userData.referrals}/{nextMilestone}</span>
        </div>
        <Progress value={milestoneProgress} className="h-2 mb-2" />
        <p className="text-slate-400 text-sm">
          Invite {nextMilestone - userData.referrals} more friends to unlock bonus mining rate!
        </p>
      </Card>

      {/* Team Members List */}
      <div className="mb-6">
        <h3 className="text-white mb-3">Team Members ({teamMembers.length})</h3>
        {teamMembers.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 mb-2">No team members yet</p>
            <p className="text-slate-500 text-sm">Start inviting friends to build your team!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500">
                    <AvatarFallback className="bg-transparent text-white">
                      {member.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white">{member.username}</h4>
                      {member.isMining && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">
                      Joined {new Date(member.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-amber-400">{member.totalEarned.toFixed(1)} Trust</p>
                    <p className="text-slate-400 text-sm">+{(member.totalEarned * 0.1).toFixed(1)} bonus</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rewards Info */}
      <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-700/50 p-4">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white mb-1">Referral Rewards</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Each referral increases your mining rate by 0.5 Trust/hour</li>
              <li>• Earn 10% of your direct referrals' mining rewards</li>
              <li>• Unlock exclusive bonuses with team milestones</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Apply Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Enter Referral Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="referralCode" className="text-white">Referral Code</Label>
              <Input
                id="referralCode"
                placeholder="TSR123456"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
              <p className="text-slate-400 text-sm mt-2">
                Enter the referral code from someone who invited you
              </p>
            </div>
            <Button
              onClick={handleApplyReferral}
              disabled={applying}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {applying ? 'Applying...' : 'Apply Referral Code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
