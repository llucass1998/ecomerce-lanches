import { ArrowRight, MapPin, Phone, Timer } from 'lucide-react';
import { categories, getMapsLink, getWhatsappLink, products, store as defaultStore } from '../data/menuData.js';

function getCategoryImage(categoryId) {
  return products.find((product) => product.category === categoryId)?.imageUrl;
}

const featuredImage = getCategoryImage('artesanal') ?? getCategoryImage('tradicionais');

export default function HomePage({ store = defaultStore }) {
  const mapsLink = getMapsLink(store);
  const whatsappLink = getWhatsappLink(store);

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

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Cardápio</h2>

        <div className="mb-8 h-72 overflow-hidden rounded-xl border-4 border-orange-300 bg-orange-100 shadow-xl">
          <img
            src={featuredImage}
            alt="Lanche em destaque"
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#/${category.slug}`}
              className="group block overflow-hidden rounded-xl border-2 border-orange-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
            >
              <div className="flex h-56 items-center justify-center overflow-hidden border-b-2 border-orange-100 bg-gradient-to-b from-orange-50 to-orange-100 text-6xl">
                {getCategoryImage(category.id) ? (
                  <img
                    src={getCategoryImage(category.id)}
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
