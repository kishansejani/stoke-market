import { Response } from 'express';
import { prisma } from '../models/prisma';
import { providerManager } from '../providers';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Watchlist, WatchlistItem } from '@stock-market/shared-types';

export class WatchlistsController {
  static async getWatchlists(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const lists = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            instrument: {
              include: { quote: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    const activeProvider = providerManager.getActiveProvider();

    const formatted: Watchlist[] = await Promise.all(
      lists.map(async (w) => {
        const items: WatchlistItem[] = await Promise.all(
          w.items.map(async (i) => {
            const liveQuote = await activeProvider.getQuote(i.instrument.symbol);
            return {
              id: i.id,
              watchlistId: i.watchlistId,
              instrumentId: i.instrumentId,
              symbol: i.instrument.symbol,
              ticker: i.instrument.ticker,
              name: i.instrument.name,
              exchange: i.instrument.exchangeId,
              sortOrder: i.sortOrder,
              addedAt: i.addedAt.toISOString(),
              quote: liveQuote || undefined,
            };
          })
        );

        return {
          id: w.id,
          userId: w.userId,
          name: w.name,
          isDefault: w.isDefault,
          createdAt: w.createdAt.toISOString(),
          items,
        };
      })
    );

    res.json({ success: true, data: formatted });
  }

  static async createWatchlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { name } = req.body;
    const watchlist = await prisma.watchlist.create({
      data: {
        userId: req.user.id,
        name,
        isDefault: false,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: watchlist.id,
        userId: watchlist.userId,
        name: watchlist.name,
        isDefault: watchlist.isDefault,
        createdAt: watchlist.createdAt.toISOString(),
        items: [],
      },
    });
  }

  static async addItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { id } = req.params;
    const { symbol } = req.body;

    const watchlist = await prisma.watchlist.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!watchlist) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Watchlist not found' } });
      return;
    }

    const instrument = await prisma.instrument.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!instrument) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Instrument symbol not found' } });
      return;
    }

    await prisma.watchlistItem.upsert({
      where: {
        watchlistId_instrumentId: {
          watchlistId: watchlist.id,
          instrumentId: instrument.id,
        },
      },
      update: {},
      create: {
        watchlistId: watchlist.id,
        instrumentId: instrument.id,
      },
    });

    // Return refreshed watchlist
    const refreshed = await prisma.watchlist.findUnique({
      where: { id: watchlist.id },
      include: {
        items: {
          include: { instrument: { include: { quote: true } } },
        },
      },
    });

    res.json({ success: true, data: refreshed });
  }

  static async removeItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { id, symbol } = req.params;
    const decodedSymbol = decodeURIComponent(symbol);

    const instrument = await prisma.instrument.findUnique({
      where: { symbol: decodedSymbol },
    });

    if (instrument) {
      await prisma.watchlistItem.deleteMany({
        where: {
          watchlistId: id,
          instrumentId: instrument.id,
        },
      });
    }

    res.json({ success: true, message: 'Item removed from watchlist' });
  }

  static async deleteWatchlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { id } = req.params;
    await prisma.watchlist.deleteMany({
      where: { id, userId: req.user.id, isDefault: false },
    });

    res.json({ success: true, message: 'Watchlist deleted' });
  }
}
