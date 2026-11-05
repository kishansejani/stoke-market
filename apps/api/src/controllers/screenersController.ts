import { Request, Response } from 'express';
import { prisma } from '../models/prisma';
import { ScreenerResult, MarketMovers, NormalizedQuote } from '@stock-market/shared-types';

export class ScreenersController {
  static async getMovers(req: Request, res: Response): Promise<void> {
    const market = req.query.market as string | undefined;

    const where: any = {
      type: 'STOCK',
    };
    if (market) where.marketId = market.toUpperCase();

    const instruments = await prisma.instrument.findMany({
      where,
      include: { quote: true },
    });

    const quotes: NormalizedQuote[] = instruments
      .filter((i) => i.quote !== null)
      .map((i) => {
        const q = i.quote!;
        return {
          symbol: i.symbol,
          ticker: i.ticker,
          name: i.name,
          exchange: i.exchangeId as any,
          market: i.marketId as any,
          currency: i.currency as any,
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
          isSimulated: q.isSimulated,
          delayMinutes: q.delayMinutes,
          dataSource: q.dataSource,
          lastTradeAt: q.lastTradeAt.toISOString(),
        };
      });

    const topGainers = [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
    const topLosers = [...quotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
    const mostActive = [...quotes].sort((a, b) => b.volume * b.price - a.volume * a.price).slice(0, 5);
    const highestVolume = [...quotes].sort((a, b) => b.volume - a.volume).slice(0, 5);

    const result: MarketMovers = {
      topGainers,
      topLosers,
      mostActive,
      highestVolume,
    };

    res.json({ success: true, data: result });
  }

  static async filter(req: Request, res: Response): Promise<void> {
    const {
      market,
      exchange,
      sector,
      minPrice,
      maxPrice,
      minChangePercent,
      maxChangePercent,
      minMarketCap,
      maxMarketCap,
      minPeRatio,
      maxPeRatio,
      minVolume,
      sortBy = 'marketCap',
      sortDirection = 'desc',
      page = 1,
      limit = 20,
    } = req.body;

    const where: any = {
      type: 'STOCK',
    };

    if (market) where.marketId = market;
    if (exchange) where.exchangeId = exchange;
    if (sector) where.sector = { contains: sector };

    const instruments = await prisma.instrument.findMany({
      where,
      include: { quote: true },
    });

    let filtered = instruments
      .filter((i) => i.quote !== null)
      .map((i) => {
        const q = i.quote!;
        return {
          symbol: i.symbol,
          ticker: i.ticker,
          name: i.name,
          exchange: i.exchangeId as any,
          market: i.marketId as any,
          currency: i.currency as any,
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
          isSimulated: q.isSimulated,
          delayMinutes: q.delayMinutes,
          dataSource: q.dataSource,
          lastTradeAt: q.lastTradeAt.toISOString(),
        };
      });

    // In-memory filters for quote attributes
    if (minPrice !== undefined) filtered = filtered.filter((q) => q.price >= minPrice);
    if (maxPrice !== undefined) filtered = filtered.filter((q) => q.price <= maxPrice);
    if (minChangePercent !== undefined) filtered = filtered.filter((q) => q.changePercent >= minChangePercent);
    if (maxChangePercent !== undefined) filtered = filtered.filter((q) => q.changePercent <= maxChangePercent);
    if (minMarketCap !== undefined) filtered = filtered.filter((q) => (q.marketCap || 0) >= minMarketCap);
    if (maxMarketCap !== undefined) filtered = filtered.filter((q) => (q.marketCap || 0) <= maxMarketCap);
    if (minPeRatio !== undefined) filtered = filtered.filter((q) => (q.peRatio || 0) >= minPeRatio);
    if (maxPeRatio !== undefined) filtered = filtered.filter((q) => (q.peRatio || 0) <= maxPeRatio);
    if (minVolume !== undefined) filtered = filtered.filter((q) => q.volume >= minVolume);

    // Sorting
    filtered.sort((a, b) => {
      let valA = (a as any)[sortBy] ?? 0;
      let valB = (b as any)[sortBy] ?? 0;
      if (sortDirection === 'asc') return valA - valB;
      return valB - valA;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const result: ScreenerResult = {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    res.json({ success: true, data: result });
  }
}
