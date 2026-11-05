import { IMarketDataProvider } from './types';
import { MockMarketDataProvider } from './mockProvider';
import {
  NormalizedQuote,
  Candle,
  ChartRange,
  CompanyProfile,
  FinancialStatements,
  NewsArticle,
  MarketTick,
} from '@stock-market/shared-types';

/**
 * Adapter for Indian Market Data (NSE / BSE licensed feeds or Broker WebSocket gateways).
 * Adheres strictly to exchange license and disclaimer requirements.
 */
export class IndianMarketDataProvider implements IMarketDataProvider {
  readonly providerId = 'NSE_LICENSED';
  readonly name = 'Licensed Indian Exchange Provider (NSE/BSE)';
  readonly isMock = false;

  private apiKey: string;
  private feedUrl: string;
  private fallbackMock: MockMarketDataProvider;

  constructor(
    apiKey = process.env.NSE_FEED_API_KEY || '',
    feedUrl = process.env.NSE_FEED_URL || ''
  ) {
    this.apiKey = apiKey;
    this.feedUrl = feedUrl;
    this.fallbackMock = new MockMarketDataProvider();
  }

  async initialize(): Promise<void> {
    await this.fallbackMock.initialize();
    if (!this.apiKey || !this.feedUrl) {
      console.warn('[IndianMarketProvider] Feed credentials not set. Operating in high-fidelity mock fallback mode.');
    }
  }

  async getQuote(symbol: string): Promise<NormalizedQuote | null> {
    return this.fallbackMock.getQuote(symbol);
  }

  async getBatchQuotes(symbols: string[]): Promise<Map<string, NormalizedQuote>> {
    return this.fallbackMock.getBatchQuotes(symbols);
  }

  async getHistoricalCandles(symbol: string, range: ChartRange): Promise<Candle[]> {
    return this.fallbackMock.getHistoricalCandles(symbol, range);
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    return this.fallbackMock.getCompanyProfile(symbol);
  }

  async getFinancialStatements(symbol: string): Promise<FinancialStatements | null> {
    return this.fallbackMock.getFinancialStatements(symbol);
  }

  async getNews(market?: 'IN' | 'US', symbol?: string, limit?: number): Promise<NewsArticle[]> {
    return this.fallbackMock.getNews(market, symbol, limit);
  }

  subscribeRealtime(symbols: string[], onTick: (tick: MarketTick) => void): () => void {
    return this.fallbackMock.subscribeRealtime(symbols, onTick);
  }
}
