import { Link, useNavigate } from "react-router-dom";
import { ClipboardCheck, ShoppingCart } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import ProductVisual from "./ProductVisual";
import { addCartItem } from "../utils/cart";

const ProductCard = ({ product, variant = "default" }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(0);
  const href = `/products/${product.id}`;
  const basePrice = Number(product.price);
  const productSpecs = product.specs || [];
  const optionPrices = useMemo(
    () =>
      productSpecs.slice(0, 3).filter(Boolean).map((label, index) => ({
        label,
        price: basePrice + index * 2500,
      })),
    [basePrice, productSpecs]
  );
  const selectedPrice = optionPrices[selectedOption]?.price || basePrice;
  const selectedOptionLabel = optionPrices[selectedOption]?.label || productSpecs[0];
  const cartItem = useMemo(
    () => ({
      id: product.id,
      name: product.name,
      model: product.model,
      image: product.image,
      visual: product.visual,
      color: product.color,
      option: selectedOptionLabel,
      price: selectedPrice,
      quantity: 1,
    }),
    [product, selectedOptionLabel, selectedPrice]
  );

  const handleAddToCart = useCallback(() => {
    addCartItem(cartItem);
    navigate("/cart");
  }, [cartItem, navigate]);

  const handleOrder = useCallback(() => {
    addCartItem(cartItem);
    navigate("/order");
  }, [cartItem, navigate]);

  if (variant === "minimal") {
    return (
      <div className="transition-transform duration-300 hover:-translate-y-1">
        <Link to={href} className="group flex min-h-[250px] cursor-pointer flex-col items-center bg-white">
          <div className="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-cyan-50 transition-all group-hover:border-cyan-200">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105" />
            ) : (
              <ProductVisual type={product.visual} color={product.color} compact />
            )}
          </div>
          <div className="w-full px-2 text-center">
            <h4 className="mb-1 truncate text-[12px] font-bold uppercase tracking-tight text-vision-blue group-hover:underline">
              {product.name}
            </h4>
            <div className="text-[13px] font-black text-slate-950">Tk {product.price}</div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-cyan-200 hover:shadow-xl">
      <Link to={href} className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-white via-cyan-50 to-blue-50" aria-label={`Open ${product.name}`}>
        <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-vision-blue shadow-sm">
          Vision
        </div>
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-contain p-8 transition duration-500 group-hover:scale-105" />
        ) : (
          <ProductVisual type={product.visual} color={product.color} />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-vision-blue">{product.model}</div>
        <Link to={href} className="mb-2 line-clamp-1 text-lg font-bold text-slate-950 group-hover:text-vision-blue">{product.name}</Link>
        <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {productSpecs.slice(0, 2).map((spec) => (
            <span key={spec} className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
              {spec}
            </span>
          ))}
        </div>

        <div className="mt-auto mb-4 space-y-3">
          {optionPrices.length > 1 && (
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Price Option</span>
              <select
                value={selectedOption}
                onChange={(event) => setSelectedOption(Number(event.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-vision-blue focus:ring-2 focus:ring-cyan-100"
              >
                {optionPrices.map((option, index) => (
                  <option key={option.label} value={index}>
                    {option.label} - Tk {option.price}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="text-xl font-bold text-vision-blue">Tk {selectedPrice}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={handleAddToCart} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-vision-blue px-2 py-2 text-[11px] font-black text-vision-blue transition hover:bg-cyan-50">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button type="button" onClick={handleOrder} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-vision-blue px-2 py-2 text-[11px] font-black text-white transition hover:bg-vision-dark">
            <ClipboardCheck className="h-4 w-4" />
            Order
          </button>
        </div>
      </div>
    </article>
  );
};

export default memo(ProductCard);
