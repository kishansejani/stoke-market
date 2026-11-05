import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Bookmark, Filter, Sparkles } from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1220]/95 backdrop-blur-lg border-t border-[#1E293B] flex items-center justify-around h-14 px-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Terminal</span>
      </NavLink>

      <NavLink
        to="/markets"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`
        }
      >
        <TrendingUp className="w-4 h-4" />
        <span>Markets</span>
      </NavLink>

      <NavLink
        to="/watchlist"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`
        }
      >
        <Bookmark className="w-4 h-4" />
        <span>Watchlist</span>
      </NavLink>

      <NavLink
        to="/screener"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`
        }
      >
        <Filter className="w-4 h-4" />
        <span>Screener</span>
      </NavLink>

      <NavLink
        to="/store"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`
        }
      >
        <Sparkles className="w-4 h-4" />
        <span>License</span>
      </NavLink>
    </nav>
  );
};

