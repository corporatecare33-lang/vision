import { Link } from "react-router-dom";
import { Award, CheckCircle, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Hero from "../components/Hero";
import ManufacturingShowcase from "../components/ManufacturingShowcase";
import ProductCard from "../components/ProductCard";
import { useCategories } from "../hooks/useCategories";
import { useCatalogProducts } from "../hooks/useCatalogProducts";

const Home = () => {
  const { categories } = useCategories();
  const { products } = useCatalogProducts();

  const uploadedProducts = products.filter((product) => product.image);
  const featuredProducts = uploadedProducts.filter((product, index, list) => (
    list.findIndex((item) => item.image === product.image) === index
  )).slice(0, 8);
  const latestAddedProducts = uploadedProducts.filter((product, index, list) => (
    list.findIndex((item) => item.image === product.image) === index
  )).slice(0, 12);
  const allUniqueProducts = products.filter((product, index, list) => (
    list.findIndex((item) => (item.image || item.visual) === (product.image || product.visual)) === index
  )).slice(0, 8);
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : allUniqueProducts;
  const getCategoryImages = (categoryId) =>
    products.filter((product) => product.category === categoryId && product.image).slice(0, 3);
  const getProductImageForSubcategory = (subcategoryId) =>
    products.find((product) => product.subcategory === subcategoryId)?.image;

  const refrigerators = categories.find((c) => c.id === "refrigerators");
  const refrigeratorSubcategories = refrigerators?.subcategories?.filter(s =>
    ["side-by-side", "no-frost", "commercial-freezer", "four-door", "single-door", "direct-cool"].includes(s.id)
  ) || [];

  return (
    <div>
      <Hero />

      <section className="container-custom py-16">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Product Range</p>
            <h2 className="section-title">Explore Categories</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 font-bold text-vision-blue">All Products <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category) => {
            const categoryImages = getCategoryImages(category.id);
            return (
              <Link key={category.id} to={category.path || `/category/${category.id}`} className={`group overflow-hidden rounded-lg border border-cyan-100 bg-gradient-to-br ${category.tone || "from-cyan-50 via-white to-blue-100"} p-6 transition hover:-translate-y-1 hover:shadow-xl`}>
                <div className="mb-8 grid h-44 grid-cols-3 items-center gap-2">
                  {category.image ? (
                    <div className="col-span-3 flex h-full items-center justify-center overflow-hidden rounded-md bg-white/80 p-2 shadow-sm">
                      <img src={category.image.startsWith("http") ? category.image : category.image} alt={category.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
                    </div>
                  ) : categoryImages.length > 0 ? (
                    <div className="col-span-3 flex h-full items-center justify-center overflow-hidden rounded-md bg-white/80 p-2 shadow-sm">
                      <img src={categoryImages[0].image} alt={category.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="col-span-3 flex h-full items-center justify-center rounded-md bg-white/70 text-sm font-black uppercase text-vision-blue">
                      Vision {category.shortName || category.name}
                    </div>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className="mb-2 min-h-7 text-xl font-black text-slate-950">{category.name}</h3>
                  <p className="mb-4 text-sm leading-6 text-slate-600">{category.description}</p>
                  <span className="text-sm font-bold text-vision-blue">See More</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cooling Solutions Section */}
      {refrigeratorSubcategories.length > 0 && (
        <section className="border-y border-slate-100 bg-white py-16">
          <div className="container-custom">
            <div className="mb-12 text-center">
              <p className="section-kicker">Vision Cooling</p>
              <h2 className="section-title">Premium Refrigeration</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {refrigeratorSubcategories.map((sub) => (
                <Link key={sub.id} to={sub.path || `/category/refrigerators/${sub.id}`} className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-blue-50 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl">
                  <img src={getProductImageForSubcategory(sub.id) || ""} alt={sub.name} className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-vision-dark/85 via-vision-dark/10 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{sub.name}</h3>
                    <p className="text-xs text-cyan-100 uppercase tracking-widest mt-1 opacity-0 transition-opacity group-hover:opacity-100">Explore Collection</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ManufacturingShowcase />

      {uploadedProducts.length > 0 && (
        <section className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-16">
          <div className="container-custom">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-kicker">Real Product Photos</p>
                <h2 className="section-title">Latest Added Products</h2>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 font-bold text-vision-blue">View Catalog <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestAddedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      <section className="bg-slate-50 py-16">
        <div className="container-custom">
          <div className="mb-10">
            <p className="section-kicker">Popular Models</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayFeatured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="container-custom py-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[
            [ShieldCheck, "ISO Quality", "Manufacturing discipline with tested quality controls."],
            [Award, "Awarded Design", "Clean, practical appliances made for repeated use."],
            [CheckCircle, "Certified Safety", "Reliable components and safety-minded engineering."],
            [Truck, "Service Network", "Support, parts, and guidance for customers."],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm md:p-6">
              <Icon className="mb-4 h-8 w-8 text-vision-blue md:mb-5 md:h-10 md:w-10" />
              <h3 className="mb-2 text-sm font-black text-slate-950 md:text-base">{title}</h3>
              <p className="text-xs leading-5 text-slate-600 md:text-sm md:leading-6">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;