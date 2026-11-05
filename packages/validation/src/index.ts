import { z } from 'zod';

// ==================== AUTH VALIDATION ====================
export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  theme: z.enum(['DARK', 'LIGHT', 'SYSTEM']).optional(),
  preferredCurrency: z.enum(['INR', 'USD']).optional(),
  defaultMarket: z.enum(['IN', 'US', 'ALL']).optional(),
  timezone: z.string().optional(),
});

// ==================== WATCHLIST VALIDATION ====================
export const CreateWatchlistSchema = z.object({
  name: z.string().trim().min(1, 'Watchlist name is required').max(50),
});

export const AddWatchlistItemSchema = z.object({
  symbol: z.string().trim().toUpperCase().min(1, 'Symbol is required'),
});

// ==================== ALERT VALIDATION ====================
export const CreateAlertSchema = z.object({
  symbol: z.string().trim().toUpperCase().min(1, 'Symbol is required'),
  condition: z.enum(['ABOVE', 'BELOW', 'PCT_CHANGE_UP', 'PCT_CHANGE_DOWN']),
  targetPrice: z.number().positive('Target price must be a positive number'),
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;

// ==================== SCREENER VALIDATION ====================
export const ScreenerQuerySchema = z.object({
  market: z.enum(['IN', 'US']).optional(),
  exchange: z.enum(['NSE', 'BSE', 'NASDAQ', 'NYSE']).optional(),
  sector: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minChangePercent: z.coerce.number().optional(),
  maxChangePercent: z.coerce.number().optional(),
  minMarketCap: z.coerce.number().optional(),
  maxMarketCap: z.coerce.number().optional(),
  minPeRatio: z.coerce.number().optional(),
  maxPeRatio: z.coerce.number().optional(),
  minVolume: z.coerce.number().optional(),
  sortBy: z.enum(['marketCap', 'price', 'changePercent', 'volume', 'peRatio']).default('marketCap'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ==================== ORDER & LICENSE VALIDATION ====================
export const CheckoutOrderSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  currency: z.enum(['INR', 'USD']),
  gateway: z.enum(['RAZORPAY', 'STRIPE', 'MANUAL_INVOICE', 'MOCK_SANDBOX']),
});

export const PaymentVerifySchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  gateway: z.enum(['RAZORPAY', 'STRIPE', 'MANUAL_INVOICE', 'MOCK_SANDBOX']),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().optional(),
});

export const ActivateLicenseSchema = z.object({
  licenseKey: z.string().trim().min(5, 'License key is required'),
  deviceId: z.string().trim().min(1, 'Device ID is required'),
  os: z.enum(['windows', 'macos', 'linux', 'android', 'ios', 'web']),
  deviceName: z.string().trim().min(1, 'Device name is required'),
});

export const DeactivateLicenseSchema = z.object({
  licenseKey: z.string().trim().min(5),
  deviceId: z.string().trim().min(1),
});

