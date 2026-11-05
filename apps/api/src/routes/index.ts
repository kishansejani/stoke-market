import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { MarketsController } from '../controllers/marketsController';
import { StocksController } from '../controllers/stocksController';
import { ScreenersController } from '../controllers/screenersController';
import { WatchlistsController } from '../controllers/watchlistsController';
import { AlertsController } from '../controllers/alertsController';
import { NewsController } from '../controllers/newsController';
import { OrdersController } from '../controllers/ordersController';
import { LicensesController } from '../controllers/licensesController';
import { AdminController } from '../controllers/adminController';
import { getIPOs, getIPOById } from '../controllers/iposController.js';
import { authenticate, requireRole, optionalAuthenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  CreateWatchlistSchema,
  AddWatchlistItemSchema,
  CreateAlertSchema,
  ScreenerQuerySchema,
  CheckoutOrderSchema,
  PaymentVerifySchema,
  ActivateLicenseSchema,
  DeactivateLicenseSchema,
} from '@stock-market/validation';

export const apiRouter = Router();

// ==================== AUTH ====================
const authRouter = Router();
authRouter.post('/register', validate(RegisterSchema), AuthController.register);
authRouter.post('/login', validate(LoginSchema), AuthController.login);
authRouter.get('/me', authenticate, AuthController.getMe);
authRouter.put('/profile', authenticate, validate(UpdateProfileSchema), AuthController.updateProfile);
apiRouter.use('/auth', authRouter);

// ==================== MARKETS & EXCHANGES ====================
const marketsRouter = Router();
marketsRouter.get('/', MarketsController.getMarkets);
marketsRouter.get('/:marketId/summary', MarketsController.getMarketSummary);
apiRouter.use('/markets', marketsRouter);

const exchangesRouter = Router();
exchangesRouter.get('/', MarketsController.getExchanges);
apiRouter.use('/exchanges', exchangesRouter);

// ==================== STOCKS & INSTRUMENTS ====================
const stocksRouter = Router();
stocksRouter.get('/search', StocksController.search);
stocksRouter.get('/:symbol', StocksController.getStock);
stocksRouter.get('/:symbol/chart', StocksController.getChart);
stocksRouter.get('/:symbol/company', StocksController.getCompany);
stocksRouter.get('/:symbol/financials', StocksController.getFinancials);
apiRouter.use('/stocks', stocksRouter);

// ==================== SCREENERS & MOVERS ====================
const screenersRouter = Router();
screenersRouter.get('/movers', ScreenersController.getMovers);
screenersRouter.post('/filter', validate(ScreenerQuerySchema), ScreenersController.filter);
apiRouter.use('/screeners', screenersRouter);

// ==================== WATCHLISTS ====================
const watchlistsRouter = Router();
watchlistsRouter.get('/', authenticate, WatchlistsController.getWatchlists);
watchlistsRouter.post('/', authenticate, validate(CreateWatchlistSchema), WatchlistsController.createWatchlist);
watchlistsRouter.post('/:id/items', authenticate, validate(AddWatchlistItemSchema), WatchlistsController.addItem);
watchlistsRouter.delete('/:id/items/:symbol', authenticate, WatchlistsController.removeItem);
watchlistsRouter.delete('/:id', authenticate, WatchlistsController.deleteWatchlist);
apiRouter.use('/watchlists', watchlistsRouter);

// ==================== ALERTS ====================
const alertsRouter = Router();
alertsRouter.get('/', authenticate, AlertsController.getAlerts);
alertsRouter.post('/', authenticate, validate(CreateAlertSchema), AlertsController.createAlert);
alertsRouter.delete('/:id', authenticate, AlertsController.deleteAlert);
alertsRouter.patch('/:id/toggle', authenticate, AlertsController.toggleAlert);
apiRouter.use('/alerts', alertsRouter);

// ==================== NEWS ====================
const newsRouter = Router();
newsRouter.get('/', NewsController.getNews);
newsRouter.get('/symbol/:symbol', NewsController.getNewsBySymbol);
apiRouter.use('/news', newsRouter);

// ==================== IPOS ====================
const iposRouter = Router();
iposRouter.get('/', getIPOs);
iposRouter.get('/:id', getIPOById);
apiRouter.use('/ipos', iposRouter);

// ==================== COMMERCE & ORDERS ====================
const ordersRouter = Router();
ordersRouter.get('/products', OrdersController.getProducts);
ordersRouter.post('/checkout', authenticate, validate(CheckoutOrderSchema), OrdersController.checkout);
ordersRouter.post('/verify-payment', authenticate, validate(PaymentVerifySchema), OrdersController.verifyPayment);
ordersRouter.get('/my-orders', authenticate, OrdersController.getMyOrders);
apiRouter.use('/orders', ordersRouter);

// ==================== LICENSING ====================
const licensesRouter = Router();
licensesRouter.get('/my-licenses', authenticate, LicensesController.getMyLicenses);
licensesRouter.post('/activate', validate(ActivateLicenseSchema), LicensesController.activate);
licensesRouter.post('/deactivate', validate(DeactivateLicenseSchema), LicensesController.deactivate);
apiRouter.use('/licenses', licensesRouter);

// ==================== ADMIN PANEL ====================
const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use(requireRole('SUPER_ADMIN', 'ADMIN'));
adminRouter.get('/stats', AdminController.getStats);
adminRouter.get('/users', AdminController.getUsers);
adminRouter.put('/users/:id/status', AdminController.updateUserStatus);
adminRouter.get('/providers', AdminController.getProviders);
adminRouter.post('/providers/switch', AdminController.switchProvider);
adminRouter.get('/audit-logs', AdminController.getAuditLogs);
apiRouter.use('/admin', adminRouter);

