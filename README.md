# Stoke | Professional Global Stock Market Platform
**Enterprise Real-Time Financial Market Analytics Terminal**
*React.js + Node.js + PostgreSQL / SQLite + React Native (Expo) + Socket.IO*

---

## 1. Overview & Key Capabilities

Stoke is a production-grade financial intelligence platform designed for institutional-level exploration of both **Indian Markets (NSE, BSE, Nifty 50, Bank Nifty, Sensex)** and **US Markets (NASDAQ, NYSE, S&P 500, Dow Jones, ETFs)**.

### Architectural Highlights
- **No Simulated Data Disguise**: Every quote, candlestick chart, and financial metric carries explicit metadata flags (`isSimulated: boolean`, `dataSource: string`, `delayMinutes: number`, `lastTradeAt: ISO-8601`).
- **Provider-Agnostic Adapter Pattern**: Live providers (NSE/BSE licensed feeds, Polygon.io, Finnhub, AlphaVantage) plug into a uniform interface (`IMarketDataProvider`). Dev environments use an integrated high-fidelity Mock Engine clearly labeled as `SIMULATED DATA`.
- **TradingView Lightweight Charts™**: Multi-timeframe candlestick, area, and line series with real-time volume histogram and indicators (SMA 20/50, EMA 20, Bollinger Bands, RSI).
- **Commercial One-Time Purchase Business Model**: Eliminates recurring subscription churn while managing external cloud data provider costs through hardware-bound cryptographic license keys.
- **Unified Monorepo**: Shared TypeScript types, Zod validation schemas, technical indicators, and API client shared across Web (React 18 / Vite) and Mobile (Expo / React Native).

---

## 2. Monorepo Structure

```
stoke-market/
├── apps/
│   ├── api/                   # Node.js + Express + Prisma ORM + Socket.IO backend
│   ├── web/                   # React 18 + Vite + Tailwind CSS + TradingView Charts
│   └── mobile/                # React Native + Expo mobile application
├── packages/
│   ├── shared-types/          # Core TypeScript models (Quotes, Orders, Licenses, IAM)
│   ├── validation/            # Zod input validation schemas
│   ├── shared-utils/          # SMA, EMA, RSI, MACD, Bollinger Bands, INR/USD formatters
│   ├── design-tokens/         # Financial dark theme terminal color tokens
│   └── api-client/            # Typed REST & WebSocket client
├── infrastructure/
│   ├── docker/                # Multi-stage Dockerfiles
│   └── nginx/                 # Reverse proxy configuration
├── PROJECT_PLAN.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_DOCUMENTATION.md
├── DEVELOPMENT_PROGRESS.md
├── PENDING_TASKS.md
└── docker-compose.yml
```

---

## 3. Quick Start (Local Development)

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x`

### 1. Install Monorepo Dependencies
```bash
npm install
```

### 2. Build Shared Packages
```bash
npm run build
```

### 3. Initialize & Seed Database
```bash
cd apps/api
npx prisma db push --schema=prisma/schema.prisma
npx tsx prisma/seed.ts
cd ../..
```

### 4. Start Development Servers
In separate terminal tabs:
- **Backend API & Real-Time Engine**:
  ```bash
  npm run dev:api
  ```
  *Server running at: `http://localhost:5000` (REST base: `/api/v1`, WebSocket: `ws://localhost:5000`)*

- **Web Financial Terminal**:
  ```bash
  npm run dev:web
  ```
  *Web app running at: `http://localhost:5173`*

- **Mobile Application**:
  ```bash
  npm run dev:mobile
  ```

---

## 4. Pre-Seeded Sandbox Credentials

For quick evaluation, the seed script provisions:

| Role | Email | Password | Entitlements |
|---|---|---|---|
| **Super Admin** | `admin@stockmarket.com` | `Admin@123456` | Full platform control, provider switcher, audit logs |
| **Pro Trader** | `trader@stockmarket.com` | `Trader@123456` | Real-time tick stream, technical indicators, unlimited watchlists |

---

## 5. Commercial One-Time Purchase & Licensing

The platform implements a transparent one-time purchase software architecture:

1. **Perpetual Software Ownership**: When a user purchases a lifetime package (`Pro Financial Terminal` or `Enterprise Station`), the client software is unlocked perpetually.
2. **Cryptographic License Verification**: Licenses carry an HMAC-SHA256 signature (`STK-PRO-XXXX-XXXX-XXXX`) verified locally or via backend.
3. **Hardware Device Binding**: Each license enforces a maximum concurrent active machine seat limit (e.g. 3 devices for Pro, 10 devices for Enterprise). Users can release unused device slots anytime.
4. **Transparent Cloud Data Period**: Software access is perpetual, while included cloud exchange aggregation feeds are clearly designated with renewal dates or by linking personal direct broker API keys (Zerodha, Alpaca, Interactive Brokers).

---

## 6. Running Automated Tests

Run the Vitest and Node native test runner suites across all packages and apps:

```bash
# Test technical indicators & formatters
npm --workspace=@stock-market/shared-utils test

# Test Zod validation schemas
npm --workspace=@stock-market/validation test

# Test backend API licensing engine & data providers
npm --workspace=@stock-market/api test
```

---

## 7. Docker Deployment

Deploy with PostgreSQL, Redis, API, and Web Reverse Proxy in one command:
```bash
docker-compose up --build -d
```
Access the application on `http://localhost`.

