import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LicenseService } from '../services/licenseService';

describe('License Engine & Device Activation', () => {
  it('generates well-formatted cryptographic license keys', () => {
    const key = LicenseService.generateLicenseKey('STK-PRO');
    assert.match(key, /^STK-PRO-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it('generates consistent HMAC-SHA256 signatures for licenses', () => {
    const key = 'STK-PRO-AAAA-BBBB-CCCC';
    const userId = 'usr_123';
    const maxDevices = 3;
    const date = new Date('2027-01-01T00:00:00Z');

    const sig1 = LicenseService.generateSignature(key, userId, maxDevices, date);
    const sig2 = LicenseService.generateSignature(key, userId, maxDevices, date);

    assert.equal(typeof sig1, 'string');
    assert.equal(sig1.length, 64); // SHA-256 hex length
    assert.equal(sig1, sig2);
  });

  it('correctly handles activation verification logic for invalid keys', async () => {
    const result = await LicenseService.activateDevice(
      'INVALID-KEY-999',
      'dev_test_mach',
      'windows',
      'Test Workstation'
    );
    assert.equal(result.valid, false);
    assert.equal(result.hasDataAccess, false);
  });
});

