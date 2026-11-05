import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  Bell,
  Building2,
  FileSpreadsheet,
  Globe,
  Share2,
  Check,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { useMarketStore } from '../store/marketStore';
import { useAuthStore } from '../store/authStore';
import { TradingViewChart } from '../components/charts/TradingViewChart';
import {
  NormalizedQuote,
  Candle,
  ChartRange,
  CompanyProfile,
  FinancialStatements,
} from '@stock-market/shared-types';
import { formatCurrency, formatPercentage, formatVolume } from '@stock-market/shared-utils';

export const StockDetailPage: React.FC = () => {
  const { symbol: rawSymbol } = useParams<{ symbol: string }>();
  const symbol = decodeURIComponent(rawSymbol || '');

  const { ticks, subscribeSymbol } = useMarketStore();
  const { isAuthenticated } = useAuthStore();

  const [quote, setQuote] = useState<NormalizedQuote | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [range, setRange] = useState<ChartRange>('1M');
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [financials, setFinancials] = useState<FinancialStatements | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'overview' | 'financials'>('chart');
  const [loading, setLoading] = useState(true);

  // Watchlist & Alert state
  const [inWatchlist, setInWatchlist] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    subscribeSymbol(symbol);

    async function loadStock() {
      setLoading(true);
      try {
        const [q, c, p, f] = await Promise.all([
          api.getStock(symbol),
          api.getStockChart(symbol, range),
          api.getCompanyProfile(symbol).catch(() => null),
          api.getCompanyFinancials(symbol).catch(() => null),
        ]);

        setQuote(q);
        setCandles(c);
        setProfile(p);
        setFinancials(f);

        if (q) {
          setAlertTargetPrice(String(Math.round(q.price * 1.05)));
        }
      } catch (err) {
        console.error('Failed to load stock data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStock();
  }, [symbol, range]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to add stocks to your personal watchlist.');
      return;
    }
    try {
      const lists = await api.getWatchlists();
      if (lists.length > 0) {
        if (!inWatchlist) {
          await api.addWatchlistItem(lists[0].id, symbol);
          setInWatchlist(true);
        } else {
          await api.removeWatchlistItem(lists[0].id, symbol);
          setInWatchlist(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to configure price alerts.');
      return;
    }
    try {
      await api.createAlert({
        symbol,
        condition: alertCondition,
        targetPrice: Number(alertTargetPrice),
      });
      setAlertMessage('Alert successfully configured! You will be notified when target triggers.');
      setTimeout(() => {
        setAlertModalOpen(false);
        setAlertMessage(null);
      }, 1500);
    } catch (err: any) {
      setAlertMessage(err.message || 'Failed to create alert');
    }
  };

  if (loading && !quote) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400">Loading instrument quote and candlestick history...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8 rounded-2xl bg-[#151F30] border border-[#1E293B] text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Stock Not Found</h2>
        <p className="text-xs text-slate-400">The requested symbol "{symbol}" could not be located on active exchanges.</p>
        <Link to="/" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Return to Terminal Overview
        </Link>
      </div>
    );
  }

  const live = ticks[symbol];
  const price = live ? live.price : quote.price;
  const change = live ? live.change : quote.change;
  const changePercent = live ? live.changePercent : quote.changePercent;
  const isPositive = change >= 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info Card */}
      <div className="p-6 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{quote.ticker}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                {quote.exchange}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {quote.market === 'IN' ? '🇮🇳 India' : '🇺🇸 USA'}
              </span>
              {quote.isSimulated && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                  SIMULATED SANDBOX DATA
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 font-medium">{quote.name}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                inWatchlist
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#0B1220] text-slate-300 border-[#1E293B] hover:text-white hover:border-slate-600'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
            </button>

            <button
              onClick={() => setAlertModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B1220] text-slate-300 border border-[#1E293B] hover:text-white hover:border-slate-600 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Alert</span>
            </button>
          </div>
        </div>

        {/* Live Price Row */}
        <div className="flex flex-wrap items-baseline gap-4 pt-2 border-t border-[#1E293B]">
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(price, quote.currency)}
            </span>
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-sm font-mono font-bold ${
                isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change > 0 ? `+${change}` : change}</span>
              <span>({formatPercentage(changePercent)})</span>
            </div>
          </div>

          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time Tick Stream Active
          </span>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 border-t border-[#1E293B]/70 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#0B1220]/60 border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-sans">Open</span>
            <span className="font-semibold text-white">{formatCurrency(quote.open, quote.currency)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B1220]/60 border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-sans">Day High</span>
            <span className="font-semibold text-emerald-400">{formatCurrency(quote.high, quote.currency)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B1220]/60 border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-sans">Day Low</span>
            <span className="font-semibold text-rose-400">{formatCurrency(quote.low, quote.currency)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B1220]/60 border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-sans">Prev Close</span>
            <span className="font-semibold text-slate-300">{formatCurrency(quote.previousClose, quote.currency)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B1220]/60 border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-sans">Volume</span>
            <span className="font-semibold text-white">{formatVolume(quote.volume)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B1220]/60 border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-sans">Market Cap</span>
            <span className="font-semibold text-white">
              {formatCurrency(quote.marketCap, quote.currency, { compact: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Chart vs Fundamentals vs Overview */}
      <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-3">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'chart'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-[#151F30] text-slate-400 hover:text-white border border-[#1E293B]'
          }`}
        >
          Interactive Technical Chart
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-[#151F30] text-slate-400 hover:text-white border border-[#1E293B]'
          }`}
        >
          Company Profile & Leadership
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'financials'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-[#151F30] text-slate-400 hover:text-white border border-[#1E293B]'
          }`}
        >
          Financial Statements & Ratios
        </button>
      </div>

      {/* Tab 1: Chart View */}
      {activeTab === 'chart' && (
        <TradingViewChart
          candles={candles}
          range={range}
          onRangeChange={(newRange) => setRange(newRange)}
        />
      )}

      {/* Tab 2: Company Profile */}
      {activeTab === 'overview' && profile && (
        <div className="p-6 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-6 text-xs">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Business Overview</h2>
            <p className="text-slate-300 leading-relaxed text-sm">{profile.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#1E293B]">
            <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px]">Chief Executive Officer</span>
              <span className="text-sm font-bold text-white">{profile.ceo}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px]">Sector</span>
              <span className="text-sm font-bold text-white">{profile.sector}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px]">Industry</span>
              <span className="text-sm font-bold text-white">{profile.industry}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#1E293B]">
              <span className="text-slate-400 block text-[11px]">Employees</span>
              <span className="text-sm font-bold text-white font-mono">{profile.employees.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 text-slate-400 flex items-center justify-between">
            <span>Headquarters: {profile.headquarters}</span>
            <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              {profile.website}
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: Financial Statements */}
      {activeTab === 'financials' && financials && (
        <div className="p-6 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Audited Financial Statements & Valuation Metrics
            </h2>
            <span className="text-[11px] text-slate-400">Reporting Currency: {financials.currency}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">FY 2025</th>
                  <th className="py-2.5 px-3">Valuation / Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                {financials.annual.map((fin, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-300">Total Revenue</td>
                      <td className="py-2.5 px-3 text-white font-bold">{formatCurrency(fin.revenue, financials.currency, { compact: true })}</td>
                      <td className="py-2.5 px-3 text-slate-400">P/E Ratio: {fin.peRatio || '—'}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-300">Net Profit (PAT)</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatCurrency(fin.netIncome, financials.currency, { compact: true })}</td>
                      <td className="py-2.5 px-3 text-slate-400">P/B Ratio: {fin.pbRatio || '—'}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-300">Diluted EPS</td>
                      <td className="py-2.5 px-3 text-white">{formatCurrency(fin.eps, financials.currency)}</td>
                      <td className="py-2.5 px-3 text-slate-400">Debt to Equity: {fin.debtToEquity || '—'}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-300">Dividend Yield</td>
                      <td className="py-2.5 px-3 text-white">{fin.dividendYield ? `${fin.dividendYield}%` : '—'}</td>
                      <td className="py-2.5 px-3 text-slate-400">Period Ended: {fin.periodEndDate}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151F30] border border-[#1E293B] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Create Price Alert for {quote.ticker}</h3>
              </div>
              <button onClick={() => setAlertModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {alertMessage && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
                {alertMessage}
              </div>
            )}

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Trigger Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertCondition('ABOVE')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      alertCondition === 'ABOVE'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#0B1220] text-slate-400 border-[#1E293B]'
                    }`}
                  >
                    Price Crosses Above
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertCondition('BELOW')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      alertCondition === 'BELOW'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#0B1220] text-slate-400 border-[#1E293B]'
                    }`}
                  >
                    Price Drops Below
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Target Price ({quote.currency})</label>
                <input
                  type="number"
                  step="0.05"
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-[#1E293B] text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500">Current trading price: {formatCurrency(price, quote.currency)}</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0B1220] text-slate-300 hover:text-white border border-[#1E293B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Activate Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

