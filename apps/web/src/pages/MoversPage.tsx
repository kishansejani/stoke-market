import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, TrendingUp, TrendingDown, Activity, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';
import { useMarketStore } from '../store/marketStore';
import { MarketMovers } from '@stock-market/shared-types';
import { formatCurrency, formatPercentage, formatVolume } from '@stock-market/shared-utils';

export const MoversPage: React.FC = () => {
  const { activeMarket, setActiveMarket } = useMarketStore();
  const [movers, setMovers] = useState<MarketMovers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const m = await api.getMarketMovers(activeMarket);
        setMovers(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeMarket]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#151F30] border border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Market Movers & Volatility Scanner
          </h1>
          <p className="text-xs text-slate-400">
            Real-time top gainers, top losers, and highest traded volume instruments.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <button
            onClick={() => setActiveMarket('IN')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMarket === 'IN' ? 'bg-blue-600 text-white' : 'bg-[#0B1220] text-slate-400 border border-[#1E293B]'
            }`}
          >
            🇮🇳 India
          </button>
          <button
            onClick={() => setActiveMarket('US')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMarket === 'US' ? 'bg-blue-600 text-white' : 'bg-[#0B1220] text-slate-400 border border-[#1E293B]'
            }`}
          >
            🇺🇸 USA
          </button>
        </div>
      </div>

      {/* Grid of Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Top 24h Gainers</h2>
          </div>
          <div className="space-y-2">
            {movers?.topGainers.map((s) => (
              <Link
                key={s.symbol}
                to={`/stocks/${encodeURIComponent(s.symbol)}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] hover:bg-[#1E293B] border border-[#1E293B] transition-colors"
              >
                <div>
                  <span className="font-bold text-xs text-white block">{s.ticker}</span>
                  <span className="text-[11px] text-slate-400">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-semibold text-xs text-white block">{formatCurrency(s.price, s.currency)}</span>
                  <span className="text-emerald-400 font-bold text-xs">{formatPercentage(s.changePercent)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <TrendingDown className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Top 24h Losers</h2>
          </div>
          <div className="space-y-2">
            {movers?.topLosers.map((s) => (
              <Link
                key={s.symbol}
                to={`/stocks/${encodeURIComponent(s.symbol)}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] hover:bg-[#1E293B] border border-[#1E293B] transition-colors"
              >
                <div>
                  <span className="font-bold text-xs text-white block">{s.ticker}</span>
                  <span className="text-[11px] text-slate-400">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-semibold text-xs text-white block">{formatCurrency(s.price, s.currency)}</span>
                  <span className="text-rose-400 font-bold text-xs">{formatPercentage(s.changePercent)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
