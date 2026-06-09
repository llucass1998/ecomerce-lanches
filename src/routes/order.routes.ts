import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { getStoreSettings } from '../services/storeSettings.service.js';
import type { OrderItemInput } from '../types/order.js';
import { normalizeEmail, normalizeText, parseMoney } from '../utils/normalize.js';
import { getIdParam } from '../utils/request.js';
import { FulfillmentType, OrderStatus } from '../../generated/prisma/client.js';

export const orderRoutes = Router();

// Cria um pedido para retirada em loja ou entrega.
orderRoutes.post(
  '/pedidos',
  asyncHandler(async (req, res) => {
    // fulfillmentType deve ser PICKUP ou DELIVERY.
    const fulfillmentType = req.body.fulfillmentType as FulfillmentType;

    // items deve ser uma lista com productId/quantity ou name/price/quantity.
    const items = Array.isArray(req.body.items)
      ? (req.body.items as OrderItemInput[])
      : [];

    if (!Object.values(FulfillmentType).includes(fulfillmentType)) {
      res
        .status(400)
        .json({ message: 'Tipo do pedido deve ser PICKUP ou DELIVERY.' });
      return;
    }

    if (items.length === 0) {
      res.status(400).json({ message: 'Adicione pelo menos um lanche.' });
      return;
    }

    // O pedido pode vir com customerId ou com customer: { name, email }.
    const customerId = normalizeText(req.body.customerId);
    const customerInput = (req.body.customer ?? {}) as Record<string, unknown>;
    const customerName = normalizeText(customerInput.name);
    const customerEmail = normalizeEmail(customerInput.email);

    let customer;

    if (customerId) {
      // Se veio customerId, busca o cliente ja cadastrado.
      customer = await prisma.customer.findUnique({ where: { id: customerId } });
    } else if (customerName && customerEmail) {
      // Se veio nome/email, cria ou atualiza o cliente.
      customer = await prisma.customer.upsert({
        where: { email: customerEmail },
        update: { name: customerName },
        create: { name: customerName, email: customerEmail },
      });
    }

    if (!customer) {
      res.status(400).json({
        message:
          'Informe customerId ou customer com nome e email para criar o pedido.',
      });
      return;
    }

    const address = req.body.address ?? {};

    // Para entrega, endereco basico e obrigatorio.
    if (fulfillmentType === FulfillmentType.DELIVERY) {
      const hasAddress =
        normalizeText(address.street) &&
        normalizeText(address.number) &&
        normalizeText(address.neighborhood);

      if (!hasAddress) {
        res.status(400).json({
          message:
            'Para entrega, informe rua, numero e bairro no campo address.',
        });
        return;
      }
    }

    // Busca no banco todos os ids de lanches enviados no pedido sem repetir.
    const productIds = [
      ...new Set(items.map((item) => normalizeText(item.productId))),
    ].filter((id): id is string => Boolean(id));

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true,
      },
    });

    const productsById = new Map(products.map((product) => [product.id, product]));

    // Aqui vamos montar os itens do pedido e calcular o subtotal.
    const orderItems: Array<{
      productId: string;
      displayName: string | null;
      customizations: string | null;
      imageUrl: string | null;
      quantity: number;
      unitPrice: string;
      total: string;
    }> = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = normalizeText(item.productId);
      const itemName = normalizeText(item.name);
      const itemDisplayName = normalizeText(item.displayName) || itemName || null;
      const itemCustomizations = normalizeText(item.customizations) || null;
      const itemCategory = normalizeText(item.category) || 'tradicionais';
      const itemBasePrice = parseMoney(item.basePrice);
      const itemPrice = parseMoney(item.price);
      const itemImageUrl = normalizeText(item.imageUrl) || null;
      const quantity = Number(item.quantity);
      let product = productId ? productsById.get(productId) : undefined;

      // Se o frontend enviou um item que ainda nao existe no banco,
      // usamos name/price para localizar ou cadastrar o lanche antes do pedido.
      if (!product && itemName && itemPrice && Number(itemPrice) > 0) {
        product =
          (await prisma.product.findFirst({
          where: {
            name: itemName,
            isAvailable: true,
          },
        })) ?? undefined;

        if (!product) {
          product = await prisma.product.create({
            data: {
              name: itemName,
              category: itemCategory,
              price: itemBasePrice ?? itemPrice,
              imageUrl: itemImageUrl,
              isAvailable: true,
            },
          });
        }
      }

      // Cada item precisa apontar para um lanche valido e ter quantidade maior que zero.
      if (!product || !Number.isInteger(quantity) || quantity <= 0) {
        res.status(400).json({
          message:
            'Cada item precisa de um lanche disponivel, preco e quantidade.',
        });
        return;
      }

      // Calcula o total de cada item: preco unitario x quantidade.
      const baseUnitPrice = Number(product.price);
      const requestedUnitPrice = itemPrice ? Number(itemPrice) : baseUnitPrice;
      const unitPrice =
        Number.isFinite(requestedUnitPrice) && requestedUnitPrice > baseUnitPrice
          ? requestedUnitPrice
          : baseUnitPrice;
      const total = unitPrice * quantity;
      subtotal += total;

      orderItems.push({
        productId: product.id,
        displayName: itemDisplayName,
        customizations: itemCustomizations,
        imageUrl: itemImageUrl,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        total: total.toFixed(2),
      });
    }

    // Busca a taxa de entrega configurada na loja.
    const settings = await getStoreSettings();
    const requestedDeliveryFee = parseMoney(req.body.deliveryFee);
    const serviceFee = parseMoney(req.body.serviceFee) ?? '0.00';

    // Se for retirada, taxa e zero. Se for entrega, usa a taxa enviada pelo front ou a cadastrada.
    const deliveryFeeBase =
      fulfillmentType === FulfillmentType.DELIVERY
        ? Number(requestedDeliveryFee ?? settings.deliveryFee)
        : 0;
    const deliveryFee = deliveryFeeBase + Number(serviceFee);

    // Total final = subtotal dos lanches + taxa de entrega.
    const total = subtotal + deliveryFee;

    // Cria o pedido, seus itens e retorna tudo junto com cliente e produtos.
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        fulfillmentType,
        street:
          fulfillmentType === FulfillmentType.DELIVERY
            ? normalizeText(address.street)
            : null,
        number:
          fulfillmentType === FulfillmentType.DELIVERY
            ? normalizeText(address.number)
            : null,
        neighborhood:
          fulfillmentType === FulfillmentType.DELIVERY
            ? normalizeText(address.neighborhood)
            : null,
        complement:
          fulfillmentType === FulfillmentType.DELIVERY
            ? normalizeText(address.complement) || null
            : null,
        deliveryFee: deliveryFee.toFixed(2),
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        notes: normalizeText(req.body.notes) || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json(order);
  }),
);

// Lista todos os pedidos, incluindo cliente, itens e lanches.
orderRoutes.get(
  '/pedidos',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(orders);
  }),
);

// Busca um pedido especifico pelo id.
orderRoutes.get(
  '/pedidos/:id',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req, res);

    if (!id) {
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Pedido nao encontrado.' });
      return;
    }

    res.json(order);
  }),
);

// Atualiza o status de um pedido, por exemplo PREPARING ou READY.
orderRoutes.patch(
  '/pedidos/:id/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = getIdParam(req, res);

    if (!id) {
      return;
    }

    const status = req.body.status as OrderStatus;

    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ message: 'Status do pedido invalido.' });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(order);
  }),
);
