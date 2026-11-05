import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../models/prisma';
import { JwtPayload, UserRole } from '@stock-market/shared-types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: UserRole[];
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Missing Bearer token.' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
    };
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Access token expired or invalid' },
    });
  }
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles,
      };
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole && !req.user.roles.includes('SUPER_ADMIN')) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' },
      });
      return;
    }

    next();
  };
}
