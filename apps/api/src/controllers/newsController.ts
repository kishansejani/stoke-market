import { Request, Response } from 'express';
import { providerManager } from '../providers';

export class NewsController {
  static async getNews(req: Request, res: Response): Promise<void> {
    const market = req.query.market as 'IN' | 'US' | undefined;
    const limit = Number(req.query.limit) || 20;

    const news = await providerManager.getActiveProvider().getNews(market, undefined, limit);
    res.json({ success: true, data: news });
  }

  static async getNewsBySymbol(req: Request, res: Response): Promise<void> {
    const symbol = decodeURIComponent(req.params.symbol);
    const limit = Number(req.query.limit) || 10;

    const news = await providerManager.getActiveProvider().getNews(undefined, symbol, limit);
    res.json({ success: true, data: news });
  }
}
