# Project Plan: Global Stock Market Platform
**Professional Multi-Market Financial Intelligence Platform (India & USA)**
*Web (React) + Mobile (React Native / Expo) + Backend (Node.js/Express) + PostgreSQL + Redis*

---

## 1. Executive Summary & Objective
The Global Stock Market Platform is a production-grade, enterprise-ready financial market information terminal designed to give traders and investors real-time and historical intelligence across both **Indian Markets (NSE, BSE, Nifty 50, Bank Nifty, Sensex)** and **US Markets (NASDAQ, NYSE, S&P 500, Dow Jones, ETFs)**.

The system is built upon a **commercial one-time purchase license model** (with transparent data provider entitlement tiers), preventing recurring subscription churn while safeguarding data provider quota costs.

---

## 2. Core Pillars & Architecture Principles
1. **No Simulated Data Disguise**: Every quote, chart, and financial metric carries explicit metadata flags (`isSimulated: boolean`, `provider: string`, `delayMinutes: number`, `asOf: ISO-8601`).
2. **Provider-Agnostic Adapter Pattern**: Live providers (NSE/BSE licensed feeds, Polygon.io, Finnhub, AlphaVantage) plug into a uniform interface (`IMarketDataProvider`). Dev environments use an integrated high-fidelity Mock Engine clearly labeled as `SIMULATED DATA`.
3. **Monorepo Shared Core**: All business rules, validation schemas, indicator algorithms, and API contracts reside in shared packages consumed identically by Web (React 18/Vite) and Mobile (Expo/React Native).
4. **Resilient Real-time Streaming**: WebSocket/Socket.IO connections deliver targeted symbol tick subscriptions with auto-reconnection, heartbeat, and Redis Pub/Sub multiplexing.
5. **Security by Design**: Argon2id password hashing, RS256/HS256 JWT auth, role-based access control (RBAC), CSRF protection, rate limiting, and strict audit logging.

---

## 3. Phased Execution Roadmap

### Phase 1: Workspace Setup & Foundational Monorepo
- Monorepo package structure with npm workspaces.
- Shared packages: `shared-types`, `validation`, `design-tokens`, `shared-utils`, `api-client`.
- Root scripts for build, lint, test, and dev orchestration.
- Git repository setup and initial remote linkage.

### Phase 2: Database Modeling & Persistence Layer
- Full PostgreSQL Prisma schema covering 24 normalized tables.
- Migrations, relational constraints, indexing on ticker/timestamp, and seed data.
- SQLite/PostgreSQL dual-driver compatibility for seamless zero-setup local dev and PostgreSQL production deployments.
- Comprehensive seed script with real India (NSE/BSE) and US (NASDAQ/NYSE) market symbols, indices, historical candles, news, and default roles/admin user.

### Phase 3: Core Backend Service (`apps/api`)
- Express + TypeScript server with modular routes (`/api/v1/*`).
- Authentication system: Register, Login, Refresh Token, Password Reset, Profile with Argon2id.
- Role-Based Access Control (Admin, Analyst, Pro User, Free User).
- Market Data Service & Pluggable Provider Architecture (`IMarketDataProvider`).
- High-fidelity Mock Data Provider for development with Geometric Brownian Motion tick generator.
- Socket.IO real-time server with room-based symbol subscriptions (`sub:AAPL`, `sub:RELIANCE.NS`).
- Watchlists, Price Alerts engine, Stock Screener, Company Fundamentals, Financial Statements.
- One-Time Purchase & License Key Generator with hardware/device binding & activation checks.
- Admin dashboard endpoints: Provider status, audit logs, user management, order approvals.

### Phase 4: Web Application (`apps/web`)
- Vite + React + TypeScript + Tailwind CSS with dark/light financial terminal styling.
- Global navigation: Market status bar, search command palette (Cmd+K), responsive mobile drawer.
- Global Market Overview: Indian indices (Nifty, Bank Nifty, Sensex) & US indices (S&P 500, Nasdaq, Dow).
- Stock Explorer & Screener with multi-criteria filtering (PE, Market Cap, Sector, Exchange, Price Change).
- Stock Details Page with interactive TradingView Lightweight Charts (Candlestick, Area, Volume, Indicators: SMA, EMA, RSI, MACD, Bollinger Bands).
- Fundamental Analysis tab: Balance Sheet, Income Statement, Cash Flow, Key Ratios.
- Real-time Watchlists & Price Alert manager with browser notifications.
- Admin Dashboard UI: System health, user/license management, audit logs, simulated market data controls.
- Store & Checkout: One-time license purchase flow, license key activation, device manager.

### Phase 5: Mobile Application (`apps/mobile`)
- Expo + React Native + TypeScript with Expo Router.
- Unified screens: Markets Overview, Watchlist, Stock Detail, Screener, Alerts, Settings.
- Dark theme matching the web design tokens.
- Cross-platform chart rendering and symbol quotes.

### Phase 6: Automated Testing & Verification
- Unit and integration tests using Vitest:
  - Password hashing & JWT validation.
  - Technical indicator calculations (RSI, SMA, EMA, MACD, Bollinger Bands).
  - Validation schemas (Zod).
  - Market data provider normalization & mock generator.
  - License key generation, verification, and device limits.
  - API endpoint integration tests.

### Phase 7: Deployment Infrastructure & Final Documentation
- Docker & Docker Compose setup (API, Web, PostgreSQL, Redis).
- Production deployment guides (Render, AWS, DigitalOcean, Nginx).
- Environment variable specifications.
- Push to GitHub remote repository (`https://github.com/kishansejani/stoke-market.git`).
