import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  RegisterSchema,
  LoginSchema,
  CreateAlertSchema,
  ScreenerQuerySchema,
  ActivateLicenseSchema,
} from '../index.js';

describe('Zod Validation Schemas', () => {
  it('validates correct registration inputs and rejects invalid passwords', () => {
    const valid = RegisterSchema.safeParse({
      email: 'trader@stockmarket.com',
      password: 'SecurePassword123',
      firstName: 'Rajesh',
      lastName: 'Sharma',
    });
    assert.equal(valid.success, true);

    const invalidPass = RegisterSchema.safeParse({
      email: 'trader@stockmarket.com',
      password: 'weak',
      firstName: 'Rajesh',
      lastName: 'Sharma',
    });
    assert.equal(invalidPass.success, false);

    const invalidEmail = RegisterSchema.safeParse({
      email: 'not-an-email',
      password: 'SecurePassword123',
      firstName: 'Rajesh',
      lastName: 'Sharma',
    });
    assert.equal(invalidEmail.success, false);
  });

  it('validates login input', () => {
    const valid = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'MyPassword1',
    });
    assert.equal(valid.success, true);
  });

  it('validates price alert creation constraints', () => {
    const valid = CreateAlertSchema.safeParse({
      symbol: 'RELIANCE.NS',
      condition: 'ABOVE',
      targetPrice: 3000,
    });
    assert.equal(valid.success, true);

    const negativePrice = CreateAlertSchema.safeParse({
      symbol: 'RELIANCE.NS',
      condition: 'ABOVE',
      targetPrice: -50,
    });
    assert.equal(negativePrice.success, false);
  });

  it('validates screener queries with defaults', () => {
    const parsed = ScreenerQuerySchema.parse({
      market: 'IN',
      sector: 'Technology',
      minMarketCap: 1000000000,
    });
    assert.equal(parsed.market, 'IN');
    assert.equal(parsed.sortBy, 'marketCap');
    assert.equal(parsed.sortDirection, 'desc');
    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 20);
  });

  it('validates license activation schema', () => {
    const valid = ActivateLicenseSchema.safeParse({
      licenseKey: 'STK-PRO-8812-4921-9941',
      deviceId: 'dev_mach_01a',
      os: 'windows',
      deviceName: 'Trading Rig Alpha',
    });
    assert.equal(valid.success, true);
  });
});
