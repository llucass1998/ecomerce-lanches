import { ArrowLeft, ShoppingCart } from 'lucide-react';
import {
  formatCurrency,
  getCategory,
  getProductsByCategory
} from '../data/menuData.js';

export default function CategoryPage({ categoryId, onAddToCart, products: catalogProducts }) {
  const category = getCategory(categoryId);
  const products =
    catalogProducts?.filter((product) => product.category === categoryId) ??
    getProductsByCategory(categoryId);
  const categoryImageUrl = products[0]?.imageUrl;

  if (!category) {
    window.location.hash = '/';
    return null;
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

      <section className="mb-8 overflow-hidden rounded-2xl border-2 border-orange-200 bg-white shadow-xl">
        <div className="grid items-center gap-6 p-6 md:grid-cols-[220px_1fr]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-orange-50 to-orange-100 text-8xl shadow-inner">
            {categoryImageUrl ? (
              <img
                src={categoryImageUrl}
                alt={category.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              category.image
            )}
          </div>
          <div>
            <h1 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              {category.name}
            </h1>
            <p className="max-w-2xl text-slate-600">{category.description}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-orange-200 bg-white p-8 text-center text-slate-600 md:col-span-2 lg:col-span-3">
            Nenhum produto disponivel nesta categoria.
          </div>
        ) : products.map((product) => (
          <article
            key={product.id}
            className="group block overflow-hidden rounded-xl border-2 border-orange-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
          >
            <div className="flex h-56 items-center justify-center overflow-hidden border-b-2 border-orange-100 bg-gradient-to-b from-orange-50 to-orange-100 text-6xl">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <span className="transition duration-300 group-hover:-translate-y-3 group-hover:scale-110">
                  {product.image}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-1 text-xl font-bold text-orange-600">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <button
                onClick={() => onAddToCart?.(product)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition hover:bg-orange-600 hover:text-white"
                type="button"
                aria-label={`Adicionar ${product.name} ao carrinho`}
                title="Adicionar ao carrinho"
              >
                <ShoppingCart size={20} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
