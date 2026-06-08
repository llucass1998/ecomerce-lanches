import { Router, type Response } from 'express';

import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createAdminToken } from '../utils/adminAuth.js';
import { normalizeEmail, normalizeText } from '../utils/normalize.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export const adminRoutes = Router();

const adminSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

function sendAdminSession(res: Response, admin: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  res.json({
    admin,
    token: createAdminToken(admin),
  });
}

// Cria o primeiro administrador do sistema.
// Essa rota so funciona quando ainda nao existe nenhum admin cadastrado.
adminRoutes.post(
  '/admin/setup',
  asyncHandler(async (req, res) => {
    const name = normalizeText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = normalizeText(req.body.password);

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Informe nome, email e senha do admin.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    const adminCount = await prisma.admin.count();

    // Depois que o primeiro admin existir, essa rota nao cria mais ninguem.
    if (adminCount > 0) {
      const existingAdminWithoutPassword = await prisma.admin.findUnique({
        where: { email },
        select: { id: true, passwordHash: true },
      });

      if (existingAdminWithoutPassword && !existingAdminWithoutPassword.passwordHash) {
        const admin = await prisma.admin.update({
          where: { id: existingAdminWithoutPassword.id },
          data: {
            name,
            passwordHash: await hashPassword(password),
          },
          select: adminSelect,
        });

        sendAdminSession(res, admin);
        return;
      }

      res.status(403).json({
        message: 'O primeiro administrador ja foi criado.',
      });
      return;
    }

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
      },
      select: adminSelect,
    });

    res.status(201);
    sendAdminSession(res, admin);
  }),
);

// Login do administrador com senha.
adminRoutes.post(
  '/admin/login',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = normalizeText(req.body.password);

    if (!email || !password) {
      res.status(400).json({ message: 'Informe email e senha do admin.' });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        ...adminSelect,
        passwordHash: true,
      },
    });

    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      res.status(401).json({ message: 'Email ou senha de admin invalidos.' });
      return;
    }

    const { passwordHash: _passwordHash, ...safeAdmin } = admin;
    sendAdminSession(res, safeAdmin);
  }),
);
