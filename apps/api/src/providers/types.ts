import {
  NormalizedQuote,
  Candle,
  ChartRange,
  CompanyProfile,
  FinancialStatements,
  NewsArticle,
  MarketTick,
} from '@stock-market/shared-types';

export interface IMarketDataProvider {
  readonly providerId: string;
  readonly name: string;
  readonly isMock: boolean;

  initialize(): Promise<void>;
  getQuote(symbol: string): Promise<NormalizedQuote | null>;
  getBatchQuotes(symbols: string[]): Promise<Map<string, NormalizedQuote>>;
  getHistoricalCandles(symbol: string, range: ChartRange): Promise<Candle[]>;
  getCompanyProfile(symbol: string): Promise<CompanyProfile | null>;
  getFinancialStatements(symbol: string): Promise<FinancialStatements | null>;
  getNews(market?: 'IN' | 'US', symbol?: string, limit?: number): Promise<NewsArticle[]>;
  subscribeRealtime(symbols: string[], onTick: (tick: MarketTick) => void): () => void;
}
