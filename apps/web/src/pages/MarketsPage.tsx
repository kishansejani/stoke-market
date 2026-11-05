import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, Globe } from 'lucide-react';
import { api } from '../lib/api';
import { useMarketStore } from '../store/marketStore';
import { MarketInfo, IndexSummary } from '@stock-market/shared-types';
import { formatPercentage } from '@stock-market/shared-utils';

export const MarketsPage: React.FC = () => {
  const { ticks, subscribeSymbol } = useMarketStore();
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [indiaIndices, setIndiaIndices] = useState<IndexSummary[]>([]);
  const [usIndices, setUsIndices] = useState<IndexSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, inInd, usInd] = await Promise.all([
          api.getMarkets(),
          api.getMarketSummary('IN'),
          api.getMarketSummary('US'),
        ]);

        setMarkets(m);
        setIndiaIndices(inInd);
        setUsIndices(usInd);

        [...inInd, ...usInd].forEach((i) => subscribeSymbol(i.symbol));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B]">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Global Financial Markets & Indices
        </h1>
        <p className="text-xs text-slate-400">
          Operational schedules, session states, and benchmark equity index performances for India and the United States.
        </p>
      </div>

      {/* Market Sessions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {markets.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-white flex items-center gap-2">
                <span>{m.id === 'IN' ? '🇮🇳' : '🇺🇸'}</span>
                <span>{m.name}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {m.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-[#1E293B]">
              <div>
                <span>Trading Hours: </span>
                <strong className="text-slate-200 block font-mono">{m.tradingHoursStart} - {m.tradingHoursEnd}</strong>
              </div>
              <div>
                <span>Timezone: </span>
                <strong className="text-slate-200 block font-mono">{m.timezone}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* India Indices Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>🇮🇳 Indian Benchmark Indices (NSE / BSE)</span>
        </h2>
        <div className="rounded-2xl bg-[#151F30] border border-[#1E293B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#111827] text-slate-400 text-[11px]">
                  <th className="py-3 px-4">Index Name</th>
                  <th className="py-3 px-4">Exchange</th>
                  <th className="py-3 px-4 text-right">Value</th>
                  <th className="py-3 px-4 text-right">Change</th>
                  <th className="py-3 px-4 text-right">Day High</th>
                  <th className="py-3 px-4 text-right">Day Low</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70 font-mono">
                {indiaIndices.map((idx) => {
                  const live = ticks[idx.symbol];
                  const price = live ? live.price : idx.currentValue;
                  const change = live ? live.change : idx.change;
                  const changePercent = live ? live.changePercent : idx.changePercent;
                  const isPositive = change >= 0;

                  return (
                    <tr key={idx.symbol} className="hover:bg-[#1E293B]/50 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-white">
                        <Link to={`/stocks/${encodeURIComponent(idx.symbol)}`} className="hover:text-blue-400">
                          {idx.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{idx.exchangeId}</td>
                      <td className="py-3 px-4 font-bold text-white text-right">{price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center space-x-1 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{formatPercentage(changePercent)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-right">{idx.high ? idx.high.toLocaleString() : '—'}</td>
                      <td className="py-3 px-4 text-slate-300 text-right">{idx.low ? idx.low.toLocaleString() : '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          Live
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* US Indices Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>🇺🇸 United States Market Indices (NASDAQ / NYSE)</span>
        </h2>
        <div className="rounded-2xl bg-[#151F30] border border-[#1E293B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#111827] text-slate-400 text-[11px]">
                  <th className="py-3 px-4">Index Name</th>
                  <th className="py-3 px-4">Exchange</th>
                  <th className="py-3 px-4 text-right">Value</th>
                  <th className="py-3 px-4 text-right">Change</th>
                  <th className="py-3 px-4 text-right">Day High</th>
                  <th className="py-3 px-4 text-right">Day Low</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70 font-mono">
                {usIndices.map((idx) => {
                  const live = ticks[idx.symbol];
                  const price = live ? live.price : idx.currentValue;
                  const change = live ? live.change : idx.change;
                  const changePercent = live ? live.changePercent : idx.changePercent;
                  const isPositive = change >= 0;

                  return (
                    <tr key={idx.symbol} className="hover:bg-[#1E293B]/50 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-white">
                        <Link to={`/stocks/${encodeURIComponent(idx.symbol)}`} className="hover:text-blue-400">
                          {idx.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{idx.exchangeId}</td>
                      <td className="py-3 px-4 font-bold text-white text-right">{price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center space-x-1 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{formatPercentage(changePercent)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-right">{idx.high ? idx.high.toLocaleString() : '—'}</td>
                      <td className="py-3 px-4 text-slate-300 text-right">{idx.low ? idx.low.toLocaleString() : '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          Live
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

