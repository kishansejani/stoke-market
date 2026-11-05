import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { NormalizedQuote, ScreenerFilter } from '@stock-market/shared-types';
import { formatCurrency, formatPercentage, formatVolume } from '@stock-market/shared-utils';

export const ScreenerPage: React.FC = () => {
  const [market, setMarket] = useState<'IN' | 'US' | ''>('');
  const [sector, setSector] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPe, setMinPe] = useState('');
  const [maxPe, setMaxPe] = useState('');
  const [sortBy, setSortBy] = useState<'marketCap' | 'price' | 'changePercent' | 'volume' | 'peRatio'>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [results, setResults] = useState<NormalizedQuote[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchScreener = async () => {
    setLoading(true);
    try {
      const filters: ScreenerFilter = {
        market: market || undefined,
        sector: sector || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minPeRatio: minPe ? Number(minPe) : undefined,
        maxPeRatio: maxPe ? Number(maxPe) : undefined,
        sortBy,
        sortDirection,
        page: 1,
        limit: 50,
      };

      const res = await api.runScreener(filters);
      setResults(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreener();
  }, [market, sortBy, sortDirection]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#151F30] border border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            Quantitative Stock Screener
          </h1>
          <p className="text-xs text-slate-400">
            Filter across {total} Indian and US instruments by market, valuation metrics, and volume.
          </p>
        </div>

        <button
          onClick={fetchScreener}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Screener</span>
        </button>
      </div>

      {/* Filter Form Card */}
      <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Market */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Market Jurisdiction</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Global Markets</option>
              <option value="IN">🇮🇳 India (NSE / BSE)</option>
              <option value="US">🇺🇸 USA (NASDAQ / NYSE)</option>
            </select>
          </div>

          {/* Sector */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Sector Keyword</label>
            <input
              type="text"
              placeholder="e.g. Technology, Energy, Bank"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Price Range */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Min Price</label>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Max Price</label>
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E293B]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Sort By:</span>
            {(['marketCap', 'price', 'changePercent', 'volume', 'peRatio'] as const).map((crit) => (
              <button
                key={crit}
                onClick={() => {
                  if (sortBy === crit) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(crit);
                    setSortDirection('desc');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                  sortBy === crit
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#0B1220] text-slate-400 border-[#1E293B] hover:text-white'
                }`}
              >
                {crit} {sortBy === crit ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>

          <button
            onClick={fetchScreener}
            className="px-4 py-1.5 rounded-lg bg-[#0B1220] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B]"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Results Table Card */}
      <div className="rounded-2xl bg-[#151F30] border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#111827] text-slate-400 text-[11px]">
                <th className="py-3 px-4 font-semibold">Instrument</th>
                <th className="py-3 px-4 font-semibold">Exchange</th>
                <th className="py-3 px-4 font-semibold text-right">Price</th>
                <th className="py-3 px-4 font-semibold text-right">24h Change</th>
                <th className="py-3 px-4 font-semibold text-right">Volume</th>
                <th className="py-3 px-4 font-semibold text-right">Market Cap</th>
                <th className="py-3 px-4 font-semibold text-right">P/E Ratio</th>
                <th className="py-3 px-4 font-semibold text-center">Data Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {results.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-[#1E293B]/60 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/stocks/${encodeURIComponent(stock.symbol)}`} className="group flex flex-col">
                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {stock.ticker}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs">{stock.name}</span>
                      </Link>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-[#0B1220] border border-[#1E293B] text-[10px]">
                        {stock.exchange}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white text-right">
                      {formatCurrency(stock.price, stock.currency)}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-right">
                      <span
                        className={`inline-flex items-center space-x-1 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{formatPercentage(stock.changePercent)}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300 text-right">
                      {formatVolume(stock.volume)}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300 text-right">
                      {formatCurrency(stock.marketCap, stock.currency, { compact: true })}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300 text-right">
                      {stock.peRatio ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-semibold">
                        SIMULATED
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
  );
};
