import { Home, Zap, Wallet, Users, User } from 'lucide-react';
import type { Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home' as Page, icon: Home, label: 'Home' },
    { id: 'mining' as Page, icon: Zap, label: 'Mine' },
    { id: 'wallet' as Page, icon: Wallet, label: 'Wallet' },
    { id: 'team' as Page, icon: Users, label: 'Team' },
    { id: 'profile' as Page, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 max-w-md mx-auto">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
