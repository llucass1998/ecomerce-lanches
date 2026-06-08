import { prisma } from '../lib/prisma.js';

// Busca as configuracoes da loja. Se ainda nao existir, cria com taxa 0.
export async function getStoreSettings() {
  return prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'Lanchonete do Lucas',
      hours: '18:00 - 2:00',
      address: 'Av. Principal, 123',
      phone: '(11) 9999-9999',
      whatsappNumber: '5511999999999',
      pixKey: 'sua-chave-pix-aqui',
      pixMerchantName: 'Lanchonete do Lucas',
      pixCity: 'Rio de Janeiro',
      deliveryFee: '0.00',
    },
  });
}
