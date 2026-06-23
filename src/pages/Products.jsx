import { useMemo, useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useCategories } from "../hooks/useCategories";
import { useCatalogProducts } from "../hooks/useCatalogProducts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DEFAULT_PRICE_RANGES = [
  { id: "all", label: "All Prices" },
  { id: "under-20000", label: "Under $20,000", max: 20000 },
  { id: "20000-40000", label: "$20,000 - $40,000", min: 20000, max: 40000 },
  { id: "40000-70000", label: "$40,000 - $70,000", min: 40000, max: 70000 },
  { id: "70000-plus", label: "$70,000+", min: 70000 },
];

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [priceRanges, setPriceRanges] = useState(DEFAULT_PRICE_RANGES);
  const { categories } = useCategories();
  const { products, isLoading, error, isUsingFallback } = useCatalogProducts();

  useEffect(() => {
    fetch(`${API_URL}/settings/filter-ranges`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (Array.isArray(d?.value) && d.value.length > 0) {
          setPriceRanges([{ id: "all", label: "All Prices" }, ...d.value]);
        }
      })
      .catch(() => {});
  }, []);

  const uniqueProducts = useMemo(
    () =>
      products.filter((product, index, list) => {
        const key = `${product.category}-${product.subcategory}-${product.image || product.visual}`;
        return list.findIndex((item) => {
          const itemKey = `${item.category}-${item.subcategory}-${item.image || item.visual}`;
          return itemKey === key;
        }) === index;
      }),
    [products]
  );

  const displayProducts = useMemo(() => {
    const selectedRange = priceRanges.find((range) => range.id === activePriceRange);

    return uniqueProducts.filter((product) => {
      const productPrice = Number(product.price);
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const matchesPrice =
        !selectedRange ||
        selectedRange.id === "all" ||
        ((selectedRange.min === undefined || productPrice >= selectedRange.min) &&
          (selectedRange.max === undefined || productPrice <= selectedRange.max));

      return matchesCategory && matchesPrice;
    });
  }, [activeCategory, activePriceRange, uniqueProducts, priceRanges]);

  const activeCategoryName = activeCategory === "all"
    ? "All Products"
    : categories.find((category) => category.id === activeCategory)?.name;
  const activePriceLabel = priceRanges.find((range) => range.id === activePriceRange)?.label || "All Prices";

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-16">
        <div className="container-custom">
          <p className="section-kicker">Vision Catalog</p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-normal text-slate-950">All Products</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">Browse every frontend product page, category, and subcategory in the Vision appliance range.</p>
        </div>
      </section>

      <section className="container-custom py-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
          <aside className="rounded-lg border border-cyan-100 bg-white p-4 shadow-sm">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-vision-blue">Filter</p>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-500">Category</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`rounded-md border px-4 py-3 text-left text-sm font-black transition ${
                      activeCategory === "all"
                        ? "border-vision-blue bg-vision-blue text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-vision-blue hover:text-vision-blue"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.id)}
                      className={`rounded-md border px-4 py-3 text-left text-sm font-black transition ${
                        activeCategory === category.id
                          ? "border-vision-blue bg-vision-blue text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-vision-blue hover:text-vision-blue"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-500">Price</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setActivePriceRange(range.id)}
                      className={`rounded-md border px-4 py-3 text-left text-sm font-black transition ${
                        activePriceRange === range.id
                          ? "border-vision-blue bg-vision-blue text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-vision-blue hover:text-vision-blue"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {(activeCategory !== "all" || activePriceRange !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setActivePriceRange("all");
                  }}
                  className="w-full rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-black text-vision-blue transition hover:border-vision-blue hover:bg-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">{activeCategoryName}</p>
                <h2 className="section-title">Products</h2>
                <p className="mt-2 text-sm font-bold text-slate-500">{activePriceLabel}</p>
                {error && isUsingFallback && (
                  <p className="mt-2 text-xs font-bold text-amber-600">Using local products until the dashboard API is running.</p>
                )}
              </div>
              <p className="text-sm font-bold text-slate-500">{isLoading ? "Loading..." : `${displayProducts.length} items`}</p>
            </div>
            {displayProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-6 py-10 text-center">
                <h3 className="text-xl font-black text-vision-dark">No products found</h3>
                <p className="mt-2 text-sm font-bold text-slate-600">Try a different category or price filter.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;