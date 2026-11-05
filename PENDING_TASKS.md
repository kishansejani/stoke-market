# Pending Tasks & External Dependencies
**Global Stock Market Platform Task Tracker**

---

## 1. Development Tasks by Domain

### Packages (Shared Monorepo Libraries)
- [ ] Implement `packages/shared-types` (Models, Quotes, Orders, Auth, WebSocket, Indicators).
- [ ] Implement `packages/validation` (Zod schemas for Auth, Screener, Alerts, Orders, License).
- [ ] Implement `packages/design-tokens` (Color palette, typography, status badges, chart themes).
- [ ] Implement `packages/shared-utils` (Technical indicators: SMA, EMA, RSI, MACD, Bollinger; Currency formatting INR/USD; Market timezone handlers).
- [ ] Implement `packages/api-client` (Axios/fetch typed wrapper + Socket.IO connection manager).

### Backend (`apps/api`)
- [ ] Set up Express + TypeScript server with Prisma ORM.
- [ ] Create Prisma schema covering all 24 database tables.
- [ ] Create database seed script with sample stocks for NSE, BSE, NASDAQ, NYSE, initial market indices, company profiles, balance sheets, and admin credentials.
- [ ] Implement Auth module (Register, Login, Refresh, Me, Argon2id/bcrypt, JWT).
- [ ] Implement Market Data Engine & Provider Adapter Interface (`IMarketDataProvider`).
- [ ] Implement High-Fidelity Mock Market Provider (Geometric Brownian Motion tick simulation, marked clearly with `isSimulated: true`).
- [ ] Implement Real-Time Socket.IO symbol subscription server.
- [ ] Implement Market routes (`/api/v1/markets`, `/api/v1/stocks`, `/api/v1/quotes`, `/api/v1/charts`).
- [ ] Implement Company Fundamentals & Financial Statements routes.
- [ ] Implement Stock Screener & Market Movers engine.
- [ ] Implement Watchlist management CRUD.
- [ ] Implement Price Alerts evaluation engine.
- [ ] Implement One-Time Purchase & License Verification engine (HMAC cryptographic signing, device binding).
- [ ] Implement Admin panel endpoints (Stats, Users, Providers, System Audit Logs).

### Web Frontend (`apps/web`)
- [ ] Set up Vite + React + TypeScript + Tailwind CSS with dark financial terminal palette.
- [ ] Implement Global Layout: Header with real-time ticker bar, responsive collapsible Sidebar, Search command palette (Cmd+K), and mobile navigation bar.
- [ ] Implement Global Market Dashboard (India: Nifty 50, Bank Nifty, Sensex; US: S&P 500, Nasdaq, Dow).
- [ ] Implement Stock Details Page with TradingView Lightweight Charts (Candles, Volume, SMA/EMA/RSI/MACD toggles).
- [ ] Implement Company Fundamentals tab (Income Statement, Balance Sheet, Key Financial Ratios).
- [ ] Implement Market Movers (Gainers, Losers, High Volume).
- [ ] Implement Stock Screener with interactive filters.
- [ ] Implement Watchlist Manager with real-time streaming price updates.
- [ ] Implement Price Alert Manager with browser notification support.
- [ ] Implement Store & One-Time Purchase Checkout with license activation modal.
- [ ] Implement Admin Dashboard (User control, Provider switcher, Audit viewer).

### Mobile App (`apps/mobile`)
- [ ] Set up React Native Expo project with Expo Router & TypeScript.
- [ ] Create mobile screen layouts: Markets, Watchlists, Stock Details, Screener, Settings.
- [ ] Integrate shared API client & WebSocket subscription hook.

### Testing & Verification
- [ ] Vitest unit tests for technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands).
- [ ] Vitest tests for validation schemas.
- [ ] Vitest integration tests for API endpoints (Auth, Quotes, Watchlist, License).

### Deployment & Git Sync
- [ ] Multi-stage Dockerfiles & Docker Compose setup.
- [ ] Commit all code and push to GitHub remote repository (`https://github.com/kishansejani/stoke-market.git`).

---

## 2. External Dependencies & Commercial Permissions Status
*Note: In accordance with production compliance guidelines, the application supports commercial providers out-of-the-box via adapter interfaces, while shipping with a complete development mock generator.*

| Provider / Service | Purpose | Required Credentials | Current Development Status |
|---|---|---|---|
| Mock Market Engine | Local Dev & Sandbox Testing | None (Built-in) | **Ready / Active** (All quotes explicitly marked `isSimulated: true`) |
| Polygon.io | US Real-time / Delayed Stocks | `POLYGON_API_KEY` | Adapter implemented; configured via env |
| AlphaVantage | Fundamentals & Technicals | `ALPHAVANTAGE_API_KEY`| Adapter implemented; configured via env |
| NSE / BSE Feed | Licensed India Real-time Feed | Exchange License & Gateway URL | Adapter implemented; configured via env |
| Razorpay Gateway | India One-Time Checkout | `RAZORPAY_KEY_ID`, `KEY_SECRET` | Webhook & Signature verification adapter implemented |
| Stripe Gateway | Global One-Time Checkout | `STRIPE_SECRET_KEY`, `WEBHOOK_SECRET` | Checkout session & Webhook adapter implemented |
| PostgreSQL | Persistent Relational DB | `DATABASE_URL` | Prisma schema configured; ready for migration |
| Redis | Real-time Pub/Sub & Caching | `REDIS_URL` | In-memory fallback supported for zero-friction local run |

