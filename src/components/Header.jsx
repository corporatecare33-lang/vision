import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingCart, X } from "lucide-react";
import { assetPath } from "../data/data";
import { useCategories } from "../hooks/useCategories";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { getCartCount } from "../utils/cart";

const navLinkClass = ({ isActive }) =>
  `text-[13px] font-bold uppercase tracking-wider transition-colors ${isActive ? "text-vision-blue" : "text-slate-800 hover:text-vision-blue"}`;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMobileCategories, setOpenMobileCategories] = useState(() => new Set());
  const [logoUrl, setLogoUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { products } = useCatalogProducts();

  const close = useCallback(() => {
    setIsOpen((value) => (value ? false : value));
    setIsSearchOpen((value) => (value ? false : value));
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    return products
      .filter((product) =>
        [product.name, product.model, product.description, product.category, product.subcategory]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [searchQuery, products]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const firstResult = searchResults[0];

    if (firstResult) {
      navigate(`/products/${firstResult.id}`);
    } else if (searchQuery.trim()) {
      navigate("/products");
    }

    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const openProduct = (productId) => {
    navigate(`/products/${productId}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsOpen(false);
  };

  const toggleMobileCategory = (categoryId) => {
    setOpenMobileCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());

    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/settings/general`)
      .then(r => r.json())
      .then(d => {
        if (d?.value) {
          if (d.value.logoUrl) setLogoUrl(d.value.logoUrl);
          if (d.value.siteName) setSiteName(d.value.siteName);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container-custom flex h-16 items-center justify-between lg:h-20">
        <Link to="/" className="flex items-center gap-3" onClick={close}>
          <img src={logoUrl || assetPath("/vision-logo.jpeg")} alt={siteName || "Vision Smart"} width="130" height="44" decoding="async" className="h-10 w-auto object-contain lg:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>

          <div className="group relative">
            <button className="flex items-center gap-1 text-[13px] font-bold uppercase tracking-wider text-slate-800 transition-colors group-hover:text-vision-blue">
              Categories <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-[900px] -translate-x-1/2 translate-y-3 border-t-2 border-vision-blue bg-white p-8 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid grid-cols-4 gap-8">
                {categories.map((category) => (
                  <div key={category.id}>
                    <Link to={category.path || `/category/${category.id}`} className="mb-3 block text-sm font-black uppercase text-vision-blue hover:underline">
                      {category.shortName || category.name}
                    </Link>
                    <div className="space-y-2">
                      {(category.subcategories || []).map((subcategory) => (
                        <Link key={subcategory.id} to={subcategory.path || `/category/${category.id}/${subcategory.id}`} className="block text-xs text-slate-600 transition hover:translate-x-1 hover:text-vision-blue">
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/support" className={navLinkClass}>Support</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 text-[13px] font-bold uppercase tracking-wider transition ${
                isActive
                  ? "border-vision-blue bg-cyan-50 text-vision-blue"
                  : "border-slate-200 text-slate-800 hover:border-vision-blue hover:bg-cyan-50 hover:text-vision-blue"
              }`
            }
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingCart className="h-4 w-4 stroke-[2.8]" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-0.5 rounded-full bg-vision-cyan px-1.5 py-0.5 text-[10px] font-black leading-none text-vision-dark">
                {cartCount}
              </span>
            )}
          </NavLink>
          <button type="button" onClick={() => setIsSearchOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-700 transition hover:border-vision-blue hover:bg-cyan-50 hover:text-vision-blue" aria-label="Search products">
            <Search className="h-4 w-4" />
          </button>
        </nav>

        <button className="rounded-md p-2 text-slate-700 lg:hidden" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu className="h-7 w-7" />
        </button>
      </div>

      {isSearchOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-t border-slate-100 bg-white shadow-xl">
          <div className="container-custom py-5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoFocus
                className="w-full rounded-md border border-cyan-100 bg-cyan-50/60 py-4 pl-12 pr-12 text-base font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-vision-blue focus:ring-4 focus:ring-cyan-100"
                placeholder="Search TV, refrigerator, kettle..."
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-white hover:text-vision-blue" aria-label="Close search">
                <X className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-4 overflow-hidden rounded-lg border border-slate-100 bg-white">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => openProduct(product.id)}
                      className="grid w-full grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-cyan-50"
                    >
                      <div className="grid h-14 w-14 place-items-center rounded-md bg-cyan-50">
                        {product.image ? (
                          <img src={product.image.startsWith("http") ? product.image : assetPath(product.image)} alt={product.name} className="h-full w-full object-contain p-1.5" />
                        ) : (
                          <span className="text-xs font-black text-vision-blue">VISION</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-black text-slate-950">{product.name}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-vision-blue">{product.model}</div>
                      </div>
                      <div className="font-black text-vision-blue">${product.price}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-5 text-sm font-bold text-slate-500">No products found.</div>
                )
              ) : (
                <div className="px-4 py-5 text-sm font-bold text-slate-500">Type a product name, model, or category.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-0 z-50 bg-white transition-transform duration-300 lg:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <img src={logoUrl || assetPath("/vision-logo.jpeg")} alt={siteName || "Vision Smart"} width="140" height="44" decoding="async" className="h-11 w-auto object-contain" />
          <button className="rounded-md p-2" onClick={close} aria-label="Close menu">
            <X className="h-7 w-7" />
          </button>
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto px-5 py-6">
          <div className="mb-7 grid gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-md border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 font-bold outline-none focus:border-vision-blue"
                placeholder="Search products"
              />
            </form>
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="overflow-hidden rounded-md border border-slate-100">
                {searchResults.slice(0, 4).map((product) => (
                  <button key={product.id} type="button" onClick={() => openProduct(product.id)} className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm font-bold last:border-b-0">
                    {product.name}
                  </button>
                ))}
              </div>
            )}
            {["Home", "Products", "About", "Support", "Contact", "Admin", "Cart"].map((label) => (
              <Link key={label} to={label === "Home" ? "/" : label === "Admin" ? "/admin" : `/${label.toLowerCase()}`} onClick={close} className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3 font-bold uppercase tracking-wider text-slate-800">
                <span>{label}</span>
                {label === "Cart" && (
                  <span className="inline-flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 stroke-[2.8]" />
                    {cartCount > 0 && <span className="rounded-full bg-vision-cyan px-2 py-0.5 text-[10px] text-vision-dark">{cartCount}</span>}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="space-y-0">
            {categories.map((category) => (
              <section key={category.id} className="border-b border-slate-100 py-3 last:border-b-0">
                <button type="button" onClick={() => toggleMobileCategory(category.id)} className="flex w-full items-center justify-between text-left text-sm font-black uppercase text-vision-blue">
                  <span>{category.name}</span>
                  {openMobileCategories.has(category.id) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                {openMobileCategories.has(category.id) && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(category.subcategories || []).map((subcategory) => (
                      <Link key={subcategory.id} to={subcategory.path || `/category/${category.id}/${subcategory.id}`} onClick={close} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;