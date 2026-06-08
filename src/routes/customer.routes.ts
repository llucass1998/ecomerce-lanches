import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { normalizeEmail, normalizeText } from '../utils/normalize.js';

export const customerRoutes = Router();

const customerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  cpf: true,
  street: true,
  neighborhood: true,
  city: true,
  cep: true,
  createdAt: true,
  updatedAt: true,
  orders: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
        },
      },
    },
  },
} as const;

function getCustomerInput(body: Record<string, unknown>) {
  const address = (body.address ?? {}) as Record<string, unknown>;

  return {
    name: normalizeText(body.name),
    email: normalizeEmail(body.email),
    password: normalizeText(body.password),
    phone: normalizeText(body.phone) || null,
    cpf: normalizeText(body.cpf) || null,
    street: normalizeText(address.street ?? body.street) || null,
    neighborhood: normalizeText(address.neighborhood ?? body.neighborhood) || null,
    city: normalizeText(address.city ?? body.city) || null,
    cep: normalizeText(address.cep ?? body.cep) || null,
  };
}

// Cadastro de cliente com senha salva no banco.
customerRoutes.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = getCustomerInput(req.body ?? {});

    if (!input.name || !input.email || !input.password) {
      res.status(400).json({ message: 'Informe nome, email e senha.' });
      return;
    }

    if (input.password.length < 6) {
      res.status(400).json({ message: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingCustomer) {
      res.status(409).json({ message: 'Este email ja esta cadastrado.' });
      return;
    }

    const passwordHash = await hashPassword(input.password);

    const customer = await prisma.customer.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone,
        cpf: input.cpf,
        street: input.street,
        neighborhood: input.neighborhood,
        city: input.city,
        cep: input.cep,
      },
      select: customerSelect,
    });

    res.status(201).json(customer);
  }),
);

// Login do cliente. Com senha, valida o cadastro do banco.
// Sem senha, preserva o fluxo antigo de nome/email para compatibilidade.
customerRoutes.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = normalizeText(req.body.password);
    const name = normalizeText(req.body.name);

    if (email && password) {
      const customer = await prisma.customer.findUnique({
        where: { email },
        select: {
          ...customerSelect,
          passwordHash: true,
        },
      });

      if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
        res.status(401).json({ message: 'Email ou senha invalidos.' });
        return;
      }

      const { passwordHash: _passwordHash, ...safeCustomer } = customer;
      res.status(200).json(safeCustomer);
      return;
    }

    if (name && email) {
      const customer = await prisma.customer.upsert({
        where: { email },
        update: { name },
        create: { name, email },
        select: customerSelect,
      });

      res.status(200).json(customer);
      return;
    }

    res.status(400).json({ message: 'Informe email e senha.' });
  }),
);
