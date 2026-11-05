import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../models/prisma';
import { LicenseService } from '../services/licenseService';
import { AuthenticatedRequest } from '../middlewares/auth';
import { CheckoutResponse, ProductPackage, Order } from '@stock-market/shared-types';

export class OrdersController {
  static async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
    });

    const data: ProductPackage[] = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      priceINR: p.priceINR,
      priceUSD: p.priceUSD,
      maxActivations: p.maxActivations,
      dataIncludedDays: p.dataIncludedDays,
      features: JSON.parse(p.features || '[]'),
      isPopular: p.slug.includes('pro'),
    }));

    res.json({ success: true, data });
  }

  static async checkout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { productId, currency, gateway } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product package not found' } });
      return;
    }

    const amount = currency === 'INR' ? product.priceINR : product.priceUSD;
    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        productId: product.id,
        currency,
        amount,
        status: 'PENDING',
      },
    });

    const response: CheckoutResponse = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency as any,
      gateway,
      gatewayOrderId: `mock_gw_${order.id.slice(0, 8)}`,
      gatewayKey: 'mock_publishable_key_sandbox',
    };

    res.status(201).json({ success: true, data: response });
  }

  static async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { orderId, gateway, paymentId } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
      include: { product: true },
    });

    if (!order) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
      return;
    }

    // Record payment
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        status: 'SUCCESS',
        gatewayPaymentId: paymentId,
        paidAt: new Date(),
      },
      create: {
        orderId: order.id,
        gateway,
        gatewayPaymentId: paymentId,
        status: 'SUCCESS',
        paidAt: new Date(),
      },
    });

    // Mark order as completed
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' },
    });

    // Provision cryptographic License
    const license = await LicenseService.provisionLicense(order.id, req.user.id, order.productId);

    // Grant PRO_USER role to user if not already granted
    const proRole = await prisma.role.findUnique({ where: { name: 'PRO_USER' } });
    if (proRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: req.user.id, roleId: proRole.id } },
        update: {},
        create: { userId: req.user.id, roleId: proRole.id },
      });
    }

    // Send order confirmation notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'License Activated: ' + order.product.name,
        body: `Your lifetime license key is: ${license.licenseKey}. You can activate up to ${license.maxDevices} devices.`,
        type: 'ORDER',
        metadata: JSON.stringify({ licenseKey: license.licenseKey, orderId: order.id }),
      },
    });

    const formattedOrder: Order = {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      productId: order.productId,
      productName: order.product.name,
      currency: order.currency as any,
      amount: order.amount,
      tax: order.tax,
      status: 'COMPLETED',
      licenseKey: license.licenseKey,
      createdAt: order.createdAt.toISOString(),
    };

    res.json({ success: true, data: formattedOrder });
  }

  static async getMyOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { product: true, license: true },
      orderBy: { createdAt: 'desc' },
    });

    const data: Order[] = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      productId: o.productId,
      productName: o.product.name,
      currency: o.currency as any,
      amount: o.amount,
      tax: o.tax,
      status: o.status as any,
      licenseKey: o.license?.licenseKey,
      createdAt: o.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  }
}

