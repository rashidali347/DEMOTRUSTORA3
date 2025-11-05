import { useState, useEffect } from 'react';
import { Zap, Trophy, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import type { UserData } from '../App';
import { projectId } from '../utils/supabase/info';
import logoImage from 'figma:asset/b0a59305518defb1f7d865f6ef70ea53d1f4706f.png';

interface MiningProps {
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  session: any;
  refreshData: () => void;
}

export function Mining({ userData, setUserData, session, refreshData }: MiningProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progress, setProgress] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (userData.isMining && userData.miningEndTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = userData.miningEndTime - now;
        
        if (remaining <= 0) {
          setTimeRemaining('00:00:00');
          setProgress(100);
          setCanClaim(true);
          clearInterval(interval);
        } else {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          
          setTimeRemaining(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
          
          const totalDuration = 24 * 60 * 60 * 1000; // 24 hours
          const elapsed = totalDuration - remaining;
          setProgress((elapsed / totalDuration) * 100);
          setCanClaim(false);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining('');
      setProgress(0);
      setCanClaim(false);
    }
  }, [userData.isMining, userData.miningEndTime]);

  const handleStartMining = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/start-mining`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Mining started! Come back in 24 hours to claim your rewards.');
        refreshData();
      } else {
        toast.error(result.error || 'Failed to start mining');
      }
    } catch (error) {
      console.error('Start mining error:', error);
      toast.error('Failed to start mining. Please try again.');
    }
  };

  const handleClaimRewards = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/claim-mining`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Claimed ${result.reward.toFixed(2)} Trust!`);
        refreshData();
      } else {
        toast.error(result.error || 'Failed to claim rewards');
      }
    } catch (error) {
      console.error('Claim mining error:', error);
      toast.error('Failed to claim rewards. Please try again.');
    }
  };

  const miningStats = [
    { label: 'Total Earned', value: `${userData.totalEarned.toFixed(2)} Trust` },
    { label: 'Current Balance', value: `${userData.trustPoints.toFixed(2)} Trust` },
    { label: 'Mining Rate', value: `${userData.miningRate}/hr` },
  ];

  const expectedReward = userData.miningRate * 24;

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl mb-2">Mine Trust</h1>
        <p className="text-slate-400">Start mining to earn Trust points</p>
      </div>

      {/* Current Balance */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="text-center">
          <p className="text-slate-400 mb-2">Current Balance</p>
          <h2 className="text-4xl text-amber-400 mb-1">{userData.trustPoints.toFixed(2)}</h2>
          <p className="text-slate-400">Trust Points</p>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm">TSR Balance</p>
            <p className="text-xl text-white">{userData.tsrBalance.toFixed(6)} $TSR</p>
          </div>
        </div>
      </Card>

      {/* Mining Interface */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8 mb-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className={`relative ${userData.isMining ? 'animate-pulse' : ''}`}>
              <div className={`w-48 h-48 rounded-full flex items-center justify-center ${
                userData.isMining 
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/50' 
                  : 'bg-slate-700'
              }`}>
                <img src={logoImage} alt="Trustora" className="w-32 h-32" />
              </div>
            </div>
            
            {userData.isMining && (
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 animate-ping" />
            )}
          </div>

          {userData.isMining && (
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-slate-400 text-sm">Time Remaining</span>
              </div>
              <p className="text-3xl text-white mb-4">{timeRemaining}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {userData.isMining && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Mining Progress</span>
                <span className="text-amber-400">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-slate-700">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </Progress>
              <p className="text-slate-400 text-sm mt-2 text-center">
                Expected reward: {expectedReward.toFixed(2)} Trust
              </p>
            </div>
          )}

          {!userData.isMining ? (
            <Button
              onClick={handleStartMining}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start 24-Hour Mining
            </Button>
          ) : canClaim ? (
            <Button
              onClick={handleClaimRewards}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Claim {expectedReward.toFixed(2)} Trust
            </Button>
          ) : (
            <div className="bg-slate-700 text-slate-300 rounded-lg p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p>Mining in progress...</p>
              <p className="text-sm text-slate-400 mt-1">Come back when the timer ends to claim</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {miningStats.map((stat, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700 p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
            <p className="text-white text-sm">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50 p-4">
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white mb-1">Mining Tips</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Mining runs for 24 hours automatically</li>
              <li>• Invite friends to increase your mining rate by 0.5/hr each</li>
              <li>• 20 Trust points = 1 $TSR token</li>
              <li>• Check in daily for bonus Trust rewards</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
