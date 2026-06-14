
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.error('[RBAC] No user found in request');
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = req.user.role?.toUpperCase();
    const requiredRoles = roles.map(r => r.toUpperCase());

    if (userRole === 'ADMIN' || userRole === 'OWNER') {
        return next(); 
    }

    if (!requiredRoles.includes(userRole)) {
      console.warn(`[RBAC] Access denied for role: ${userRole}. Required one of: ${requiredRoles.join(', ')}`);
      return res.status(403).json({ error: `Permission denied. Your role: ${userRole}` });
    }

    next();
  };
};
