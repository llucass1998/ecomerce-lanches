import type { Request, Response } from 'express';

import { normalizeText } from './normalize.js';

// Pega o id que vem na URL, por exemplo /api/lanches/:id.
export function getIdParam(req: Request, res: Response) {
  const id = normalizeText(req.params.id);

  if (!id) {
    res.status(400).json({ message: 'Informe um id valido.' });
    return null;
  }

  return id;
}
