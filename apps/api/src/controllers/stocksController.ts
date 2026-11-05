import { Request, Response } from 'express';
import { prisma } from '../models/prisma';
import { providerManager } from '../providers';
import { ChartRange } from '@stock-market/shared-types';

export class StocksController {
  static async search(req: Request, res: Response): Promise<void> {
    const q = ((req.query.q as string) || '').trim();
    const market = (req.query.market as string) || undefined;

    if (!q) {
      res.json({ success: true, data: [] });
      return;
    }

    const where: any = {
      OR: [
        { ticker: { contains: q.toUpperCase() } },
        { symbol: { contains: q.toUpperCase() } },
        { name: { contains: q } },
      ],
    };

    if (market) where.marketId = market.toUpperCase();

    const instruments = await prisma.instrument.findMany({
      where,
      include: { quote: true },
      take: 10,
    });

    const results = instruments.map((inst) => {
      const quote = inst.quote;
      return {
        symbol: inst.symbol,
        ticker: inst.ticker,
        name: inst.name,
        exchange: inst.exchangeId,
        market: inst.marketId,
        currency: inst.currency,
        price: quote ? quote.price : 0,
        change: quote ? quote.change : 0,
        changePercent: quote ? quote.changePercent : 0,
        volume: quote ? quote.volume : 0,
        isSimulated: quote ? quote.isSimulated : true,
      };
    });

    res.json({ success: true, data: results });
  }

  static async getStock(req: Request, res: Response): Promise<void> {
    const symbol = decodeURIComponent(req.params.symbol);
    const quote = await providerManager.getActiveProvider().getQuote(symbol);

    if (!quote) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stock instrument not found' } });
      return;
    }

    res.json({ success: true, data: quote });
  }

  static async getChart(req: Request, res: Response): Promise<void> {
    const symbol = decodeURIComponent(req.params.symbol);
    const range = ((req.query.range as string) || '1M') as ChartRange;

    const candles = await providerManager.getActiveProvider().getHistoricalCandles(symbol, range);
    res.json({ success: true, data: candles });
  }

  static async getCompany(req: Request, res: Response): Promise<void> {
    const symbol = decodeURIComponent(req.params.symbol);
    const profile = await providerManager.getActiveProvider().getCompanyProfile(symbol);

    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Company profile not found' } });
      return;
    }

    res.json({ success: true, data: profile });
  }

  static async getFinancials(req: Request, res: Response): Promise<void> {
    const symbol = decodeURIComponent(req.params.symbol);
    const financials = await providerManager.getActiveProvider().getFinancialStatements(symbol);

    if (!financials) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Financial statements not found' } });
      return;
    }

    res.json({ success: true, data: financials });
  }
}

