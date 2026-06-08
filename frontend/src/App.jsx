import { useEffect, useMemo, useState } from 'react';
import {
  LogOut,
  LogIn,
  Menu,
  Moon,
  ShieldCheck,
  ShoppingCart,
  Sun,
  User,
  X
} from 'lucide-react';
import AccountPage from './pages/AccountPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CartPage from './pages/CartPage.jsx';
import HomePage from './pages/HomePage.jsx';
import TradicionaisPage from './pages/categories/TradicionaisPage.jsx';
import BebidasPage from './pages/categories/BebidasPage.jsx';
import AcaiPage from './pages/categories/AcaiPage.jsx';
import CombosEspeciaisPage from './pages/categories/CombosEspeciaisPage.jsx';
import PicanhaPage from './pages/categories/PicanhaPage.jsx';
import FileDeFrangoPage from './pages/categories/FileDeFrangoPage.jsx';
import ArtesanalPage from './pages/categories/ArtesanalPage.jsx';
import PorcoesPage from './pages/categories/PorcoesPage.jsx';
import MilkshakePage from './pages/categories/MilkshakePage.jsx';
import {
  formatCurrency,
  getStoreFromSettings,
  products,
  store
} from './data/menuData.js';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const savedCustomerKey = 'ecomerce-lanche-customer';
const savedThemeKey = 'ecomerce-lanche-theme';
const defaultCartItems = [1, 29]
  .map((productId) => products.find((product) => product.id === productId))
  .filter(Boolean)
  .map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    qty: 1,
    image: product.image,
    imageUrl: product.imageUrl,
  }));

const routes = {
  '/': HomePage,
  '/admin': AdminPage,
  '/conta': AccountPage,
  '/carrinho': CartPage,
  '/tradicionais': TradicionaisPage,
  '/bebidas': BebidasPage,
  '/acai': AcaiPage,
  '/combos-especiais': CombosEspeciaisPage,
  '/picanha': PicanhaPage,
  '/file-de-frango': FileDeFrangoPage,
  '/artesanal': ArtesanalPage,
  '/porcoes': PorcoesPage,
  '/milkshake': MilkshakePage
};

function getHashPath() {
  const path = window.location.hash.replace('#', '');
  return path || '/';
}

function getInitialDarkMode() {
  const savedTheme = window.localStorage.getItem(savedThemeKey);

  if (savedTheme) {
    return savedTheme === 'dark';
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export default function LanchoneteApp() {
  const [path, setPath] = useState(getHashPath);
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerCpf, setRegisterCpf] = useState('');
  const [registerStreet, setRegisterStreet] = useState('');
  const [registerNeighborhood, setRegisterNeighborhood] = useState('');
  const [registerCity, setRegisterCity] = useState('');
  const [registerCep, setRegisterCep] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState(() => {
    const savedCustomer = window.localStorage.getItem(savedCustomerKey);
    return savedCustomer ? JSON.parse(savedCustomer) : null;
  });
  const [cartItems, setCartItems] = useState(defaultCartItems);
  const [storeSettings, setStoreSettings] = useState(null);

  const currentStore = useMemo(
    () => getStoreFromSettings(storeSettings ?? store),
    [storeSettings]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem(savedThemeKey, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    function handleHashChange() {
      setPath(getHashPath());
      setIsMenuOpen(false);
      setIsAccountMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadStoreSettings() {
      try {
        const response = await fetch(`${API_BASE_URL}/configuracoes`);
        const data = await response.json().catch(() => null);

        if (isMounted && response.ok && data) {
          setStoreSettings(data);
        }
      } catch {
        // Mantem os dados padrao quando a API ainda nao estiver aberta.
      }
    }

    loadStoreSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const Page = routes[path] ?? HomePage;
  const isLoggedIn = Boolean(currentCustomer);

  function openAuthModal(mode = 'login') {
    setAuthMode(mode);
    setAuthError('');
    setShowLoginModal(true);
  }

  async function submitAuthRequest(pathname, body) {
    const response = await fetch(`${API_BASE_URL}${pathname}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message ?? 'Nao foi possivel concluir a operacao.');
    }

    return data;
  }

  function finishAuth(customer) {
    setCurrentCustomer(customer);
    window.localStorage.setItem(savedCustomerKey, JSON.stringify(customer));
    setShowLoginModal(false);
    setIsAccountMenuOpen(false);
    setAuthError('');
    setEmail('');
    setPassword('');
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setIsAuthLoading(true);
      setAuthError('');
      const customer = await submitAuthRequest('/login', { email, password });
      finishAuth(customer);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Erro ao entrar.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    try {
      setIsAuthLoading(true);
      setAuthError('');
      const customer = await submitAuthRequest('/register', {
        name: registerName,
        email,
        password,
        phone: registerPhone,
        cpf: registerCpf,
        address: {
          street: registerStreet,
          neighborhood: registerNeighborhood,
          city: registerCity,
          cep: registerCep,
        },
      });

      finishAuth(customer);
      setRegisterName('');
      setRegisterPhone('');
      setRegisterCpf('');
      setRegisterStreet('');
      setRegisterNeighborhood('');
      setRegisterCity('');
      setRegisterCep('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Erro ao cadastrar.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  function handleLogout() {
    setCurrentCustomer(null);
    window.localStorage.removeItem(savedCustomerKey);
    setIsAccountMenuOpen(false);

    if (getHashPath() === '/conta') {
      window.location.hash = '/';
    }
  }

  function addToCart(product) {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.id === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          image: product.image,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }

  function updateCartItemQuantity(itemId, nextQuantity) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === itemId ? { ...item, qty: Math.max(1, nextQuantity) } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeCartItem(itemId) {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  }

  function handleOrderCreated(order) {
    setCartItems([]);

    if (!currentCustomer) {
      return;
    }

    const updatedCustomer = {
      ...currentCustomer,
      orders: [order, ...(currentCustomer.orders ?? [])],
    };

    setCurrentCustomer(updatedCustomer);
    window.localStorage.setItem(savedCustomerKey, JSON.stringify(updatedCustomer));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <header className="sticky top-0 z-50 border-b-4 border-orange-600 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <a href="#/" className="flex items-center gap-2">
            <div className="text-3xl" aria-hidden="true">
              🍔
            </div>
            <div className="text-xl font-bold text-white sm:text-2xl">{currentStore.name}</div>
          </a>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm transition hover:shadow-lg md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            className={`${
              isMenuOpen ? 'flex' : 'hidden'
            } nav-actions-menu absolute left-4 right-4 top-20 flex-col gap-3 rounded-lg border-2 border-orange-200 bg-white p-4 shadow-2xl md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            <button
              onClick={() => setIsDarkMode((current) => !current)}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition hover:shadow-lg md:w-12 md:rounded-full md:bg-white"
              title={isDarkMode ? 'Usar modo claro' : 'Usar modo escuro'}
              type="button"
              aria-label={isDarkMode ? 'Usar modo claro' : 'Usar modo escuro'}
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <div className="group relative">
              <a
                href="#/admin"
                className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition hover:shadow-lg md:w-12 md:rounded-full md:bg-white"
                title="Area administrativa"
              >
                <ShieldCheck size={22} />
              </a>
            </div>

            <div className="group relative">
              <a
                href="#/carrinho"
                className="relative flex h-12 w-full items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition hover:shadow-lg md:w-12 md:rounded-full md:bg-white"
                title="Ver carrinho"
              >
                <ShoppingCart size={24} />
                {cartItems.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {cartItems.length}
                  </span>
                )}
              </a>

              <div className="invisible absolute right-0 top-14 z-50 w-72 rounded-lg border-2 border-orange-200 bg-white p-4 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <h3 className="mb-3 font-bold text-orange-600">Seu Pedido</h3>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-slate-600">Carrinho vazio</p>
                ) : (
                  <>
                    <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-3 border-b border-orange-100 pb-2 text-sm"
                        >
                          <span className="text-slate-700">
                            {item.name} x{item.qty}
                          </span>
                          <span className="font-bold text-orange-600">
                            {formatCurrency(item.price * item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mb-3 border-t-2 border-orange-200 pt-3">
                      <div className="flex justify-between font-bold text-orange-600">
                        <span>Total:</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                    </div>
                    <a
                      href="#/carrinho"
                      className="block w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 py-2 text-center text-sm font-bold text-white transition hover:shadow-lg"
                    >
                      Finalizar pedido
                    </a>
                  </>
                )}
              </div>
            </div>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition hover:shadow-lg md:w-12 md:rounded-full md:bg-white"
                  title="Abrir menu da conta"
                  type="button"
                >
                  <User size={22} />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-14 z-50 w-44 overflow-hidden rounded-lg border-2 border-orange-200 bg-white py-2 shadow-2xl">
                    <a
                      href="#/conta"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
                    >
                      <User size={18} />
                      Ver conta
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                      type="button"
                    >
                      <LogOut size={18} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center justify-center gap-2 rounded-lg bg-orange-50 px-4 py-2 font-bold text-orange-600 transition hover:shadow-lg md:bg-white"
                type="button"
              >
                <LogIn size={18} />
                <span className="text-sm">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <Page
        isLoggedIn={isLoggedIn}
        customer={currentCustomer}
        apiBaseUrl={API_BASE_URL}
        store={currentStore}
        storeSettings={storeSettings}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onAddToCart={addToCart}
        onLoginClick={() => openAuthModal('login')}
        onLogout={handleLogout}
        onUpdateCartItemQuantity={updateCartItemQuantity}
        onRemoveCartItem={removeCartItem}
        onOrderCreated={handleOrderCreated}
        onStoreSettingsChange={setStoreSettings}
      />

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border-2 border-orange-300 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-orange-600">
                {authMode === 'login' ? 'Entrar 🍔' : 'Cadastrar 🍔'}
              </h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-600 hover:text-slate-900"
                type="button"
                aria-label="Fechar login"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={authMode === 'login' ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {authMode === 'register' && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Nome</label>
                  <input
                    type="text"
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={registerPhone}
                        onChange={(event) => setRegisterPhone(event.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">CPF</label>
                      <input
                        type="text"
                        value={registerCpf}
                        onChange={(event) => setRegisterCpf(event.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Rua</label>
                    <input
                      type="text"
                      value={registerStreet}
                      onChange={(event) => setRegisterStreet(event.target.value)}
                      placeholder="Rua e numero"
                      className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={registerNeighborhood}
                        onChange={(event) => setRegisterNeighborhood(event.target.value)}
                        placeholder="Centro"
                        className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={registerCity}
                        onChange={(event) => setRegisterCity(event.target.value)}
                        placeholder="Sao Paulo"
                        className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">CEP</label>
                      <input
                        type="text"
                        value={registerCep}
                        onChange={(event) => setRegisterCep(event.target.value)}
                        placeholder="00000-000"
                        className="w-full rounded-lg border-2 border-orange-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {authError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 py-2 font-bold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuthLoading
                  ? 'Aguarde...'
                  : authMode === 'login'
                    ? 'Entrar'
                    : 'Cadastrar'}
              </button>

              <div className="text-center text-sm text-slate-600">
                {authMode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="font-bold text-orange-600 hover:text-red-600"
                >
                  {authMode === 'login' ? 'Cadastre-se' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
