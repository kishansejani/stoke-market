import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { NormalizedQuote } from '@stock-market/shared-types';
import { formatCurrency, formatPercentage } from '@stock-market/shared-utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NormalizedQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchStocks(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-[#151F30] border border-[#1E293B] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3 border-b border-[#1E293B]">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stock by name or ticker (e.g. RELIANCE, AAPL, TCS, NVDA)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#1E293B]">
            ESC
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching global markets...
            </div>
          )}

          {!loading && results.length === 0 && query.trim() !== '' && (
            <div className="py-8 text-center text-xs text-slate-400">
              No instruments found matching "{query}".
            </div>
          )}

          {!loading && results.length === 0 && query.trim() === '' && (
            <div className="py-6 px-4 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">Quick Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'AAPL.US', 'MSFT.US', 'NVDA.US'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      navigate(`/stocks/${encodeURIComponent(sym)}`);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#1E293B] hover:bg-blue-600 hover:text-white text-slate-300 transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading &&
            results.map((item) => {
              const isPositive = item.change >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => {
                    navigate(`/stocks/${encodeURIComponent(item.symbol)}`);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1E293B] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {item.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white text-xs">{item.ticker}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {item.exchange}
                        </span>
                        {item.isSimulated && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            SIMULATED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold text-white">
                        {formatCurrency(item.price, item.currency)}
                      </p>
                      <div className={`flex items-center justify-end space-x-1 text-[11px] font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{formatPercentage(item.changePercent)}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

