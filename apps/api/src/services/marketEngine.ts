import { providerManager } from '../providers/index.js';
import { prisma } from '../models/prisma.js';
import { MarketTick, NormalizedQuote } from '@stock-market/shared-types';
import { syncAllRealMarketQuotes } from './realQuoteSync.js';

export class MarketEngine {
  private static instance: MarketEngine;
  private tickSubscribers = new Set<(tick: MarketTick) => void>();

  private constructor() {}

  static getInstance(): MarketEngine {
    if (!MarketEngine.instance) {
      MarketEngine.instance = new MarketEngine();
    }
    return MarketEngine.instance;
  }

  async start(): Promise<void> {
    // 1. Fetch real exchange market data asynchronously
    syncAllRealMarketQuotes().catch((e) => console.error('[MarketEngine] Quote sync err:', e));
    // Repeat quote sync every 5 minutes
    setInterval(() => {
      syncAllRealMarketQuotes().catch((e) => console.error('[MarketEngine] Periodic sync err:', e));
    }, 5 * 60 * 1000).unref();

    await providerManager.initialize();

    // Subscribe to all seeded symbols for real-time tick generation & alert evaluation
    const instruments = await prisma.instrument.findMany({ select: { symbol: true } });
    const symbols = instruments.map((i) => i.symbol);

    providerManager.getActiveProvider().subscribeRealtime(symbols, (tick) => {
      this.handleIncomingTick(tick);
    });
  }

  private async handleIncomingTick(tick: MarketTick): Promise<void> {
    // 1. Notify WebSocket clients
    for (const sub of this.tickSubscribers) {
      sub(tick);
    }

    // 2. Evaluate active price alerts
    this.checkPriceAlerts(tick).catch((err) => {
      console.error('[MarketEngine] Error evaluating alerts:', err);
    });
  }

  private async checkPriceAlerts(tick: MarketTick): Promise<void> {
    const inst = await prisma.instrument.findUnique({
      where: { symbol: tick.symbol },
      select: { id: true },
    });

    if (!inst) return;

    const alerts = await prisma.priceAlert.findMany({
      where: {
        instrumentId: inst.id,
        isActive: true,
        triggered: false,
      },
    });

    for (const alert of alerts) {
      let isTriggered = false;
      if (alert.condition === 'ABOVE' && tick.price >= alert.targetPrice) {
        isTriggered = true;
      } else if (alert.condition === 'BELOW' && tick.price <= alert.targetPrice) {
        isTriggered = true;
      }

      if (isTriggered) {
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            triggered: true,
            triggeredAt: new Date(),
            isActive: false,
          },
        });

        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: alert.userId,
            title: `Price Alert Triggered: ${tick.symbol}`,
            body: `${tick.symbol} has hit your target of ${alert.targetPrice} (Current: ${tick.price})`,
            type: 'ALERT',
            metadata: JSON.stringify({ symbol: tick.symbol, price: tick.price }),
          },
        });
      }
    }
  }

  onTick(listener: (tick: MarketTick) => void): () => void {
    this.tickSubscribers.add(listener);
    return () => {
      this.tickSubscribers.delete(listener);
    };
  }

  async getQuote(symbol: string): Promise<NormalizedQuote | null> {
    return providerManager.getActiveProvider().getQuote(symbol);
  }
}

export const marketEngine = MarketEngine.getInstance();

