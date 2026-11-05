import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Newspaper,
} from 'lucide-react';
import { api } from '../lib/api';
import { useMarketStore } from '../store/marketStore';
import { IndexSummary, MarketMovers, NewsArticle, NormalizedQuote } from '@stock-market/shared-types';
import { formatCurrency, formatPercentage, formatVolume } from '@stock-market/shared-utils';

export const DashboardPage: React.FC = () => {
  const { activeMarket, setActiveMarket, ticks, subscribeSymbol } = useMarketStore();
  const [indiaIndices, setIndiaIndices] = useState<IndexSummary[]>([]);
  const [usIndices, setUsIndices] = useState<IndexSummary[]>([]);
  const [movers, setMovers] = useState<MarketMovers | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [inSum, usSum, mov, nws] = await Promise.all([
          api.getMarketSummary('IN'),
          api.getMarketSummary('US'),
          api.getMarketMovers(activeMarket),
          api.getNews(activeMarket, 6),
        ]);

        setIndiaIndices(inSum);
        setUsIndices(usSum);
        setMovers(mov);
        setNews(nws);

        // Subscribe to all index tickers for live updates
        const allSymbols = [...inSum, ...usSum].map((i) => i.symbol);
        allSymbols.forEach((s) => subscribeSymbol(s));
      } catch (err) {
        console.error('Failed to load market summary:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeMarket]);

  const activeIndices = activeMarket === 'IN' ? indiaIndices : usIndices;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Market Status & Disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#151F30] to-[#111827] border border-[#1E293B]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Global Financial Market Terminal
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                NSE • BSE • NASDAQ • NYSE
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Live quote broadcasting engine with pluggable institutional data adapters.
            </p>
          </div>
        </div>

        {/* Data Disclaimer Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="font-medium text-[11px]">
            Data Mode: <strong className="font-semibold">Simulated Sandbox Feed</strong> (No scraping / licensed compliant)
          </span>
        </div>
      </div>

      {/* Market Selector Tabs */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveMarket('IN')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMarket === 'IN'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#151F30] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            <span>🇮🇳 Indian Markets (NIFTY & SENSEX)</span>
          </button>
          <button
            onClick={() => setActiveMarket('US')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMarket === 'US'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#151F30] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            <span>🇺🇸 US Markets (S&P 500 & NASDAQ)</span>
          </button>
        </div>

        <Link
          to="/markets"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
        >
          <span>View All Indices</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Index Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeIndices.map((idx) => {
          const live = ticks[idx.symbol];
          const price = live ? live.price : idx.currentValue;
          const change = live ? live.change : idx.change;
          const changePercent = live ? live.changePercent : idx.changePercent;
          const isPositive = change >= 0;

          return (
            <Link
              key={idx.symbol}
              to={`/stocks/${encodeURIComponent(idx.symbol)}`}
              className="p-4 rounded-2xl bg-[#151F30] border border-[#1E293B] hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  {idx.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1E293B] text-slate-400">
                  {idx.exchangeId}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold font-mono text-white tracking-tight">
                    {price ? price.toLocaleString() : '—'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span
                    className={`flex items-center space-x-1 font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{formatPercentage(changePercent)}</span>
                  </span>
                  <span className="text-slate-500">
                    ({change > 0 ? `+${change}` : change})
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-[10px] text-slate-400">
                <span>Prev Close: {idx.previousClose?.toLocaleString()}</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  STREAMING
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Movers & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers & Losers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Active Market Movers
                </h2>
              </div>
              <Link to="/movers" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                Full Movers & Screeners →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gainers */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  Top Gainers
                </p>
                <div className="space-y-1.5">
                  {movers?.topGainers.slice(0, 4).map((g) => (
                    <Link
                      key={g.symbol}
                      to={`/stocks/${encodeURIComponent(g.symbol)}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1220] hover:bg-[#1E293B] border border-[#1E293B]/60 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-xs text-white">{g.ticker}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{g.name}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-xs font-semibold text-white">{formatCurrency(g.price, g.currency)}</p>
                        <p className="text-[11px] font-semibold text-emerald-400">
                          {formatPercentage(g.changePercent)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Losers */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide">
                  Top Losers
                </p>
                <div className="space-y-1.5">
                  {movers?.topLosers.slice(0, 4).map((l) => (
                    <Link
                      key={l.symbol}
                      to={`/stocks/${encodeURIComponent(l.symbol)}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B1220] hover:bg-[#1E293B] border border-[#1E293B]/60 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-xs text-white">{l.ticker}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{l.name}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-xs font-semibold text-white">{formatCurrency(l.price, l.currency)}</p>
                        <p className="text-[11px] font-semibold text-rose-400">
                          {formatPercentage(l.changePercent)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Blue Chip Stocks Carousel */}
          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {activeMarket === 'IN' ? 'NSE & BSE Nifty Heavyweights' : 'NASDAQ & NYSE Megacaps'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(activeMarket === 'IN'
                ? ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS']
                : ['AAPL.US', 'NVDA.US', 'MSFT.US']
              ).map((symbol) => (
                <Link
                  key={symbol}
                  to={`/stocks/${encodeURIComponent(symbol)}`}
                  className="p-3.5 rounded-xl bg-[#0B1220] hover:bg-[#1E293B] border border-[#1E293B] space-y-2 transition-all block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white group-hover:text-blue-400">
                      {symbol.split('.')[0]}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                      {symbol.includes('.NS') ? 'NSE' : 'NASDAQ'}
                    </span>
                  </div>
                  <p className="text-base font-bold font-mono text-white">
                    {ticks[symbol] ? formatCurrency(ticks[symbol].price, symbol.includes('.NS') ? 'INR' : 'USD') : '—'}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Real-time Active</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Market News Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Newspaper className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Financial News
                </h2>
              </div>
              <Link to="/news" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                All News →
              </Link>
            </div>

            <div className="space-y-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#0B1220] border border-[#1E293B]/70 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-blue-400">{item.source}</span>
                    <span>{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold font-mono">
                      {item.sentiment}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white"
                    >
                      Read full source ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* License Promotion Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 via-[#151F30] to-[#151F30] border border-blue-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">One-Time Software License</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Own the Complete Professional Terminal Forever
            </h3>
            <p className="text-xs text-slate-300">
              Never pay recurring subscription lock-ins. Install across your desktop, laptop, and mobile devices with perpetual ownership.
            </p>
            <Link
              to="/store"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              <span>Explore License Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
