import { useState } from 'react';
import { X, Gift, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import type { UserData } from '../App';
import { projectId } from '../utils/supabase/info';

interface DailyCheckInProps {
  userData: UserData;
  session: any;
  onClose: () => void;
  onCheckIn: () => void;
}

export function DailyCheckIn({ userData, session, onClose, onCheckIn }: DailyCheckInProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const rewards = [3, 5, 7, 10, 13, 16, 20];
  const currentDay = userData.checkInStreak % 7;

  const handleCheckIn = async () => {
    setClaiming(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-50951e45/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setClaimed(true);
        toast.success(`Daily check-in successful! +${result.reward} Trust`);
        onCheckIn();
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <Card className="bg-slate-800 border-slate-700 p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl text-white mb-2">Daily Check-In</h2>
          <p className="text-slate-400">Check in daily for 7 days to earn bonus Trust!</p>
        </div>

        {/* Weekly Progress */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {rewards.map((reward, index) => {
            const isCompleted = index < currentDay;
            const isCurrent = index === currentDay;
            
            return (
              <div
                key={index}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 ${
                  isCompleted
                    ? 'bg-green-600'
                    : isCurrent
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-slate-700'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white mb-1" />
                ) : (
                  <span className="text-xs text-white mb-1">Day {index + 1}</span>
                )}
                <span className="text-xs text-white">{reward}</span>
              </div>
            );
          })}
        </div>

        {/* Current Reward */}
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-lg p-4 mb-6">
          <p className="text-amber-200 text-sm text-center mb-2">Today's Reward</p>
          <p className="text-3xl text-white text-center">+{rewards[currentDay]} Trust</p>
        </div>

        {/* Streak Info */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm text-center">
            Current Streak: <span className="text-amber-400">{userData.checkInStreak} days</span>
          </p>
        </div>

        {/* Check In Button */}
        <Button
          onClick={handleCheckIn}
          disabled={claiming || claimed}
          className={`w-full ${
            claimed
              ? 'bg-green-600 hover:bg-green-600'
              : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {claiming ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Checking In...
            </div>
          ) : claimed ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Checked In!
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 mr-2" />
              Check In Now
            </>
          )}
        </Button>

        <p className="text-slate-500 text-xs text-center mt-4">
          Come back tomorrow to continue your streak!
        </p>
      </Card>
    </div>
  );
}
