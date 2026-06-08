// Este arquivo centraliza a conexao com o banco de dados.
// Assim, todas as rotas usam o mesmo Prisma Client.
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

// Busca a URL do PostgreSQL configurada no arquivo .env.
const connectionString = process.env.DATABASE_URL;

// Se nao tiver DATABASE_URL, paramos o servidor logo no inicio.
if (!connectionString) {
  throw new Error('DATABASE_URL nao foi configurada no arquivo .env');
}

// Adapter necessario para o Prisma 7 conversar com PostgreSQL.
const adapter = new PrismaPg({ connectionString });

// Exportamos o prisma para ser usado nas rotas.
export const prisma = new PrismaClient({ adapter });
