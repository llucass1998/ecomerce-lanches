import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  Minus,
  PackageCheck,
  Plus,
  QrCode,
  Receipt,
  Trash2,
  Truck
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatCurrency, store as defaultStore } from '../data/menuData.js';

const savedOrdersKey = 'ecomerce-lanche-orders';
const deliveryFee = 5;
const serviceFee = 2;
const pixKeyPlaceholder = 'sua-chave-pix-aqui';
const paymentMethods = [
  {
    id: 'PIX',
    label: 'PIX',
    description: 'QR Code e copia e cola',
    Icon: QrCode,
  },
  {
    id: 'CASH',
    label: 'Dinheiro',
    description: 'Pagamento na hora',
    Icon: Banknote,
  },
  {
    id: 'DEBIT',
    label: 'Débito',
    description: 'Cartão de débito',
    Icon: CreditCard,
  },
  {
    id: 'CREDIT',
    label: 'Crédito',
    description: 'Cartão de crédito',
    Icon: CreditCard,
  },
];

const cardPaymentModes = [
  {
    id: 'ONLINE',
    label: 'Cartão online',
    description: 'Enviar link de pagamento',
  },
  {
    id: 'ON_DELIVERY',
    label: 'Pagar na hora',
    description: 'Maquininha na entrega ou retirada',
  },
];

const deliveryTrackingSteps = [
  {
    key: 'PENDING',
    title: 'Pedido feito',
    description: 'Recebemos o pedido e ele entrou na fila da cozinha.',
    Icon: Receipt,
  },
  {
    key: 'PREPARING',
    title: 'Pagamento confirmado',
    description: 'Pagamento registrado para o pedido.',
    Icon: CreditCard,
  },
  {
    key: 'OUT_FOR_DELIVERY',
    title: 'Pedido enviado',
    description: 'O pedido já está a caminho do endereço informado.',
    Icon: Truck,
  },
  {
    key: 'DELIVERED',
    title: 'Pedido entregue',
    description: 'Pedido finalizado e entregue ao cliente.',
    Icon: CheckCircle2,
  },
];

const pickupTrackingSteps = [
  {
    key: 'PENDING',
    title: 'Pedido feito',
    description: 'Recebemos o pedido e ele entrou na fila da cozinha.',
    Icon: Receipt,
  },
  {
    key: 'PREPARING',
    title: 'Pagamento confirmado',
    description: 'Pagamento registrado para o pedido.',
    Icon: CreditCard,
  },
  {
    key: 'READY',
    title: 'Pronto para retirada',
    description: 'O pedido esta pronto para ser retirado na loja.',
    Icon: PackageCheck,
  },
  {
    key: 'DELIVERED',
    title: 'Pedido retirado',
    description: 'Pedido finalizado e entregue ao cliente no balcao.',
    Icon: CheckCircle2,
  },
];

function getFulfillmentLabel(fulfillmentType) {
  return fulfillmentType === 'PICKUP' ? 'Retirada na loja' : 'Entrega / envio';
}

function getTrackingSteps(fulfillmentType) {
  return fulfillmentType === 'PICKUP' ? pickupTrackingSteps : deliveryTrackingSteps;
}

function normalizePixText(value, maxLength) {
  return String(value || 'LOJA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 $%*+\-./:]/gi, '')
    .toUpperCase()
    .slice(0, maxLength);
}

function emvField(id, value) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function crc16(payload) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildPixPayload(amount, store = defaultStore) {
  const pixKey = String(store.pixKey || pixKeyPlaceholder).trim();
  const merchantAccount = [
    emvField('00', 'br.gov.bcb.pix'),
    emvField('01', pixKey),
    emvField('02', 'Pedido lanchonete'),
  ].join('');
  const additionalData = emvField('05', 'PEDIDO');
  const payloadWithoutCrc = [
    emvField('00', '01'),
    emvField('26', merchantAccount),
    emvField('52', '0000'),
    emvField('53', '986'),
    emvField('54', Number(amount || 0).toFixed(2)),
    emvField('58', 'BR'),
    emvField('59', normalizePixText(store.pixMerchantName || store.name, 25)),
    emvField('60', normalizePixText(store.pixCity || 'BRASIL', 15)),
    emvField('62', additionalData),
    '6304',
  ].join('');

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

function getPixQrCodeUrl(payload) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(payload)}`;
}

function parseCurrencyInput(value) {
  const normalized = String(value || '')
    .replace(/[^\d,.-]/g, '')
    .replace('.', '')
    .replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function getPaymentMethodLabel(paymentMethod) {
  return paymentMethods.find((method) => method.id === paymentMethod)?.label ?? paymentMethod;
}

function getPaymentSummary(paymentMethod, cardPaymentMode, cashChangeFor) {
  if (paymentMethod === 'PIX') {
    return 'PIX via QR Code';
  }

  if (paymentMethod === 'CASH') {
    return cashChangeFor.trim()
      ? `Dinheiro - troco para ${formatCurrency(parseCurrencyInput(cashChangeFor) ?? 0)}`
      : 'Dinheiro - sem troco informado';
  }

  const methodLabel = getPaymentMethodLabel(paymentMethod);
  const modeLabel =
    cardPaymentMode === 'ONLINE'
      ? 'cartão online por link de pagamento'
      : 'pagar na hora com maquininha';

  return `${methodLabel} - ${modeLabel}`;
}

function getSavedOrders() {
  try {
    return JSON.parse(window.localStorage.getItem(savedOrdersKey) ?? '[]');
  } catch {
    return [];
  }
}

function formatOrderDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatTrackingDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

function getOrderDisplayNumber(order) {
  const numericId = String(order?.id ?? '').replace(/\D/g, '');

  if (numericId) {
    return numericId.slice(-4);
  }

  return String(order?.id ?? '').slice(0, 8).toUpperCase();
}

function getOrderStatusLabel(status) {
  if (status === 'DELIVERED') {
    return 'FINALIZADO';
  }

  if (status === 'CANCELED') {
    return 'CANCELADO';
  }

  return 'EM ANDAMENTO';
}

function getTrackingIndex(status, fulfillmentType) {
  if (status === 'DELIVERED') {
    return 3;
  }

  if (status === 'OUT_FOR_DELIVERY') {
    return 2;
  }

  if (status === 'READY') {
    return fulfillmentType === 'PICKUP' ? 2 : 1;
  }

  if (status === 'PREPARING') {
    return 1;
  }

  return 0;
}

function normalizeOrder(order, fallbackItems, fallbackTotal) {
  const createdAt = order?.createdAt ?? new Date().toISOString();
  const items =
    order?.items?.map((item) => ({
      id: item.id,
      name: item.product?.name ?? item.name ?? 'Item do pedido',
      image: item.product?.image ?? item.image ?? '',
      imageUrl: item.product?.imageUrl ?? item.imageUrl ?? null,
      quantity: item.quantity,
      total: Number(item.total ?? 0),
    })) ??
    fallbackItems.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      imageUrl: item.imageUrl,
      quantity: item.qty,
      total: item.price * item.qty,
    }));

  return {
    id: order?.id ?? `PED-${Date.now()}`,
    status: order?.status ?? 'PREPARING',
    fulfillmentType: order?.fulfillmentType ?? 'DELIVERY',
    total: Number(order?.total ?? fallbackTotal),
    createdAt,
    items,
  };
}

export default function CartPage({
  apiBaseUrl,
  cartItems,
  cartTotal,
  customer,
  isLoggedIn,
  onLoginClick,
  onOrderCreated,
  onRemoveCartItem,
  store = defaultStore,
  onUpdateCartItemQuantity,
}) {
  const [orders, setOrders] = useState(getSavedOrders);
  const [lastOrder, setLastOrder] = useState(orders[0] ?? null);
  const [fulfillmentType, setFulfillmentType] = useState('DELIVERY');
  const [customerName, setCustomerName] = useState(customer?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(customer?.email ?? '');
  const [street, setStreet] = useState(customer?.street ?? '');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState(customer?.neighborhood ?? '');
  const [complement, setComplement] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [cardPaymentMode, setCardPaymentMode] = useState('ON_DELIVERY');
  const [cashChangeFor, setCashChangeFor] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasItems = cartItems.length > 0;
  const trackingFulfillmentType = lastOrder?.fulfillmentType ?? fulfillmentType;
  const trackingIndex = getTrackingIndex(lastOrder?.status, trackingFulfillmentType);
  const currentTrackingSteps = getTrackingSteps(trackingFulfillmentType);
  const deliveryFeeAmount =
    fulfillmentType === 'DELIVERY' && hasItems ? deliveryFee : 0;
  const checkoutTotal = cartTotal + (hasItems ? serviceFee : 0) + deliveryFeeAmount;
  const isCardPayment = paymentMethod === 'DEBIT' || paymentMethod === 'CREDIT';
  const isPixKeyConfigured = Boolean(
    store.pixKey && store.pixKey.trim() && store.pixKey !== pixKeyPlaceholder
  );
  const pixPayload = useMemo(
    () => buildPixPayload(checkoutTotal, store),
    [checkoutTotal, store]
  );
  const pixQrCodeUrl = useMemo(() => getPixQrCodeUrl(pixPayload), [pixPayload]);
  const paymentSummary = useMemo(
    () => getPaymentSummary(paymentMethod, cardPaymentMode, cashChangeFor),
    [cardPaymentMode, cashChangeFor, paymentMethod]
  );

  const canCheckout = useMemo(() => {
    if (!hasItems) {
      return false;
    }

    if (customer?.id) {
      return true;
    }

    return Boolean(customerName.trim() && customerEmail.trim());
  }, [cartItems, customer, customerEmail, customerName, hasItems]);

  async function copyPixPayload() {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopyFeedback('Código PIX copiado');
    } catch {
      setCopyFeedback('Copie o código manualmente');
    }

    window.setTimeout(() => setCopyFeedback(''), 2500);
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError('');

    if (!hasItems) {
      setError('Adicione itens ao carrinho antes de finalizar.');
      return;
    }

    if (!canCheckout) {
      setError('Entre na conta ou informe nome e email para finalizar.');
      return;
    }

    if (
      fulfillmentType === 'DELIVERY' &&
      (!street.trim() || !number.trim() || !neighborhood.trim())
    ) {
      setError('Para entrega, informe rua, número e bairro.');
      return;
    }

    if (paymentMethod === 'PIX' && !isPixKeyConfigured) {
      setError('Configure a chave PIX real da loja antes de finalizar por PIX.');
      return;
    }

    if (paymentMethod === 'CASH' && cashChangeFor.trim()) {
      const changeFor = parseCurrencyInput(cashChangeFor);

      if (!changeFor || changeFor < checkoutTotal) {
        setError('O valor para troco precisa ser maior que o total do pedido.');
        return;
      }
    }

    const payload = {
      fulfillmentType,
      deliveryFee: deliveryFeeAmount,
      serviceFee,
      customerId: customer?.id,
      customer: customer?.id
        ? undefined
        : {
            name: customerName,
            email: customerEmail,
          },
      address:
        fulfillmentType === 'DELIVERY'
          ? {
              street,
              number,
              neighborhood,
              complement,
            }
          : undefined,
      notes: [
        `Tipo: ${getFulfillmentLabel(fulfillmentType)}`,
        notes,
        `Pagamento: ${paymentSummary}`,
        paymentMethod === 'PIX' ? `PIX copia e cola: ${pixPayload}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
      items: cartItems.map((item) => ({
        productId: String(item.productId ?? item.id),
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.qty,
      })),
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${apiBaseUrl}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? 'Não foi possível finalizar o pedido.');
      }

      const order = normalizeOrder(data, cartItems, checkoutTotal);
      const nextOrders = [order, ...orders];

      setLastOrder(order);
      setOrders(nextOrders);
      window.localStorage.setItem(savedOrdersKey, JSON.stringify(nextOrders));
      onOrderCreated(order);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível finalizar o pedido.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function refreshLastOrder() {
    if (!lastOrder?.id) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`${apiBaseUrl}/pedidos/${lastOrder.id}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? 'Não foi possível atualizar o pedido.');
      }

      const refreshedOrder = normalizeOrder(data, [], data.total ?? lastOrder.total);
      const nextOrders = orders.map((order) =>
        order.id === refreshedOrder.id ? refreshedOrder : order
      );

      setLastOrder(refreshedOrder);
      setOrders(nextOrders);
      window.localStorage.setItem(savedOrdersKey, JSON.stringify(nextOrders));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível atualizar o pedido.'
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <a
        href="#/"
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 font-bold text-orange-700 transition hover:bg-orange-100"
      >
        <ArrowLeft size={18} />
        Voltar ao cardápio
      </a>

      <section className="mb-8 rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Carrinho e pedidos</h1>
            <p className="text-slate-600">Revise seu pedido, finalize e acompanhe a trajetória.</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold uppercase text-orange-600">Total atual</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(cartTotal)}</p>
          </div>
        </div>

        {!hasItems ? (
          <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-6 text-center">
            <p className="font-semibold text-slate-700">Seu carrinho está vazio.</p>
            <a
              href="#/"
              className="mt-4 inline-flex rounded-lg bg-orange-600 px-5 py-2 font-bold text-white transition hover:bg-red-600"
            >
              Escolher itens
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-xl border border-orange-100 bg-orange-50 p-4 sm:grid-cols-[auto_1fr_auto_auto]"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-white text-3xl shadow-sm">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span>{item.image}</span>
                  )}
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">{item.name}</h2>
                  <p className="text-sm text-slate-600">
                    {formatCurrency(item.price)} cada
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateCartItemQuantity(item.id, item.qty - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-600 transition hover:bg-orange-100"
                    type="button"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{item.qty}</span>
                  <button
                    onClick={() => onUpdateCartItemQuantity(item.id, item.qty + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-600 transition hover:bg-orange-100"
                    type="button"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="font-bold text-orange-600">
                    {formatCurrency(item.price * item.qty)}
                  </p>
                  <button
                    onClick={() => onRemoveCartItem(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600 transition hover:bg-red-50"
                    type="button"
                    aria-label="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleCheckout}
          className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Finalizar pedido</h2>
              <p className="text-sm text-slate-600">
                O pedido será salvo no banco quando a API estiver conectada.
              </p>
            </div>
            {!isLoggedIn && (
              <button
                onClick={onLoginClick}
                className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                type="button"
              >
                Entrar
              </button>
            )}
          </div>

          <div className="mb-5 grid gap-3 rounded-xl border-2 border-orange-100 bg-orange-50 p-3 sm:grid-cols-2">
            <button
              onClick={() => setFulfillmentType('DELIVERY')}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition ${
                fulfillmentType === 'DELIVERY'
                  ? 'border-orange-500 bg-orange-600 text-white'
                  : 'border-orange-100 bg-white text-orange-700 hover:border-orange-300'
              }`}
              type="button"
            >
              <Truck size={22} />
              <span>
                <span className="block font-bold">Entrega / envio</span>
                <span className="block text-sm opacity-80">Receber no endereco informado</span>
              </span>
            </button>
            <button
              onClick={() => setFulfillmentType('PICKUP')}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition ${
                fulfillmentType === 'PICKUP'
                  ? 'border-orange-500 bg-orange-600 text-white'
                  : 'border-orange-100 bg-white text-orange-700 hover:border-orange-300'
              }`}
              type="button"
            >
              <PackageCheck size={22} />
              <span>
                <span className="block font-bold">Retirada na loja</span>
                <span className="block text-sm opacity-80">Buscar no balcao sem taxa</span>
              </span>
            </button>
          </div>

          {fulfillmentType === 'PICKUP' && (
            <div className="mb-5 rounded-xl border-2 border-orange-100 bg-orange-50 p-4 text-sm font-semibold text-slate-700">
              Retirada escolhida: o pedido sera preparado para buscar na loja e nao tera taxa
              de entrega.
            </div>
          )}

          <section className="mb-5 rounded-xl border-2 border-orange-100 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-orange-600">
              <CreditCard size={20} />
              Método de pagamento
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map(({ id, label, description, Icon }) => (
                <label
                  key={id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${
                    paymentMethod === id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-orange-100 hover:bg-orange-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="mr-3"
                  />
                  <Icon className="shrink-0 text-orange-600" size={20} />
                  <span>
                    <span className="block font-semibold text-slate-900">{label}</span>
                    <span className="block text-sm text-slate-600">{description}</span>
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === 'PIX' && (
              <div className="mt-4 rounded-xl border-2 border-orange-100 bg-orange-50 p-4">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <div className="flex items-center justify-center rounded-xl bg-white p-3">
                    <img
                      src={pixQrCodeUrl}
                      alt="QR Code PIX"
                      className="h-52 w-52 rounded-lg border border-orange-100 bg-white"
                    />
                  </div>
                  <div>
                    <div className="mb-3">
                      <p className="text-sm font-bold uppercase text-orange-600">Chave PIX</p>
                      <p className="break-all font-semibold text-slate-900">
                        {store.pixKey || pixKeyPlaceholder}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-bold uppercase text-orange-600">Valor</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(checkoutTotal)}
                      </p>
                    </div>
                    {!isPixKeyConfigured && (
                      <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                        Configure a chave PIX real da loja para liberar pagamentos por PIX.
                      </p>
                    )}
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      PIX copia e cola
                    </label>
                    <textarea
                      value={pixPayload}
                      readOnly
                      className="mb-3 h-24 w-full resize-none rounded-lg border-2 border-orange-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none"
                    />
                    <button
                      onClick={copyPixPayload}
                      className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600"
                      type="button"
                    >
                      <Copy size={16} />
                      Copiar código PIX
                    </button>
                    {copyFeedback && (
                      <p className="mt-2 text-sm font-semibold text-green-700">{copyFeedback}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="mt-4 rounded-xl border-2 border-orange-100 bg-orange-50 p-4">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Troco para quanto?
                </label>
                <input
                  value={cashChangeFor}
                  onChange={(event) => setCashChangeFor(event.target.value)}
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: 100,00"
                />
                <p className="mt-2 text-sm text-slate-600">
                  Deixe em branco se não precisar de troco.
                </p>
              </div>
            )}

            {isCardPayment && (
              <div className="mt-4 rounded-xl border-2 border-orange-100 bg-orange-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {cardPaymentModes.map((mode) => (
                    <label
                      key={mode.id}
                      className={`cursor-pointer rounded-lg border-2 p-3 transition ${
                        cardPaymentMode === mode.id
                          ? 'border-orange-400 bg-white'
                          : 'border-orange-100 bg-orange-50 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cardPaymentMode"
                        checked={cardPaymentMode === mode.id}
                        onChange={() => setCardPaymentMode(mode.id)}
                        className="mr-3"
                      />
                      <span className="font-semibold text-slate-900">{mode.label}</span>
                      <span className="mt-1 block text-sm text-slate-600">
                        {mode.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {!customer?.id && (
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Nome</label>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                <input
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="seu@email.com"
                  type="email"
                />
              </div>
            </div>
          )}

          {fulfillmentType === 'DELIVERY' && (
            <div className="mb-5 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Rua</label>
                <input
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Rua do endereço"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Número</label>
                  <input
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Bairro</label>
                  <input
                    value={neighborhood}
                    onChange={(event) => setNeighborhood(event.target.value)}
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Centro"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Complemento
                </label>
                <input
                  value={complement}
                  onChange={(event) => setComplement(event.target.value)}
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Apartamento, bloco, referência"
                />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-bold text-slate-700">Observações</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={
                fulfillmentType === 'DELIVERY'
                  ? 'Ex: sem cebola, entregar na portaria...'
                  : 'Ex: sem cebola, vou retirar no nome de...'
              }
            />
          </div>

          {error && (
            <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            disabled={!canCheckout || isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 py-3 text-lg font-bold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
          >
            {isSubmitting ? 'Finalizando...' : 'Finalizar pedido'}
          </button>
        </form>

        <aside className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl lg:col-start-2 lg:row-start-1 lg:self-start">
          <div className="mb-8 rounded-xl border-2 border-orange-100 bg-white p-5">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Acompanhamento do pedido
            </h2>
            {lastOrder ? (
              <>
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div className="border-l-4 border-slate-300 pl-3">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        {getOrderStatusLabel(lastOrder.status)}
                      </p>
                      <p className="text-2xl font-bold text-slate-700">
                        #{getOrderDisplayNumber(lastOrder)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {getFulfillmentLabel(lastOrder.fulfillmentType)} - {formatCurrency(lastOrder.total)}
                      </p>
                    </div>
                    <button
                      onClick={refreshLastOrder}
                      className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                      type="button"
                    >
                      Atualizar
                    </button>
                  </div>

                  <div className="overflow-x-auto pb-2">
                    <div className="relative min-w-[520px] px-3 pt-4">
                      <div className="absolute left-10 right-10 top-10 grid grid-cols-3">
                        {currentTrackingSteps.slice(0, -1).map((step, index) => (
                          <div
                            key={step.key}
                            className={`h-1 ${
                              index < trackingIndex ? 'bg-green-700' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="relative grid grid-cols-4">
                        {currentTrackingSteps.map(({ key, title, Icon }, index) => {
                          const isActive = index <= trackingIndex;

                          return (
                            <div key={key} className="flex flex-col items-center text-center">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm ${
                                  isActive
                                    ? 'border-green-700 bg-green-700 text-white'
                                    : 'border-slate-200 bg-white text-slate-300'
                                }`}
                              >
                                <Icon size={22} />
                              </div>
                              <p
                                className={`mt-3 max-w-28 text-sm font-semibold ${
                                  isActive ? 'text-slate-700' : 'text-slate-400'
                                }`}
                              >
                                {title}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {isActive ? formatTrackingDate(lastOrder.createdAt) : 'Aguardando'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-orange-200 pt-6">
                  <h3 className="mb-4 text-lg font-bold text-slate-900">Detalhes do pedido</h3>
                  <div className="space-y-2">
                    {lastOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 text-sm text-slate-700"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-orange-50 text-2xl">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span>{item.image}</span>
                            )}
                          </span>
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                        </span>
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-orange-100 pt-4 text-lg font-bold text-orange-600">
                    <span>Total:</span>
                    <span>{formatCurrency(lastOrder.total)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-orange-50 p-4 text-slate-600">
                Finalize um pedido para acompanhar o andamento por aqui.
              </p>
            )}
          </div>

          {hasItems && (
            <div className="mb-8 rounded-xl border-2 border-orange-100 bg-orange-50 p-5">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Resumo financeiro</h2>
              <div className="space-y-3 border-b border-orange-200 pb-4">
                <div className="flex justify-between text-slate-700">
                  <span>Tipo:</span>
                  <span className="font-semibold">{getFulfillmentLabel(fulfillmentType)}</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-700">
                  <span>Pagamento:</span>
                  <span className="text-right font-semibold">{paymentSummary}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Taxa de entrega:</span>
                  <span className={fulfillmentType === 'DELIVERY' ? '' : 'font-semibold text-green-600'}>
                    {fulfillmentType === 'DELIVERY' ? formatCurrency(deliveryFeeAmount) : 'Sem taxa'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Taxa de serviço:</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-xl font-bold text-orange-600">
                <span>Total:</span>
                <span>{formatCurrency(checkoutTotal)}</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border-2 border-orange-100 bg-white p-5">
            <h2 className="mb-5 text-xl font-bold text-slate-900">Pedidos feitos</h2>
            {orders.length === 0 ? (
              <p className="rounded-lg bg-orange-50 p-4 text-slate-600">
                Nenhum pedido finalizado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setLastOrder(order)}
                    className="w-full rounded-xl border border-orange-100 bg-orange-50 p-4 text-left transition hover:border-orange-300 hover:bg-orange-100"
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">
                          Pedido #{String(order.id).slice(0, 8)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatOrderDate(order.createdAt)}
                        </p>
                        <p className="text-sm font-semibold text-orange-700">
                          {getFulfillmentLabel(order.fulfillmentType)}
                        </p>
                      </div>
                      <div className="flex shrink-0 -space-x-2">
                        {(order.items ?? []).slice(0, 3).map((item) => (
                          <span
                            key={`${order.id}-${item.id}`}
                            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-orange-100 text-lg shadow-sm"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span>{item.image}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 font-bold text-orange-600">
                      {formatCurrency(order.total)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
