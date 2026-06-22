import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductVisual from "../components/ProductVisual";
import { useCategory } from "../hooks/useCategories";
import { useCatalogProducts } from "../hooks/useCatalogProducts";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const category = useCategory(categoryId);
  const { products } = useCatalogProducts();

  if (!category) {
    return <div className="container-custom py-24 text-center text-2xl font-black">Category not found</div>;
  }

  const getProductsForSubcategory = (activeCategoryId, activeSubcategoryId) =>
    products.filter((product) => product.category === activeCategoryId && product.subcategory === activeSubcategoryId);
  const categoryProducts = (category.subcategories || []).flatMap((subcategory) => getProductsForSubcategory(category.id, subcategory.id));
  const categoryProductImage = categoryProducts.find((product) => product.image);
  const fallbackVisual = categoryProducts[0]?.visual;
  const heroImage = category.image || categoryProductImage?.image;

  return (
    <div>
      <div className="border-b border-slate-100 bg-white">
        <div className="container-custom flex items-center py-3 text-xs uppercase tracking-wider text-slate-500">
          <Link to="/" className="hover:text-vision-blue">Home</Link>
          <ChevronRight className="mx-2 h-3 w-3" />
          <span className="font-bold text-slate-900">{category.name}</span>
        </div>
      </div>

      <section className={`bg-gradient-to-br ${category.tone || "from-cyan-50 via-white to-blue-100"}`}>
        <div className="container-custom grid min-h-[360px] items-center gap-8 py-12 lg:grid-cols-2">
          <div>
            <p className="section-kicker">{category.shortName || category.name}</p>
            <h1 className="mb-5 text-4xl font-black uppercase tracking-normal text-slate-950 md:text-6xl">{category.name}</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">{category.description}</p>
          </div>
          <div className="flex justify-center">
            {heroImage ? (
              <div className="flex h-64 w-full max-w-lg items-center justify-center rounded-lg border border-cyan-100 bg-white/80 p-4 shadow-sm">
                <img src={heroImage.startsWith("http") ? heroImage : heroImage} alt={category.name} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-64 w-full max-w-md items-center justify-center rounded-lg border border-cyan-100 bg-white/80 p-6 shadow-sm">
                <ProductVisual type={fallbackVisual} color={category.accent} />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-custom py-14">
        {(category.subcategories || []).map((subcategory) => {
          const subProducts = getProductsForSubcategory(category.id, subcategory.id);
          const subcategoryImage = subProducts.find((product) => product.image)?.image;
          return (
            <section key={subcategory.id} className="mb-20">
              <div className="relative mb-12 aspect-[21/9] w-full overflow-hidden rounded-lg border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-blue-50 shadow-lg md:aspect-[3/1]">
                {subcategoryImage && (
                  <img src={subcategoryImage.startsWith("http") ? subcategoryImage : subcategoryImage} alt={subcategory.name} className="absolute right-0 top-0 h-full w-1/2 object-contain p-6" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-vision-dark/85 via-vision-dark/55 to-transparent">
                  <div className="flex h-full flex-col justify-center p-8 text-white md:p-14">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-white/80">Vision {category.shortName || category.name}</p>
                    <h2 className="mb-4 text-3xl font-black uppercase tracking-tight md:text-5xl">{subcategory.name}</h2>
                    <p className="max-w-md text-sm font-medium leading-relaxed opacity-90 md:text-base">{subcategory.tagline}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {subProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} variant="minimal" />)}
              </div>
              <Link to={subcategory.path || `/category/${category.id}/${subcategory.id}`} className="block w-full border border-slate-200 bg-slate-50 py-3 text-center text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-vision-blue hover:bg-vision-blue hover:text-white">
                See More
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPage;