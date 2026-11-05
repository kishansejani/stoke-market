import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/prisma';
import { config } from '../config';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AuthResponse, JwtPayload, UserRole } from '@stock-market/shared-types';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email, password, firstName, lastName } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'An account with this email address already exists' },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const freeRole = await prisma.role.findUnique({ where: { name: 'FREE_USER' } });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        isEmailVerified: true, // Auto-verified in local sandbox mode
        status: 'ACTIVE',
        profile: {
          create: {
            theme: 'DARK',
            preferredCurrency: 'INR',
            defaultMarket: 'IN',
            timezone: 'Asia/Kolkata',
          },
        },
      },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
      },
    });

    if (freeRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: freeRole.id },
      });
    }

    // Default Watchlist creation
    await prisma.watchlist.create({
      data: {
        userId: user.id,
        name: 'My Watchlist',
        isDefault: true,
      },
    });

    const roles: UserRole[] = ['FREE_USER'];
    const tokenPayload: JwtPayload = { sub: user.id, email: user.email, roles };
    const accessToken = jwt.sign(tokenPayload, config.jwt.accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, config.jwt.refreshSecret, { expiresIn: '7d' });

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: await bcrypt.hash(refreshToken, 6),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        status: user.status as any,
        roles,
        profile: user.profile ? (user.profile as any) : undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    };

    res.status(201).json({ success: true, data: response });
  }

  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password combination' },
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password combination' },
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended or is pending verification.' },
      });
      return;
    }

    const roles: UserRole[] = user.userRoles.map((ur) => ur.role.name as UserRole);
    const tokenPayload: JwtPayload = { sub: user.id, email: user.email, roles };
    const accessToken = jwt.sign(tokenPayload, config.jwt.accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, config.jwt.refreshSecret, { expiresIn: '7d' });

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: await bcrypt.hash(refreshToken, 6),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        status: user.status as any,
        roles,
        profile: user.profile ? (user.profile as any) : undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    };

    res.json({ success: true, data: response });
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        roles: user.userRoles.map((ur) => ur.role.name),
        profile: user.profile,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { firstName, lastName, theme, preferredCurrency, defaultMarket, timezone } = req.body;

    if (firstName || lastName) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
        },
      });
    }

    const profileData: any = {};
    if (theme) profileData.theme = theme;
    if (preferredCurrency) profileData.preferredCurrency = preferredCurrency;
    if (defaultMarket) profileData.defaultMarket = defaultMarket;
    if (timezone) profileData.timezone = timezone;

    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: req.user.id },
        update: profileData,
        create: { userId: req.user.id, ...profileData },
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true, userRoles: { include: { role: true } } },
    });

    res.json({
      success: true,
      data: {
        id: updated!.id,
        email: updated!.email,
        firstName: updated!.firstName,
        lastName: updated!.lastName,
        isEmailVerified: updated!.isEmailVerified,
        status: updated!.status,
        roles: updated!.userRoles.map((ur) => ur.role.name),
        profile: updated!.profile,
      },
    });
  }
}
