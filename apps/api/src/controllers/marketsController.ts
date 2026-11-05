import { Request, Response } from 'express';
import { prisma } from '../models/prisma';
import { getMarketSessionStatus } from '@stock-market/shared-utils';
import { MarketInfo, IndexSummary } from '@stock-market/shared-types';

export class MarketsController {
  static async getMarkets(req: Request, res: Response): Promise<void> {
    const dbMarkets = await prisma.market.findMany();

    const data: MarketInfo[] = dbMarkets.map((m) => {
      const session = getMarketSessionStatus(m.id as any);
      return {
        id: m.id as any,
        name: m.name,
        currency: m.currency as any,
        timezone: m.timezone,
        tradingHoursStart: m.tradingHoursStart,
        tradingHoursEnd: m.tradingHoursEnd,
        status: session.status,
      };
    });

    res.json({ success: true, data });
  }

  static async getMarketSummary(req: Request, res: Response): Promise<void> {
    const { marketId } = req.params;
    const market = (marketId || 'IN').toUpperCase();

    const indices = await prisma.instrument.findMany({
      where: {
        marketId: market,
        type: 'INDEX',
      },
      include: {
        quote: true,
      },
    });

    const data: IndexSummary[] = indices.map((idx) => {
      const q = idx.quote;
      return {
        symbol: idx.symbol,
        name: idx.name,
        marketId: idx.marketId as any,
        exchangeId: idx.exchangeId as any,
        currentValue: q ? q.price : 0,
        change: q ? q.change : 0,
        changePercent: q ? q.changePercent : 0,
        high: q ? q.high : 0,
        low: q ? q.low : 0,
        previousClose: q ? q.previousClose : 0,
        isSimulated: q ? q.isSimulated : true,
        delayMinutes: q ? q.delayMinutes : 0,
        lastUpdated: q ? q.lastTradeAt.toISOString() : new Date().toISOString(),
      };
    });

    res.json({ success: true, data });
  }

  static async getExchanges(req: Request, res: Response): Promise<void> {
    const exchanges = await prisma.exchange.findMany();
    res.json({ success: true, data: exchanges });
  }
}

