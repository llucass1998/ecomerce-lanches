import { ArrowRight, Flame, MapPin, Phone, ShoppingCart, Timer } from 'lucide-react';
import {
  categories,
  formatCurrency,
  getMapsLink,
  getWhatsappLink,
  products as fallbackProducts,
  store as defaultStore
} from '../data/menuData.js';

function getCategoryImage(categoryId, products) {
  return products.find((product) => product.category === categoryId)?.imageUrl;
}

function getBestSeller(products) {
  const preferredNames = ['X-Bacon Deluxe', 'X-Burguer Premium', 'Batata Maluca'];
  const preferredProduct = preferredNames
    .map((name) =>
      products.find((product) =>
        String(product.name ?? '').toLowerCase().includes(name.toLowerCase())
      )
    )
    .find(Boolean);

  return preferredProduct ?? products.find((product) => product.category !== 'bebidas') ?? products[0];
}

export default function HomePage({
  products = fallbackProducts,
  store = defaultStore,
  onAddToCart,
}) {
  const mapsLink = getMapsLink(store);
  const whatsappLink = getWhatsappLink(store);
  const bestSeller = getBestSeller(products);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-orange-100 bg-white p-5 text-center">
          <Timer size={32} className="mx-auto mb-2 text-orange-600" />
          <p className="text-sm text-slate-600">Horário:</p>
          <p className="font-bold text-slate-900">{store.hours}</p>
        </div>
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border-2 border-orange-100 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
        >
          <MapPin size={32} className="mx-auto mb-2 text-orange-600" />
          <p className="text-sm text-slate-600">Localização:</p>
          <p className="font-bold text-slate-900">{store.address}</p>
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border-2 border-orange-100 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
        >
          <Phone size={32} className="mx-auto mb-2 text-orange-600" />
          <p className="text-sm text-slate-600">Telefone:</p>
          <p className="font-bold text-slate-900">{store.phone}</p>
        </a>
      </section>

      <section className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-6 py-12 text-center text-white shadow-xl sm:px-12">
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          🍔 Bem-vindo ao {store.name}!
        </h1>
        <p className="text-base opacity-90 sm:text-lg">
          Os melhores hambúrgueres da cidade com entrega rápida
        </p>
      </section>

      {bestSeller ? (
        <section className="mb-10 overflow-hidden rounded-2xl border-2 border-orange-500 bg-slate-950 text-white shadow-[8px_8px_0_#ea580c]">
          <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex h-64 items-center justify-center overflow-hidden bg-orange-50 text-7xl md:h-auto">
              {bestSeller.imageUrl ? (
                <img
                  src={bestSeller.imageUrl}
                  alt={bestSeller.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span>{bestSeller.image}</span>
              )}
            </div>
            <div className="flex flex-col justify-center p-6">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-orange-600 px-3 py-1 text-xs font-black uppercase tracking-wide">
                <Flame size={16} />
                Mais vendido da semana
              </div>
              <h2 className="text-3xl font-black uppercase leading-tight">
                {bestSeller.name}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-orange-100">
                O pedido que mais sai na semana, pronto para entrar no carrinho sem bagunca visual.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-2xl font-black text-orange-300">
                  {formatCurrency(bestSeller.price)}
                </span>
                <button
                  type="button"
                  onClick={() => onAddToCart?.(bestSeller)}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-black text-white shadow-[4px_4px_0_#7c2d12] transition hover:bg-red-600"
                >
                  <ShoppingCart size={20} />
                  Pedir agora
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Cardápio</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#/${category.slug}`}
              className="group block overflow-hidden rounded-xl border-2 border-orange-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
            >
              <div className="flex h-56 items-center justify-center overflow-hidden border-b-2 border-orange-100 bg-gradient-to-b from-orange-50 to-orange-100 text-6xl">
                {getCategoryImage(category.id, products) ? (
                  <img
                    src={getCategoryImage(category.id, products)}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <span className="transition duration-300 group-hover:-translate-y-3 group-hover:scale-110">
                    {category.image}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
                  <ArrowRight size={18} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
