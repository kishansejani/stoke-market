import { create } from 'zustand';
import { MarketId, MarketTick } from '@stock-market/shared-types';
import { realtime } from '../lib/api';

interface MarketState {
  activeMarket: MarketId;
  ticks: Record<string, MarketTick>;
  subscribedSymbols: string[];
  setActiveMarket: (market: MarketId) => void;
  subscribeSymbol: (symbol: string) => void;
  unsubscribeSymbol: (symbol: string) => void;
  updateTick: (tick: MarketTick) => void;
}

export const useMarketStore = create<MarketState>((set, get) => {
  // Listen for realtime ticks from Socket.IO client
  realtime.onTick((tick) => {
    get().updateTick(tick);
  });

  return {
    activeMarket: 'IN',
    ticks: {},
    subscribedSymbols: [],

    setActiveMarket: (market: MarketId) => set({ activeMarket: market }),

    subscribeSymbol: (symbol: string) => {
      const current = get().subscribedSymbols;
      if (!current.includes(symbol)) {
        const next = [...current, symbol];
        realtime.subscribe([symbol]);
        set({ subscribedSymbols: next });
      }
    },

    unsubscribeSymbol: (symbol: string) => {
      const current = get().subscribedSymbols;
      const next = current.filter((s) => s !== symbol);
      realtime.unsubscribe([symbol]);
      set({ subscribedSymbols: next });
    },

    updateTick: (tick: MarketTick) => {
      set((state) => ({
        ticks: {
          ...state.ticks,
          [tick.symbol]: tick,
        },
      }));
    },
  };
});
