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
    fiscalQuarter?: number;
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
//# sourceMappingURL=fundamentals.d.ts.map