import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Bell,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMarketStore } from '../../store/marketStore';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { activeMarket, setActiveMarket, ticks } = useMarketStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = user?.roles.includes('SUPER_ADMIN') || user?.roles.includes('ADMIN');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B] bg-[#0B1220]/95 backdrop-blur-md">
      {/* Real-time Indices Ticker Ribbon */}
      <div className="hidden lg:flex items-center space-x-6 px-4 py-1.5 text-xs border-b border-[#1E293B]/60 bg-[#111827]/80 overflow-x-auto whitespace-nowrap select-none">
        <div className="flex items-center space-x-2 text-[#94A3B8]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-white">LIVE TICKER:</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-slate-300">NIFTY 50</span>
            <span className="font-mono text-white font-semibold">
              {ticks['NIFTY50.IDX'] ? ticks['NIFTY50.IDX'].price.toLocaleString() : '24,350.25'}
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">+0.62%</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-slate-300">BANK NIFTY</span>
            <span className="font-mono text-white font-semibold">
              {ticks['BANKNIFTY.IDX'] ? ticks['BANKNIFTY.IDX'].price.toLocaleString() : '52,180.60'}
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">+0.64%</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-slate-300">SENSEX</span>
            <span className="font-mono text-white font-semibold">
              {ticks['SENSEX.IDX'] ? ticks['SENSEX.IDX'].price.toLocaleString() : '80,120.45'}
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">+0.59%</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-slate-300">S&P 500</span>
            <span className="font-mono text-white font-semibold">
              {ticks['SPX.IDX'] ? ticks['SPX.IDX'].price.toLocaleString() : '5,864.20'}
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">+0.84%</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-slate-300">NASDAQ 100</span>
            <span className="font-mono text-white font-semibold">
              {ticks['NDX.IDX'] ? ticks['NDX.IDX'].price.toLocaleString() : '20,380.40'}
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">+1.14%</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
            <span>DEV MODE: SIMULATED DATA</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                STOKE <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">PRO</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider -mt-1 hidden sm:inline">GLOBAL TERMINAL</span>
            </div>
          </Link>

          {/* Market Selector Pill */}
          <div className="hidden sm:flex items-center p-1 bg-[#151F30] rounded-lg border border-[#1E293B] ml-4 text-xs font-medium">
            <button
              onClick={() => setActiveMarket('IN')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeMarket === 'IN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 India (NSE/BSE)
            </button>
            <button
              onClick={() => setActiveMarket('US')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeMarket === 'US'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 USA (NASDAQ/NYSE)
            </button>
          </div>
        </div>

        {/* Center: Search Bar Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 w-48 sm:w-72 md:w-96 px-3 py-1.5 rounded-lg bg-[#151F30] border border-[#1E293B] hover:border-slate-600 text-xs text-slate-400 transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left truncate">Search ticker (e.g. RELIANCE, AAPL)...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[#1E293B] text-slate-400 rounded border border-[#334155]">
            ⌘K
          </kbd>
        </button>

        {/* Right: Actions, Store CTA & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/store"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-blue-500/10 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lifetime License</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-[#151F30] border border-transparent hover:border-[#1E293B] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden md:inline">
                  {user?.firstName || 'Trader'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#151F30] border border-[#1E293B] shadow-2xl py-1 text-xs z-50">
                  <div className="px-4 py-2.5 border-b border-[#1E293B]">
                    <p className="font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono font-semibold">
                        {user?.roles?.[0] || 'FREE_USER'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/store"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-[#1E293B]"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>My Licenses & Devices</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-[#1E293B]"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Admin Management</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-[#1E293B] border-t border-[#1E293B]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
