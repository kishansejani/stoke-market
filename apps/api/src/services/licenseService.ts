import crypto from 'crypto';
import { prisma } from '../models/prisma';
import { config } from '../config';
import { License, LicenseValidationResult, DeviceActivation } from '@stock-market/shared-types';

export class LicenseService {
  /**
   * Generates a cryptographically strong human-readable license key:
   * e.g. STK-PRO-8712-4412-9982
   */
  static generateLicenseKey(prefix = 'STK-PRO'): string {
    const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}-${segment()}-${segment()}-${segment()}`;
  }

  /**
   * Signs a license payload using HMAC-SHA256
   */
  static generateSignature(licenseKey: string, userId: string, maxDevices: number, dataExpiry: Date): string {
    const payload = `${licenseKey}:${userId}:${maxDevices}:${dataExpiry.toISOString()}`;
    return crypto.createHmac('sha256', config.license.hmacSecret).update(payload).digest('hex');
  }

  /**
   * Provisions a new License record after successful payment
   */
  static async provisionLicense(orderId: string, userId: string, productId: string): Promise<License> {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product package not found');

    const prefix = product.slug.includes('enterprise') ? 'STK-ENT' : 'STK-PRO';
    const licenseKey = this.generateLicenseKey(prefix);

    const dataAccessExpiry = new Date();
    dataAccessExpiry.setDate(dataAccessExpiry.getDate() + product.dataIncludedDays);

    const signature = this.generateSignature(licenseKey, userId, product.maxActivations, dataAccessExpiry);

    const record = await prisma.license.create({
      data: {
        licenseKey,
        orderId,
        userId,
        status: 'ACTIVE',
        maxDevices: product.maxActivations,
        activeDevices: JSON.stringify([]),
        dataAccessExpiry,
        softwareAccessExpiry: null, // null represents perpetual software license
        signature,
      },
      include: {
        order: {
          include: { product: true },
        },
      },
    });

    return {
      id: record.id,
      licenseKey: record.licenseKey,
      userId: record.userId,
      productName: record.order.product.name,
      status: record.status as any,
      maxDevices: record.maxDevices,
      activeDevices: [],
      dataAccessExpiry: record.dataAccessExpiry.toISOString(),
      softwareAccessExpiry: record.softwareAccessExpiry ? record.softwareAccessExpiry.toISOString() : undefined,
      signature: record.signature,
      createdAt: record.createdAt.toISOString(),
    };
  }

  /**
   * Validates and activates a license on a client device
   */
  static async activateDevice(
    licenseKey: string,
    deviceId: string,
    os: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web',
    deviceName: string
  ): Promise<LicenseValidationResult> {
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { order: { include: { product: true } } },
    });

    if (!license) {
      return {
        valid: false,
        status: 'REVOKED',
        message: 'License key does not exist or has been revoked.',
        hasDataAccess: false,
        daysRemainingData: 0,
      };
    }

    if (license.status !== 'ACTIVE') {
      return {
        valid: false,
        status: license.status as any,
        message: `License is currently ${license.status.toLowerCase()}. Please contact support.`,
        hasDataAccess: false,
        daysRemainingData: 0,
      };
    }

    const activeDevices: DeviceActivation[] = JSON.parse(license.activeDevices || '[]');
    const existingIndex = activeDevices.findIndex((d) => d.deviceId === deviceId);

    const now = new Date();
    if (existingIndex >= 0) {
      // Already activated on this device; refresh lastSeenAt
      activeDevices[existingIndex].lastSeenAt = now.toISOString();
      activeDevices[existingIndex].deviceName = deviceName;
    } else {
      // New device activation check against max devices limit
      if (activeDevices.length >= license.maxDevices) {
        return {
          valid: false,
          status: 'ACTIVE',
          message: `Activation limit reached (${license.maxDevices} devices). Deactivate an older device from your account to continue.`,
          hasDataAccess: false,
          daysRemainingData: 0,
        };
      }

      activeDevices.push({
        deviceId,
        os,
        deviceName,
        activatedAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
      });
    }

    await prisma.license.update({
      where: { id: license.id },
      data: { activeDevices: JSON.stringify(activeDevices) },
    });

    const nowMs = now.getTime();
    const expiryMs = license.dataAccessExpiry.getTime();
    const daysRemaining = Math.max(0, Math.ceil((expiryMs - nowMs) / (1000 * 3600 * 24)));
    const hasDataAccess = daysRemaining > 0;

    return {
      valid: true,
      status: 'ACTIVE',
      message: 'License successfully activated and verified for this machine.',
      hasDataAccess,
      daysRemainingData: daysRemaining,
      license: {
        id: license.id,
        licenseKey: license.licenseKey,
        userId: license.userId,
        productName: license.order.product.name,
        status: 'ACTIVE',
        maxDevices: license.maxDevices,
        activeDevices,
        dataAccessExpiry: license.dataAccessExpiry.toISOString(),
        softwareAccessExpiry: license.softwareAccessExpiry ? license.softwareAccessExpiry.toISOString() : undefined,
        signature: license.signature,
        createdAt: license.createdAt.toISOString(),
      },
    };
  }

  /**
   * Deactivates a device slot
   */
  static async deactivateDevice(licenseKey: string, deviceId: string): Promise<boolean> {
    const license = await prisma.license.findUnique({ where: { licenseKey } });
    if (!license) return false;

    const activeDevices: DeviceActivation[] = JSON.parse(license.activeDevices || '[]');
    const filtered = activeDevices.filter((d) => d.deviceId !== deviceId);

    await prisma.license.update({
      where: { id: license.id },
      data: { activeDevices: JSON.stringify(filtered) },
    });

    return true;
  }
}

