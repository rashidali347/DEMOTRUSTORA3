import { ArrowRight, TrendingUp, Users, Award, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import type { UserData, Page } from '../App';
import logoImage from 'figma:asset/b0a59305518defb1f7d865f6ef70ea53d1f4706f.png';

interface HomeProps {
  userData: UserData;
  onNavigate: (page: Page) => void;
  refreshData: () => void;
}

export function Home({ userData, onNavigate, refreshData }: HomeProps) {
  const stats = [
    { label: 'Total Earned', value: `${userData.totalEarned.toFixed(1)} Trust`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Team Size', value: userData.referrals, icon: Users, color: 'text-blue-400' },
    { label: 'Mining Rate', value: `${userData.miningRate}/hr`, icon: Zap, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-400 text-sm">Welcome back,</h1>
          <h2 className="text-white text-xl">{userData.username}</h2>
        </div>
        <img src={logoImage} alt="Trustora Logo" className="w-12 h-12 rounded-full" />
      </div>

      {/* Main Balance Card */}
      <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <img src={logoImage} alt="Trustora" className="w-8 h-8" />
          <span className="text-amber-950">Total Balance</span>
        </div>
        <div className="mb-4">
          <h3 className="text-4xl text-white mb-1">{userData.tsrBalance.toFixed(3)} TSR</h3>
          <p className="text-amber-950">{userData.trustPoints.toFixed(1)} Trust Points</p>
        </div>
        <div className="bg-amber-950/20 rounded-lg p-3 mb-4">
          <p className="text-amber-100 text-sm">
            {(20 - (userData.trustPoints % 20)).toFixed(1)} Trust needed for next TSR
          </p>
        </div>
        <Button 
          onClick={() => onNavigate('mining')}
          className="w-full bg-amber-950 hover:bg-amber-900 text-amber-100"
        >
          Start Mining
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800 border-slate-700 p-4">
              <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
              <p className="text-white">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-white mb-3">Quick Actions</h3>
        
        <Card 
          onClick={() => onNavigate('team')}
          className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white">Invite Friends</h4>
                <p className="text-slate-400 text-sm">Earn bonus Trust points</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        </Card>

        <Card 
          onClick={() => onNavigate('wallet')}
          className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-white">View Wallet</h4>
                <p className="text-slate-400 text-sm">Manage your TSR tokens</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700/50 p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white mb-1">Trustora Network</h4>
            <p className="text-slate-300 text-sm">
              Mine Trust points daily and convert them to $TSR tokens. 20 Trust = 1 TSR
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
