import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../shared/errors/httpError';

type TokenPayload = {
  sub?: string;
  role?: UserRole;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

function getBearerToken(header?: string) {
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      throw new HttpError(401, 'Authentication required');
    }

    const payload = jwt.verify(token, getJwtSecret()) as TokenPayload;
    if (!payload.sub) {
      throw new HttpError(401, 'Invalid token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new HttpError(401, 'Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpError(401, 'Invalid token'));
      return;
    }

    next(error);
  }
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}
