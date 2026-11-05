export type MarketId = 'IN' | 'US';
export type ExchangeId = 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';
export type InstrumentType = 'STOCK' | 'INDEX' | 'ETF' | 'MUTUAL_FUND';
export type MarketStatusType = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS' | 'HOLIDAY';
export interface MarketInfo {
    id: MarketId;
    name: string;
    currency: 'INR' | 'USD';
    timezone: string;
    tradingHoursStart: string;
    tradingHoursEnd: string;
    status: MarketStatusType;
    nextOpenTime?: string;
    nextCloseTime?: string;
    isSimulated?: boolean;
}
export interface ExchangeInfo {
    id: ExchangeId;
    marketId: MarketId;
    name: string;
    country: string;
    website: string;
}
export interface Instrument {
    id: string;
    symbol: string;
    ticker: string;
    name: string;
    exchangeId: ExchangeId;
    marketId: MarketId;
    type: InstrumentType;
    currency: 'INR' | 'USD';
    sector?: string;
    industry?: string;
    isin?: string;
    isActive: boolean;
}
export interface IndexSummary {
    symbol: string;
    name: string;
    marketId: MarketId;
    exchangeId: ExchangeId;
    currentValue: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    previousClose: number;
    isSimulated: boolean;
    delayMinutes: number;
    lastUpdated: string;
}
//# sourceMappingURL=market.d.ts.map