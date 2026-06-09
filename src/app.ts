// Este arquivo monta a aplicacao Express.
// Aqui ficam os middlewares globais e o registro das rotas.
import cors from 'cors';
import express from 'express';

import { adminRoutes } from './routes/admin.routes.js';
import { customerRoutes } from './routes/customer.routes.js';
import { orderRoutes } from './routes/order.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';
import { statusRoutes } from './routes/status.routes.js';

// Cria a aplicacao Express, que sera a API.
export const app = express();

// Libera o acesso da API para o front-end.
app.use(cors());

// Permite receber JSON no corpo das requisicoes, incluindo imagens compactadas dos produtos.
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// Todas essas rotas comecam com /api.
app.use(
  '/api',
  statusRoutes,
  customerRoutes,
  adminRoutes,
  productRoutes,
  settingsRoutes,
  orderRoutes,
);
