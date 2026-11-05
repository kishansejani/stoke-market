export interface CompanyProfile {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  ceo: string;
  employees: number;
  headquarters: string;
  website: string;
  foundedYear?: number;
  isin?: string;
}

export interface FinancialStatementPeriod {
  fiscalYear: number;
  fiscalQuarter?: number; // 1, 2, 3, 4 (or null for annual)
  periodEndDate: string;
  revenue: number;
  netIncome: number;
  operatingIncome?: number;
  eps: number;
  ebitda?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  operatingCashFlow?: number;
  freeCashFlow?: number;
  peRatio?: number;
  pbRatio?: number;
  debtToEquity?: number;
  dividendYield?: number;
}

export interface FinancialStatements {
  symbol: string;
  currency: 'INR' | 'USD';
  annual: FinancialStatementPeriod[];
  quarterly: FinancialStatementPeriod[];
}

