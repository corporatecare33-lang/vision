import { useState, useEffect, useRef } from "react";
import { Zap, Plus, Trash2, Edit, RefreshCcw, X, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const Countdown = ({ endDate, startDate }) => {
  const [time, setTime] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(startDate) > now ? new Date(startDate) : new Date(endDate);
      const label = new Date(startDate) > now ? "শুরু হবে" : "শেষ হবে";
      const diff = target - now;
      if (diff <= 0) { setTime(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${label}: ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    ref.current = setInterval(tick, 1000);
    return () => clearInterval(ref.current);
  }, [endDate, startDate]);
  if (!time) return null;
  return (
    <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
      <Clock className="w-3 h-3 text-red-500 shrink-0" />
      <span className="text-[10px] font-extrabold text-red-600 font-mono tracking-wider">{time}</span>
    </div>
  );
};
import { getFlashSales, createFlashSale, updateFlashSale, deleteFlashSale, getProducts } from "../services/api";

const StatusBadge = ({ active }) => {
  const isActive = active === true || active === "true";
  const now = new Date();
  const isExpired = false; // Will be calculated per item
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
      {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
    </span>
  );
};

const FlashSaleManager = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    productId: "",
    productName: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    const [sales, prods] = await Promise.all([getFlashSales(true), getProducts()]);
    if (Array.isArray(sales)) setFlashSales(sales);
    if (Array.isArray(prods)) setProducts(prods);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({
      title: "", productId: "", productName: "", discountType: "percentage",
      discountValue: "", startDate: "", endDate: "", isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleProductSelect = (e) => {
    const pid = e.target.value;
    const product = products.find(p => p.id === pid);
    setForm({
      ...form,
      productId: pid,
      productName: product?.name || "",
      title: product ? `${product.name} - ফ্ল্যাশ সেল` : form.title,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        discountValue: Number(form.discountValue),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive === true || form.isActive === "true",
      };
      
      if (editingId) {
        await updateFlashSale(editingId, data);
      } else {
        await createFlashSale(data);
      }
      resetForm();
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ফ্ল্যাশ সেলটি মুছবেন?")) {
      await deleteFlashSale(id);
      loadData();
    }
  };

  const handleToggle = async (sale) => {
    await updateFlashSale(sale._id, { isActive: !sale.isActive });
    loadData();
  };

  const handleEdit = (sale) => {
    const formatDate = (d) => {
      if (!d) return "";
      const date = new Date(d);
      return date.toISOString().slice(0, 16);
    };
    setForm({
      title: sale.title || "",
      productId: sale.productId || "",
      productName: sale.productName || "",
      discountType: sale.discountType || "percentage",
      discountValue: sale.discountValue || "",
      startDate: formatDate(sale.startDate),
      endDate: formatDate(sale.endDate),
      isActive: sale.isActive !== false,
    });
    setEditingId(sale._id);
    setShowForm(true);
  };

  const now = new Date();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">ফ্ল্যাশ সেল ম্যানেজমেন্ট</h3>
          <p className="text-sm text-gray-500 mt-1">সীমিত সময়ের অফার ও ফ্ল্যাশ ডিল সেটআপ করুন</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> নতুন ফ্ল্যাশ সেল
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900">{editingId ? "ফ্ল্যাশ সেল সম্পাদনা" : "নতুন ফ্ল্যাশ সেল"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">টাইটেল</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="Flash Sale Title" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">পণ্য নির্বাচন করুন</label>
                <select value={form.productId} onChange={handleProductSelect} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 bg-white" required>
                  <option value="">পণ্য নির্বাচন করুন</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - ৳{p.price}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ডিসকাউন্ট টাইপ</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 bg-white">
                    <option value="percentage">শতাংশ (%)</option>
                    <option value="fixed">নির্দিষ্ট মূল্য (৳)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ডিসকাউন্ট ভ্যালু</label>
                  <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="10" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">শুরুর তারিখ</label>
                  <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">শেষের তারিখ</label>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" required />
                </div>
              </div>
              <label className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সক্রিয়</span>
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {form.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </button>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">বাতিল</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg">
                  {editingId ? "আপডেট করুন" : "তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8"><RefreshCcw className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
      ) : flashSales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center text-center">
          <Zap className="w-16 h-16 text-gray-200 mb-4" />
          <h4 className="text-lg font-bold text-gray-900 mb-2">কোনো ফ্ল্যাশ সেল নেই</h4>
          <p className="text-sm text-gray-500 max-w-md">নতুন ফ্ল্যাশ সেল তৈরি করে পণ্যে ডিসকাউন্ট অফার করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {flashSales.map((sale) => {
            const startDate = new Date(sale.startDate);
            const endDate = new Date(sale.endDate);
            const isExpired = endDate < now;
            const isUpcoming = startDate > now;
            const isRunning = !isExpired && !isUpcoming;
            
            let statusClass = "bg-gray-100 text-gray-600";
            let statusText = "নিষ্ক্রিয়";
            if (sale.isActive && isRunning) { statusClass = "bg-green-100 text-green-700"; statusText = "চলমান"; }
            else if (sale.isActive && isUpcoming) { statusClass = "bg-blue-100 text-blue-700"; statusText = "আসন্ন"; }
            else if (isExpired) { statusClass = "bg-red-100 text-red-700"; statusText = "মেয়াদোত্তীর্ণ"; }
            
            const discountedPrice = sale.productPrice - (sale.discountType === "percentage" 
              ? (sale.productPrice * (sale.discountValue || 0) / 100) 
              : (sale.discountValue || 0));

            return (
              <div key={sale._id} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all ${isExpired ? "border-red-100 opacity-75" : sale.isActive ? "border-green-100" : "border-gray-100"}`}>
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExpired ? "bg-red-100" : sale.isActive ? "bg-green-100" : "bg-gray-100"}`}>
                        <Zap className={`w-5 h-5 ${isExpired ? "text-red-500" : sale.isActive ? "text-green-600" : "text-gray-400"}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{sale.title}</h4>
                        <p className="text-[10px] text-gray-400">{sale.productName}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusClass}`}>{statusText}</span>
                  </div>
                </div>
                <div className="px-5 py-3 space-y-2">
                  {sale.productImage && (
                    <img src={sale.productImage} alt={sale.productName} className="h-20 w-full object-contain rounded-lg bg-gray-50" />
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">ডিসকাউন্ট:</span>
                      <span className="font-bold text-red-600 ml-1">{sale.discountValue}{sale.discountType === "percentage" ? "%" : "৳"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">সেল মূল্য:</span>
                      <span className="font-bold text-green-600 ml-1">৳{Math.max(0, discountedPrice).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>শুরু:</span>
                      <span>{startDate.toLocaleDateString("bn-BD")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>শেষ:</span>
                      <span>{endDate.toLocaleDateString("bn-BD")}</span>
                    </div>
                  </div>
                  {!isExpired && sale.isActive && (
                    <Countdown endDate={sale.endDate} startDate={sale.startDate} />
                  )}
                </div>
                <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <StatusBadge active={sale.isActive} />
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleToggle(sale)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="স্ট্যাটাস টগল">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleEdit(sale)} className="p-1.5 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="সম্পাদনা">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(sale._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="মুছুন">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashSaleManager;