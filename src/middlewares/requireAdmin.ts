import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma.js';
import { verifyAdminToken } from '../utils/adminAuth.js';

function getBearerToken(req: Request) {
  const authorization = req.header('authorization') ?? '';

  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return req.header('x-admin-token')?.trim();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const payload = verifyAdminToken(getBearerToken(req));

  if (!payload) {
    res.status(401).json({ message: 'Entre como administrador para continuar.' });
    return;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true },
  });

  if (!admin || admin.email !== payload.email) {
    res.status(403).json({ message: 'Acesso de administrador invalido.' });
    return;
  }

  next();
}
