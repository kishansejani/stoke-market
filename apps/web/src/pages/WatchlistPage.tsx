import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Plus, Trash2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useMarketStore } from '../store/marketStore';
import { Watchlist } from '@stock-market/shared-types';
import { formatCurrency, formatPercentage } from '@stock-market/shared-utils';

export const WatchlistPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { ticks, subscribeSymbol } = useMarketStore();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWatchlists = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const lists = await api.getWatchlists();
      setWatchlists(lists);
      if (lists.length > 0 && !activeWatchlistId) {
        setActiveWatchlistId(lists[0].id);
      }

      // Subscribe to all symbols in all watchlists
      lists.forEach((list) => {
        list.items.forEach((item) => subscribeSymbol(item.symbol));
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, [isAuthenticated]);

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const created = await api.createWatchlist(newListName.trim());
      setWatchlists([...watchlists, created]);
      setActiveWatchlistId(created.id);
      setNewListName('');
      setIsCreating(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create watchlist');
    }
  };

  const handleRemoveItem = async (watchlistId: string, symbol: string) => {
    try {
      await api.removeWatchlistItem(watchlistId, symbol);
      fetchWatchlists();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4 max-w-lg mx-auto mt-12">
        <Bookmark className="w-12 h-12 text-blue-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Sign In to Synchronize Watchlists</h2>
        <p className="text-xs text-slate-400">
          Monitor your high-conviction Indian and US stocks across all your devices in real-time.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const activeList = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#151F30] border border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-400" />
            Personal Watchlists
          </h1>
          <p className="text-xs text-slate-400">
            Real-time portfolio watchlist monitor synced across Web, Android and iOS devices.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Watchlist</span>
        </button>
      </div>

      {/* Create Watchlist Modal / Form */}
      {isCreating && (
        <form onSubmit={handleCreateWatchlist} className="p-4 rounded-xl bg-[#151F30] border border-[#1E293B] flex items-center gap-3">
          <input
            type="text"
            placeholder="Watchlist name (e.g. Breakout Swings, Core Dividend)"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white text-xs focus:outline-none focus:border-blue-500"
            required
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
            Save
          </button>
          <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-2 text-slate-400 hover:text-white text-xs">
            Cancel
          </button>
        </form>
      )}

      {/* Watchlist Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#1E293B]">
        {watchlists.map((w) => (
          <button
            key={w.id}
            onClick={() => setActiveWatchlistId(w.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeWatchlistId === w.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-[#151F30] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            {w.name} ({w.items?.length || 0})
          </button>
        ))}
      </div>

      {/* Watchlist Items Table */}
      {activeList && (
        <div className="rounded-2xl bg-[#151F30] border border-[#1E293B] overflow-hidden">
          {(!activeList.items || activeList.items.length === 0) ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <p>Your watchlist "{activeList.name}" is currently empty.</p>
              <p className="text-slate-500">Search any stock ticker using ⌘K and click "Add to Watchlist".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#111827] text-slate-400 text-[11px]">
                    <th className="py-3 px-4 font-semibold">Symbol</th>
                    <th className="py-3 px-4 font-semibold">Exchange</th>
                    <th className="py-3 px-4 font-semibold text-right">Live Price</th>
                    <th className="py-3 px-4 font-semibold text-right">Daily Change</th>
                    <th className="py-3 px-4 font-semibold text-right">Market Cap</th>
                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/70">
                  {activeList.items.map((item) => {
                    const live = ticks[item.symbol];
                    const price = live ? live.price : item.quote?.price || 0;
                    const change = live ? live.change : item.quote?.change || 0;
                    const changePercent = live ? live.changePercent : item.quote?.changePercent || 0;
                    const isPositive = change >= 0;
                    const currency = item.symbol.includes('.NS') || item.symbol.includes('.BO') ? 'INR' : 'USD';

                    return (
                      <tr key={item.symbol} className="hover:bg-[#1E293B]/50 transition-colors">
                        <td className="py-3 px-4">
                          <Link to={`/stocks/${encodeURIComponent(item.symbol)}`} className="group">
                            <span className="font-bold text-white group-hover:text-blue-400 transition-colors block">
                              {item.ticker}
                            </span>
                            <span className="text-[11px] text-slate-400">{item.name}</span>
                          </Link>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          <span className="px-1.5 py-0.5 rounded bg-[#0B1220] border border-[#1E293B] text-[10px]">
                            {item.exchange}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-white text-right">
                          {formatCurrency(price, currency)}
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-right">
                          <span
                            className={`inline-flex items-center space-x-1 ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{formatPercentage(changePercent)}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300 text-right">
                          {formatCurrency(item.quote?.marketCap, currency, { compact: true })}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleRemoveItem(activeList.id, item.symbol)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

