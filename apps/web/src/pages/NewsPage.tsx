import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Globe } from 'lucide-react';
import { api } from '../lib/api';
import { useMarketStore } from '../store/marketStore';
import { NewsArticle } from '@stock-market/shared-types';

export const NewsPage: React.FC = () => {
  const { activeMarket, setActiveMarket } = useMarketStore();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const n = await api.getNews(activeMarket, 30);
        setNews(n);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#151F30] border border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-400" />
            Financial Market Intelligence & News
          </h1>
          <p className="text-xs text-slate-400">
            Licensed press releases, central bank commentary, and corporate disclosure announcements.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <button
            onClick={() => setActiveMarket('IN')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMarket === 'IN' ? 'bg-blue-600 text-white' : 'bg-[#0B1220] text-slate-400 border border-[#1E293B]'
            }`}
          >
            🇮🇳 India News
          </button>
          <button
            onClick={() => setActiveMarket('US')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMarket === 'US' ? 'bg-blue-600 text-white' : 'bg-[#0B1220] text-slate-400 border border-[#1E293B]'
            }`}
          >
            🇺🇸 US News
          </button>
        </div>
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#151F30] border border-[#1E293B] space-y-3 hover:border-slate-600 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-blue-400">{item.source}</span>
                <span className="font-mono">{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">{item.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold text-[10px]">
                {item.sentiment}
              </span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white flex items-center space-x-1 font-medium"
              >
                <span>Read Full Article</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

