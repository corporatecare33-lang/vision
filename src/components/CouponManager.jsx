import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, RefreshCcw, Check, TicketPercent, AlertTriangle, Save } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </>
  );
};

const StatusBadge = ({ status }) => {
  const colors = { active: "bg-green-100 text-green-700 border-green-200", inactive: "bg-gray-100 text-gray-500 border-gray-200" };
  const labels = { active: "Active", inactive: "Inactive" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${colors[status] || colors.inactive} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-green-500" : "bg-red-500"}`} />
      {labels[status] || status}
    </span>
  );
};

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", discountType: "percentage", discountValue: "", minOrderAmount: "",
    maxDiscount: "", usageLimit: "", isActive: true, expiresAt: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const getToken = () => localStorage.getItem("token");
  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

  const loadCoupons = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/coupons`, { headers: headers() });
      const data = await res.json();
      if (Array.isArray(data)) setCoupons(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editCoupon ? `${API_URL}/coupons/${editCoupon._id}` : `${API_URL}/coupons`;
      const method = editCoupon ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      await loadCoupons();
      setShowForm(false);
      setEditCoupon(null);
      setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxDiscount: "", usageLimit: "", isActive: true, expiresAt: "" });
      alert("✅ Coupon saved!");
    } catch (e) { alert("Failed to save coupon: " + e.message); }
    setSaving(false);
  };

  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
    setForm({
      code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "", maxDiscount: coupon.maxDiscount || "",
      usageLimit: coupon.usageLimit || "", isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleToggle = async (coupon) => {
    try {
      await fetch(`${API_URL}/coupons/${coupon._id}`, {
        method: "PUT", headers: headers(), body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      await loadCoupons();
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await fetch(`${API_URL}/coupons/${id}`, { method: "DELETE", headers: headers() });
      await loadCoupons();
    } catch (e) { alert("Error: " + e.message); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-vision-blue/20 border-t-vision-blue rounded-full animate-spin" /></div>;
  }

  const activeCount = coupons.filter(c => c.isActive).length;
  const totalUsed = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Coupon Management</h3>
          <p className="text-sm text-gray-500 mt-1">Create and manage discount coupons and promo codes</p>
        </div>
        <button onClick={() => { setEditCoupon(null); setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxDiscount: "", usageLimit: "", isActive: true, expiresAt: "" }); setShowForm(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { value: coupons.length, label: "Total Coupons", color: "text-gray-900" },
          { value: activeCount, label: "Active", color: "text-green-600" },
          { value: totalUsed, label: "Used", color: "text-blue-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {coupons.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Code", "Discount", "Max Discount", "Usage", "Status", "Expires", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 text-left ${i === 6 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4"><span className="text-sm font-bold text-gray-900">{c.code}</span></td>
                  <td className="px-5 py-4"><span className="text-xs font-extrabold text-emerald-600">{c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-500">{c.maxDiscount ? `$${c.maxDiscount}` : "—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{c.usedCount || 0}/{c.usageLimit || "∞"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(c)} className="cursor-pointer"><StatusBadge status={c.isActive ? "active" : "inactive"} /></button>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-vision-blue rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
          <TicketPercent className="w-16 h-16 text-gray-200 mb-4" />
          <h4 className="text-lg font-bold text-gray-900 mb-2">No coupons found</h4>
          <p className="text-sm text-gray-500">No coupons yet. Create your first coupon.</p>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditCoupon(null); }} title={editCoupon ? "Edit Coupon" : "New Coupon"}>
        <form onSubmit={handleSave} className="space-y-4">
          <label className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Coupon Code</span>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" required placeholder="SUMMER20" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Discount Type</span>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 bg-white">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Discount Value</span>
              <input type="number" min="1" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" required />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Minimum Order</span>
              <input type="number" min="0" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Max Discount</span>
              <input type="number" min="0" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Usage Limit</span>
              <input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="0 = unlimited" />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Expiry Date</span>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditCoupon(null); }} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
              {saving ? "Saving..." : editCoupon ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CouponManager;