import { Request, Response, NextFunction } from 'express';
import { db, DbUser } from './db';

export interface AuthenticatedRequest extends Request {
  user?: DbUser;
  token?: string;
}

export function extractSessionToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  // 2. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  // 3. Check custom header
  const customHeader = req.headers['x-session-token'];
  if (typeof customHeader === 'string' && customHeader) {
    return customHeader;
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractSessionToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    return;
  }

  const session = db.findSession(token);
  if (!session) {
    res.status(401).json({ success: false, error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    res.status(401).json({ success: false, error: 'User account not found.' });
    return;
  }

  req.user = user;
  req.token = token;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractSessionToken(req);
  if (token) {
    const session = db.findSession(token);
    if (session) {
      const user = db.findUserById(session.userId);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
  }
  next();
}

export function sanitizeUser(user: DbUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
