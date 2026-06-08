import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { Prisma } from '../../generated/prisma/client.js';
import { getIdParam } from '../utils/request.js';
import { normalizeText, parseMoney } from '../utils/normalize.js';

export const productRoutes = Router();

// Lista todos os lanches cadastrados, mais novos primeiro.
productRoutes.get(
  '/lanches',
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  }),
);

// Busca um lanche especifico pelo id.
productRoutes.get(
  '/lanches/:id',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req, res);

    if (!id) {
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: 'Lanche nao encontrado.' });
      return;
    }

    res.json(product);
  }),
);

// Cadastra um novo lanche no cardapio.
productRoutes.post(
  '/lanches',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const name = normalizeText(req.body.name);
    const description = normalizeText(req.body.description) || null;
    const imageUrl = normalizeText(req.body.imageUrl) || null;
    const price = parseMoney(req.body.price);

    // Para cadastrar, o lanche precisa ter nome e preco maior que zero.
    if (!name || !price || Number(price) <= 0) {
      res
        .status(400)
        .json({ message: 'Informe nome e preco maior que zero para o lanche.' });
      return;
    }

    // Salva o lanche no banco, incluindo a URL da foto se tiver sido enviada.
    const product = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        price,
        isAvailable:
          typeof req.body.isAvailable === 'boolean'
            ? req.body.isAvailable
            : true,
      },
    });

    res.status(201).json(product);
  }),
);

// Atualiza um lanche existente.
productRoutes.put(
  '/lanches/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = getIdParam(req, res);

    if (!id) {
      return;
    }

    // Primeiro verifica se o lanche existe.
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: 'Lanche nao encontrado.' });
      return;
    }

    // Se o preco foi enviado, converte para decimal. Se nao foi, mantem igual.
    const price =
      req.body.price === undefined ? undefined : parseMoney(req.body.price);

    if (price === null || (price !== undefined && Number(price) <= 0)) {
      res.status(400).json({ message: 'Informe um preco valido.' });
      return;
    }

    // Monta apenas os campos que vieram na requisicao.
    const data: Prisma.ProductUpdateInput = {};

    if (req.body.name !== undefined) {
      const name = normalizeText(req.body.name);

      if (!name) {
        res.status(400).json({ message: 'Informe um nome valido.' });
        return;
      }

      data.name = name;
    }

    if (req.body.description !== undefined) {
      data.description = normalizeText(req.body.description) || null;
    }

    if (req.body.imageUrl !== undefined) {
      data.imageUrl = normalizeText(req.body.imageUrl) || null;
    }

    if (price !== undefined) {
      data.price = price;
    }

    if (typeof req.body.isAvailable === 'boolean') {
      data.isAvailable = req.body.isAvailable;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data,
    });

    res.json(updatedProduct);
  }),
);

// Remove o lanche do cardapio de forma segura, marcando como indisponivel.
productRoutes.delete(
  '/lanches/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = getIdParam(req, res);

    if (!id) {
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: 'Lanche nao encontrado.' });
      return;
    }

    // Nao apaga do banco; so deixa indisponivel para manter historico de pedidos.
    await prisma.product.update({
      where: { id: product.id },
      data: { isAvailable: false },
    });

    res.status(204).send();
  }),
);
