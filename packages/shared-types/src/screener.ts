import { MarketId, ExchangeId } from './market.js';
import { NormalizedQuote } from './quote.js';

export interface ScreenerFilter {
  market?: MarketId;
  exchange?: ExchangeId;
  sector?: string;
  minPrice?: number;
  maxPrice?: number;
  minChangePercent?: number;
  maxChangePercent?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPeRatio?: number;
  maxPeRatio?: number;
  minVolume?: number;
  sortBy?: 'marketCap' | 'price' | 'changePercent' | 'volume' | 'peRatio';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ScreenerResult {
  data: NormalizedQuote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MarketMovers {
  topGainers: NormalizedQuote[];
  topLosers: NormalizedQuote[];
  mostActive: NormalizedQuote[];
  highestVolume: NormalizedQuote[];
}
