import type { Request, Response } from 'express';

// Tipo usado nas rotas async para o TypeScript entender req e res.
type AsyncHandler = (req: Request, res: Response) => Promise<void>;

// Evita repetir try/catch em todas as rotas.
// Se alguma rota der erro, a API responde com erro 500.
export const asyncHandler =
  (handler: AsyncHandler) => async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  };
