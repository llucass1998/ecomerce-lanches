import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { getStoreSettings } from '../services/storeSettings.service.js';
import { normalizeText, parseMoney } from '../utils/normalize.js';

export const settingsRoutes = Router();

// Busca as configuracoes atuais da loja, como taxa de entrega.
settingsRoutes.get(
  '/configuracoes',
  asyncHandler(async (_req, res) => {
    const settings = await getStoreSettings();
    res.json(settings);
  }),
);

// Atualiza a taxa de entrega da loja.
settingsRoutes.put(
  '/configuracoes/taxa-entrega',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deliveryFee = parseMoney(req.body.deliveryFee);

    if (deliveryFee === null) {
      res.status(400).json({ message: 'Informe uma taxa de entrega valida.' });
      return;
    }

    // Cria as configuracoes se nao existirem, ou atualiza se ja existirem.
    const settings = await prisma.storeSetting.upsert({
      where: { id: 1 },
      update: { deliveryFee },
      create: { id: 1, deliveryFee },
    });

    res.json(settings);
  }),
);

// Atualiza os dados publicos da loja usados no site e no checkout.
settingsRoutes.put(
  '/configuracoes/loja',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deliveryFee =
      req.body.deliveryFee === undefined
        ? undefined
        : parseMoney(req.body.deliveryFee);

    if (deliveryFee === null) {
      res.status(400).json({ message: 'Informe uma taxa de entrega valida.' });
      return;
    }

    const currentSettings = await getStoreSettings();
    const storeName = normalizeText(req.body.storeName) || currentSettings.storeName;
    const hours = normalizeText(req.body.hours) || currentSettings.hours;
    const address = normalizeText(req.body.address) || currentSettings.address;
    const phone = normalizeText(req.body.phone) || currentSettings.phone;
    const whatsappNumber =
      normalizeText(req.body.whatsappNumber) || currentSettings.whatsappNumber;
    const pixKey = normalizeText(req.body.pixKey) || currentSettings.pixKey;
    const pixMerchantName =
      normalizeText(req.body.pixMerchantName) || storeName;
    const pixCity = normalizeText(req.body.pixCity) || currentSettings.pixCity;

    const settings = await prisma.storeSetting.update({
      where: { id: 1 },
      data: {
        storeName,
        hours,
        address,
        phone,
        whatsappNumber,
        pixKey,
        pixMerchantName,
        pixCity,
        ...(deliveryFee !== undefined ? { deliveryFee } : {}),
      },
    });

    res.json(settings);
  }),
);
