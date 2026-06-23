import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, Minus, Plus, ShoppingBag, Tag, Trash2, Truck, XCircle } from "lucide-react";
import ProductVisual from "../components/ProductVisual";
import { getCartItems, saveCartItems } from "../utils/cart";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Cart = ({ mode = "cart" }) => {
  const [items, setItems] = useState([]);
  const [deliveryArea, setDeliveryArea] = useState("inside");
  const [shipping, setShipping] = useState({ inside: 60, outside: 130, freeThreshold: 2000 });
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getCartItems());
    fetch(`${API_URL}/settings/shipping`)
      .then(r => r.json())
      .then(data => { if (data?.value) setShipping(s => ({ ...s, ...data.value })); })
      .catch(() => {});
  }, []);

  const subtotal = useMemo(() => items.reduce((t, i) => t + i.price * i.quantity, 0), [items]);

  const deliveryFee = useMemo(() => {
    if (subtotal >= (shipping.freeThreshold || 2000)) return 0;
    return deliveryArea === "inside" ? (shipping.inside || 60) : (shipping.outside || 130);
  }, [subtotal, deliveryArea, shipping]);

  const couponDiscount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return 0;
    let disc = coupon.discountType === "percentage"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;
    if (coupon.maxDiscount && disc > coupon.maxDiscount) disc = coupon.maxDiscount;
    return disc;
  }, [coupon, subtotal]);

  const total = subtotal + deliveryFee - couponDiscount;

  const updateItems = (next) => { setItems(next); saveCartItems(next); };
  const updateQuantity = (item, qty) => updateItems(items.map(c => c.id === item.id && c.option === item.option ? { ...c, quantity: Math.max(1, qty) } : c));
  const removeItem = (item) => updateItems(items.filter(c => !(c.id === item.id && c.option === item.option)));
  const itemCount = items.reduce((t, i) => t + i.quantity, 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCoupon(null);
    try {
      const res = await fetch(`${API_URL}/coupons/validate/${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json();
      if (!res.ok) { setCouponError(data.message || "কুপন সঠিক নয়"); }
      else {
        if (data.minOrderAmount && subtotal < data.minOrderAmount) {
          setCouponError(`কমপক্ষে $${data.minOrderAmount} অর্ডার করলে কুপন প্রযোজ্য`);
        } else {
          setCoupon(data);
        }
      }
    } catch { setCouponError("কুপন যাচাই করা সম্ভব হয়নি"); }
    setCouponLoading(false);
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setPlacing(true);
    const formData = new FormData(event.currentTarget);
    const orderData = {
      customer: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
      },
      items,
      totalAmount: total,
      paymentMethod: formData.get("payment") || "cod",
      deliveryCharge: deliveryFee,
      discount: couponDiscount,
      couponCode: coupon?.code || "",
      deliveryArea,
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "অর্ডার সেভ করতে সমস্যা হয়েছে");
      }
      const data = await res.json();
      const savedOrder = { ...orderData, orderId: data.orderId || `VSN-${Date.now()}`, createdAt: new Date().toISOString(), subtotal, couponDiscount };
      localStorage.setItem("vision-last-order", JSON.stringify(savedOrder));
      saveCartItems([]);
      setItems([]);
      navigate("/thank-you", { state: { order: savedOrder } });
    } catch (err) {
      alert(err.message || "অর্ডার দেওয়া যায়নি, আবার চেষ্টা করুন।");
    }
    setPlacing(false);
  };

  if (mode === "cart") {
    return (
      <div className="bg-slate-50">
        <section className="border-b border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-12">
          <div className="container-custom">
            <Link to="/products" className="mb-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-vision-blue hover:underline">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
            <h1 className="text-4xl font-black uppercase text-vision-dark md:text-6xl">Shopping Cart</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Review your selected Vision products before placing an order.</p>
          </div>
        </section>

        <section className="container-custom py-12">
          {items.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-vision-cyan" />
              <h2 className="mb-3 text-2xl font-black uppercase text-vision-dark">Your cart is empty</h2>
              <p className="mb-6 text-slate-600">Add a product from the catalog and it will show here.</p>
              <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <article key={`${item.id}-${item.option}`} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[140px_1fr]">
                    <Link to={`/products/${item.id}`} className="flex aspect-square items-center justify-center rounded-md bg-gradient-to-br from-white via-cyan-50 to-blue-50">
                      {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-contain p-4" /> : <ProductVisual type={item.visual} color={item.color} compact />}
                    </Link>
                    <div>
                      <div className="mb-1 text-xs font-black uppercase tracking-wider text-vision-blue">{item.model}</div>
                      <Link to={`/products/${item.id}`} className="text-xl font-black text-vision-dark hover:text-vision-blue">{item.name}</Link>
                      {item.option && <div className="mt-2 text-sm font-bold text-slate-500">Option: {item.option}</div>}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-2xl font-black text-vision-blue">${(item.price * item.quantity).toLocaleString()}</div>
                        <div className="flex items-center gap-3">
                          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
                            <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} className="grid h-10 w-10 place-items-center hover:bg-cyan-50"><Minus className="h-4 w-4" /></button>
                            <div className="grid h-10 w-12 place-items-center border-x border-slate-200 font-black">{item.quantity}</div>
                            <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} className="grid h-10 w-10 place-items-center hover:bg-cyan-50"><Plus className="h-4 w-4" /></button>
                          </div>
                          <button type="button" onClick={() => removeItem(item)} className="grid h-10 w-10 place-items-center rounded-md border border-red-100 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="h-fit rounded-lg border border-cyan-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-black uppercase text-vision-dark">Cart Summary</h2>
                <div className="space-y-3 border-b border-slate-100 pb-5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Items</span><span className="font-black">{itemCount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-black">${subtotal.toLocaleString()}</span></div>
                </div>
                <div className="flex justify-between py-5 text-xl font-black text-vision-dark">
                  <span>Total</span><span>${subtotal.toLocaleString()}</span>
                </div>
                <Link to="/order" className="inline-flex w-full items-center justify-center rounded-md bg-vision-blue px-6 py-3 font-black text-white transition hover:bg-vision-dark">
                  Proceed to Order
                </Link>
              </aside>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="container-custom py-12 lg:py-20">
        {items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-vision-cyan" />
            <h2 className="mb-3 text-2xl font-black uppercase text-vision-dark">Your cart is empty</h2>
            <p className="mb-6 text-slate-600">Add a product from the catalog and it will show here.</p>
            <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
          </div>
        ) : (
          <>
            <Link to="/products" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-vision-blue">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>

            <div className="mb-8 rounded-md border border-vision-blue/20 bg-cyan-50 px-5 py-4 text-center text-sm font-bold text-vision-dark">
              Fill in your details and click Place Order to confirm.
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <form className="space-y-6" onSubmit={handlePlaceOrder}>
                <div>
                  <label htmlFor="customer-name" className="mb-2 block font-black text-slate-950">Your Name *</label>
                  <input id="customer-name" name="name" className="form-input border-cyan-100 bg-cyan-50/70" placeholder="Full name" required />
                </div>
                <div>
                  <label htmlFor="customer-phone" className="mb-2 block font-black text-slate-950">Phone Number *</label>
                  <input id="customer-phone" name="phone" className="form-input border-cyan-100 bg-cyan-50/70" placeholder="01XXXXXXXXX" required />
                </div>
                <div>
                  <label htmlFor="customer-address" className="mb-2 block font-black text-slate-950">Delivery Address *</label>
                  <textarea id="customer-address" name="address" className="form-input min-h-28 resize-none border-cyan-100 bg-cyan-50/70" placeholder="Full delivery address" required />
                </div>

                <div>
                  <h2 className="mb-3 font-black text-slate-950">Select Delivery Area *</h2>
                  <div className="grid gap-3">
                    {[
                      { value: "inside", label: "Inside Dhaka", fee: shipping.inside || 60 },
                      { value: "outside", label: "Outside Dhaka", fee: shipping.outside || 130 },
                    ].map(opt => (
                      <label key={opt.value} className={`flex cursor-pointer items-center justify-between rounded-md border bg-white px-4 py-4 transition ${deliveryArea === opt.value ? "border-vision-blue ring-4 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"}`}>
                        <span className="flex items-center gap-3 font-bold text-slate-900">
                          <input type="radio" name="delivery-area" value={opt.value} checked={deliveryArea === opt.value} onChange={() => setDeliveryArea(opt.value)} className="accent-vision-blue" />
                          {opt.label}
                        </span>
                        <span className="font-black text-vision-blue">${opt.fee}</span>
                      </label>
                    ))}
                  </div>
                  {subtotal >= (shipping.freeThreshold || 2000) && (
                    <p className="mt-2 text-sm font-bold text-green-600">🎉 Free delivery! ${shipping.freeThreshold || 2000}+ অর্ডারে বিনামূল্যে ডেলিভারি।</p>
                  )}
                </div>

                <div>
                  <h2 className="mb-3 font-black text-slate-950">Payment Method</h2>
                  <div className="space-y-2">
                    {[
                      { value: "cod", label: "Cash On Delivery" },
                      { value: "bkash", label: "bKash" },
                      { value: "nagad", label: "Nagad" },
                    ].map(pm => (
                      <label key={pm.value} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 font-bold text-vision-dark hover:border-vision-blue/40 transition">
                        <input type="radio" name="payment" value={pm.value} defaultChecked={pm.value === "cod"} className="accent-vision-blue" />
                        {pm.label}
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={placing} className="w-full rounded-md bg-vision-blue px-6 py-4 text-lg font-black text-white shadow-sm transition hover:bg-vision-dark disabled:opacity-60 flex items-center justify-center gap-2">
                  {placing ? <><Loader2 className="h-5 w-5 animate-spin" /> অর্ডার দেওয়া হচ্ছে...</> : "Place Order"}
                </button>
              </form>

              <aside className="h-fit overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
                <div className="bg-vision-dark px-5 py-4">
                  <h2 className="text-2xl font-black text-white">Order Summary</h2>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-[1fr_80px] border-b border-slate-200 pb-3 text-sm font-bold text-slate-500">
                    <span>Details</span><span className="text-right">Price</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <article key={`${item.id}-${item.option}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4">
                        <button type="button" onClick={() => removeItem(item)} className="text-red-500 transition hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        <div className="flex min-w-0 items-center gap-3">
                          <Link to={`/products/${item.id}`} className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-100 bg-cyan-50">
                            {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2" /> : <ProductVisual type={item.visual} color={item.color} compact />}
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/products/${item.id}`} className="line-clamp-1 font-black text-slate-950 hover:text-vision-blue">{item.name}</Link>
                            {item.option && <p className="text-xs font-bold text-slate-500">Option: {item.option}</p>}
                            <div className="mt-2 inline-grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
                              <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} className="grid h-8 w-8 place-items-center hover:bg-cyan-50"><Minus className="h-3.5 w-3.5" /></button>
                              <span className="grid h-8 w-10 place-items-center border-x border-slate-200 text-sm font-black">{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} className="grid h-8 w-8 place-items-center hover:bg-cyan-50"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-black text-vision-dark">${(item.price * item.quantity).toLocaleString()}</div>
                      </article>
                    ))}
                  </div>

                  {/* Coupon Code */}
                  <div className="border-y border-slate-200 py-4">
                    <div className="mb-3 flex items-center gap-2 font-black text-slate-950">
                      <Tag className="h-4 w-4 text-vision-blue" /> Coupon Code
                    </div>
                    {coupon ? (
                      <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span>{coupon.code} — {coupon.discountType === "percentage" ? `${coupon.discountValue}% ছাড়` : `$${coupon.discountValue} ছাড়`}</span>
                        </div>
                        <button type="button" onClick={() => { setCoupon(null); setCouponCode(""); }} className="text-red-400 hover:text-red-600"><XCircle className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <input value={couponCode} onChange={e => setCouponCode(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                            className="form-input border-cyan-100 bg-cyan-50/70 py-2" placeholder="Enter coupon code" />
                          <button type="button" onClick={applyCoupon} disabled={couponLoading} className="rounded-md border border-vision-blue px-4 font-black text-vision-blue transition hover:bg-vision-blue hover:text-white disabled:opacity-50">
                            {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                          </button>
                        </div>
                        {couponError && <p className="mt-1.5 text-xs font-bold text-red-500">{couponError}</p>}
                      </>
                    )}
                  </div>

                  <div className="space-y-2 border-b border-slate-200 py-4 text-sm">
                    <div className="flex justify-between"><span>Items:</span><span className="font-bold">{itemCount}</span></div>
                    <div className="flex justify-between"><span>Subtotal:</span><span className="font-bold">${subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Delivery Charge:</span><span className="font-bold">{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `$${deliveryFee}`}</span></div>
                    {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount:</span><span className="font-bold">-${couponDiscount.toLocaleString()}</span></div>}
                  </div>

                  <div className="flex justify-between py-4 text-xl font-black text-vision-dark">
                    <span>Total:</span><span>${total.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-3 rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold leading-6 text-vision-dark">
                    <Truck className="mt-1 h-5 w-5 shrink-0 text-vision-blue" />
                    <p>Please place your order only after confirming all details. Pay in cash when you receive the product.</p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Cart;
