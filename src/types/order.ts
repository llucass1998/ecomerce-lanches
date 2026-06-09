// Formato esperado para cada item enviado ao criar um pedido.
export type OrderItemInput = {
  productId?: string;
  name?: string;
  displayName?: string;
  category?: string;
  customizations?: string;
  basePrice?: number | string;
  price?: number | string;
  imageUrl?: string;
  quantity?: number;
};
