import { NormalizedQuote } from './quote';

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  instrumentId: string;
  symbol: string;
  ticker: string;
  name: string;
  exchange: string;
  sortOrder: number;
  addedAt: string;
  quote?: NormalizedQuote;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  items: WatchlistItem[];
}
