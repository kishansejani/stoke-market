import { ExchangeId, MarketId } from './market.js';

export interface NormalizedQuote {
  symbol: string;
  ticker: string;
  name: string;
  exchange: ExchangeId;
  market: MarketId;
  currency: 'INR' | 'USD';
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  day52WeekHigh?: number;
  day52WeekLow?: number;
  marketCap?: number;
  peRatio?: number;
  isSimulated: boolean;
  delayMinutes: number;
  dataSource: string;
  lastTradeAt: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1mo';

export type ChartRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

export interface Candle {
  time: number | string; // Unix timestamp in seconds or YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  isSimulated: boolean;
  timestamp: string;
}
