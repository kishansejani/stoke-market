import React, { useEffect, useState } from 'react';
import {
  Rocket,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Calculator,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Search,
} from 'lucide-react';
import { api } from '../lib/api';
import { useMarketStore } from '../store/marketStore';
import { IPOItem, IPOStatus } from '@stock-market/shared-types';
import { formatCurrency } from '@stock-market/shared-utils';

export const IpoPage: React.FC = () => {
  const { activeMarket, setActiveMarket } = useMarketStore();
  const [ipos, setIpos] = useState<IPOItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIpo, setSelectedIpo] = useState<IPOItem | null>(null);
  const [calcLots, setCalcLots] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadIPOs() {
      setLoading(true);
      try {
        const data = await api.getIPOs(
          activeMarket,
          selectedStatus !== 'ALL' ? selectedStatus : undefined
        );
        setIpos(data);
        if (data.length > 0 && !selectedIpo) {
          setSelectedIpo(data[0]);
        }
      } catch (err) {
        console.error('Failed to load IPOs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadIPOs();
  }, [activeMarket, selectedStatus]);

  // Instant real-time search filtering across company name, ticker/symbol, and exchange
  const filteredIpos = ipos.filter((ipo) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      ipo.companyName.toLowerCase().includes(q) ||
      (ipo.symbol && ipo.symbol.toLowerCase().includes(q)) ||
      ipo.exchange.toLowerCase().includes(q) ||
      (ipo.description && ipo.description.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Apply Now (Open)
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3" />
            Upcoming
          </span>
        );
      case 'LISTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Listed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/50">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151F30] via-[#1A253C] to-[#151F30] border border-[#1E293B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Rocket className="w-3.5 h-3.5" />
            Primary Market & IPO Central
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Initial Public Offerings (IPO) Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Live IPO subscription rates, Grey Market Premium (GMP), expected listing gains, and detailed lot-size profit calculator.
          </p>
        </div>

        {/* Market Selector */}
        <div className="flex items-center space-x-2 bg-[#0B1220] p-1.5 rounded-xl border border-[#1E293B]">
          <button
            onClick={() => setActiveMarket('IN')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMarket === 'IN'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 India Mainboard / SME
          </button>
          <button
            onClick={() => setActiveMarket('US')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMarket === 'US'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇺🇸 USA Wall Street
          </button>
        </div>
      </div>

      {/* Live IPO Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (val.trim()) {
              const matched = ipos.find((ipo) =>
                ipo.companyName.toLowerCase().includes(val.toLowerCase()) ||
                (ipo.symbol && ipo.symbol.toLowerCase().includes(val.toLowerCase()))
              );
              if (matched) setSelectedIpo(matched);
            }
          }}
          placeholder="Search IPO by company or symbol (e.g. BLS, Swiggy, Waaree, NTPC, BlackBuck, Sagility)..."
          className="w-full bg-[#151F30] border border-[#1E293B] rounded-xl pl-11 pr-24 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#0B1220] border border-[#1E293B]"
          >
            Clear ✕
          </button>
        ) : (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-[#0B1220] px-2 py-0.5 rounded border border-[#1E293B]">
            MAINBOARD & SME
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          {['ALL', 'ACTIVE', 'UPCOMING', 'LISTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-[#151F30] text-slate-400 border border-transparent hover:border-[#1E293B]'
              }`}
            >
              {st === 'ALL'
                ? 'All Offerings'
                : st === 'ACTIVE'
                ? '🟢 Active / Open'
                : st === 'UPCOMING'
                ? '⏳ Upcoming'
                : '🏁 Listed'}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-semibold">{filteredIpos.length}</span> issues
        </div>
      </div>

      {/* Main Grid: IPO List + Profit & Allotment Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: IPO Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-[#151F30] animate-pulse border border-[#1E293B]" />
              ))}
            </div>
          ) : filteredIpos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#151F30] border border-[#1E293B]">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No IPOs Found</h3>
              <p className="text-xs text-slate-400 mt-1">
                There are no offerings matching "{searchQuery}" in the selected market.
              </p>
            </div>
          ) : (
            filteredIpos.map((ipo) => {
              const currency = ipo.marketId === 'IN' ? 'INR' : 'USD';
              const symPrefix = ipo.marketId === 'IN' ? '₹' : '$';
              const isSelected = selectedIpo?.id === ipo.id;

              return (
                <div
                  key={ipo.id}
                  onClick={() => {
                    setSelectedIpo(ipo);
                    setCalcLots(1);
                  }}
                  className={`p-5 rounded-2xl bg-[#151F30] border cursor-pointer transition-all hover:border-blue-500/50 ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-gradient-to-br from-[#151F30] to-[#1A253C]'
                      : 'border-[#1E293B]'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">{ipo.companyName}</h2>
                        {ipo.symbol && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0B1220] text-slate-300 border border-[#1E293B]">
                            {ipo.symbol}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                          {ipo.exchange} • {ipo.category}
                        </span>
                      </div>
                      {ipo.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {ipo.description}
                        </p>
                      )}
                    </div>
                    <div>{getStatusBadge(ipo.status)}</div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#0B1220]/60 border border-[#1E293B]/60 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Price Band</span>
                      <span className="font-semibold text-white">
                        {symPrefix}{ipo.priceBandLow} - {symPrefix}{ipo.priceBandHigh}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Lot Size / Min Invest</span>
                      <span className="font-semibold text-white">
                        {ipo.lotSize} shares (
                        {formatCurrency(ipo.lotSize * ipo.priceBandHigh, currency)})
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Issue Size</span>
                      <span className="font-semibold text-white">
                        {symPrefix}{ipo.issueSize} {ipo.marketId === 'IN' ? 'Cr' : 'M'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">GMP / Est Gain</span>
                      {ipo.gmpPrice !== null && ipo.gmpPrice !== undefined ? (
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            ipo.gmpPrice >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {symPrefix}{ipo.gmpPrice} ({ipo.gmpPercent ? `${ipo.gmpPercent > 0 ? '+' : ''}${ipo.gmpPercent}%` : '0%'})
                        </span>
                      ) : (
                        <span className="text-slate-500">TBA</span>
                      )}
                    </div>
                  </div>

                  {/* Timeline & Expected Profit */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-[#1E293B]/60">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>Dates: </span>
                        <strong className="text-white">
                          {formatDate(ipo.openDate)} - {formatDate(ipo.closeDate)}
                        </strong>
                      </span>

                      {ipo.listingDate && (
                        <span className="hidden sm:inline-flex items-center gap-1.5">
                          <Rocket className="w-3.5 h-3.5 text-purple-400" />
                          <span>Listing: </span>
                          <strong className="text-white">{formatDate(ipo.listingDate)}</strong>
                        </span>
                      )}
                    </div>

                    {ipo.expectedProfit !== null && ipo.expectedProfit !== undefined && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        Est Profit/Lot: {formatCurrency(ipo.expectedProfit, currency)}
                      </div>
                    )}
                  </div>

                  {/* Subscription Bars if Active or Listed */}
                  {ipo.subscriptionTotal !== null && ipo.subscriptionTotal !== undefined && ipo.subscriptionTotal > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#1E293B]/40">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Total Subscription Status:</span>
                        <span className="font-bold text-white">{ipo.subscriptionTotal}x Subscribed</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-[#0B1220] p-1.5 rounded-lg border border-[#1E293B] text-center">
                          <span className="text-slate-400 block text-[10px]">QIB</span>
                          <strong className="text-blue-400">{ipo.subscriptionQIB || 0}x</strong>
                        </div>
                        <div className="bg-[#0B1220] p-1.5 rounded-lg border border-[#1E293B] text-center">
                          <span className="text-slate-400 block text-[10px]">NII / HNI</span>
                          <strong className="text-amber-400">{ipo.subscriptionNII || 0}x</strong>
                        </div>
                        <div className="bg-[#0B1220] p-1.5 rounded-lg border border-[#1E293B] text-center">
                          <span className="text-slate-400 block text-[10px]">Retail</span>
                          <strong className="text-emerald-400">{ipo.subscriptionRetail || 0}x</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Interactive Profit & Allotment Calculator */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] sticky top-20">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1E293B]">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">IPO Profit Calculator</h3>
                <p className="text-xs text-slate-400">Calculate investment & listing gain</p>
              </div>
            </div>

            {selectedIpo ? (
              <div className="space-y-4 text-xs">
                {/* Selected IPO header */}
                <div className="p-3 rounded-xl bg-[#0B1220] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Issue</span>
                  <strong className="text-white text-sm block mt-0.5">{selectedIpo.companyName}</strong>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Lot: {selectedIpo.lotSize} shares @ ₹{selectedIpo.priceBandHigh}
                  </span>
                </div>

                {/* Lots Selector */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">
                    Number of Application Lots:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 5, 13].map((lots) => (
                      <button
                        key={lots}
                        onClick={() => setCalcLots(lots)}
                        className={`py-2 rounded-xl font-bold transition-all text-xs ${
                          calcLots === lots
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-[#0B1220] text-slate-300 border border-[#1E293B] hover:border-slate-500'
                        }`}
                      >
                        {lots} {lots === 1 ? 'Lot' : 'Lots'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Computation Breakdown */}
                {(() => {
                  const totalShares = calcLots * selectedIpo.lotSize;
                  const totalInvestment = totalShares * selectedIpo.priceBandHigh;
                  const gmp = selectedIpo.gmpPrice || 0;
                  const totalGain = totalShares * gmp;
                  const totalListingValue = totalInvestment + totalGain;
                  const currency = selectedIpo.marketId === 'IN' ? 'INR' : 'USD';

                  return (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between py-2 border-b border-[#1E293B]/60">
                        <span className="text-slate-400">Total Bidding Shares:</span>
                        <strong className="text-white font-mono">{totalShares} Shares</strong>
                      </div>

                      <div className="flex justify-between py-2 border-b border-[#1E293B]/60">
                        <span className="text-slate-400">Total Application Amount:</span>
                        <strong className="text-white font-mono">{formatCurrency(totalInvestment, currency)}</strong>
                      </div>

                      <div className="flex justify-between py-2 border-b border-[#1E293B]/60">
                        <span className="text-slate-400">Grey Market Premium (GMP):</span>
                        <strong className={`font-mono ${gmp >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {selectedIpo.marketId === 'IN' ? '₹' : '$'}{gmp} / share ({selectedIpo.gmpPercent || 0}%)
                        </strong>
                      </div>

                      {/* Highlighted Profit Card */}
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
                        <span className="text-[11px] font-semibold text-emerald-300 block uppercase tracking-wide">
                          Expected Listing Profit ({calcLots} {calcLots === 1 ? 'Lot' : 'Lots'})
                        </span>
                        <div className="text-2xl font-black font-mono">
                          {formatCurrency(totalGain, currency)}
                        </div>
                        <span className="text-[10px] text-emerald-400/80 block">
                          Estimated Portfolio Value on Day 1: {formatCurrency(totalListingValue, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Timeline Stepper */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">IPO Schedule & Deadlines</h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1220] border border-[#1E293B]">
                      <span className="text-slate-400">Issue Bidding Closes:</span>
                      <strong className="text-white">{formatDate(selectedIpo.closeDate)}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1220] border border-[#1E293B]">
                      <span className="text-slate-400">Basis of Allotment:</span>
                      <strong className="text-white">{formatDate(selectedIpo.allotmentDate)}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1220] border border-[#1E293B]">
                      <span className="text-slate-400">Listing on Exchanges:</span>
                      <strong className="text-emerald-400">{formatDate(selectedIpo.listingDate)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Select any IPO from the list to view its profit breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
