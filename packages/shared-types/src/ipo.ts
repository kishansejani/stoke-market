import { MarketId } from './market.js';

export type IPOStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'LISTED';
export type IPOCategory = 'MAINBOARD' | 'SME';

export interface IPOItem {
  id: string;
  symbol?: string;
  companyName: string;
  marketId: MarketId;
  exchange: string;
  category: IPOCategory;
  status: IPOStatus;
  priceBandLow: number;
  priceBandHigh: number;
  lotSize: number;
  issueSize: number; // In Cr for INR, Millions for USD
  openDate: string;
  closeDate: string;
  allotmentDate?: string;
  listingDate?: string;
  gmpPrice?: number; // Grey Market Premium in Currency (₹ or $)
  gmpPercent?: number; // Expected Gain %
  expectedProfit?: number; // Expected profit per lot
  subscriptionQIB?: number;
  subscriptionNII?: number;
  subscriptionRetail?: number;
  subscriptionTotal?: number;
  description?: string;
}

