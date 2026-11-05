# API Documentation
**Global Stock Market Platform REST & Real-time WebSocket API**
*Base Path: `/api/v1`*

---

## 1. Authentication & Security Specification

All secured endpoints require an HTTP Authorization Bearer token:
```
Authorization: Bearer <ACCESS_JWT_TOKEN>
```

Standard Response Format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive status",
  "meta": {
    "timestamp": "2026-11-05T07:45:00.000Z",
    "requestId": "req_847f9201"
  }
}
```

Standard Error Format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid password criteria",
    "details": [
      { "field": "password", "issue": "Minimum 8 characters required" }
    ]
  }
}
```

---

## 2. API Endpoints Catalog

### A. Authentication & Identity (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new user account | No |
| POST | `/auth/login` | Authenticate with email & password, returns JWT pair | No |
| POST | `/auth/refresh` | Exchange refresh token for fresh access token | No |
| POST | `/auth/logout` | Revoke session & blacklist refresh token | Yes |
| POST | `/auth/forgot-password` | Send password reset email | No |
| POST | `/auth/reset-password` | Reset password using reset token | No |
| GET | `/auth/me` | Retrieve active authenticated user profile & permissions | Yes |
| PUT | `/auth/profile` | Update profile preferences (theme, currency, timezone) | Yes |
| POST | `/auth/change-password` | Update account password | Yes |

### B. Markets & Exchanges (`/api/v1/markets`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/markets` | List all supported markets (`IN`, `US`) with open/closed status | No |
| GET | `/markets/:marketId/summary` | Market indices summary (Nifty, Sensex, S&P 500, Nasdaq) | No |
| GET | `/exchanges` | List supported exchanges (`NSE`, `BSE`, `NASDAQ`, `NYSE`) | No |

### C. Stocks & Instruments (`/api/v1/stocks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/stocks` | Paginated stock explorer with query filters | No |
| GET | `/stocks/search` | Quick auto-suggest search by ticker, name, or ISIN | No |
| GET | `/stocks/:symbol` | Detailed instrument overview, current quote, high/low | No |
| GET | `/stocks/:symbol/quote` | Latest real-time/delayed quote with simulation flag | No |
| GET | `/stocks/:symbol/chart` | Historical candlestick/line data (`1D`,`1W`,`1M`,`1Y`,`5Y`) | No |
| GET | `/stocks/:symbol/company` | Company profile (sector, CEO, website, employees) | No |
| GET | `/stocks/:symbol/financials`| Income statement, balance sheet, cash flows, key ratios | No |

### D. Market Movers & Screener (`/api/v1/screeners`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/screeners/movers` | Top gainers, top losers, most active by volume | No |
| POST | `/screeners/filter` | Multi-variable screener (market, sector, PE, market cap) | No |

### E. Watchlists (`/api/v1/watchlists`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/watchlists` | Get all watchlists for authenticated user | Yes |
| POST | `/watchlists` | Create new custom watchlist | Yes |
| GET | `/watchlists/:id` | Get watchlist details with live quote enrichments | Yes |
| PUT | `/watchlists/:id` | Rename watchlist | Yes |
| DELETE | `/watchlists/:id` | Delete watchlist | Yes |
| POST | `/watchlists/:id/items` | Add stock symbol to watchlist | Yes |
| DELETE | `/watchlists/:id/items/:symbol`| Remove stock symbol from watchlist | Yes |
| PUT | `/watchlists/:id/reorder` | Reorder symbols within watchlist | Yes |

### F. Price Alerts (`/api/v1/alerts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/alerts` | Get user's configured price alerts | Yes |
| POST | `/alerts` | Create price alert (above/below target, pct change) | Yes |
| DELETE | `/alerts/:id` | Delete price alert | Yes |
| PATCH | `/alerts/:id/toggle` | Toggle alert active/inactive | Yes |

### G. Financial News (`/api/v1/news`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/news` | Paginated market news filtered by market (`IN`/`US`) | No |
| GET | `/news/symbol/:symbol` | Company-specific announcements and news | No |

### H. Products, Orders & Licenses (`/api/v1/licenses`, `/api/v1/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/orders/products` | Catalog of one-time purchase software packages | No |
| POST | `/orders/checkout` | Create order for one-time license purchase | Yes |
| POST | `/orders/verify-payment` | Verify gateway signature & provision license | Yes |
| GET | `/orders/my-orders` | User order history and receipt status | Yes |
| GET | `/licenses/my-licenses` | User owned licenses, activation status, keys | Yes |
| POST | `/licenses/activate` | Activate license on current client device/machine | Yes |
| POST | `/licenses/deactivate` | Deactivate machine slot from license | Yes |
| POST | `/licenses/verify-offline` | Cryptographic offline signature verification | No |

### I. Administration & System Management (`/api/v1/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/admin/stats` | High-level metrics: users, licenses, revenue, orders | Admin |
| GET | `/admin/users` | User management list & status modification | Admin |
| PUT | `/admin/users/:id/status` | Suspend or activate user | Admin |
| GET | `/admin/providers` | Health, latency, quota usage of market data providers | Admin |
| POST | `/admin/providers/switch` | Toggle active provider or trigger simulated feed mode | Admin |
| GET | `/admin/audit-logs` | Security and administration audit trail | Admin |

---

## 3. Real-Time Socket.IO WebSocket Protocol

Connection URI: `ws://localhost:5000` (or `wss://api.yourdomain.com`)
Auth: Handshake query `{ token: "<JWT_ACCESS_TOKEN>" }` or anonymous public rooms.

### Client -> Server Events
1. `subscribe:symbols`
   - Payload: `{ symbols: ["AAPL.US", "RELIANCE.NS", "NIFTY50.IDX"] }`
   - Joins client to individual symbol rooms.
2. `unsubscribe:symbols`
   - Payload: `{ symbols: ["AAPL.US"] }`
   - Leaves symbol room.

### Server -> Client Events
1. `market:tick`
   - Payload:
   ```json
   {
     "symbol": "RELIANCE.NS",
     "price": 2845.50,
     "change": 32.10,
     "changePercent": 1.14,
     "high": 2860.00,
     "low": 2810.00,
     "volume": 6842010,
     "isSimulated": true,
     "timestamp": "2026-11-05T07:45:00.000Z"
   }
   ```
2. `market:status`
   - Payload: `{ market: "IN", status: "OPEN", serverTime: "2026-11-05T07:45:00.000Z" }`
3. `alert:triggered`
   - Payload: `{ alertId: "...", symbol: "AAPL.US", targetPrice: 220, currentPrice: 221.50 }`
