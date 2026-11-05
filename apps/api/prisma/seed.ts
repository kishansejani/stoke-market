import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Global Stock Market Database...');

  // 1. Markets
  await prisma.market.upsert({
    where: { id: 'IN' },
    update: {},
    create: {
      id: 'IN',
      name: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      tradingHoursStart: '09:15',
      tradingHoursEnd: '15:30',
      status: 'OPEN',
    },
  });

  await prisma.market.upsert({
    where: { id: 'US' },
    update: {},
    create: {
      id: 'US',
      name: 'United States',
      currency: 'USD',
      timezone: 'America/New_York',
      tradingHoursStart: '09:30',
      tradingHoursEnd: '16:00',
      status: 'OPEN',
    },
  });

  // 2. Exchanges
  const exchanges = [
    { id: 'NSE', marketId: 'IN', name: 'National Stock Exchange of India', country: 'India', website: 'https://www.nseindia.com' },
    { id: 'BSE', marketId: 'IN', name: 'Bombay Stock Exchange', country: 'India', website: 'https://www.bseindia.com' },
    { id: 'NASDAQ', marketId: 'US', name: 'NASDAQ Stock Market', country: 'United States', website: 'https://www.nasdaq.com' },
    { id: 'NYSE', marketId: 'US', name: 'New York Stock Exchange', country: 'United States', website: 'https://www.nyse.com' },
  ];

  for (const ex of exchanges) {
    await prisma.exchange.upsert({
      where: { id: ex.id },
      update: {},
      create: ex,
    });
  }

  // 3. Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system privileges and configuration' },
    { name: 'ADMIN', description: 'User management, order approval, data monitor' },
    { name: 'ANALYST', description: 'Market research and data curator' },
    { name: 'PRO_USER', description: 'Subscribed pro trader with real-time stream' },
    { name: 'FREE_USER', description: 'Standard user with delayed quotes' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // 4. Default Users
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const traderHash = await bcrypt.hash('Trader@123456', 10);

  const adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const proRole = await prisma.role.findUnique({ where: { name: 'PRO_USER' } });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stockmarket.com' },
    update: {},
    create: {
      email: 'admin@stockmarket.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      isEmailVerified: true,
      status: 'ACTIVE',
      profile: {
        create: {
          theme: 'DARK',
          preferredCurrency: 'INR',
          defaultMarket: 'IN',
          timezone: 'Asia/Kolkata',
          bio: 'Platform Chief Architect & Security Admin',
        },
      },
    },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
  }

  const traderUser = await prisma.user.upsert({
    where: { email: 'trader@stockmarket.com' },
    update: {},
    create: {
      email: 'trader@stockmarket.com',
      passwordHash: traderHash,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      isEmailVerified: true,
      status: 'ACTIVE',
      profile: {
        create: {
          theme: 'DARK',
          preferredCurrency: 'INR',
          defaultMarket: 'IN',
          timezone: 'Asia/Kolkata',
          bio: 'Equity Swing Trader & Quantitative Investor',
        },
      },
    },
  });

  if (proRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: traderUser.id, roleId: proRole.id } },
      update: {},
      create: { userId: traderUser.id, roleId: proRole.id },
    });
  }

  // 5. Products for One-Time Purchase
  const products = [
    {
      slug: 'pro-terminal-lifetime',
      name: 'Pro Financial Terminal (Perpetual)',
      tagline: 'Complete professional terminal for active traders & retail quants',
      description: 'One-time perpetual license with multi-screen desktop/web/mobile access, TradingView indicators, Screener, and 1-Year included real-time cloud data feed.',
      priceINR: 1499900, // Rs 14,999
      priceUSD: 19900,   // $199
      maxActivations: 3,
      dataIncludedDays: 365,
      features: JSON.stringify([
        'Full Web, Mobile & Desktop Terminal access',
        'Real-time streaming quotes for NSE, BSE, NASDAQ, NYSE',
        'TradingView Lightweight Charts + 25+ Indicators',
        'Unlimited Watchlists & Custom Alerts',
        'Fundamental Statements & Financial Ratios',
        'Multi-variable Stock Screener',
        '1-Year Included Real-time Market Data Connector',
        'Connect your own broker API keys (Zerodha, Alpaca, IBKR) forever',
      ]),
    },
    {
      slug: 'enterprise-terminal-lifetime',
      name: 'Enterprise Trading Station (Perpetual)',
      tagline: 'Institutional-grade analytics for family offices & prop firms',
      description: 'Full team terminal access with 10 device seats, priority tick delivery, institutional historical data, custom alert webhooks, and phone support.',
      priceINR: 4999900, // Rs 49,999
      priceUSD: 59900,   // $599
      maxActivations: 10,
      dataIncludedDays: 730,
      features: JSON.stringify([
        '10 Multi-device workstation seats',
        'Sub-millisecond priority tick streaming',
        '20+ Years Historical Tick & Daily Bar Data',
        'Custom Webhooks for Algorithmic Trading Bots',
        'Dedicated SLA & Architecture Consultation',
        'Direct FIX / Exchange Protocol connector support',
      ]),
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }

  // 6. Data Providers
  const providers = [
    { code: 'MOCK', name: 'Integrated High-Fidelity Simulator', isMock: true, isActive: true, quotaLimit: 10000000 },
    { code: 'POLYGON', name: 'Polygon.io US Real-Time Feed', isMock: false, isActive: false, quotaLimit: 250000 },
    { code: 'NSE_LICENSED', name: 'Licensed National Stock Exchange Feed', isMock: false, isActive: false, quotaLimit: 500000 },
    { code: 'ALPHAVANTAGE', name: 'AlphaVantage Financials & Macro', isMock: false, isActive: false, quotaLimit: 100000 },
  ];

  for (const prov of providers) {
    await prisma.dataProvider.upsert({
      where: { code: prov.code },
      update: {},
      create: prov,
    });
  }

  // 7. Seed Instruments, Quotes, Profiles, Financials, History
  interface SeedInstrument {
    symbol: string;
    ticker: string;
    name: string;
    exchangeId: string;
    marketId: string;
    type: string;
    currency: string;
    sector: string;
    industry: string;
    isin: string;
    price: number;
    prevClose: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    marketCap: number;
    peRatio: number;
    profile: {
      description: string;
      ceo: string;
      employees: number;
      headquarters: string;
      website: string;
    };
    financials: {
      revenue: number;
      netIncome: number;
      eps: number;
      peRatio: number;
      pbRatio: number;
      debtToEquity: number;
      dividendYield: number;
    };
  }

  const seedInstruments: SeedInstrument[] = [
    // INDIA INDICES
    {
      symbol: 'NIFTY50.IDX',
      ticker: 'NIFTY50',
      name: 'NIFTY 50 Index',
      exchangeId: 'NSE',
      marketId: 'IN',
      type: 'INDEX',
      currency: 'INR',
      sector: 'Broad Market',
      industry: 'Index',
      isin: 'IN9000000001',
      price: 24350.25,
      prevClose: 24200.50,
      open: 24230.00,
      high: 24410.80,
      low: 24190.10,
      volume: 450000000,
      marketCap: 185000000000000,
      peRatio: 22.8,
      profile: {
        description: 'The NIFTY 50 is the flagship index of the National Stock Exchange of India, representing 50 of the largest Indian companies listed across 13 sectors.',
        ceo: 'Ashishkumar Chauhan (NSE MD & CEO)',
        employees: 1200,
        headquarters: 'Mumbai, Maharashtra, India',
        website: 'https://www.nseindia.com',
      },
      financials: { revenue: 4500000000000, netIncome: 650000000000, eps: 1068.0, peRatio: 22.8, pbRatio: 3.4, debtToEquity: 0.8, dividendYield: 1.2 },
    },
    {
      symbol: 'BANKNIFTY.IDX',
      ticker: 'BANKNIFTY',
      name: 'NIFTY Bank Index',
      exchangeId: 'NSE',
      marketId: 'IN',
      type: 'INDEX',
      currency: 'INR',
      sector: 'Financial Services',
      industry: 'Banking Index',
      isin: 'IN9000000002',
      price: 52180.60,
      prevClose: 51850.20,
      open: 51920.00,
      high: 52350.00,
      low: 51800.00,
      volume: 320000000,
      marketCap: 45000000000000,
      peRatio: 16.5,
      profile: {
        description: 'NIFTY Bank Index comprises the most liquid and large Indian banking stocks, serving as the primary benchmark for the Indian banking sector.',
        ceo: 'Ashishkumar Chauhan',
        employees: 1200,
        headquarters: 'Mumbai, Maharashtra, India',
        website: 'https://www.nseindia.com',
      },
      financials: { revenue: 2100000000000, netIncome: 310000000000, eps: 3162.0, peRatio: 16.5, pbRatio: 2.1, debtToEquity: 1.5, dividendYield: 1.1 },
    },
    {
      symbol: 'SENSEX.IDX',
      ticker: 'SENSEX',
      name: 'BSE SENSEX 30',
      exchangeId: 'BSE',
      marketId: 'IN',
      type: 'INDEX',
      currency: 'INR',
      sector: 'Broad Market',
      industry: 'Index',
      isin: 'IN9000000003',
      price: 80120.45,
      prevClose: 79650.10,
      open: 79750.00,
      high: 80340.50,
      low: 79600.00,
      volume: 280000000,
      marketCap: 155000000000000,
      peRatio: 23.4,
      profile: {
        description: 'S&P BSE SENSEX is the oldest and most tracked benchmark stock market index of 30 well-established and financially sound companies listed on BSE.',
        ceo: 'Sundararaman Ramamurthy (BSE MD & CEO)',
        employees: 950,
        headquarters: 'Dalal Street, Mumbai, India',
        website: 'https://www.bseindia.com',
      },
      financials: { revenue: 4200000000000, netIncome: 610000000000, eps: 3424.0, peRatio: 23.4, pbRatio: 3.5, debtToEquity: 0.85, dividendYield: 1.15 },
    },

    // INDIA BLUE CHIP STOCKS
    {
      symbol: 'RELIANCE.NS',
      ticker: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      exchangeId: 'NSE',
      marketId: 'IN',
      type: 'STOCK',
      currency: 'INR',
      sector: 'Energy & Telecommunications',
      industry: 'Conglomerate',
      isin: 'INE002A01018',
      price: 2845.50,
      prevClose: 2813.40,
      open: 2820.00,
      high: 2862.00,
      low: 2810.00,
      volume: 6842000,
      marketCap: 19250000000000,
      peRatio: 27.4,
      profile: {
        description: 'Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications (Jio), and media.',
        ceo: 'Mukesh D. Ambani',
        employees: 389000,
        headquarters: 'Maker Chambers IV, Nariman Point, Mumbai, India',
        website: 'https://www.ril.com',
      },
      financials: { revenue: 9982410000000, netIncome: 696210000000, eps: 102.8, peRatio: 27.4, pbRatio: 2.2, debtToEquity: 0.42, dividendYield: 0.35 },
    },
    {
      symbol: 'TCS.NS',
      ticker: 'TCS',
      name: 'Tata Consultancy Services Ltd.',
      exchangeId: 'NSE',
      marketId: 'IN',
      type: 'STOCK',
      currency: 'INR',
      sector: 'Information Technology',
      industry: 'IT Services & Consulting',
      isin: 'INE467B01029',
      price: 3950.80,
      prevClose: 3995.20,
      open: 3980.00,
      high: 4015.00,
      low: 3935.00,
      volume: 2410000,
      marketCap: 14280000000000,
      peRatio: 30.1,
      profile: {
        description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company. It is a part of the Tata Group and operates in 150 locations across 46 countries.',
        ceo: 'K. Krithivasan',
        employees: 601546,
        headquarters: 'TCS House, Raveline Street, Fort, Mumbai, India',
        website: 'https://www.tcs.com',
      },
      financials: { revenue: 2408930000000, netIncome: 460990000000, eps: 126.8, peRatio: 30.1, pbRatio: 14.5, debtToEquity: 0.08, dividendYield: 1.85 },
    },
    {
      symbol: 'HDFCBANK.NS',
      ticker: 'HDFCBANK',
      name: 'HDFC Bank Ltd.',
      exchangeId: 'NSE',
      marketId: 'IN',
      type: 'STOCK',
      currency: 'INR',
      sector: 'Financial Services',
      industry: 'Private Sector Bank',
      isin: 'INE040A01034',
      price: 1685.20,
      prevClose: 1660.00,
      open: 1665.00,
      high: 1694.50,
      low: 1658.00,
      volume: 14200000,
      marketCap: 12850000000000,
      peRatio: 19.8,
      profile: {
        description: 'HDFC Bank Limited is the largest private sector bank in India by assets and market capitalization. It offers personal, corporate, and digital banking solutions.',
        ceo: 'Sashidhar Jagdishan',
        employees: 213527,
        headquarters: 'HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai, India',
        website: 'https://www.hdfcbank.com',
      },
      financials: { revenue: 2950000000000, netIncome: 640000000000, eps: 85.1, peRatio: 19.8, pbRatio: 2.8, debtToEquity: 1.25, dividendYield: 1.16 },
    },
    {
      symbol: 'INFY.NS',
      ticker: 'INFY',
      name: 'Infosys Ltd.',
      exchangeId: 'NSE',
      marketId: 'IN',
      type: 'STOCK',
      currency: 'INR',
      sector: 'Information Technology',
      industry: 'IT Services & Consulting',
      isin: 'INE009A01021',
      price: 1820.40,
      prevClose: 1845.00,
      open: 1840.00,
      high: 1855.00,
      low: 1812.00,
      volume: 5320000,
      marketCap: 7560000000000,
      peRatio: 28.5,
      profile: {
        description: 'Infosys Limited is a global leader in next-generation digital services and consulting, enabling clients across 56 countries to navigate digital transformation.',
        ceo: 'Salil Parekh',
        employees: 317240,
        headquarters: 'Electronics City, Hosur Road, Bengaluru, Karnataka, India',
        website: 'https://www.infosys.com',
      },
      financials: { revenue: 1536700000000, netIncome: 262480000000, eps: 63.8, peRatio: 28.5, pbRatio: 8.9, debtToEquity: 0.11, dividendYield: 2.2 },
    },

    // USA INDICES
    {
      symbol: 'SPX.IDX',
      ticker: 'SPX',
      name: 'S&P 500 Index',
      exchangeId: 'NYSE',
      marketId: 'US',
      type: 'INDEX',
      currency: 'USD',
      sector: 'Broad Market',
      industry: 'Index',
      isin: 'US78378X1072',
      price: 5864.20,
      prevClose: 5815.10,
      open: 5825.00,
      high: 5878.90,
      low: 5820.00,
      volume: 2450000000,
      marketCap: 45000000000000,
      peRatio: 25.2,
      profile: {
        description: 'The S&P 500 is a stock market index tracking the stock performance of 500 leading companies listed on stock exchanges in the United States.',
        ceo: 'Dan Draper (S&P Dow Jones CEO)',
        employees: 5000,
        headquarters: 'New York, NY, USA',
        website: 'https://www.spglobal.com',
      },
      financials: { revenue: 18000000000000, netIncome: 1950000000000, eps: 232.7, peRatio: 25.2, pbRatio: 4.8, debtToEquity: 1.1, dividendYield: 1.32 },
    },
    {
      symbol: 'NDX.IDX',
      ticker: 'NDX',
      name: 'NASDAQ 100 Index',
      exchangeId: 'NASDAQ',
      marketId: 'US',
      type: 'INDEX',
      currency: 'USD',
      sector: 'Technology & Innovation',
      industry: 'Index',
      isin: 'US6311011026',
      price: 20380.40,
      prevClose: 20150.80,
      open: 20210.00,
      high: 20450.00,
      low: 20180.00,
      volume: 3850000000,
      marketCap: 22000000000000,
      peRatio: 31.4,
      profile: {
        description: 'The NASDAQ-100 includes 100 of the largest domestic and international non-financial companies listed on The Nasdaq Stock Market based on market capitalization.',
        ceo: 'Adena Friedman (NASDAQ Chair & CEO)',
        employees: 6200,
        headquarters: '151 W. 42nd Street, New York, NY, USA',
        website: 'https://www.nasdaq.com',
      },
      financials: { revenue: 11500000000000, netIncome: 1420000000000, eps: 649.0, peRatio: 31.4, pbRatio: 7.2, debtToEquity: 0.9, dividendYield: 0.78 },
    },

    // USA BLUE CHIP STOCKS
    {
      symbol: 'AAPL.US',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchangeId: 'NASDAQ',
      marketId: 'US',
      type: 'STOCK',
      currency: 'USD',
      sector: 'Technology',
      industry: 'Consumer Electronics & Software',
      isin: 'US0378331005',
      price: 232.40,
      prevClose: 228.60,
      open: 229.50,
      high: 233.80,
      low: 228.90,
      volume: 48900000,
      marketCap: 3520000000000,
      peRatio: 34.8,
      profile: {
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services (App Store, Apple Music, iCloud).',
        ceo: 'Tim Cook',
        employees: 161000,
        headquarters: 'One Apple Park Way, Cupertino, CA 95014, USA',
        website: 'https://www.apple.com',
      },
      financials: { revenue: 383285000000, netIncome: 96995000000, eps: 6.67, peRatio: 34.8, pbRatio: 48.5, debtToEquity: 1.45, dividendYield: 0.43 },
    },
    {
      symbol: 'MSFT.US',
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      exchangeId: 'NASDAQ',
      marketId: 'US',
      type: 'STOCK',
      currency: 'USD',
      sector: 'Technology',
      industry: 'Software & Cloud Infrastructure',
      isin: 'US5949181045',
      price: 428.15,
      prevClose: 422.30,
      open: 424.00,
      high: 430.50,
      low: 421.80,
      volume: 21300000,
      marketCap: 3180000000000,
      peRatio: 35.6,
      profile: {
        description: 'Microsoft develops and supports software, services, devices, and solutions worldwide, including Azure Cloud, Windows, Office 365, LinkedIn, and Xbox gaming.',
        ceo: 'Satya Nadella',
        employees: 221000,
        headquarters: 'One Microsoft Way, Redmond, WA 98052, USA',
        website: 'https://www.microsoft.com',
      },
      financials: { revenue: 245122000000, netIncome: 88136000000, eps: 12.02, peRatio: 35.6, pbRatio: 12.8, debtToEquity: 0.41, dividendYield: 0.75 },
    },
    {
      symbol: 'NVDA.US',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      exchangeId: 'NASDAQ',
      marketId: 'US',
      type: 'STOCK',
      currency: 'USD',
      sector: 'Technology',
      industry: 'Semiconductors & AI Hardware',
      isin: 'US67066G1040',
      price: 141.50,
      prevClose: 137.20,
      open: 138.50,
      high: 143.20,
      low: 137.90,
      volume: 72400000,
      marketCap: 3470000000000,
      peRatio: 58.2,
      profile: {
        description: 'NVIDIA Corporation pioneered GPU-accelerated computing and leads modern artificial intelligence hardware, data centers, robotics, and high-performance computing.',
        ceo: 'Jensen Huang',
        employees: 29600,
        headquarters: '2788 San Tomas Expressway, Santa Clara, CA 95051, USA',
        website: 'https://www.nvidia.com',
      },
      financials: { revenue: 60922000000, netIncome: 29760000000, eps: 2.43, peRatio: 58.2, pbRatio: 42.1, debtToEquity: 0.25, dividendYield: 0.03 },
    },
    {
      symbol: 'AMZN.US',
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      exchangeId: 'NASDAQ',
      marketId: 'US',
      type: 'STOCK',
      currency: 'USD',
      sector: 'Consumer Discretionary',
      industry: 'E-commerce & Cloud Computing',
      isin: 'US0231351067',
      price: 198.80,
      prevClose: 195.40,
      open: 196.20,
      high: 200.10,
      low: 195.10,
      volume: 38200000,
      marketCap: 2070000000000,
      peRatio: 42.5,
      profile: {
        description: 'Amazon focuses on e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.',
        ceo: 'Andy Jassy',
        employees: 1525000,
        headquarters: '410 Terry Avenue North, Seattle, WA 98109, USA',
        website: 'https://www.amazon.com',
      },
      financials: { revenue: 574785000000, netIncome: 30425000000, eps: 4.67, peRatio: 42.5, pbRatio: 8.5, debtToEquity: 0.72, dividendYield: 0.0 },
    },
  ];

  for (const item of seedInstruments) {
    const change = Number((item.price - item.prevClose).toFixed(2));
    const changePercent = Number(((change / item.prevClose) * 100).toFixed(2));

    const instrument = await prisma.instrument.upsert({
      where: { symbol: item.symbol },
      update: {
        name: item.name,
        exchangeId: item.exchangeId,
        marketId: item.marketId,
        currency: item.currency,
        sector: item.sector,
        industry: item.industry,
        isin: item.isin,
      },
      create: {
        symbol: item.symbol,
        ticker: item.ticker,
        name: item.name,
        exchangeId: item.exchangeId,
        marketId: item.marketId,
        type: item.type,
        currency: item.currency,
        sector: item.sector,
        industry: item.industry,
        isin: item.isin,
      },
    });

    // Stock quote
    await prisma.stockQuote.upsert({
      where: { instrumentId: instrument.id },
      update: {
        price: item.price,
        previousClose: item.prevClose,
        open: item.open,
        high: item.high,
        low: item.low,
        volume: item.volume,
        change,
        changePercent,
        day52WeekHigh: Number((item.price * 1.18).toFixed(2)),
        day52WeekLow: Number((item.price * 0.76).toFixed(2)),
        marketCap: item.marketCap,
        peRatio: item.peRatio,
        isSimulated: true, // Marked clearly as SIMULATED DATA
        delayMinutes: 0,
        dataSource: 'SIMULATED_DATA_GENERATOR',
      },
      create: {
        instrumentId: instrument.id,
        price: item.price,
        previousClose: item.prevClose,
        open: item.open,
        high: item.high,
        low: item.low,
        volume: item.volume,
        change,
        changePercent,
        day52WeekHigh: Number((item.price * 1.18).toFixed(2)),
        day52WeekLow: Number((item.price * 0.76).toFixed(2)),
        marketCap: item.marketCap,
        peRatio: item.peRatio,
        isSimulated: true,
        delayMinutes: 0,
        dataSource: 'SIMULATED_DATA_GENERATOR',
      },
    });

    // Company Profile
    const profile = await prisma.companyProfile.upsert({
      where: { instrumentId: instrument.id },
      update: item.profile,
      create: {
        instrumentId: instrument.id,
        ...item.profile,
        sector: item.sector,
        industry: item.industry,
      },
    });

    // Financial Statements
    await prisma.companyFinancial.deleteMany({ where: { companyProfileId: profile.id } });
    await prisma.companyFinancial.create({
      data: {
        companyProfileId: profile.id,
        fiscalYear: 2025,
        periodEndDate: new Date('2025-12-31'),
        ...item.financials,
      },
    });

    // Historical candles (30 daily candles)
    await prisma.historicalPrice.deleteMany({ where: { instrumentId: instrument.id } });
    const candlesToInsert = [];
    let currentBarClose = item.price;
    const now = new Date();

    for (let day = 30; day >= 0; day--) {
      const candleDate = new Date(now.getTime() - day * 24 * 3600 * 1000);
      const volatility = 0.015;
      const dailyDrift = (Math.random() - 0.48) * volatility;
      const open = Number((currentBarClose * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2));
      const close = Number((open * (1 + dailyDrift)).toFixed(2));
      const high = Number((Math.max(open, close) * (1 + Math.random() * 0.01)).toFixed(2));
      const low = Number((Math.min(open, close) * (1 - Math.random() * 0.01)).toFixed(2));
      const volume = Math.floor(item.volume * (0.7 + Math.random() * 0.6));

      currentBarClose = close;

      candlesToInsert.push({
        instrumentId: instrument.id,
        timestamp: candleDate,
        open,
        high,
        low,
        close,
        volume,
        timeframe: '1d',
        isSimulated: true,
      });
    }

    await prisma.historicalPrice.createMany({
      data: candlesToInsert,
    });
  }

  // 8. Market News
  const newsItems = [
    {
      marketId: 'IN',
      title: 'RBI Monetary Policy Committee Maintains Status Quo on Repo Rates, Projects 7.2% GDP Growth',
      summary: 'Reserve Bank of India Governor highlights robust domestic macroeconomic fundamentals and easing inflation trajectories across urban and rural markets.',
      source: 'Economic Times',
      url: 'https://economictimes.indiatimes.com/markets',
      sentiment: 'BULLISH',
      relatedSymbols: 'NIFTY50.IDX,BANKNIFTY.IDX,HDFCBANK.NS',
    },
    {
      marketId: 'IN',
      title: 'Reliance Industries Clean Energy Gigafactories in Jamnagar Approach Phase 1 Commissioning',
      summary: 'Mukesh Ambani outlines solar photovoltaic cell manufacturing timeline and green hydrogen electrolyzer rollout schedule.',
      source: 'Mint',
      url: 'https://www.livemint.com/companies/news',
      sentiment: 'BULLISH',
      relatedSymbols: 'RELIANCE.NS',
    },
    {
      marketId: 'US',
      title: 'US Tech Equities Surge on Enterprise AI Cloud Infrastructure Spending Momentum',
      summary: 'NVIDIA, Microsoft, and Apple report record-breaking hardware orders and data center expansions heading into the next fiscal quarter.',
      source: 'Bloomberg Markets',
      url: 'https://www.bloomberg.com/markets',
      sentiment: 'BULLISH',
      relatedSymbols: 'SPX.IDX,NDX.IDX,NVDA.US,MSFT.US,AAPL.US',
    },
  ];

  for (const n of newsItems) {
    await prisma.marketNews.create({
      data: n,
    });
  }

  // 9. Initial Default Watchlist for Trader User
  const defaultWatchlist = await prisma.watchlist.upsert({
    where: { id: 'default_trader_wl' },
    update: {},
    create: {
      id: 'default_trader_wl',
      userId: traderUser.id,
      name: 'Core Holdings & Watch',
      isDefault: true,
    },
  });

  const sampleSymbolsToWatch = ['RELIANCE.NS', 'TCS.NS', 'AAPL.US', 'NVDA.US'];
  for (let i = 0; i < sampleSymbolsToWatch.length; i++) {
    const inst = await prisma.instrument.findUnique({ where: { symbol: sampleSymbolsToWatch[i] } });
    if (inst) {
      await prisma.watchlistItem.upsert({
        where: { watchlistId_instrumentId: { watchlistId: defaultWatchlist.id, instrumentId: inst.id } },
        update: {},
        create: {
          watchlistId: defaultWatchlist.id,
          instrumentId: inst.id,
          sortOrder: i,
        },
      });
    }
  }

  console.log('Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
