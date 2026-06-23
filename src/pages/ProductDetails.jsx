import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductVisual from "../components/ProductVisual";
import { useCategory, useSubcategory } from "../hooks/useCategories";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { addCartItem } from "../utils/cart";

const tabs = ["Description", "Delivery Info", "Reviews"];

const ProductDetails = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(0);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const navigate = useNavigate();
  const { products } = useCatalogProducts();
  const product = products.find((item) => item.id === productId);
  const category = useCategory(product?.category);
  const subcategory = useSubcategory(product?.category, product?.subcategory);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setQuantity(1);
    setSelectedOption(0);
    setActiveTab(tabs[0]);
  }, [productId]);

  if (!product) {
    return (
      <div className="container-custom py-24 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase text-slate-950">Product not found</h1>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  const basePrice = Number(product.price);
  const productSpecs = product.specs || [];
  const hasPriceOptions = product.priceOptions && product.priceOptions.length > 0;
  const optionPrices = hasPriceOptions
    ? product.priceOptions
    : productSpecs.slice(0, 3).filter(Boolean).map((label, index) => ({ label, price: basePrice + index * 2500 }));
  const selectedPrice = optionPrices[selectedOption]?.price ?? basePrice;
  const selectedOptionLabel = optionPrices[selectedOption]?.label || "";
  const originalPrice = Number(product.originalPrice) || 0;
  const showDiscount = originalPrice > selectedPrice;
  const savedAmount = showDiscount ? originalPrice - selectedPrice : 0;
  const relatedProducts = products
    .filter((item) => item.subcategory === product.subcategory && item.id !== product.id)
    .slice(0, 4);

  const highlights = [
    ["100% genuine Vision product", "Official brand quality and verified model."],
    [`${productSpecs[1] || product.model} ready`, product.description],
    ["Service support available", "Contact support for product guidance."],
  ];

  const serviceItems = [
    { icon: Truck, title: "Fast Delivery", text: "Nationwide delivery" },
    { icon: ShieldCheck, title: "Official Warranty", text: "Vision support" },
    { icon: Zap, title: "Ready Stock", text: "Order assistance" },
  ];

  const tabContent = {
    Description: (
      <div className="space-y-3 text-sm leading-7 text-slate-700">
        <p>{product.description}</p>
        <ul className="space-y-2">
          {productSpecs.map((spec) => (
            <li key={spec} className="flex gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-vision-cyan" />
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
    "Delivery Info": (
      <p className="text-sm leading-7 text-slate-700">
        Delivery and pickup support are available through Vision sales and service channels. Contact the sales team to confirm stock, delivery time, and installation details.
      </p>
    ),
    Reviews: (
      <p className="text-sm leading-7 text-slate-700">
        Customer reviews for this model will appear here after launch.
      </p>
    ),
  };

  const addSelectedProductToCart = () => {
    addCartItem({
      id: product.id,
      name: product.name,
      model: product.model,
      image: product.image,
      visual: product.visual,
      color: product.color,
      option: selectedOptionLabel,
      price: selectedPrice,
      quantity,
    });
  };

  const handleAddToCart = () => {
    addSelectedProductToCart();
    navigate("/cart");
  };

  const handleOrderNow = () => {
    addSelectedProductToCart();
    navigate("/order");
  };

  return (
    <div className="bg-[#f6f8f3]">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-custom flex flex-wrap items-center py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Link to="/" className="hover:text-vision-blue">Home</Link>
          <ChevronRight className="mx-2 h-3 w-3" />
          <Link to="/products" className="hover:text-vision-blue">Products</Link>
          <ChevronRight className="mx-2 h-3 w-3" />
          {category && (
            <>
              <Link to={category.path || `/category/${category.id}`} className="hover:text-vision-blue">{category.name}</Link>
              <ChevronRight className="mx-2 h-3 w-3" />
            </>
          )}
          <span className="text-vision-dark">{product.name}</span>
        </div>
      </div>

      <section className="container-custom py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="relative flex min-h-[430px] items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
              <span className="absolute left-4 top-4 rounded-full bg-vision-blue px-3 py-1 text-xs font-black text-white">Vision</span>
              {product.image ? (
                <img src={product.image.startsWith("http") ? product.image : product.image} alt={product.name} className="h-full max-h-[390px] w-full object-contain p-8" />
              ) : (
                <div className="scale-125 md:scale-150">
                  <ProductVisual type={product.visual} color={product.color} />
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {(product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean).map((img, index) => (
                <button
                  key={index}
                  type="button"
                  className={`flex aspect-square items-center justify-center rounded-md border bg-white transition ${index === 0 ? "border-vision-cyan ring-2 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"}`}
                  aria-label={`${product.name} preview ${index + 1}`}
                >
                  <img src={img.startsWith("http") ? img : img} alt={`${product.name} preview ${index + 1}`} className="h-full w-full object-contain p-3" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Link to={subcategory?.path || `/category/${product.category}/${product.subcategory}` || "/products"} className="mb-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-vision-blue hover:underline">
              <ArrowLeft className="h-4 w-4" />
              {subcategory?.name || "All Products"}
            </Link>

            <h1 className="text-4xl font-black uppercase leading-tight text-vision-dark md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{product.description}</p>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end gap-4">
                <div className="text-4xl font-black text-vision-blue">${selectedPrice.toLocaleString()}</div>
                {showDiscount && (
                  <>
                    <div className="pb-1 text-lg font-bold text-slate-400 line-through">${originalPrice.toLocaleString()}</div>
                    <span className="mb-1 rounded bg-cyan-50 px-3 py-1 text-xs font-black text-vision-blue">Save ${savedAmount.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-dashed border-cyan-300 bg-white p-5">
              <h2 className="mb-3 text-sm font-black uppercase text-vision-dark">Special Features</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                {highlights.map(([title, text]) => (
                  <li key={title} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-vision-cyan" />
                    <span><strong>{title}</strong> - {text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {optionPrices.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-3 text-sm font-black uppercase text-vision-dark">Choose Option</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {optionPrices.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedOption(index)}
                      className={`rounded-lg border bg-white p-4 text-left transition ${selectedOption === index ? "border-vision-cyan bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"}`}
                    >
                      <div className="text-sm font-black text-slate-900">{option.label}</div>
                      <div className="mt-1 text-xs font-bold text-vision-blue">${option.price.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <h2 className="mb-3 text-sm font-black uppercase text-vision-dark">Quantity</h2>
              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-white">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid place-items-center text-slate-600 hover:bg-cyan-50" aria-label="Decrease quantity">
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="grid place-items-center border-x border-slate-200 font-black text-vision-dark">{quantity}</div>
                  <button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid place-items-center text-slate-600 hover:bg-cyan-50" aria-label="Increase quantity">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" onClick={handleAddToCart} className="inline-flex items-center justify-center gap-2 rounded-md bg-vision-blue px-6 py-3 font-black text-white transition hover:bg-vision-dark">
                  <ShoppingCart className="h-5 w-5" />
                  Add To Cart
                </button>
              </div>
              <button type="button" onClick={handleOrderNow} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-vision-cyan px-6 py-3 font-black text-vision-dark transition hover:bg-cyan-300">
                <Zap className="h-5 w-5" />
                Order Now
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-vision-cyan text-vision-dark">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-slate-500">Call for order</div>
                <div className="text-lg font-black text-vision-dark">+670 7551 3983</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {serviceItems.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                  <Icon className="mx-auto mb-2 h-6 w-6 text-vision-cyan" />
                  <div className="text-sm font-black text-vision-dark">{title}</div>
                  <div className="text-xs text-slate-500">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200 bg-slate-50">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-black transition ${activeTab === tab ? "bg-white text-vision-blue shadow-[inset_0_-3px_0_#28c7cf]" : "text-slate-500 hover:text-vision-blue"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="min-h-44 p-6">{tabContent[activeTab]}</div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="container-custom pb-16">
          <div className="mb-8">
            <p className="section-kicker">More in {subcategory?.name}</p>
            <h2 className="section-title">Related Products</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;