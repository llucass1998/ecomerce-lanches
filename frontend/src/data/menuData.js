export const store = {
  name: "Lanchonete do Lucas",
  hours: '18:00 - 2:00',
  address: 'Av. Principal, 123',
  phone: '(11) 9999-9999',
  whatsappNumber: '5511999999999',
  pixKey: 'sua-chave-pix-aqui',
  pixMerchantName: 'Lanchonete do Lucas',
  pixCity: 'Rio de Janeiro'
};

export function getStoreFromSettings(settings = {}) {
  return {
    ...store,
    name: settings.storeName ?? settings.name ?? store.name,
    hours: settings.hours ?? store.hours,
    address: settings.address ?? store.address,
    phone: settings.phone ?? store.phone,
    whatsappNumber: settings.whatsappNumber ?? store.whatsappNumber,
    pixKey: settings.pixKey ?? store.pixKey,
    pixMerchantName: settings.pixMerchantName ?? settings.storeName ?? store.pixMerchantName,
    pixCity: settings.pixCity ?? store.pixCity,
  };
}

export function getMapsLink(currentStore = store) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${currentStore.address}, Brasil`
  )}`;
}

export function getWhatsappLink(currentStore = store) {
  return `https://wa.me/${currentStore.whatsappNumber}?text=${encodeURIComponent(
    'Olá! Vim pelo site e gostaria de fazer um pedido.'
  )}`;
}

export const categories = [
  {
    id: 'tradicionais',
    slug: 'tradicionais',
    name: 'Tradicionais',
    image: '🍔',
    description: 'Clássicos da casa para quem gosta do lanche direto ao ponto.'
  },
  {
    id: 'bebidas',
    slug: 'bebidas',
    name: 'Bebidas',
    image: '🥤',
    description: 'Refrigerantes, guaravita e bebidas geladas para acompanhar o pedido.'
  },
  {
    id: 'acai',
    slug: 'acai',
    name: 'Açaí',
    image: '🍓',
    description: 'Açaí gelado com combinações para todos os momentos.'
  },
  {
    id: 'combos',
    slug: 'combos-especiais',
    name: 'Combos Especiais',
    image: '🧺',
    description: 'Combinações prontas para dividir ou matar a fome.'
  },
  {
    id: 'picanha',
    slug: 'picanha',
    name: 'Picanha',
    image: '🥩',
    description: 'Hambúrgueres com sabor marcante de picanha.'
  },
  {
    id: 'frango',
    slug: 'file-de-frango',
    name: 'Filé de Frango',
    image: '🍗',
    description: 'Hambúrgueres de frango com combinações especiais.'
  },
  {
    id: 'artesanal',
    slug: 'artesanal',
    name: 'Artesanal',
    image: '🍔',
    description: 'Hambúrgueres artesanais com receitas mais caprichadas.'
  },
  {
    id: 'porcoes',
    slug: 'porcoes',
    name: 'Porções',
    image: '🍟',
    description: 'Combos com hambúrgueres e batatas para dividir.'
  },
  {
    id: 'milkshake',
    slug: 'milkshake',
    name: 'Milkshake',
    image: '🥤',
    description: 'Milkshakes cremosos em sabores clássicos e especiais.'
  }
];

const productImagesByCategory = {
  tradicionais:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  bebidas:
    'https://andinacocacola.vtexassets.com/arquivos/ids/159382-800-auto?aspect=true&height=auto&v=639163193134500000&width=800',
  acai:
    'https://imagens.jotaja.com/produtos/84072fed-6128-426b-a0ba-26b71a1b22a6.jpg',
  combos:
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=80',
  picanha:
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  frango:
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',
  artesanal:
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  porcoes:
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=80',
  milkshake:
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80'
};

const productImagesById = {
  4: 'https://www.pikpng.com/pngl/m/497-4971558_refresco-guaravita-tradicional-290ml-caffeinated-drink-clipart.png',
  5: 'https://andinacocacola.vtexassets.com/arquivos/ids/159348-800-auto?aspect=true&height=auto&v=639156030802970000&width=800',
  6: 'https://andinacocacola.vtexassets.com/arquivos/ids/159347-800-auto?aspect=true&height=auto&v=639134998771670000&width=800',
  7: 'https://imagens.jotaja.com/produtos/84072fed-6128-426b-a0ba-26b71a1b22a6.jpg',
  8: 'https://imagens.jotaja.com/produtos/84072fed-6128-426b-a0ba-26b71a1b22a6.jpg',
  9: 'https://imagens.jotaja.com/produtos/84072fed-6128-426b-a0ba-26b71a1b22a6.jpg',
  13: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  14: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  15: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  16: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',
  17: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',
  18: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',
  22: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=80',
  23: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=80',
  24: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=900&q=80',
  28: 'https://meufestval.vtexassets.com/arquivos/ids/208389/1049363.jpg?v=638652696892400000',
  29: 'https://andinacocacola.vtexassets.com/arquivos/ids/159382-800-auto?aspect=true&height=auto&v=639163193134500000&width=800'
};

export const products = [
  { id: 1, name: 'X-Burguer Premium', category: 'tradicionais', price: 28.9, image: '🍔' },
  { id: 2, name: 'X-Bacon Deluxe', category: 'tradicionais', price: 34.9, image: '🍔' },
  { id: 3, name: 'X-Tudo', category: 'tradicionais', price: 39.9, image: '🍔' },
  { id: 29, name: 'Coca-Cola lata 350ml', category: 'bebidas', price: 7, image: '🥤' },
  { id: 4, name: 'Guaravita 290ml', category: 'bebidas', price: 4.5, image: '🥤' },
  { id: 5, name: 'Fanta Uva lata 350ml', category: 'bebidas', price: 7, image: '🥤' },
  { id: 6, name: 'Fanta Laranja lata 350ml', category: 'bebidas', price: 7, image: '🥤' },
  { id: 7, name: 'Açaí 300ml', category: 'acai', price: 16.9, image: '🍓' },
  { id: 8, name: 'Açaí 500ml', category: 'acai', price: 25.9, image: '🍓' },
  { id: 9, name: 'Açaí 700ml', category: 'acai', price: 32.9, image: '🍓' },
  { id: 10, name: 'Combo Duplo', category: 'combos', price: 59.9, image: '🧺' },
  { id: 11, name: 'Combo Família', category: 'combos', price: 99.9, image: '🧺' },
  { id: 12, name: 'Combo Amigos', category: 'combos', price: 129.9, image: '🧺' },
  { id: 13, name: 'Hambúrguer de Picanha', category: 'picanha', price: 45.9, image: '🥩' },
  { id: 14, name: 'Picanha Bacon', category: 'picanha', price: 58.9, image: '🥩' },
  { id: 15, name: 'Picanha Especial', category: 'picanha', price: 69.9, image: '🥩' },
  { id: 16, name: 'X-Frango', category: 'frango', price: 35.9, image: '🍗' },
  { id: 17, name: 'X-Frango Bacon', category: 'frango', price: 38.9, image: '🍗' },
  { id: 18, name: 'X-Frango Catupiry', category: 'frango', price: 42.9, image: '🍗' },
  { id: 19, name: 'Hambúrguer Artesanal Beef', category: 'artesanal', price: 45.9, image: '🍔' },
  { id: 20, name: 'Hambúrguer Artesanal Gourmet', category: 'artesanal', price: 52.9, image: '🍔' },
  { id: 21, name: 'Artesanal da Casa', category: 'artesanal', price: 49.9, image: '🍔' },
  { id: 22, name: 'Combo 2 Hambúrgueres + Batata', category: 'porcoes', price: 54.9, image: '🍟' },
  { id: 23, name: 'Combo 3 Hambúrgueres + Batata', category: 'porcoes', price: 74.9, image: '🍟' },
  { id: 24, name: 'Combo 4 Hambúrgueres + Batata', category: 'porcoes', price: 94.9, image: '🍟' },
  { id: 25, name: 'Milkshake Morango', category: 'milkshake', price: 16.9, image: '🥤' },
  { id: 26, name: 'Milkshake Chocolate', category: 'milkshake', price: 16.9, image: '🥤' },
  { id: 27, name: 'Milkshake Ovomaltine', category: 'milkshake', price: 19.9, image: '🥤' },
  { id: 28, name: 'Guaraná Antarctica lata 350ml', category: 'bebidas', price: 7, image: '🥤' }
].map((product) => ({
  ...product,
  imageUrl: productImagesById[product.id] ?? productImagesByCategory[product.category]
}));

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function getCategory(categoryId) {
  return categories.find((category) => category.id === categoryId);
}

export function getProductsByCategory(categoryId) {
  return products.filter((product) => product.category === categoryId);
}
