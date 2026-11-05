import { IMarketDataProvider } from './types';
import { prisma } from '../models/prisma';
import {
  NormalizedQuote,
  Candle,
  ChartRange,
  CompanyProfile,
  FinancialStatements,
  NewsArticle,
  MarketTick,
} from '@stock-market/shared-types';

export class MockMarketDataProvider implements IMarketDataProvider {
  readonly providerId = 'MOCK';
  readonly name = 'Integrated High-Fidelity Simulator';
  readonly isMock = true;

  private tickInterval: NodeJS.Timeout | null = null;
  private activeSubscriptions = new Map<string, Set<(tick: MarketTick) => void>>();
  private cachedQuotes = new Map<string, NormalizedQuote>();

  async initialize(): Promise<void> {
    // Load initial quotes from database
    const dbQuotes = await prisma.stockQuote.findMany({
      include: {
        instrument: {
          include: {
            exchange: true,
            market: true,
          },
        },
      },
    });

    for (const q of dbQuotes) {
      this.cachedQuotes.set(q.instrument.symbol, {
        symbol: q.instrument.symbol,
        ticker: q.instrument.ticker,
        name: q.instrument.name,
        exchange: q.instrument.exchangeId as any,
        market: q.instrument.marketId as any,
        currency: q.instrument.currency as any,
        price: q.price,
        previousClose: q.previousClose,
        open: q.open,
        high: q.high,
        low: q.low,
        volume: q.volume,
        change: q.change,
        changePercent: q.changePercent,
        day52WeekHigh: q.day52WeekHigh || undefined,
        day52WeekLow: q.day52WeekLow || undefined,
        marketCap: q.marketCap || undefined,
        peRatio: q.peRatio || undefined,
        isSimulated: true,
        delayMinutes: 0,
        dataSource: 'SIMULATED DATA (DEV MOCK)',
        lastTradeAt: q.lastTradeAt.toISOString(),
      });
    }

    // Start tick simulation loop (every 1.5s for subscribed symbols)
    this.startSimulationLoop();
  }

  private startSimulationLoop() {
    if (this.tickInterval) clearInterval(this.tickInterval);

    this.tickInterval = setInterval(() => {
      if (this.activeSubscriptions.size === 0) return;

      for (const [symbol, listeners] of this.activeSubscriptions.entries()) {
        const quote = this.cachedQuotes.get(symbol);
        if (!quote) continue;

        // Realistic random walk (Geometric Brownian Motion tick)
        const volatility = 0.0015; // 0.15% max tick step
        const delta = (Math.random() - 0.495) * volatility;
        const newPrice = Number((quote.price * (1 + delta)).toFixed(2));
        const priceDiff = Number((newPrice - quote.previousClose).toFixed(2));
        const pctDiff = Number(((priceDiff / quote.previousClose) * 100).toFixed(2));

        quote.price = newPrice;
        quote.change = priceDiff;
        quote.changePercent = pctDiff;
        quote.high = Math.max(quote.high, newPrice);
        quote.low = Math.min(quote.low, newPrice);
        quote.volume += Math.floor(Math.random() * 500);
        quote.lastTradeAt = new Date().toISOString();

        const tick: MarketTick = {
          symbol,
          price: newPrice,
          change: priceDiff,
          changePercent: pctDiff,
          high: quote.high,
          low: quote.low,
          volume: quote.volume,
          isSimulated: true,
          timestamp: quote.lastTradeAt,
        };

        for (const listener of listeners) {
          listener(tick);
        }
      }
    }, 1500);
    this.tickInterval.unref();
  }

  async getQuote(symbol: string): Promise<NormalizedQuote | null> {
    const existing = this.cachedQuotes.get(symbol);
    if (existing) return existing;

    const inst = await prisma.instrument.findUnique({
      where: { symbol },
      include: { quote: true },
    });

    if (!inst || !inst.quote) return null;

    const normalized: NormalizedQuote = {
      symbol: inst.symbol,
      ticker: inst.ticker,
      name: inst.name,
      exchange: inst.exchangeId as any,
      market: inst.marketId as any,
      currency: inst.currency as any,
      price: inst.quote.price,
      previousClose: inst.quote.previousClose,
      open: inst.quote.open,
      high: inst.quote.high,
      low: inst.quote.low,
      volume: inst.quote.volume,
      change: inst.quote.change,
      changePercent: inst.quote.changePercent,
      day52WeekHigh: inst.quote.day52WeekHigh || undefined,
      day52WeekLow: inst.quote.day52WeekLow || undefined,
      marketCap: inst.quote.marketCap || undefined,
      peRatio: inst.quote.peRatio || undefined,
      isSimulated: true,
      delayMinutes: 0,
      dataSource: 'SIMULATED DATA (DEV MOCK)',
      lastTradeAt: inst.quote.lastTradeAt.toISOString(),
    };

    this.cachedQuotes.set(symbol, normalized);
    return normalized;
  }

  async getBatchQuotes(symbols: string[]): Promise<Map<string, NormalizedQuote>> {
    const map = new Map<string, NormalizedQuote>();
    for (const sym of symbols) {
      const q = await this.getQuote(sym);
      if (q) map.set(sym, q);
    }
    return map;
  }

  async getHistoricalCandles(symbol: string, range: ChartRange): Promise<Candle[]> {
    const inst = await prisma.instrument.findUnique({
      where: { symbol },
      include: {
        history: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!inst || !inst.history || inst.history.length === 0) {
      // Fallback: generate algorithmic synthetic history
      return this.generateSyntheticCandles(range);
    }

    // Filter by requested range
    let days = 30;
    if (range === '1D') days = 1;
    else if (range === '5D') days = 5;
    else if (range === '1M') days = 30;
    else if (range === '3M') days = 90;
    else if (range === '6M') days = 180;
    else if (range === '1Y') days = 365;
    else if (range === '5Y' || range === 'ALL') days = 1825;

    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);
    const filtered = inst.history.filter((h) => h.timestamp >= cutoff);

    if (filtered.length < 5) {
      return this.generateSyntheticCandles(range);
    }

    return filtered.map((h) => ({
      time: Math.floor(h.timestamp.getTime() / 1000),
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.volume,
    }));
  }

  private generateSyntheticCandles(range: ChartRange): Candle[] {
    const count = range === '1D' ? 78 : range === '5D' ? 35 : range === '1M' ? 30 : 60;
    const candles: Candle[] = [];
    const now = Math.floor(Date.now() / 1000);
    const step = range === '1D' ? 300 : 86400; // 5min or 1day
    let price = 1000;

    for (let i = count; i >= 0; i--) {
      const time = now - i * step;
      const drift = (Math.random() - 0.49) * 0.02;
      const open = price;
      const close = Number((open * (1 + drift)).toFixed(2));
      const high = Number((Math.max(open, close) * (1 + Math.random() * 0.008)).toFixed(2));
      const low = Number((Math.min(open, close) * (1 - Math.random() * 0.008)).toFixed(2));
      const volume = Math.floor(Math.random() * 100000 + 10000);
      price = close;

      candles.push({ time, open, high, low, close, volume });
    }
    return candles;
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    const inst = await prisma.instrument.findUnique({
      where: { symbol },
      include: { company: true },
    });

    if (!inst || !inst.company) return null;

    return {
      symbol: inst.symbol,
      name: inst.name,
      description: inst.company.description,
      sector: inst.company.sector,
      industry: inst.company.industry,
      ceo: inst.company.ceo,
      employees: inst.company.employees,
      headquarters: inst.company.headquarters,
      website: inst.company.website,
      foundedYear: inst.company.foundedYear || undefined,
      isin: inst.company.isin || undefined,
    };
  }

  async getFinancialStatements(symbol: string): Promise<FinancialStatements | null> {
    const inst = await prisma.instrument.findUnique({
      where: { symbol },
      include: {
        company: {
          include: {
            financials: true,
          },
        },
      },
    });

    if (!inst || !inst.company || !inst.company.financials) return null;

    const mapped = inst.company.financials.map((f) => ({
      fiscalYear: f.fiscalYear,
      fiscalQuarter: f.fiscalQuarter || undefined,
      periodEndDate: f.periodEndDate.toISOString().split('T')[0],
      revenue: f.revenue,
      netIncome: f.netIncome,
      operatingIncome: f.operatingIncome || undefined,
      eps: f.eps,
      ebitda: f.ebitda || undefined,
      totalAssets: f.totalAssets || undefined,
      totalLiabilities: f.totalLiabilities || undefined,
      totalEquity: f.totalEquity || undefined,
      operatingCashFlow: f.operatingCashFlow || undefined,
      freeCashFlow: f.freeCashFlow || undefined,
      peRatio: f.peRatio || undefined,
      pbRatio: f.pbRatio || undefined,
      debtToEquity: f.debtToEquity || undefined,
      dividendYield: f.dividendYield || undefined,
    }));

    return {
      symbol: inst.symbol,
      currency: inst.currency as any,
      annual: mapped,
      quarterly: mapped,
    };
  }

  async getNews(market?: 'IN' | 'US', symbol?: string, limit = 20): Promise<NewsArticle[]> {
    const where: any = {};
    if (market) where.marketId = market;
    if (symbol) where.relatedSymbols = { contains: symbol };

    const news = await prisma.marketNews.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return news.map((n) => ({
      id: n.id,
      marketId: n.marketId as any,
      title: n.title,
      summary: n.summary,
      content: n.content || undefined,
      source: n.source,
      url: n.url,
      imageUrl: n.imageUrl || undefined,
      publishedAt: n.publishedAt.toISOString(),
      sentiment: (n.sentiment as any) || 'NEUTRAL',
      relatedSymbols: n.relatedSymbols.split(',').map((s) => s.trim()),
    }));
  }

  subscribeRealtime(symbols: string[], onTick: (tick: MarketTick) => void): () => void {
    for (const sym of symbols) {
      if (!this.activeSubscriptions.has(sym)) {
        this.activeSubscriptions.set(sym, new Set());
      }
      this.activeSubscriptions.get(sym)?.add(onTick);
    }

    return () => {
      for (const sym of symbols) {
        this.activeSubscriptions.get(sym)?.delete(onTick);
        if (this.activeSubscriptions.get(sym)?.size === 0) {
          this.activeSubscriptions.delete(sym);
        }
      }
    };
  }
}
