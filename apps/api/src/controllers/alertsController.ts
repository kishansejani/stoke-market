import { Response } from 'express';
import { prisma } from '../models/prisma';
import { AuthenticatedRequest } from '../middlewares/auth';
import { PriceAlert } from '@stock-market/shared-types';

export class AlertsController {
  static async getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: req.user.id },
      include: { instrument: true },
      orderBy: { createdAt: 'desc' },
    });

    const data: PriceAlert[] = alerts.map((a) => ({
      id: a.id,
      userId: a.userId,
      instrumentId: a.instrumentId,
      symbol: a.instrument.symbol,
      condition: a.condition as any,
      targetPrice: a.targetPrice,
      triggered: a.triggered,
      triggeredAt: a.triggeredAt ? a.triggeredAt.toISOString() : undefined,
      isActive: a.isActive,
      createdAt: a.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  }

  static async createAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { symbol, condition, targetPrice } = req.body;

    const instrument = await prisma.instrument.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: { quote: true },
    });

    if (!instrument) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stock instrument not found' } });
      return;
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId: req.user.id,
        instrumentId: instrument.id,
        condition,
        targetPrice,
        isActive: true,
        triggered: false,
      },
    });

    const data: PriceAlert = {
      id: alert.id,
      userId: alert.userId,
      instrumentId: alert.instrumentId,
      symbol: instrument.symbol,
      condition: alert.condition as any,
      targetPrice: alert.targetPrice,
      currentPriceAtCreation: instrument.quote?.price,
      triggered: alert.triggered,
      isActive: alert.isActive,
      createdAt: alert.createdAt.toISOString(),
    };

    res.status(201).json({ success: true, data });
  }

  static async deleteAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { id } = req.params;
    await prisma.priceAlert.deleteMany({
      where: { id, userId: req.user.id },
    });

    res.json({ success: true, message: 'Price alert removed' });
  }

  static async toggleAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { id } = req.params;
    const alert = await prisma.priceAlert.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!alert) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
      return;
    }

    const updated = await prisma.priceAlert.update({
      where: { id: alert.id },
      data: { isActive: !alert.isActive },
    });

    res.json({ success: true, data: updated });
  }
}
