import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Bookmark,
  Filter,
  Flame,
  Newspaper,
  Bell,
  Sparkles,
  Shield,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes('SUPER_ADMIN') || user?.roles.includes('ADMIN');

  const navLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/markets', label: 'Markets', icon: TrendingUp },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
    { to: '/screener', label: 'Stock Screener', icon: Filter },
    { to: '/movers', label: 'Market Movers', icon: Flame },
    { to: '/news', label: 'Market News', icon: Newspaper },
    { to: '/alerts', label: 'Price Alerts', icon: Bell },
    { to: '/store', label: 'Store & License', icon: Sparkles, highlight: true },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin Console', icon: Shield, highlight: false });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-14 z-50 md:z-30 h-screen md:h-[calc(100vh-3.5rem)] w-60 bg-[#0B1220] md:bg-[#0B1220]/70 border-r border-[#1E293B] flex flex-col justify-between py-4 px-3 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3 md:hidden flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">STOKE TERMINAL</span>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Financial Modules
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 font-semibold'
                        : item.highlight
                        ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                        : 'text-slate-400 hover:bg-[#151F30] hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom system card */}
        <div className="p-3 rounded-xl bg-[#151F30]/80 border border-[#1E293B] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Data Feed Engine</span>
            <span className="flex items-center space-x-1 text-[10px] font-mono font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>ONLINE</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Exchange Tick Subscriptions active on WebSocket port 5000.
          </p>
        </div>
      </aside>
    </>
  );
};

