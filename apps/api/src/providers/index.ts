import { IMarketDataProvider } from './types';
import { MockMarketDataProvider } from './mockProvider';
import { PolygonMarketDataProvider } from './polygonProvider';
import { IndianMarketDataProvider } from './indianMarketProvider';
import { config } from '../config';

class ProviderManager {
  private activeProvider: IMarketDataProvider;
  private providers = new Map<string, IMarketDataProvider>();

  constructor() {
    const mock = new MockMarketDataProvider();
    const polygon = new PolygonMarketDataProvider();
    const indian = new IndianMarketDataProvider();

    this.providers.set('MOCK', mock);
    this.providers.set('POLYGON', polygon);
    this.providers.set('NSE_LICENSED', indian);

    this.activeProvider = this.providers.get(config.marketProvider) || mock;
  }

  async initialize(): Promise<void> {
    console.log(`[ProviderManager] Initializing active market data provider: ${this.activeProvider.name}`);
    await this.activeProvider.initialize();
  }

  getActiveProvider(): IMarketDataProvider {
    return this.activeProvider;
  }

  switchProvider(providerId: string): boolean {
    const next = this.providers.get(providerId);
    if (!next) return false;
    this.activeProvider = next;
    console.log(`[ProviderManager] Switched active provider to: ${next.name}`);
    return true;
  }

  getAllProvidersInfo() {
    return Array.from(this.providers.values()).map((p) => ({
      providerId: p.providerId,
      name: p.name,
      isMock: p.isMock,
      isActive: p.providerId === this.activeProvider.providerId,
    }));
  }
}

export const providerManager = new ProviderManager();
