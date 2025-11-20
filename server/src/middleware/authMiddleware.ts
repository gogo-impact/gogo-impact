import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.admin) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

