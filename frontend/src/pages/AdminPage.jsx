import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  LogOut,
  PackagePlus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../data/menuData.js';

const savedAdminKey = 'ecomerce-lanche-admin';

const emptyStoreForm = {
  storeName: '',
  hours: '',
  address: '',
  phone: '',
  whatsappNumber: '',
  pixKey: '',
  pixMerchantName: '',
  pixCity: '',
  deliveryFee: '',
};

const statusOptions = [
  { value: 'PENDING', label: 'Pedido feito' },
  { value: 'PREPARING', label: 'Pagamento confirmado' },
  { value: 'READY', label: 'Pronto para retirada' },
  { value: 'OUT_FOR_DELIVERY', label: 'Saiu para entrega' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELED', label: 'Cancelado' },
];

function getSavedAdminSession() {
  try {
    return JSON.parse(window.localStorage.getItem(savedAdminKey) ?? 'null');
  } catch {
    return null;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function normalizeProduct(product) {
  return {
    ...product,
    priceInput: String(product.price ?? '').replace('.', ','),
  };
}

export default function AdminPage({ apiBaseUrl, onStoreSettingsChange }) {
  const [session, setSession] = useState(getSavedAdminSession);
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('Administrador');
  const [email, setEmail] = useState('admin@ecomerce-lanche.com');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.token ?? ''}`,
    }),
    [session],
  );

  function saveSession(nextSession) {
    setSession(nextSession);
    window.localStorage.setItem(savedAdminKey, JSON.stringify(nextSession));
  }

  function logout() {
    setSession(null);
    window.localStorage.removeItem(savedAdminKey);
  }

  async function request(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message ?? 'Nao foi possivel concluir a operacao.');
    }

    return data;
  }

  async function handleAuth(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setIsLoading(true);
      const data = await request(authMode === 'setup' ? '/admin/setup' : '/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          authMode === 'setup' ? { name, email, password } : { email, password },
        ),
      });

      saveSession(data);
      setPassword('');
      setMessage(
        authMode === 'setup'
          ? 'Administrador criado com sucesso.'
          : 'Administrador conectado.',
      );
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'Nao foi possivel entrar como administrador.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDashboardData() {
    if (!session?.token) {
      return;
    }

    setError('');

    try {
      setIsLoading(true);
      const [nextOrders, nextProducts, settings] = await Promise.all([
        request('/pedidos', { headers: authHeaders }),
        request('/lanches'),
        request('/configuracoes'),
      ]);

      setOrders(nextOrders);
      setProducts(nextProducts.map(normalizeProduct));
      setStoreForm({
        storeName: settings.storeName ?? '',
        hours: settings.hours ?? '',
        address: settings.address ?? '',
        phone: settings.phone ?? '',
        whatsappNumber: settings.whatsappNumber ?? '',
        pixKey: settings.pixKey ?? '',
        pixMerchantName: settings.pixMerchantName ?? settings.storeName ?? '',
        pixCity: settings.pixCity ?? '',
        deliveryFee: String(settings.deliveryFee ?? '0').replace('.', ','),
      });
      onStoreSettingsChange?.(settings);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel carregar o painel.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, [session?.token]);

  async function updateOrderStatus(orderId, status) {
    setError('');
    setMessage('');

    try {
      const updatedOrder = await request(`/pedidos/${orderId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
      );
      setMessage('Status do pedido atualizado.');
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : 'Nao foi possivel atualizar o pedido.',
      );
    }
  }

  async function saveStoreSettings() {
    setError('');
    setMessage('');

    try {
      const settings = await request('/configuracoes/loja', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(storeForm),
      });

      setStoreForm({
        storeName: settings.storeName ?? '',
        hours: settings.hours ?? '',
        address: settings.address ?? '',
        phone: settings.phone ?? '',
        whatsappNumber: settings.whatsappNumber ?? '',
        pixKey: settings.pixKey ?? '',
        pixMerchantName: settings.pixMerchantName ?? settings.storeName ?? '',
        pixCity: settings.pixCity ?? '',
        deliveryFee: String(settings.deliveryFee ?? '0').replace('.', ','),
      });
      onStoreSettingsChange?.(settings);
      setMessage('Dados da loja atualizados.');
    } catch (settingsError) {
      setError(
        settingsError instanceof Error
          ? settingsError.message
          : 'Nao foi possivel atualizar os dados da loja.',
      );
    }
  }

  async function saveProduct(product) {
    setError('');
    setMessage('');

    try {
      const updatedProduct = await request(`/lanches/${product.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          price: product.priceInput,
          isAvailable: product.isAvailable,
        }),
      });

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id ? normalizeProduct(updatedProduct) : item,
        ),
      );
      setMessage('Produto atualizado.');
    } catch (productError) {
      setError(
        productError instanceof Error
          ? productError.message
          : 'Nao foi possivel atualizar o produto.',
      );
    }
  }

  async function createProduct(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const createdProduct = await request('/lanches', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...newProduct,
          isAvailable: true,
        }),
      });

      setProducts((currentProducts) => [
        normalizeProduct(createdProduct),
        ...currentProducts,
      ]);
      setNewProduct({ name: '', price: '', description: '', imageUrl: '' });
      setMessage('Produto criado no cardapio.');
    } catch (productError) {
      setError(
        productError instanceof Error
          ? productError.message
          : 'Nao foi possivel criar o produto.',
      );
    }
  }

  if (!session?.token) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <a
          href="#/"
          className="mb-6 inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 font-bold text-orange-700 transition hover:bg-orange-100"
        >
          <ArrowLeft size={18} />
          Voltar ao cardapio
        </a>

        <section className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Administrador</h1>
              <p className="text-slate-600">
                Entre para gerenciar pedidos, taxa e cardapio.
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setAuthMode('login')}
              className={`rounded-lg border-2 px-4 py-3 font-bold transition ${
                authMode === 'login'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-orange-100 text-slate-600 hover:bg-orange-50'
              }`}
              type="button"
            >
              Entrar
            </button>
            <button
              onClick={() => setAuthMode('setup')}
              className={`rounded-lg border-2 px-4 py-3 font-bold transition ${
                authMode === 'setup'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-orange-100 text-slate-600 hover:bg-orange-50'
              }`}
              type="button"
            >
              Criar primeiro admin
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'setup' && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Nome</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nome do administrador"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="admin@loja.com"
                type="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Senha</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Minimo 6 caracteres"
                type="password"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 py-3 font-bold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
            >
              {isLoading ? 'Aguarde...' : authMode === 'setup' ? 'Criar admin' : 'Entrar'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="#/"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 font-bold text-orange-700 transition hover:bg-orange-100"
        >
          <ArrowLeft size={18} />
          Voltar ao cardapio
        </a>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-orange-700 shadow-sm transition hover:bg-orange-50"
            type="button"
          >
            <RefreshCw size={18} />
            Atualizar painel
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
            type="button"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <ShieldCheck size={26} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-orange-600">Area administrativa</p>
            <h1 className="text-3xl font-bold text-slate-900">
              {session.admin?.name ?? 'Administrador'}
            </h1>
            <p className="text-slate-600">{session.admin?.email}</p>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardList className="text-orange-600" size={24} />
            <h2 className="text-2xl font-bold text-slate-900">Pedidos</h2>
          </div>

          {orders.length === 0 ? (
            <p className="rounded-lg bg-orange-50 p-4 text-slate-600">
              Nenhum pedido encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl border border-orange-100 bg-orange-50 p-4"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-900">
                        Pedido #{String(order.id).slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDate(order.createdAt)} - {order.customer?.name}
                      </p>
                      <p className="text-sm font-semibold text-orange-700">
                        {order.fulfillmentType === 'PICKUP'
                          ? 'Retirada na loja'
                          : 'Entrega / envio'}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(Number(order.total))}
                      </p>
                      <p className="text-sm text-slate-600">
                        {order.items?.length ?? 0} item(ns)
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 grid gap-2">
                    {(order.items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        <span>
                          {item.product?.name ?? 'Item'} x{item.quantity}
                        </span>
                        <span className="font-semibold">{formatCurrency(Number(item.total))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <select
                      value={order.status}
                      onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                      className="rounded-lg border-2 border-orange-200 bg-white px-4 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-green-700">
                      <CheckCircle2 size={16} />
                      Status editavel
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <Settings className="text-orange-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-900">Loja</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Nome da loja
                </label>
                <input
                  value={storeForm.storeName}
                  onChange={(event) =>
                    setStoreForm((settings) => ({
                      ...settings,
                      storeName: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nome da loja"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Endereco da loja
                </label>
                <input
                  value={storeForm.address}
                  onChange={(event) =>
                    setStoreForm((settings) => ({
                      ...settings,
                      address: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Rua, numero, bairro, cidade"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Telefone
                  </label>
                  <input
                    value={storeForm.phone}
                    onChange={(event) =>
                      setStoreForm((settings) => ({
                        ...settings,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="(21) 99999-9999"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    WhatsApp
                  </label>
                  <input
                    value={storeForm.whatsappNumber}
                    onChange={(event) =>
                      setStoreForm((settings) => ({
                        ...settings,
                        whatsappNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="5521999999999"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Horario
                  </label>
                  <input
                    value={storeForm.hours}
                    onChange={(event) =>
                      setStoreForm((settings) => ({
                        ...settings,
                        hours: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="18:00 - 02:00"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Taxa de entrega
                  </label>
                  <input
                    value={storeForm.deliveryFee}
                    onChange={(event) =>
                      setStoreForm((settings) => ({
                        ...settings,
                        deliveryFee: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: 5,00"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Chave PIX
                </label>
                <input
                  value={storeForm.pixKey}
                  onChange={(event) =>
                    setStoreForm((settings) => ({
                      ...settings,
                      pixKey: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatoria"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nome no PIX
                  </label>
                  <input
                    value={storeForm.pixMerchantName}
                    onChange={(event) =>
                      setStoreForm((settings) => ({
                        ...settings,
                        pixMerchantName: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nome que aparece no PIX"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Cidade PIX
                  </label>
                  <input
                    value={storeForm.pixCity}
                    onChange={(event) =>
                      setStoreForm((settings) => ({
                        ...settings,
                        pixCity: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Rio de Janeiro"
                  />
                </div>
              </div>

              <button
                onClick={saveStoreSettings}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-bold text-white transition hover:bg-red-600"
                type="button"
              >
                <Save size={18} />
                Salvar dados da loja
              </button>
            </div>
          </section>

          <section className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <PackagePlus className="text-orange-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-900">Novo produto</h2>
            </div>
            <form onSubmit={createProduct} className="space-y-3">
              <input
                value={newProduct.name}
                onChange={(event) =>
                  setNewProduct((product) => ({ ...product, name: event.target.value }))
                }
                className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nome do produto"
              />
              <input
                value={newProduct.price}
                onChange={(event) =>
                  setNewProduct((product) => ({ ...product, price: event.target.value }))
                }
                className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Preco"
              />
              <input
                value={newProduct.description}
                onChange={(event) =>
                  setNewProduct((product) => ({
                    ...product,
                    description: event.target.value,
                  }))
                }
                className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Descricao"
              />
              <input
                value={newProduct.imageUrl}
                onChange={(event) =>
                  setNewProduct((product) => ({ ...product, imageUrl: event.target.value }))
                }
                className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="URL da imagem"
              />
              <button
                className="w-full rounded-lg bg-orange-600 py-2 font-bold text-white transition hover:bg-red-600"
                type="submit"
              >
                Criar produto
              </button>
            </form>
          </section>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <Store className="text-orange-600" size={24} />
          <h2 className="text-2xl font-bold text-slate-900">Produtos do banco</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-xl border border-orange-100 bg-orange-50 p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-white text-2xl">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Store size={22} />
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={product.isAvailable}
                    onChange={(event) =>
                      setProducts((currentProducts) =>
                        currentProducts.map((item) =>
                          item.id === product.id
                            ? { ...item, isAvailable: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />
                  Disponivel
                </label>
              </div>

              <div className="space-y-3">
                <input
                  value={product.name}
                  onChange={(event) =>
                    setProducts((currentProducts) =>
                      currentProducts.map((item) =>
                        item.id === product.id
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="w-full rounded-lg border-2 border-orange-200 px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  value={product.priceInput}
                  onChange={(event) =>
                    setProducts((currentProducts) =>
                      currentProducts.map((item) =>
                        item.id === product.id
                          ? { ...item, priceInput: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="w-full rounded-lg border-2 border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Preco"
                />
                <input
                  value={product.imageUrl ?? ''}
                  onChange={(event) =>
                    setProducts((currentProducts) =>
                      currentProducts.map((item) =>
                        item.id === product.id
                          ? { ...item, imageUrl: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="w-full rounded-lg border-2 border-orange-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="URL da imagem"
                />
                <button
                  onClick={() => saveProduct(product)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-bold text-white transition hover:bg-red-600"
                  type="button"
                >
                  <Save size={18} />
                  Salvar produto
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
