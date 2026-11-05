import { Response } from 'express';
import { prisma } from '../models/prisma';
import { LicenseService } from '../services/licenseService';
import { AuthenticatedRequest } from '../middlewares/auth';
import { License } from '@stock-market/shared-types';

export class LicensesController {
  static async getMyLicenses(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const records = await prisma.license.findMany({
      where: { userId: req.user.id },
      include: { order: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const data: License[] = records.map((rec) => ({
      id: rec.id,
      licenseKey: rec.licenseKey,
      userId: rec.userId,
      productName: rec.order.product.name,
      status: rec.status as any,
      maxDevices: rec.maxDevices,
      activeDevices: JSON.parse(rec.activeDevices || '[]'),
      dataAccessExpiry: rec.dataAccessExpiry.toISOString(),
      softwareAccessExpiry: rec.softwareAccessExpiry ? rec.softwareAccessExpiry.toISOString() : undefined,
      signature: rec.signature,
      createdAt: rec.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  }

  static async activate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { licenseKey, deviceId, os, deviceName } = req.body;

    const result = await LicenseService.activateDevice(licenseKey, deviceId, os, deviceName);
    if (!result.valid) {
      res.status(400).json({ success: false, error: { code: 'ACTIVATION_FAILED', message: result.message } });
      return;
    }

    res.json({ success: true, data: result });
  }

  static async deactivate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { licenseKey, deviceId } = req.body;
    const ok = await LicenseService.deactivateDevice(licenseKey, deviceId);

    if (!ok) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'License key not found' } });
      return;
    }

    res.json({ success: true, message: 'Device slot successfully released' });
  }
}

