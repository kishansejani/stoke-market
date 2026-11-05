import { Response } from 'express';
import { prisma } from '../models/prisma';
import { providerManager } from '../providers';
import { AuthenticatedRequest } from '../middlewares/auth';

export class AdminController {
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
    const totalLicenses = await prisma.license.count({ where: { status: 'ACTIVE' } });
    const totalInstruments = await prisma.instrument.count();

    const inrOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED', currency: 'INR' },
      select: { amount: true },
    });
    const revenueINR = inrOrders.reduce((sum, o) => sum + o.amount, 0);

    const usdOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED', currency: 'USD' },
      select: { amount: true },
    });
    const revenueUSD = usdOrders.reduce((sum, o) => sum + o.amount, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalLicenses,
        totalInstruments,
        revenueINR, // in paise
        revenueUSD, // in cents
        activeProvider: providerManager.getActiveProvider().name,
        systemStatus: 'HEALTHY',
      },
    });
  }

  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        userRoles: { include: { role: true } },
        licenses: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      isEmailVerified: u.isEmailVerified,
      status: u.status,
      roles: u.userRoles.map((ur) => ur.role.name),
      licenseCount: u.licenses.length,
      createdAt: u.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    });

    // Log admin action
    if (req.user) {
      await prisma.adminLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_USER_STATUS',
          resource: `user:${id}`,
          payload: JSON.stringify({ newStatus: status }),
        },
      });
    }

    res.json({ success: true, data: updated });
  }

  static async getProviders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const providers = providerManager.getAllProvidersInfo();
    res.json({ success: true, data: providers });
  }

  static async switchProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { providerId } = req.body;
    const ok = providerManager.switchProvider(providerId);

    if (!ok) {
      res.status(400).json({ success: false, error: { code: 'INVALID_PROVIDER', message: 'Provider does not exist' } });
      return;
    }

    if (req.user) {
      await prisma.adminLog.create({
        data: {
          userId: req.user.id,
          action: 'SWITCH_MARKET_PROVIDER',
          resource: `provider:${providerId}`,
          payload: JSON.stringify({ providerId }),
        },
      });
    }

    res.json({
      success: true,
      message: `Switched market data provider to: ${providerManager.getActiveProvider().name}`,
      activeProvider: providerManager.getActiveProvider().name,
    });
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const logs = await prisma.adminLog.findMany({
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: logs });
  }
}

