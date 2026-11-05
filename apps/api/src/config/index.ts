import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_stock_terminal_99',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_stock_terminal_99',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  license: {
    hmacSecret: process.env.LICENSE_HMAC_SECRET || 'dev_license_hmac_secret_crypto_seed_2026',
  },
  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173,http://localhost:8081')
      .split(',')
      .map((s) => s.trim()),
  },
  marketProvider: process.env.MARKET_DATA_PROVIDER || 'MOCK',
};
