import { io, Socket } from 'socket.io-client';
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
  MarketInfo,
  IndexSummary,
  NormalizedQuote,
  Candle,
  ChartRange,
  CompanyProfile,
  FinancialStatements,
  ScreenerResult,
  ScreenerFilter,
  MarketMovers,
  Watchlist,
  PriceAlert,
  CreateAlertInput,
  NewsArticle,
  ProductPackage,
  Order,
  CheckoutResponse,
  PaymentVerificationRequest,
  License,
  LicenseValidationResult,
  MarketTick,
} from '@stock-market/shared-types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  setToken?: (token: string, refreshToken?: string) => void;
  onAuthError?: () => void;
}

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;
  private setToken?: (token: string, refreshToken?: string) => void;
  private onAuthError?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getToken = config.getToken;
    this.setToken = config.setToken;
    this.onAuthError = config.onAuthError;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken ? this.getToken() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.onAuthError) {
      this.onAuthError();
    }

    const json: ApiResponse<T> = await response.json().catch(() => {
      throw new Error(`Invalid JSON response from server (Status ${response.status})`);
    });

    if (!response.ok || !json.success) {
      const errorMsg = json.error?.message || json.message || `API request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return json.data;
  }

  // Auth Endpoints
  async register(data: RegisterInput): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(data: Partial<User['profile']> & { firstName?: string; lastName?: string }): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Markets & Overview
  async getMarkets(): Promise<MarketInfo[]> {
    return this.request<MarketInfo[]>('/markets');
  }

  async getMarketSummary(marketId: 'IN' | 'US'): Promise<IndexSummary[]> {
    return this.request<IndexSummary[]>(`/markets/${marketId}/summary`);
  }

  // Stocks & Quotes
  async searchStocks(query: string, market?: string): Promise<NormalizedQuote[]> {
    const params = new URLSearchParams({ q: query });
    if (market) params.append('market', market);
    return this.request<NormalizedQuote[]>(`/stocks/search?${params.toString()}`);
  }

  async getStock(symbol: string): Promise<NormalizedQuote> {
    return this.request<NormalizedQuote>(`/stocks/${encodeURIComponent(symbol)}`);
  }

  async getStockChart(symbol: string, range: ChartRange = '1M'): Promise<Candle[]> {
    return this.request<Candle[]>(`/stocks/${encodeURIComponent(symbol)}/chart?range=${range}`);
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    return this.request<CompanyProfile>(`/stocks/${encodeURIComponent(symbol)}/company`);
  }

  async getCompanyFinancials(symbol: string): Promise<FinancialStatements> {
    return this.request<FinancialStatements>(`/stocks/${encodeURIComponent(symbol)}/financials`);
  }

  // Screeners & Movers
  async getMarketMovers(market?: 'IN' | 'US'): Promise<MarketMovers> {
    const params = market ? `?market=${market}` : '';
    return this.request<MarketMovers>(`/screeners/movers${params}`);
  }

  async runScreener(filters: ScreenerFilter): Promise<ScreenerResult> {
    return this.request<ScreenerResult>('/screeners/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Watchlists
  async getWatchlists(): Promise<Watchlist[]> {
    return this.request<Watchlist[]>('/watchlists');
  }

  async createWatchlist(name: string): Promise<Watchlist> {
    return this.request<Watchlist>('/watchlists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async addWatchlistItem(watchlistId: string, symbol: string): Promise<Watchlist> {
    return this.request<Watchlist>(`/watchlists/${watchlistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  }

  async removeWatchlistItem(watchlistId: string, symbol: string): Promise<Watchlist> {
    return this.request<Watchlist>(`/watchlists/${watchlistId}/items/${encodeURIComponent(symbol)}`, {
      method: 'DELETE',
    });
  }

  // Alerts
  async getAlerts(): Promise<PriceAlert[]> {
    return this.request<PriceAlert[]>('/alerts');
  }

  async createAlert(data: CreateAlertInput): Promise<PriceAlert> {
    return this.request<PriceAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(alertId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  // News
  async getNews(market?: 'IN' | 'US', limit = 20): Promise<NewsArticle[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (market) params.append('market', market);
    return this.request<NewsArticle[]>(`/news?${params.toString()}`);
  }

  // Products, Orders & Licenses
  async getProducts(): Promise<ProductPackage[]> {
    return this.request<ProductPackage[]>('/orders/products');
  }

  async checkoutOrder(productId: string, currency: 'INR' | 'USD', gateway = 'MOCK_SANDBOX'): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ productId, currency, gateway }),
    });
  }

  async verifyPayment(verification: PaymentVerificationRequest): Promise<Order> {
    return this.request<Order>('/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify(verification),
    });
  }

  async getMyLicenses(): Promise<License[]> {
    return this.request<License[]>('/licenses/my-licenses');
  }

  async activateLicense(data: { licenseKey: string; deviceId: string; os: string; deviceName: string }): Promise<LicenseValidationResult> {
    return this.request<LicenseValidationResult>('/licenses/activate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin Endpoints
  async getAdminStats(): Promise<any> {
    return this.request<any>('/admin/stats');
  }

  async getAdminUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users');
  }

  async getAdminProviders(): Promise<any[]> {
    return this.request<any[]>('/admin/providers');
  }

  async getAdminAuditLogs(): Promise<any[]> {
    return this.request<any[]>('/admin/audit-logs');
  }
}

/**
 * Realtime WebSocket manager for Socket.IO symbol stream subscriptions
 */
export class RealtimeClient {
  private socket: Socket | null = null;
  private url: string;
  private subscribedSymbols = new Set<string>();
  private tickListeners = new Set<(tick: MarketTick) => void>();

  constructor(url: string) {
    this.url = url;
  }

  connect(token?: string) {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      // Resubscribe to existing symbols if reconnected
      if (this.subscribedSymbols.size > 0) {
        this.socket?.emit('subscribe:symbols', {
          symbols: Array.from(this.subscribedSymbols),
        });
      }
    });

    this.socket.on('market:tick', (tick: MarketTick) => {
      this.tickListeners.forEach((listener) => listener(tick));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(symbols: string[]) {
    symbols.forEach((s) => this.subscribedSymbols.add(s));
    if (this.socket?.connected) {
      this.socket.emit('subscribe:symbols', { symbols });
    }
  }

  unsubscribe(symbols: string[]) {
    symbols.forEach((s) => this.subscribedSymbols.delete(s));
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:symbols', { symbols });
    }
  }

  onTick(listener: (tick: MarketTick) => void): () => void {
    this.tickListeners.add(listener);
    return () => {
      this.tickListeners.delete(listener);
    };
  }
}

