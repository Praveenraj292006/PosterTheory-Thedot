import React, { useEffect, useMemo, useState } from 'react';
// Adjust this import to match your project's api client path
// (e.g. '../services/api' or '../utils/api') — same client used on the homepage.
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import MetallicPostersHero from '../components/Metallicpostershero ';
import mockUp from '../assets/Mocup-A4.png';

interface Product {
  id: number;
  title: string;
  price?: number;
  image: string;
  collection_name?: string;
  layout?: string;
  available_sizes?: number[];
  [key: string]: any;
}

const PAGE_SIZE = 12;

export default function MetallicPosters() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pageReady, setPageReady] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    const isLoadMore = limit > PAGE_SIZE;
    if (isLoadMore) setLoadingMore(true);

    api
      .get(`/api/products?layout=Metallic&limit=${limit}`)
      .then((res) => {
        const list: Product[] = Array.isArray(res.data) ? res.data : [];
        setProducts(list);
        setExhausted(list.length < limit);
      })
      .catch(() => {
        setProducts((prev) => (isLoadMore ? prev : []));
      })
      .finally(() => {
        setPageReady(true);
        setLoadingMore(false);
      });
  }, [limit]);

  const heroImage: string | null = useMemo(() => {
    const withImage = products.find((p) => Boolean(p.image));
    return withImage?.image ?? null;
  }, [products]);

  const gridProducts = useMemo(() => {
    // Reserve the hero image so it isn't immediately repeated below the fold.
    if (!heroImage) return products;
    const heroId = products.find((p) => p.image === heroImage)?.id;
    return products.filter((p) => p.id !== heroId);
  }, [products, heroImage]);

  return (
    <div className="min-h-screen pb-32">
      <MetallicPostersHero loading={!pageReady} image={heroImage} fallbackImage={mockUp} />

      <div className="max-w-[1440px] mx-auto px-6 pt-20">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-10 border-b-2 border-z-border pb-20">
          <div>
            <h2 className="font-display font-black uppercase italic text-3xl md:text-4xl tracking-tight mb-10">
              Shop metallic posters
            </h2>
            <p className="font-mono text-xs text-z-muted uppercase tracking-widest mt-3">
              {pageReady ? `${products.length} design${products.length === 1 ? '' : 's'}` : 'Loading'}
            </p>
          </div>
        </div>

        {!pageReady ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-2 border-z-border p-3 sm:p-4 animate-pulse" aria-hidden="true">
                <div className="aspect-[4/5] bg-z-border/20" />
                <div className="h-3 w-2/3 bg-z-border/20 mt-4" />
                <div className="h-4 w-1/3 bg-z-border/20 mt-3" />
              </div>
            ))}
          </div>
        ) : gridProducts.length === 0 && products.length === 0 ? (
          <div className="border-2 border-z-border py-24 text-center">
            <p className="font-mono uppercase tracking-widest text-sm text-z-muted">
              No metallic posters available yet — check back soon.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {gridProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {!exhausted && (
              <div className="flex justify-center mt-14">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => setLimit((l) => l + PAGE_SIZE)}
                  className="inline-flex items-center gap-3 border-2 border-z-border bg-z-ink text-z-paper font-mono font-bold uppercase tracking-widest text-sm px-8 py-4 shadow-[6px_6px_0px_0px_var(--color-z-shadow)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_var(--color-z-shadow)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}