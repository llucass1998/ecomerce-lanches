import { Router } from 'express';

export const statusRoutes = Router();

// Rota simples para testar se a API esta online.
statusRoutes.get('/status', (_req, res) => {
  res.json({
    status: 'online',
    message: 'API do e-commerce de lanches operando com sucesso!',
  });
});
