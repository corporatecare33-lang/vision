import { Link, useParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useCategory, useSubcategory } from "../hooks/useCategories";
import { useCatalogProducts } from "../hooks/useCatalogProducts";

const SubcategoryPage = () => {
  const { categoryId, subcategoryId } = useParams();
  const category = useCategory(categoryId);
  const subcategory = useSubcategory(categoryId, subcategoryId);
  const { products } = useCatalogProducts();
  const subcategoryProducts = products.filter((product) => product.category === categoryId && product.subcategory === subcategoryId);

  if (!category || !subcategory) {
    return <div className="container-custom py-24 text-center text-2xl font-black">Subcategory not found</div>;
  }

  return (
    <div>
      <div className="border-b border-slate-100 bg-white">
        <div className="container-custom flex flex-wrap items-center py-3 text-xs uppercase tracking-wider text-slate-500">
          <Link to="/" className="hover:text-vision-blue">Home</Link>
          <ChevronRight className="mx-2 h-3 w-3" />
          <Link to={category.path || `/category/${category.id}`} className="hover:text-vision-blue">{category.name}</Link>
          <ChevronRight className="mx-2 h-3 w-3" />
          <span className="font-bold text-slate-900">{subcategory.name}</span>
        </div>
      </div>

      <section className={`bg-gradient-to-br ${category.tone || "from-cyan-50 via-white to-blue-100"}`}>
        <div className="container-custom grid items-center gap-8 py-12 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="section-kicker">Vision {category.shortName || category.name}</p>
            <h1 className="mb-4 text-4xl font-black uppercase tracking-normal text-slate-950 md:text-6xl">{subcategory.name}</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">{subcategory.tagline}</p>
          </div>
          {subcategoryProducts[0]?.image && (
            <div className="flex h-64 items-center justify-center rounded-lg border border-cyan-100 bg-white/80 p-5 shadow-sm">
              <img src={subcategoryProducts[0].image.startsWith("http") ? subcategoryProducts[0].image : subcategoryProducts[0].image} alt={subcategoryProducts[0].name} className="h-full w-full object-contain" />
            </div>
          )}
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-600">
            Showing <span className="font-black text-vision-blue">{subcategoryProducts.length}</span> products
          </div>
          <button className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {subcategoryProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryPage;