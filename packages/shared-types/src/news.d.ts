import { MarketId } from './market';
export interface NewsArticle {
    id: string;
    marketId: MarketId;
    title: string;
    summary: string;
    content?: string;
    source: string;
    url: string;
    imageUrl?: string;
    publishedAt: string;
    sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    relatedSymbols: string[];
}
//# sourceMappingURL=news.d.ts.map