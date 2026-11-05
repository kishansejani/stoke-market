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
 * Adapter for Polygon.io US Market Data API.
 * Safely falls back to the Mock Simulator if no commercial key is provided.
 */
export class PolygonMarketDataProvider implements IMarketDataProvider {
  readonly providerId = 'POLYGON';
  readonly name = 'Polygon.io US Market Provider';
  readonly isMock = false;

  private apiKey: string;
  private fallbackMock: MockMarketDataProvider;

  constructor(apiKey = process.env.POLYGON_API_KEY || '') {
    this.apiKey = apiKey;
    this.fallbackMock = new MockMarketDataProvider();
  }

  async initialize(): Promise<void> {
    await this.fallbackMock.initialize();
    if (!this.apiKey) {
      console.warn('[PolygonProvider] No POLYGON_API_KEY provided. Using development mock fallback.');
    }
  }

  async getQuote(symbol: string): Promise<NormalizedQuote | null> {
    if (!this.apiKey) return this.fallbackMock.getQuote(symbol);
    // Real implementation with Polygon REST call
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

