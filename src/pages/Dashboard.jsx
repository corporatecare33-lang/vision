import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  List,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  User,
  Bell,
  ShoppingCart,
  Tags,
  Truck,
  Shield,
  Home,
  PackagePlus,
  RefreshCcw,
  ChevronDown,
  UserCircle,
  FileText,
  ShieldCheck,
  TruckIcon,
  Globe,
  Smartphone,
  Headphones,
  MessageCircle,
  FileCheck,
  BellRing,
  ShoppingBag,
  Tag,
  Users,
  Gift,
  MapPin,
  Mail,
  RotateCcw,
  Cog,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  Menu,
  X,
  Search,
  Eye,
  Download,
  Printer,
  Filter,
  Clock,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCheck,
  UserPlus,
  Fingerprint,
  Gavel,
  Warehouse,
  Layers,
  Megaphone,
  TicketPercent,
  Image,
  Zap,
  Banknote,
  LineChart,
  Mail as MailIcon,
  Palette,
  Receipt,
  Radio,
  Contact,
  Upload,
  CreditCard
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
  getSalesReport,
  getOrders,
  updateOrderStatus,
  getUsers,
  updateUserStatus,
  updateUser,
  registerUser,
  getPages,
  createPage,
  updatePage,
  updatePageStatus,
  deletePage,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStockProducts,
  updateProductStock,
  getStockTransactions,
  getStockAlerts,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getReviews,
  updateReview,
  deleteReview,
  getSetting,
  saveSetting,
  saveSettingWithFile,
  logout as apiLogout,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from "../services/api";
import CouponManager from "../components/CouponManager";
import SiteSettings from "../components/SiteSettings";
import BannerManager from "../components/BannerManager";
import { categories as fallbackCategories } from "../data/data";

// ============================================================
// Helper Components
// ============================================================
const StatusBadge = ({ status }) => {
  const colors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-sky-100 text-sky-700 border-sky-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    returned: "bg-purple-100 text-purple-700 border-purple-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    failed: "bg-rose-100 text-rose-700 border-rose-200",
    refunded: "bg-orange-100 text-orange-700 border-orange-200",
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-gray-100 text-gray-500 border-gray-200",
    superadmin: "bg-purple-100 text-purple-700 border-purple-200",
    admin: "bg-blue-100 text-blue-700 border-blue-200",
    instock: "bg-emerald-100 text-emerald-700 border-emerald-200",
    lowstock: "bg-amber-100 text-amber-700 border-amber-200",
    outofstock: "bg-red-100 text-red-700 border-red-200",
  };
  const labels = {
    pending: "Pending", processing: "Processing", shipped: "Shipped",
    delivered: "Delivered", cancelled: "Cancelled", returned: "Returned",
    paid: "Paid", failed: "Failed", refunded: "Refunded",
    active: "Active", inactive: "Inactive", superadmin: "Super Admin", admin: "Admin",
    instock: "In Stock", lowstock: "Low Stock", outofstock: "Out of Stock",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${colors[status] || colors.pending} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" || status === "delivered" || status === "paid" || status === "instock" ? "bg-green-500" : status === "inactive" || status === "cancelled" || status === "failed" || status === "outofstock" ? "bg-red-500" : "bg-amber-500"}`} />
      {labels[status] || status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size] || widths.md} max-h-[90vh] overflow-y-auto animate-fadeIn`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
};

const StockBadge = ({ stock, threshold }) => {
  if (stock === 0) return <StatusBadge status="outofstock" />;
  if (stock <= threshold) return <StatusBadge status="lowstock" />;
  return <StatusBadge status="instock" />;
};

// ============================================================
// Order Management Component (extracted for cleanliness)
// ============================================================
const COURIER_SERVICES = [
  { id: "dhl", name: "DHL Express", trackUrl: "https://www.dhl.com/us-en/home/tracking.html?tracking-id=" },
  { id: "fedex", name: "FedEx", trackUrl: "https://www.fedex.com/fedextrack/?trknbr=" },
  { id: "ups", name: "UPS", trackUrl: "https://www.ups.com/track?tracknum=" },
  { id: "usps", name: "USPS", trackUrl: "https://tools.usps.com/go/TrackConfirmAction?tLabels=" },
];

const CourierModal = ({ order, onClose, onSave }) => {
  const [courier, setCourier] = useState("dhl");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!trackingNumber.trim()) return;
    setSaving(true);
    const courierInfo = { courier, trackingNumber: trackingNumber.trim(), serviceType, assignedAt: new Date().toISOString() };
    await onSave(order._id, courierInfo);
    setSaving(false);
    onClose();
  };

  const selectedCourier = COURIER_SERVICES.find(c => c.id === courier);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-gray-900">Assign Courier</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">Order: <span className="text-vision-blue">{order.orderId}</span></p>
            <p className="text-xs text-gray-500">Customer: {order.customer?.name} — {order.customer?.phone}</p>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Courier Service</label>
            <select value={courier} onChange={e => setCourier(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50">
              {COURIER_SERVICES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Service Type</label>
            <input type="text" value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder={courier === "dhl" ? "e.g. Express Worldwide" : courier === "fedex" ? "e.g. FedEx International Priority" : "e.g. Ground"} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Tracking Number *</label>
            <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          </div>
          {trackingNumber && selectedCourier && (
            <a href={`${selectedCourier.trackUrl}${trackingNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-vision-blue hover:underline">
              <Globe className="w-3.5 h-3.5" /> Preview tracking link
            </a>
          )}
          <div className="bg-blue-50 rounded-xl p-3 text-[11px] text-blue-600 space-y-1">
            <p className="font-bold text-blue-700">Setup Guide</p>
            {courier === "dhl" && <p>Create shipment at <strong>developer.dhl.com</strong> → Shipment Tracking API. Account number + API key required.</p>}
            {courier === "fedex" && <p>Use <strong>developer.fedex.com</strong> → Ship API. FedEx account + OAuth credentials required.</p>}
            {courier === "ups" && <p>Register at <strong>developer.ups.com</strong> → Shipping API. UPS account + Client ID/Secret required.</p>}
            {courier === "usps" && <p>Register at <strong>developer.usps.com</strong> → Shipments API. Business account required.</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={!trackingNumber.trim() || saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-vision-blue to-vision-cyan text-white text-xs font-bold hover:shadow-lg disabled:opacity-50">
              {saving ? "Saving..." : "Assign & Mark Shipped"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderManagement = ({ orders, loadOrders, orderSearch, setOrderSearch, orderFilter, setOrderFilter, orderPage, setOrderPage, ordersPagination, handleOrderStatusUpdate, viewOrder, setViewOrder }) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [courierOrder, setCourierOrder] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const filteredOrders = orders.filter(order => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(order.createdAt);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedOrders.has(o._id));
  const toggleAll = () => {
    if (allSelected) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(filteredOrders.map(o => o._id)));
  };
  const toggleOrder = (id) => {
    const next = new Set(selectedOrders);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedOrders(next);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) return;
    if (!window.confirm(`Delete ${selectedOrders.size} selected order(s)?`)) return;
    setBulkDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all([...selectedOrders].map(id =>
        fetch(`${API_URL}/dashboard/orders/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      ));
      setSelectedOrders(new Set());
      loadOrders();
    } catch (e) { alert("Some deletions failed"); }
    setBulkDeleting(false);
  };

  const handleAssignCourier = async (orderId, courierInfo) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/dashboard/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderStatus: "shipped", courierInfo }),
    });
    loadOrders();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Order Management</h3>
          <p className="text-sm text-gray-500 mt-1">Track and manage all orders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedOrders.size > 0 && (
            <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedOrders.size})
            </button>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl font-bold">{ordersPagination.total || orders.length} Orders</span>
          <button onClick={loadOrders} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all"><RefreshCcw className="w-3.5 h-3.5" /> Refresh</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by order ID or phone..." value={orderSearch} onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={orderFilter} onChange={e => { setOrderFilter(e.target.value); setOrderPage(1); }} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
            <option value="">All Statuses</option>
            {[["pending","Pending"],["processing","Processing"],["shipped","Shipped"],["delivered","Delivered"],["cancelled","Cancelled"],["returned","Returned"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
          <Clock className="w-4 h-4 text-gray-400" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent border-none outline-none text-xs text-gray-600" title="From date" />
          <span className="text-gray-300">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent border-none outline-none text-xs text-gray-600" title="To date" />
          {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-gray-400 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-4 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-vision-blue w-4 h-4" /></th>
              {["Order", "Customer", "Product", "Total", "Payment", "Status", "Action"].map((h, i) => (
                <th key={i} className={`px-4 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map(order => (
              <tr key={order._id} className={`hover:bg-gray-50/70 transition-colors ${selectedOrders.has(order._id) ? "bg-cyan-50/30" : ""}`}>
                <td className="px-4 py-4"><input type="checkbox" checked={selectedOrders.has(order._id)} onChange={() => toggleOrder(order._id)} className="accent-vision-blue w-4 h-4" /></td>
                <td className="px-4 py-4">
                  <span className="text-xs font-bold text-vision-blue">{order.orderId}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-US")}</p>
                  {order.courierInfo && <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{order.courierInfo.courier?.toUpperCase()} · {order.courierInfo.trackingNumber}</p>}
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs font-semibold text-gray-900">{order.customer?.name || "Unknown"}</p>
                  <p className="text-[10px] text-gray-400">{order.customer?.phone}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs text-gray-600 truncate max-w-[130px]">{(order.items || []).map(i => i.name).join(", ") || "—"}</p>
                  <p className="text-[10px] text-gray-400">{(order.items || []).length} item(s)</p>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-extrabold text-gray-900">${order.totalAmount?.toLocaleString()}</span>
                  <p className="text-[10px] text-gray-400">{order.paymentMethod || "COD"}</p>
                </td>
                <td className="px-4 py-4"><StatusBadge status={order.paymentStatus} /></td>
                <td className="px-4 py-4">
                  <div className="relative group">
                    <button className="flex items-center gap-1 cursor-pointer"><StatusBadge status={order.orderStatus} /><ChevronDown className="w-3 h-3 text-gray-400" /></button>
                    <div className="absolute left-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                      {[["pending","Pending"],["processing","Processing"],["shipped","Shipped"],["delivered","Delivered"],["cancelled","Cancelled"]].map(([s, l]) => (
                        <button key={s} onClick={() => handleOrderStatusUpdate(order._id, s)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${order.orderStatus === s ? "bg-vision-blue/10 text-vision-blue" : "text-gray-600 hover:bg-gray-50"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => setViewOrder(order)} className="p-1.5 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="View"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setCourierOrder(order)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Assign Courier"><Truck className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && <tr><td colSpan="8" className="text-center py-12 text-gray-400 text-xs">No orders found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {ordersPagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-gray-500 font-bold">Page {orderPage} of {ordersPagination.pages}</span>
          <button onClick={() => setOrderPage(p => Math.min(ordersPagination.pages, p + 1))} disabled={orderPage === ordersPagination.pages} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {courierOrder && <CourierModal order={courierOrder} onClose={() => setCourierOrder(null)} onSave={handleAssignCourier} />}
    </div>
  );
};

  const Dashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(() => {
    return localStorage.getItem("dashboardActiveNav") || "dashboard";
  });
  const contentRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("monthly");
  const [pages, setPages] = useState([]);
  const [editPage, setEditPage] = useState(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [editProduct, setEditProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSelected, setProductSelected] = useState([]);
  const [productBulkDeleting, setProductBulkDeleting] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [stockProducts, setStockProducts] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [stockAlerts, setStockAlerts] = useState({ lowStock: [], outOfStock: [], total: 0 });
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [stockDateFrom, setStockDateFrom] = useState("");
  const [stockDateTo, setStockDateTo] = useState("");
  const [stockSelected, setStockSelected] = useState([]);
  const [stockBulkDeleting, setStockBulkDeleting] = useState(false);
  const [adjustStockProduct, setAdjustStockProduct] = useState(null);
  const [showStockAdjust, setShowStockAdjust] = useState(false);
  const [stockAdjustForm, setStockAdjustForm] = useState({ type: "add", quantity: "", reason: "" });
  const [viewOrder, setViewOrder] = useState(null);
  const [stockTxPage, setStockTxPage] = useState(1);
  const [activeStockTab, setActiveStockTab] = useState("overview");
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [marketingCounts, setMarketingCounts] = useState({ coupons: 0, banners: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeenOrderId, setLastSeenOrderId] = useState(() => localStorage.getItem("lastSeenOrderId") || "");

  // Poll for new orders every 30 seconds
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const checkNewOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/orders?limit=10&page=1`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (!res.ok) return;
        const data = await res.json();
        const recentOrders = data.orders || [];
        if (recentOrders.length === 0) return;
        const newestId = recentOrders[0]?._id;
        if (lastSeenOrderId && newestId !== lastSeenOrderId) {
          const newOrders = [];
          for (const o of recentOrders) {
            if (o._id === lastSeenOrderId) break;
            newOrders.push({ id: o._id, message: `New order from ${o.customer?.name || "customer"} — $${Number(o.totalAmount || 0).toLocaleString()}`, time: new Date(o.createdAt || Date.now()).toLocaleTimeString(), read: false });
          }
          if (newOrders.length > 0) setNotifications(n => [...newOrders, ...n].slice(0, 20));
        }
        if (!lastSeenOrderId && newestId) { setLastSeenOrderId(newestId); localStorage.setItem("lastSeenOrderId", newestId); }
        if (newestId && newestId !== lastSeenOrderId) { setLastSeenOrderId(newestId); localStorage.setItem("lastSeenOrderId", newestId); }
      } catch {}
    };
    checkNewOrders();
    const interval = setInterval(checkNewOrders, 30000);
    return () => clearInterval(interval);
  }, [lastSeenOrderId]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    const [statsData, salesData] = await Promise.all([getDashboardStats(), getSalesReport()]);
    if (statsData) setStats(statsData);
    if (salesData) setSalesReport(salesData);
    setIsLoading(false);
  }, []);

  const loadOrders = useCallback(async () => {
    const params = { page: orderPage, limit: 15 };
    if (orderFilter) params.status = orderFilter;
    if (orderSearch) params.search = orderSearch;
    const data = await getOrders(params);
    if (data) {
      if (Array.isArray(data)) {
        setOrders(data);
        setOrdersPagination({ total: data.length, page: 1, pages: 1 });
      } else {
        setOrders(data.orders || []);
        setOrdersPagination({ total: data.total || 0, page: data.page || 1, pages: data.pages || 1 });
      }
    }
  }, [orderPage, orderFilter, orderSearch]);

  const loadUsers = useCallback(async () => { const data = await getUsers(); if (data) setUsers(data); }, []);
  const loadPages = useCallback(async () => { const data = await getPages(); if (data) setPages(data); }, []);
  const loadProducts = useCallback(async () => { const data = await getProducts(); if (data) setProducts(data); }, []);

  const loadStockProducts = useCallback(async () => {
    const params = {};
    if (stockSearch) params.search = stockSearch;
    if (stockCategoryFilter !== "all") params.category = stockCategoryFilter;
    if (stockStatusFilter !== "all") params.stockStatus = stockStatusFilter;
    if (stockDateFrom) params.dateFrom = stockDateFrom;
    if (stockDateTo) params.dateTo = stockDateTo;
    const data = await getStockProducts(params);
    if (Array.isArray(data)) setStockProducts(data);
  }, [stockSearch, stockCategoryFilter, stockStatusFilter, stockDateFrom, stockDateTo]);

  const loadStockTransactions = useCallback(async () => { const data = await getStockTransactions({ page: stockTxPage, limit: 50 }); if (data) setStockTransactions(data); }, [stockTxPage]);
  const loadStockAlerts = useCallback(async () => { const data = await getStockAlerts(); if (data) setStockAlerts(data); }, []);

  const loadCategories = useCallback(async () => {
    const data = await getCategories();
    const cats = Array.isArray(data) && data.length > 0 ? data : fallbackCategories;
    setCategories(cats);
    setProductCategories(cats);
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    localStorage.setItem("dashboardActiveNav", activeNav);
    if (activeNav === "dashboard") loadDashboardData();
    if (activeNav === "orders") loadOrders();
    if (activeNav === "users") loadUsers();
    if (activeNav === "page-management") loadPages();
    if (activeNav === "products") { loadProducts(); loadCategories(); }
    if (activeNav === "price-edit") { loadProducts(); loadCategories(); }
    if (activeNav === "marketing") {
      loadProducts(); loadDashboardData();
      Promise.all([getCoupons(), getBanners()]).then(([c, b]) => {
        setMarketingCounts({ coupons: Array.isArray(c) ? c.filter(x => x.isActive).length : 0, banners: Array.isArray(b) ? b.length : 0 });
      });
    }
    if (activeNav === "stock-management") { loadStockProducts(); loadStockTransactions(); loadStockAlerts(); loadCategories(); }
    if (activeNav === "category-management") { loadCategories(); }
  }, [activeNav, loadDashboardData, loadOrders, loadUsers, loadPages, loadProducts, loadStockProducts, loadStockTransactions, loadStockAlerts, loadCategories]);

  const handleOrderStatusUpdate = async (id, status) => { await updateOrderStatus(id, { orderStatus: status }); loadOrders(); };

  const handleUserToggleStatus = async (id, currentStatus) => { await updateUserStatus(id, !currentStatus); loadUsers(); };
  const handleUpdateUser = async () => { if (editUser) { await updateUser(editUser._id, { name: editUser.name, email: editUser.email, phone: editUser.phone, role: editUser.role }); setEditUser(null); loadUsers(); } };
  const handleTogglePageStatus = async (id, isActive) => { await updatePageStatus(id, !isActive); loadPages(); };

  const handleSavePage = async () => {
    try {
      if (editPage?._id) {
        await updatePage(editPage._id, { name: editPage.name, title: editPage.title, content: editPage.content, isActive: editPage.isActive });
      } else if (editPage) {
        const slug = editPage.name.toLowerCase().replace(/[ঀ-৿]/g, (c) => c).replace(/\s+/g, "-").replace(/[^\wঀ-৿-]/g, "").replace(/-+/g, "-").trim() || `page-${Date.now()}`;
        await createPage({ name: editPage.name, title: editPage.title, content: editPage.content, slug });
      }
      setEditPage(null); setShowAddPage(false); loadPages();
    } catch (err) {
      alert(err.message || "Error saving page");
    }
  };

  const handleDeletePage = async (id) => { if (window.confirm("Delete this page?")) { await deletePage(id); loadPages(); } };
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message || "Failed to delete product");
    }
  };
  const handleSaveProduct = async () => { setShowAddProduct(false); setEditProduct(null); loadProducts(); };

  const handleStockAdjust = async () => {
    if (!adjustStockProduct || !stockAdjustForm.quantity) return;
    await updateProductStock(adjustStockProduct.id, { type: stockAdjustForm.type, quantity: Number(stockAdjustForm.quantity), reason: stockAdjustForm.reason, performedBy: "admin" });
    setShowStockAdjust(false); setAdjustStockProduct(null); setStockAdjustForm({ type: "add", quantity: "", reason: "" });
    loadStockProducts(); loadStockTransactions(); loadStockAlerts();
  };

  const handleSaveCategory = () => {
    setEditCategory(null); setShowAddCategory(false); loadCategories();
  };

  const handleDeleteCategory = async (id) => { if (window.confirm("Delete this category?")) { await deleteCategory(id); loadCategories(); } };
  const handleLogout = () => { apiLogout(); navigate("/login"); };

  const formatTk = (value) => `$${Number(value || 0).toLocaleString()}`;
  const dashboardCards = [
    { bg: "bg-gradient-to-br from-blue-50 to-blue-100", iconBg: "bg-blue-500", icon: ShoppingCart, value: stats?.totalOrders || 0, label: "Total Orders", valueColor: "text-blue-900" },
    { bg: "bg-gradient-to-br from-green-50 to-green-100", iconBg: "bg-green-500", icon: DollarSign, value: formatTk(stats?.totalSales), label: "Total Sales", valueColor: "text-green-900" },
    { bg: "bg-gradient-to-br from-purple-50 to-purple-100", iconBg: "bg-purple-500", icon: Users, value: stats?.totalCustomers || 0, label: "Total Customers", valueColor: "text-purple-900" },
    { bg: "bg-gradient-to-br from-orange-50 to-orange-100", iconBg: "bg-orange-500", icon: Package, value: stats?.totalProducts || 0, label: "Total Products", valueColor: "text-orange-900" },
  ];
  const salesBars = salesReport?.monthly?.length ? salesReport.monthly : [];
  const maxSales = Math.max(...salesBars.map((item) => Number(item.sales || 0)), 1);
  const inventoryAlerts = stats?.inventoryAlerts || [];
  const topSellingProducts = stats?.topSellingProducts || [];
  const recentDashboardOrders = stats?.recentOrders || [];

  const handleInlinePriceChange = (id, key, value) => {
    setProducts((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const handleSaveInlinePrice = async (product) => {
    const fd = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      if (["imageFile", "_id", "__v", "createdAt", "updatedAt"].includes(key)) return;
      fd.append(key, Array.isArray(value) ? value.join(",") : value ?? "");
    });
    await updateProduct(product.id, fd);
    await loadProducts();
  };

  const sidebarGroups = [
    {
      label: "Products",
      items: [
        { id: "products", icon: ShoppingBag, label: "All Products" },
        { id: "price-edit", icon: Banknote, label: "Price Edit" },
        { id: "category-management", icon: Layers, label: "Categories" },
      ]
    },
    {
      label: "Marketing",
      items: [
        { id: "marketing", icon: Megaphone, label: "Marketing" },
        { id: "coupons", icon: TicketPercent, label: "Coupons" },
        { id: "banners", icon: Image, label: "Banners" },
      ]
    },
    {
      label: "Orders & Delivery",
      items: [
        { id: "orders", icon: ShoppingCart, label: "Orders" },
        { id: "shipping-charge", icon: Truck, label: "Shipping Charge" },
      ]
    },
    {
      label: "Payment",
      items: [
        { id: "payment-settings", icon: Wallet, label: "Payment Settings" },
      ]
    },
    {
      label: "Content",
      items: [
        { id: "contact-messages", icon: MessageCircle, label: "Messages" },
        { id: "page-management", icon: FileText, label: "Page Management" },
        { id: "frontend-content", icon: Layers, label: "Frontend Content" },
        { id: "filter-settings", icon: Filter, label: "Filter Settings" },
      ]
    },
    {
      label: "Analytics & Integration",
      items: [
        { id: "tracking-pixel", icon: LineChart, label: "Tracking Pixel" },
        { id: "smtp-email", icon: MailIcon, label: "SMTP Email" },
      ]
    },
    {
      label: "General Settings",
      items: [
        { id: "general-settings", icon: Settings, label: "General Settings" },
      ]
    },
    {
      label: "Settings",
      items: [
        { id: "users", icon: Users, label: "User Management" },
        { id: "stock-management", icon: Warehouse, label: "Stock Management" },
      ]
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarCollapsed ? "lg:-translate-x-full lg:w-0 lg:opacity-0 lg:pointer-events-none" : ""}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-vision-blue to-vision-cyan rounded-xl flex items-center justify-center shadow-lg shadow-vision-blue/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">Admin Panel</h1>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Vision E-commerce</p>
            </div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-5 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden transition-colors"><X className="w-5 h-5" /></button>
        <nav className="flex-1 px-3 pb-3 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button key={item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group ${isActive ? "bg-gradient-to-r from-vision-blue to-vision-cyan text-white shadow-lg shadow-vision-blue/25" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full opacity-80" />}
                      <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"} transition-colors`} />
                      {item.label}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-100 space-y-1.5 bg-gray-50/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"><LogOut className="w-4.5 h-4.5" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-auto bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 py-2">
          <div className="flex items-center gap-3">
            {/* Mobile open */}
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden transition-colors"><Menu className="w-5 h-5" /></button>
            {/* PC sidebar toggle */}
            <button onClick={() => setSidebarCollapsed(c => !c)} className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-vision-blue bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-all">
              <Globe className="w-3.5 h-3.5" />
              View Website
            </a>
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(o => !o); markAllRead(); }} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <BellRing className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">Notifications</p>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs">No new notifications</div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${n.read ? "" : "bg-cyan-50/50"}`} onClick={() => setActiveNav("orders")}>
                          <p className="text-xs font-bold text-gray-900">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={() => { setNotifications([]); setNotifOpen(false); }} className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-red-500 border-t border-gray-100 transition-colors">Clear all</button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block"><p className="text-sm font-semibold text-gray-900">superadmin</p><p className="text-xs text-gray-500">Admin</p></div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">A</div>
            </div>
          </div>
        </header>

        <div ref={contentRef} className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* ============ DASHBOARD ============ */}
          {activeNav === "dashboard" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardCards.map((card, i) => (
                  <div key={i} className={`${card.bg} rounded-xl p-5 border border-white/50 shadow-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${card.iconBg} rounded-lg w-12 h-12 flex items-center justify-center text-white shadow-md`}>
                        <card.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className={`text-2xl font-extrabold ${card.valueColor} mb-1`}>{card.value}</p>
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Second Row Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { bg: "bg-gradient-to-br from-yellow-50 to-yellow-100", icon: Clock, iconColor: "text-yellow-600", value: stats?.pendingOrders ?? 0, label: "Pending" },
                  { bg: "bg-gradient-to-br from-green-50 to-green-100", icon: CheckCircle2, iconColor: "text-green-600", value: stats?.completedOrders ?? 0, label: "Completed" },
                  { bg: "bg-gradient-to-br from-blue-50 to-blue-100", icon: Truck, iconColor: "text-blue-600", value: stats?.inCourier ?? 0, label: "In Courier" },
                  { bg: "bg-gradient-to-br from-red-50 to-red-100", icon: XCircle, iconColor: "text-red-600", value: stats?.cancelledOrders ?? 0, label: "Cancelled" },
                ].map((card, i) => (
                  <div key={i} className={`${card.bg} rounded-xl p-4 border border-white/50 shadow-sm flex items-center gap-4`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/80 shadow-sm`}>
                      <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-gray-800">{card.value}</span>
                      <p className="text-sm font-medium text-gray-600">{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sales Analytics & Inventory Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sales Analytics */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Sales Analytics</h3>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2 px-4">
                    {salesBars.map((data, i) => {
                      const height = (Number(data.sales || 0) / maxSales) * 100;
                      return (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-orange-400 rounded-t transition-all hover:bg-orange-500" 
                            style={{ height: `${height}%` }}
                          ></div>
                          <p className="text-[10px] text-gray-500 mt-2 text-center">{data.month.slice(0, 3)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inventory Alerts */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Inventory Alerts
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {inventoryAlerts.length > 0 ? inventoryAlerts.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'out' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                        <p className="text-xs text-gray-600 flex-1 truncate">{item.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${item.status === 'out' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.status === 'out' ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </div>
                    )) : <p className="text-xs text-gray-400 text-center py-4">Stock Normal</p>}
                  </div>
                </div>
              </div>

              {/* Top Selling Products & Quick Links */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Selling Products */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Top Selling Products</h3>
                  </div>
                  <div className="space-y-3">
                    {topSellingProducts.length > 0 ? topSellingProducts.map((product, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-xs text-gray-700 truncate">{product.name}</p>
                            <p className="text-[10px] text-gray-400">{product.sales} sold</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-yellow-600">${Number(product.price || 0).toLocaleString()}</span>
                      </div>
                    )) : <p className="text-xs text-gray-400 text-center py-4">No sales yet</p>}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Add Product", icon: Package, bg: "bg-yellow-100 text-yellow-700" },
                      { label: "View Orders", icon: ShoppingCart, bg: "bg-blue-100 text-blue-700" },
                      { label: "Categories", icon: Layers, bg: "bg-orange-100 text-orange-700" },
                      { label: "Coupons", icon: Tags, bg: "bg-green-100 text-green-700" },
                    ].map((link, i) => (
                      <button key={i} className={`${link.bg} rounded-lg p-3 text-center hover:opacity-80 transition-all`}>
                        <link.icon className="w-5 h-5 mx-auto mb-1" />
                        <p className="text-xs font-medium">{link.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Recent Orders</h3>
                  <button className="text-xs text-orange-500 hover:text-orange-600">View All →</button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {recentDashboardOrders.length > 0 ? recentDashboardOrders.map((order, i) => (
                      <tr key={order._id || i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 font-mono text-gray-600 text-[10px]">{order.orderId || "—"}</td>
                        <td className="py-2 text-gray-700">{order.customer?.name || "Unknown"}</td>
                        <td className="py-2 text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US") : "—"}</td>
                        <td className="py-2 font-bold text-gray-700">${Number(order.totalAmount || 0).toLocaleString()}</td>
                        <td className="py-2"><StatusBadge status={order.orderStatus || "pending"} /></td>
                        <td className="py-2 text-right">
                          <button onClick={() => setActiveNav("orders")} className="text-vision-blue hover:text-vision-cyan text-[10px] font-bold">View</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" className="py-6 text-center text-gray-400">No orders yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ USER MANAGEMENT ============ */}
          {activeNav === "users" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage admins and managers</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={loadUsers} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all"><RefreshCcw className="w-3.5 h-3.5" /> Refresh</button>
                  <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                    <UserPlus className="w-4 h-4" /> New Admin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { bg: "from-blue-50 to-blue-100", icon: Users, iconBg: "bg-blue-500", value: users.length, label: "Total Admins" },
                  { bg: "from-green-50 to-green-100", icon: CheckCircle2, iconBg: "bg-green-500", value: users.filter(u => u.isActive !== false).length, label: "Active" },
                  { bg: "from-red-50 to-red-100", icon: XCircle, iconBg: "bg-red-400", value: users.filter(u => u.isActive === false).length, label: "Inactive" },
                ].map((card, i) => (
                  <div key={i} className={`bg-gradient-to-br ${card.bg} rounded-2xl p-4 border border-white/50 shadow-sm flex items-center gap-3`}>
                    <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-md`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">{card.value}</p>
                      <p className="text-xs font-medium text-gray-500">{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="Search name, email or username..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["User", "Username", "Email", "Role", "Status", "Created Date", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.filter(u => !userSearch || u.name?.includes(userSearch) || u.email?.includes(userSearch) || u.username?.includes(userSearch)).map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-vision-blue/10 to-vision-cyan/10 rounded-xl flex items-center justify-center">
                              <span className="text-sm font-extrabold text-vision-blue">{(user.name || user.username || "A").charAt(0).toUpperCase()}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">{user.name || user.username}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-gray-500">{user.username || "—"}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{user.email || "—"}</td>
                        <td className="px-5 py-4"><StatusBadge status={user.role || "admin"} /></td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleUserToggleStatus(user._id, user.isActive !== false)} className="cursor-pointer">
                            <StatusBadge status={user.isActive !== false ? "active" : "inactive"} />
                          </button>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US") : "—"}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => setEditUser({ ...user })} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">No users yet — check if server is running</td></tr>}
                  </tbody>
                </table>
              </div>

              <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
                {editUser && (
                  <div className="space-y-4">
                    {[["name","Name"], ["email","Email"], ["phone","Phone"]].map(([field, label]) => (
                      <label key={field} className="space-y-1.5 block">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                        <input value={editUser[field] || ""} onChange={(e) => setEditUser({ ...editUser, [field]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
                      </label>
                    ))}
                    <label className="space-y-1.5 block">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role</span>
                      <select value={editUser.role || "admin"} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-vision-blue/50 bg-white">
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditUser(null)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                      <button onClick={handleUpdateUser} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">Update</button>
                    </div>
                  </div>
                )}
              </Modal>
              <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="New Admin">
                <AddUserForm onSuccess={() => { setShowAddUser(false); loadUsers(); }} />
              </Modal>
            </div>
          )}

          {/* ============ PRODUCT MANAGEMENT ============ */}
          {activeNav === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Product Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Add, edit, update prices, and manage products · <span className="font-bold text-gray-700">{products.length} product{products.length !== 1 ? "s" : ""}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => { setEditProduct({ name: "", model: "", price: "", originalPrice: "", category: "", subcategory: "", description: "", specs: "", stock: 10, lowStockThreshold: 5, isActive: true, color: "#0b3474", priceOptions: [] }); setShowAddProduct(true); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                    <Plus className="w-4 h-4" /> New Product
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search name, model, or ID..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
                    <option value="all">All Categories</option>
                    {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <input type="date" id="prod-date-from" className="bg-transparent border-none outline-none text-xs text-gray-600" title="From date" />
                  <span className="text-gray-300">—</span>
                  <input type="date" id="prod-date-to" className="bg-transparent border-none outline-none text-xs text-gray-600" title="To date" />
                </div>
              </div>
              {/* Bulk delete bar */}
              {productSelected.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <span className="text-xs font-bold text-red-700">{productSelected.length} product(s) selected</span>
                  <button disabled={productBulkDeleting} onClick={async () => {
                    if (!window.confirm(`Delete ${productSelected.length} product(s)? This cannot be undone.`)) return;
                    setProductBulkDeleting(true);
                    const token = localStorage.getItem("token");
                    const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await Promise.all(productSelected.map(id => fetch(`${API}/products/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} })));
                    setProductSelected([]);
                    setProductBulkDeleting(false);
                    loadProducts();
                  }} className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />{productBulkDeleting ? "Deleting..." : "Delete Selected"}
                  </button>
                  <button onClick={() => setProductSelected([])} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-4 text-left">
                        <input type="checkbox" className="rounded"
                          checked={products.length > 0 && productSelected.length === products.length}
                          onChange={e => setProductSelected(e.target.checked ? products.map(p => p.id || p._id) : [])} />
                      </th>
                      {["Product", "Model", "Price", "Original Price", "Category", "Stock", "Status", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 7 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.filter(p => {
                      const matchesSearch = !productSearch || p.name?.includes(productSearch) || p.model?.includes(productSearch) || p.id?.includes(productSearch);
                      const matchesCat = productCategoryFilter === "all" || p.category === productCategoryFilter;
                      const from = document.getElementById("prod-date-from")?.value;
                      const to = document.getElementById("prod-date-to")?.value;
                      const d = p.createdAt ? new Date(p.createdAt) : null;
                      const matchesDate = !d || ((!from || d >= new Date(from)) && (!to || d <= new Date(to + "T23:59:59")));
                      return matchesSearch && matchesCat && matchesDate;
                    }).map((product) => {
                      const pid = product.id || product._id;
                      const stockVal = product.stock !== undefined ? product.stock : 10;
                      const threshold = product.lowStockThreshold || 5;
                      return (
                        <tr key={pid} className={`hover:bg-gray-50 transition-colors ${productSelected.includes(pid) ? "bg-red-50/40" : ""}`}>
                          <td className="px-4 py-4">
                            <input type="checkbox" className="rounded"
                              checked={productSelected.includes(pid)}
                              onChange={e => setProductSelected(s => e.target.checked ? [...s, pid] : s.filter(x => x !== pid))} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" />}
                              </div>
                              <div><p className="text-sm font-bold text-gray-900">{product.name}</p><p className="text-[10px] text-gray-400">{product.id}</p></div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600">{product.model}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-extrabold text-emerald-600">${Number(product.price).toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-4">
                            {product.originalPrice > 0 ? (
                              <span className="text-xs text-gray-400 line-through">${Number(product.originalPrice).toLocaleString()}</span>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] font-semibold text-vision-blue bg-vision-blue/5 px-2.5 py-1 rounded-lg">{product.category}</span>
                            <span className="text-[10px] text-gray-400 ml-1">/ {product.subcategory}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <StockBadge stock={stockVal} threshold={threshold} />
                              <span className="text-xs font-bold text-gray-600">{stockVal}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={product.isActive !== false ? "active" : "inactive"} /></td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => { setEditProduct({ ...product }); setShowAddProduct(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(pid)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && <tr><td colSpan="9" className="text-center py-12 text-gray-400 text-xs">No products yet</td></tr>}
                  </tbody>
                </table>
              </div>
              {/* Add/Edit Product Modal */}
              <Modal isOpen={showAddProduct} onClose={() => { setShowAddProduct(false); setEditProduct(null); }} title={editProduct?.id ? "Edit Product" : "Add New Product"} size="xl">
                {editProduct && (
                  <ProductForm product={editProduct} categories={productCategories} onSave={handleSaveProduct} onCancel={() => { setShowAddProduct(false); setEditProduct(null); }} isEdit={!!editProduct?.id} />
                )}
              </Modal>
            </div>
          )}

          {/* ============ STOCK MANAGEMENT ============ */}
          {activeNav === "stock-management" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Stock Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Track and update product stock</p>
                </div>
                <button onClick={() => { loadStockProducts(); loadStockAlerts(); }} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* Real Stats from DB */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { bg: "bg-white border border-gray-100", icon: Package, iconBg: "bg-orange-50", iconColor: "text-orange-500", value: stockAlerts.total || stockProducts.length, label: "Total Products" },
                  { bg: "bg-yellow-50 border border-yellow-100", icon: AlertTriangle, iconBg: "bg-yellow-100", iconColor: "text-yellow-600", value: (stockAlerts.lowStock || []).length, label: "Low Stock" },
                  { bg: "bg-red-50 border border-red-100", icon: XCircle, iconBg: "bg-red-100", iconColor: "text-red-500", value: (stockAlerts.outOfStock || []).length, label: "Out of Stock" },
                ].map((card, i) => (
                  <div key={i} className={`${card.bg} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
                    <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                      <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900">{card.value}</p>
                      <p className="text-xs font-semibold text-gray-400">{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Low Stock Alerts */}
              {(stockAlerts.lowStock || []).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-yellow-700 mb-3 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alert</p>
                  <div className="flex flex-wrap gap-2">
                    {(stockAlerts.lowStock || []).map((p, i) => (
                      <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[11px] font-bold">{p.name} — {p.stock}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search by product name or model..." value={stockSearch} onChange={(e) => { setStockSearch(e.target.value); }} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                </div>
                <select value={stockStatusFilter} onChange={(e) => setStockStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-600 outline-none">
                  <option value="all">All Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
                <input type="date" value={stockDateFrom} onChange={e => setStockDateFrom(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 outline-none" title="Added from" />
                <input type="date" value={stockDateTo} onChange={e => setStockDateTo(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 outline-none" title="Added to" />
                <button onClick={() => { loadStockProducts(); }} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2.5 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all"><Search className="w-3.5 h-3.5" /> Search</button>
              </div>

              {/* Bulk delete bar */}
              {stockSelected.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <span className="text-xs font-bold text-red-700">{stockSelected.length} product(s) selected</span>
                  <button disabled={stockBulkDeleting} onClick={async () => {
                    if (!window.confirm(`Delete ${stockSelected.length} product(s)? This cannot be undone.`)) return;
                    setStockBulkDeleting(true);
                    const token = localStorage.getItem("token");
                    const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await Promise.all(stockSelected.map(id => fetch(`${API}/dashboard/products/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} })));
                    setStockSelected([]);
                    setStockBulkDeleting(false);
                    loadStockProducts();
                  }} className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />{stockBulkDeleting ? "Deleting..." : "Delete Selected"}
                  </button>
                  <button onClick={() => setStockSelected([])} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              )}

              {/* Real Products Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-4 text-left">
                        <input type="checkbox" checked={stockProducts.length > 0 && stockSelected.length === stockProducts.length}
                          onChange={e => setStockSelected(e.target.checked ? stockProducts.map(p => p._id || p.id) : [])}
                          className="rounded" />
                      </th>
                      {["Product", "Categories", "Price ($)", "Stock", "Status", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 5 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs">
                    {stockProducts.map((p) => {
                      const pid = p._id || p.id;
                      const isOut = (p.stock ?? 0) === 0;
                      const isLow = !isOut && (p.stock ?? 0) <= (p.lowStockThreshold || 5);
                      return (
                        <tr key={pid} className={`hover:bg-gray-50 transition-colors ${stockSelected.includes(pid) ? "bg-red-50/40" : ""}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={stockSelected.includes(pid)}
                              onChange={e => setStockSelected(s => e.target.checked ? [...s, pid] : s.filter(x => x !== pid))}
                              className="rounded" />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {p.image ? <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg border border-gray-100" /> : <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>}
                              <div><p className="font-bold text-gray-900 truncate max-w-[180px]">{p.name}</p><p className="text-[10px] text-gray-400">{p.model}</p></div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-500">{p.category || "—"}</td>
                          <td className="px-5 py-3 font-bold text-gray-900">{Number(p.price).toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <span className={`text-sm font-extrabold ${isOut ? "text-red-600" : isLow ? "text-yellow-600" : "text-gray-900"}`}>{p.stock ?? 0}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isOut ? "bg-red-100 text-red-700" : isLow ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                              {isOut ? "Out of Stock" : isLow ? "Low Stock" : "Normal"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { setAdjustStockProduct(p); setShowStockAdjust(true); }} className="px-3 py-1.5 bg-vision-blue/10 text-vision-blue rounded-lg text-[10px] font-bold hover:bg-vision-blue/20 transition-all">Update Stock</button>
                          </td>
                        </tr>
                      );
                    })}
                    {stockProducts.length === 0 && (
                      <tr><td colSpan="7" className="text-center py-12 text-gray-400">No products yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* ============ CATEGORY MANAGEMENT ============ */}
          {activeNav === "category-management" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Category Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Add, edit and manage categories and subcategories</p>
                </div>
                <button onClick={() => { setEditCategory({ id: "", name: "", shortName: "", description: "", tagline: "", accent: "#0b3474", subcategories: [], sortOrder: categories.length + 1, isActive: true }); setShowAddCategory(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                  <Plus className="w-4 h-4" /> New Category
                </button>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="Search category name..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {categories.filter(c => !categorySearch || c.name?.includes(categorySearch)).map((cat) => (
                  <div key={cat._id || cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: cat.accent || "#0b3474" }}>
                          {cat.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                          <p className="text-[10px] text-gray-400">{cat.shortName} • Sort: {cat.sortOrder}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={cat.isActive !== false ? "active" : "inactive"} />
                        <button onClick={() => { setEditCategory({ ...cat }); setShowAddCategory(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id || cat._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subcategories ({cat.subcategories?.length || 0})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(cat.subcategories || []).map(sc => (
                          <span key={sc.id} className="text-[10px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">{sc.name}</span>
                        ))}
                        {(!cat.subcategories || cat.subcategories.length === 0) && <span className="text-xs text-gray-400">No subcategories</span>}
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
                      <p className="text-[10px] text-gray-400">{cat.description || "No description"}</p>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-400">No categories yet</p>
                  </div>
                )}
              </div>

              {/* Add/Edit Category Modal */}
              <Modal isOpen={showAddCategory} onClose={() => { setShowAddCategory(false); setEditCategory(null); }} title={(editCategory?._id || editCategory?.id) ? "Edit Category" : "New Category"} size="lg">
                {editCategory && (
                  <CategoryForm category={editCategory} onSave={handleSaveCategory} onCancel={() => { setShowAddCategory(false); setEditCategory(null); }} isEdit={!!(editCategory?._id || editCategory?.id)} />
                )}
              </Modal>
            </div>
          )}

          {/* ============ ORDER MANAGEMENT ============ */}
          {activeNav === "orders" && (
            <OrderManagement
              orders={orders}
              loadOrders={loadOrders}
              orderSearch={orderSearch} setOrderSearch={setOrderSearch}
              orderFilter={orderFilter} setOrderFilter={setOrderFilter}
              orderPage={orderPage} setOrderPage={setOrderPage}
              ordersPagination={ordersPagination}
              handleOrderStatusUpdate={handleOrderStatusUpdate}
              viewOrder={viewOrder} setViewOrder={setViewOrder}
            />
          )}

          {/* ============ PRICE EDIT ============ */}
          {activeNav === "price-edit" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Price Edit</h3>
                  <p className="text-sm text-gray-500 mt-1">Edit product prices and do bulk price updates</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><RefreshCcw className="w-4 h-4" /> Refresh</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-left">Categories</th><th className="px-4 py-3 text-left">Sale Price</th><th className="px-4 py-3 text-left">Original Price</th><th className="px-4 py-3 text-left">Stock</th><th className="px-4 py-3 text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-semibold text-gray-800">{product.name}<p className="text-[11px] text-gray-400">{product.model}</p></td>
                        <td className="px-4 py-3 text-gray-500">{product.category}</td>
                        <td className="px-4 py-3"><input type="number" value={product.price || ""} onChange={(e) => handleInlinePriceChange(product.id, "price", e.target.value)} className="w-28 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-vision-blue" /></td>
                        <td className="px-4 py-3"><input type="number" value={product.originalPrice || ""} onChange={(e) => handleInlinePriceChange(product.id, "originalPrice", e.target.value)} className="w-28 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-vision-blue" /></td>
                        <td className="px-4 py-3"><input type="number" value={product.stock ?? 0} onChange={(e) => handleInlinePriceChange(product.id, "stock", e.target.value)} className="w-24 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-vision-blue" /></td>
                        <td className="px-4 py-3 text-right"><button onClick={() => handleSaveInlinePrice(product)} className="px-4 py-2 rounded-lg bg-vision-blue text-white text-xs font-bold hover:bg-vision-cyan">Save</button></td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-400">No products yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ MARKETING ============ */}
          {activeNav === "marketing" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Marketing Overview</h3>
                  <p className="text-sm text-gray-500 mt-1">Sales, promotions and campaigns at a glance</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveNav("coupons")} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all"><TicketPercent className="w-4 h-4" /> Create Coupon</button>
                </div>
              </div>

              {/* Sales Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { bg: "from-emerald-50 to-emerald-100", icon: DollarSign, iconBg: "bg-emerald-500", value: formatTk(stats?.totalSales), label: "Total Sales", sub: "All Orders" },
                  { bg: "from-blue-50 to-blue-100", icon: ShoppingCart, iconBg: "bg-blue-500", value: stats?.totalOrders || 0, label: "Total Orders", sub: "All Time" },
                  { bg: "from-purple-50 to-purple-100", icon: Users, iconBg: "bg-purple-500", value: stats?.totalCustomers || 0, label: "Total Customers", sub: "Unique Phones" },
                  { bg: "from-orange-50 to-orange-100", icon: TrendingUp, iconBg: "bg-orange-500", value: formatTk(stats?.monthlyRevenue), label: "Monthly Revenue", sub: "This Month" },
                ].map((card, i) => (
                  <div key={i} className={`bg-gradient-to-br ${card.bg} rounded-2xl p-4 border border-white/50 shadow-sm`}>
                    <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-md mb-3`}><card.icon className="w-5 h-5" /></div>
                    <p className="text-xl font-extrabold text-gray-900">{card.value}</p>
                    <p className="text-xs font-bold text-gray-600">{card.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Active Promotions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: TicketPercent, iconBg: "bg-pink-500", bg: "from-pink-50 to-rose-50 border-pink-100", value: marketingCounts.coupons, label: "Active Coupons", nav: "coupons", btn: "Manage" },
                  { icon: Image, iconBg: "bg-indigo-500", bg: "from-indigo-50 to-blue-50 border-indigo-100", value: marketingCounts.banners, label: "Active Banners", nav: "banners", btn: "Manage" },
                ].map((item, i) => (
                  <div key={i} className={`bg-gradient-to-br ${item.bg} rounded-2xl border p-5 flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center text-white shadow-md`}><item.icon className="w-6 h-6" /></div>
                      <div>
                        <p className="text-2xl font-extrabold text-gray-900">{item.value}</p>
                        <p className="text-xs font-bold text-gray-600">{item.label}</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveNav(item.nav)} className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-gray-600 hover:text-vision-blue border border-gray-200 hover:border-vision-blue/30 transition-all shadow-sm">{item.btn} →</button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Promoted Products */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-sm">Promoted Products</h4>
                    <button onClick={() => setActiveNav("products")} className="text-[10px] font-bold text-vision-blue hover:text-vision-cyan">View All →</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {products.filter(p => p.featured || p.isBestSeller || p.isNewArrival).slice(0, 5).map((p) => (
                      <div key={p.id || p._id} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {p.featured && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Featured</span>}
                            {p.isBestSeller && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">Best Seller</span>}
                            {p.isNewArrival && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">New</span>}
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 flex-shrink-0">${Number(p.price).toLocaleString()}</span>
                      </div>
                    ))}
                    {products.filter(p => p.featured || p.isBestSeller || p.isNewArrival).length === 0 && (
                      <div className="px-5 py-8 text-center text-gray-400 text-xs">
                        <Tag className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        No promoted products yet<br />
                        <button onClick={() => setActiveNav("products")} className="text-vision-blue font-bold mt-1 hover:underline">Add tags to products →</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Selling + Quick Actions */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100"><h4 className="font-bold text-gray-900 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-500" /> Top Selling Products</h4></div>
                    <div className="divide-y divide-gray-50">
                      {topSellingProducts.slice(0, 4).map((p, i) => (
                        <div key={i} className="px-5 py-3 flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-extrabold text-gray-500">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                            <p className="text-[10px] text-gray-400">{p.sales} sold</p>
                          </div>
                          <span className="text-xs font-extrabold text-vision-blue flex-shrink-0">${Number(p.revenue || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      {topSellingProducts.length === 0 && <div className="px-5 py-6 text-center text-xs text-gray-400">No sales data yet</div>}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Coupons", nav: "coupons", icon: TicketPercent, color: "text-pink-600 bg-pink-50 hover:bg-pink-100" },
                        { label: "Banners", nav: "banners", icon: Image, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
                        { label: "Price Edit", nav: "price-edit", icon: Banknote, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
                        { label: "Product Tags", nav: "products", icon: Tag, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
                        { label: "Orders", nav: "orders", icon: ShoppingCart, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
                      ].map((a) => (
                        <button key={a.nav} onClick={() => setActiveNav(a.nav)} className={`${a.color} rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs font-bold transition-all`}>
                          <a.icon className="w-4 h-4 flex-shrink-0" />{a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ COUPONS ============ */}
          {activeNav === "coupons" && (
            <CouponManager />
          )}

          {/* ============ BANNERS ============ */}
          {activeNav === "banners" && (
            <BannerManager />
          )}

          {/* ============ SHIPPING CHARGE ============ */}
          {activeNav === "shipping-charge" && <ShippingManager />}

          {/* ============ PAYMENT SETTINGS ============ */}
          {activeNav === "payment-settings" && <PaymentSettingsManager />}

          {/* ============ FACEBOOK PIXEL ============ */}
          {activeNav === "facebook-pixel" && <PixelManager />}

          {/* ============ TRACKING PIXEL ============ */}
          {activeNav === "tracking-pixel" && <PixelManager />}

          {/* ============ ANALYTICS ============ */}
          {activeNav === "analytics" && <PixelManager />}

          {/* ============ SMTP EMAIL ============ */}
          {activeNav === "smtp-email" && <SmtpManager />}

          {/* ============ GENERAL SETTINGS ============ */}
          {activeNav === "general-settings" && <GeneralSettingsManager />}

          {/* ============ FRONTEND CONTENT ============ */}
          {activeNav === "frontend-content" && <FrontendContentManager />}

          {/* ============ FILTER SETTINGS ============ */}
          {activeNav === "filter-settings" && <FilterSettingsManager />}

          {/* ============ SITE SETTINGS ============ */}
          {activeNav === "site-settings" && (
            <SiteSettings />
          )}

          {/* ============ CONTACT MESSAGES ============ */}
          {activeNav === "contact-messages" && <ContactMessagesManager />}

          {/* ============ PAGE MANAGEMENT ============ */}
          {activeNav === "page-management" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Page Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage website pages</p>
                </div>
                <button onClick={() => { setEditPage({ name: "", title: "", content: "", isActive: true }); setShowAddPage(true); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                  <Plus className="w-4 h-4" /> Add New Page
                </button>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="Search by page name or title..." value={pageSearch} onChange={(e) => setPageSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["#", "Name", "Title", "Slug", "Status", "Created Date", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pages.filter(p => !pageSearch || p.name?.includes(pageSearch) || p.title?.includes(pageSearch)).map((page, index) => (
                      <tr key={page._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4"><span className="text-xs font-semibold text-gray-400">{String(index + 1).padStart(2, '0')}</span></td>
                        <td className="px-5 py-4"><span className="text-xs font-bold text-gray-900">{page.name}</span></td>
                        <td className="px-5 py-4"><span className="text-xs text-gray-500">{page.title}</span></td>
                        <td className="px-5 py-4"><code className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">{page.slug}</code></td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleTogglePageStatus(page._id, page.isActive)} className="cursor-pointer">
                            <StatusBadge status={page.isActive ? "active" : "inactive"} />
                          </button>
                        </td>
                        <td className="px-5 py-4"><span className="text-xs text-gray-400">{page.createdAt ? new Date(page.createdAt).toLocaleDateString("en-US") : "—"}</span></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setEditPage(page); setShowAddPage(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeletePage(page._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pages.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">No pages yet</td></tr>}
                  </tbody>
                </table>
              </div>
              <Modal isOpen={showAddPage} onClose={() => { setShowAddPage(false); setEditPage(null); }} title={editPage?._id ? "Edit Page" : "New Page"}>
                {editPage && (
                  <div className="space-y-4">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</span>
                      <input value={editPage.name} onChange={(e) => setEditPage({ ...editPage, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="Page name" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Title</span>
                      <input value={editPage.title} onChange={(e) => setEditPage({ ...editPage, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="Page title" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Content</span>
                      <textarea value={editPage.content} onChange={(e) => setEditPage({ ...editPage, content: e.target.value })} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="Page Content" />
                    </label>
                    {editPage._id && (
                      <label className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</span>
                        <button onClick={() => setEditPage({ ...editPage, isActive: !editPage.isActive })} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editPage.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {editPage.isActive ? "Active" : "Inactive"}
                        </button>
                      </label>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => { setShowAddPage(false); setEditPage(null); }} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                      <button onClick={handleSavePage} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">{editPage._id ? "Update" : "Create"}</button>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          )}
        </div>

        {/* ===== STOCK ADJUST MODAL ===== */}
        <Modal isOpen={showStockAdjust} onClose={() => { setShowStockAdjust(false); setAdjustStockProduct(null); setStockAdjustForm({ type: "add", quantity: "", reason: "" }); }} title="Update Stock" size="sm">
          {adjustStockProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                {adjustStockProduct.image ? <img src={adjustStockProduct.image} alt={adjustStockProduct.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-gray-400" /></div>}
                <div>
                  <p className="font-bold text-sm text-gray-900">{adjustStockProduct.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Current Stock: <span className="font-extrabold text-vision-blue">{adjustStockProduct.stock ?? 0}</span></p>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Operation</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["add","Add","green"],["subtract","Subtract","red"],["set","Set","blue"]].map(([t, l, c]) => (
                    <button key={t} onClick={() => setStockAdjustForm(f => ({ ...f, type: t }))} className={`py-2 rounded-xl border text-xs font-bold transition-all ${stockAdjustForm.type === t ? `bg-${c}-50 text-${c}-700 border-${c}-300` : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Quantity *</label>
                <input type="number" min="0" value={stockAdjustForm.quantity} onChange={e => setStockAdjustForm(f => ({ ...f, quantity: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="0" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Reason</label>
                <input value={stockAdjustForm.reason} onChange={e => setStockAdjustForm(f => ({ ...f, reason: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="Enter reason for stock change..." />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowStockAdjust(false); setAdjustStockProduct(null); setStockAdjustForm({ type: "add", quantity: "", reason: "" }); }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleStockAdjust} disabled={!stockAdjustForm.quantity} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:shadow-lg transition-all">Update</button>
              </div>
            </div>
          )}
        </Modal>

        {/* ===== ORDER DETAIL MODAL ===== */}
        <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order Details — ${viewOrder?.orderId || ""}`} size="lg">
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Info</p>
                  <p className="text-sm font-bold text-gray-900">{viewOrder.customer?.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{viewOrder.customer?.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{viewOrder.customer?.address}</p>
                  {viewOrder.customer?.email && <p className="text-xs text-gray-500">{viewOrder.customer.email}</p>}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Order Info</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{new Date(viewOrder.createdAt).toLocaleDateString("en-US")}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-semibold uppercase">{viewOrder.paymentMethod || "COD"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={viewOrder.orderStatus} /></div>
                    {viewOrder.isFraudSuspected && <p className="text-red-600 font-bold mt-1">⚠️ Suspicious</p>}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-100">Product List</p>
                <div className="divide-y divide-gray-50">
                  {(viewOrder.items || []).map((item, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div><p className="text-xs font-bold text-gray-900">{item.name}</p><p className="text-[10px] text-gray-400">x{item.quantity}</p></div>
                      <span className="text-xs font-extrabold text-vision-blue">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">${((viewOrder.totalAmount || 0) - (viewOrder.deliveryCharge || 0) + (viewOrder.discount || 0)).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery Charge</span><span className="font-semibold">${viewOrder.deliveryCharge || 0}</span></div>
                {viewOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-semibold">-${viewOrder.discount}</span></div>}
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-extrabold text-gray-900"><span>Total</span><span>${viewOrder.totalAmount?.toLocaleString()}</span></div>
              </div>
              {viewOrder.notes && <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded-xl p-3">📝 {viewOrder.notes}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setViewOrder(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Close</button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

// ============================================================
// Product Form Component — Redesigned
// ============================================================
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-extrabold uppercase tracking-widest text-vision-blue mb-3 flex items-center gap-2">
    <span className="w-4 h-0.5 bg-vision-blue/30 rounded-full" />
    {children}
  </p>
);

const FormField = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-vision-blue/60 focus:ring-4 focus:ring-vision-blue/5 transition bg-white placeholder:text-gray-300";

const ProductForm = ({ product, categories, onSave, onCancel, isEdit }) => {
  // Initialize form with proper defaults
  const [form, setForm] = useState(() => {
    let initialPriceOptions = [];
    if (product?.priceOptions) {
      if (Array.isArray(product.priceOptions)) {
        initialPriceOptions = product.priceOptions;
      } else if (typeof product.priceOptions === 'string') {
        try {
          initialPriceOptions = JSON.parse(product.priceOptions);
        } catch {
          initialPriceOptions = [];
        }
      }
    }
    return {
      ...product,
      priceOptions: initialPriceOptions
    };
  });
  const [saving, setSaving] = useState(false);
  const [mainPreview, setMainPreview] = useState(product?.image || "");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState(() => {
    if (product?.images) {
      if (Array.isArray(product.images)) {
        return product.images;
      } else if (typeof product.images === 'string') {
        try {
          return JSON.parse(product.images);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (file) { setForm(f => ({ ...f, imageFile: file })); setMainPreview(URL.createObjectURL(file)); }
  };

  const handleGallery = (e) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
  };

  const removeExistingGallery = (index) => {
    setExistingGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("id", form.id || "");
      fd.append("name", form.name || "");
      fd.append("model", form.model || "");
      fd.append("price", form.price || 0);
      fd.append("originalPrice", form.originalPrice || 0);
      fd.append("category", form.category || "");
      fd.append("subcategory", form.subcategory || "");
      fd.append("description", form.description || "");
      fd.append("specs", form.specs || "");
      fd.append("visual", form.visual || "");
      fd.append("color", form.color || "#0b3474");
      fd.append("stock", form.stock ?? 10);
      fd.append("lowStockThreshold", form.lowStockThreshold ?? 5);
      fd.append("isActive", form.isActive !== false ? "true" : "false");
      fd.append("featured", form.featured ? "true" : "false");
      fd.append("isNewArrival", form.isNewArrival ? "true" : "false");
      fd.append("isBestSeller", form.isBestSeller ? "true" : "false");
      fd.append("priceOptions", JSON.stringify(form.priceOptions || []));
      fd.append("existingImages", JSON.stringify(existingGallery));
      if (form.imageFile) fd.append("image", form.imageFile);
      galleryFiles.forEach(f => fd.append("images", f));

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const url = isEdit ? `${API_URL}/products/${form.id}` : `${API_URL}/products`;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "Error saving product"); }
      onSave();
    } catch (error) {
      alert("❌ " + error.message);
    }
    setSaving(false);
  };

  const selectedCategory = categories.find(c => c.id === form.category);
  const subcategories = selectedCategory?.subcategories || [];
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto space-y-5 pr-1">

      {/* ── Images ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-4">
        <SectionLabel>Images</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          {/* Main image */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Main Image *</p>
            <label className="cursor-pointer block">
              <div className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${mainPreview ? "border-vision-blue/30 bg-white" : "border-gray-200 bg-white hover:border-vision-blue/40"}`}>
                {mainPreview ? (
                  <div className="relative aspect-square">
                    <img src={mainPreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-bold">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center gap-2 text-gray-300">
                    <Upload className="w-8 h-8" />
                    <p className="text-xs font-bold">Upload Image</p>
                    <p className="text-[10px]">Uploads to Cloudinary</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
            </label>
          </div>

          {/* Gallery */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Gallery Images</p>
            <label className="cursor-pointer block">
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-vision-blue/40 transition-all p-3 min-h-[80px] flex flex-wrap gap-1.5 items-start">
                {existingGallery.map((url, i) => (
                  <div key={`existing-${i}`} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.preventDefault(); removeExistingGallery(i); }}
                      className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl-lg text-[9px] flex items-center justify-center">×</button>
                  </div>
                ))}
                {galleryFiles.map((file, i) => (
                  <div key={`new-${i}`} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.preventDefault(); setGalleryFiles(p => p.filter((_, idx) => idx !== i)); }}
                      className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl-lg text-[9px] flex items-center justify-center">×</button>
                  </div>
                ))}
                <div className="w-full flex flex-col items-center justify-center gap-1 text-gray-300 py-4">
                  <Plus className="w-6 h-6" />
                  <p className="text-[10px] font-bold">Multiple Images</p>
                </div>
              </div>
              <input type="file" accept="image/*" multiple onChange={handleGallery} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>Basic Info</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Product Name" required>
            <input className={inputCls} value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="Vision SmartView 43" required />
          </FormField>
          <FormField label="Model Number" required>
            <input className={inputCls} value={form.model || ""} onChange={e => set("model", e.target.value)} placeholder="VSV-43S" required />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Categories" required>
            <select className={inputCls} value={form.category || ""} onChange={e => set("category", e.target.value)} required>
              <option value="">Select...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Subcategory">
            <select className={inputCls} value={form.subcategory || ""} onChange={e => set("subcategory", e.target.value)}>
              <option value="">Select...</option>
              {subcategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Description">
          <textarea className={inputCls} rows={2} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Brief product description..." />
        </FormField>
        <FormField label="Specifications (comma separated)">
          <input className={inputCls} value={form.specs || ""} onChange={e => set("specs", e.target.value)} placeholder="43 inch, Full HD, Wifi, Bluetooth" />
        </FormField>
      </div>

      {/* ── Pricing ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>Price &amp; Color</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Sale Price ($)" required>
            <input className={inputCls} type="number" value={form.price || ""} onChange={e => set("price", e.target.value)} placeholder="25000" required />
          </FormField>
          <FormField label="Original Price ($)">
            <input className={inputCls} type="number" value={form.originalPrice || ""} onChange={e => set("originalPrice", e.target.value)} placeholder="28000" />
          </FormField>
        </div>
        <FormField label="Brand Color">
          <div className="flex items-center gap-3">
            <input type="color" value={form.color || "#0b3474"} onChange={e => set("color", e.target.value)}
              className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer flex-shrink-0 p-0.5" />
            <input className={inputCls} value={form.color || "#0b3474"} onChange={e => set("color", e.target.value)} placeholder="#0b3474" />
          </div>
        </FormField>
      </div>

      {/* ── Inventory ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>Inventory</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Stock Quantity">
            <input className={inputCls} type="number" value={form.stock ?? 10} onChange={e => set("stock", Number(e.target.value))} />
          </FormField>
          <FormField label="Low Stock Threshold">
            <input className={inputCls} type="number" value={form.lowStockThreshold ?? 5} onChange={e => set("lowStockThreshold", Number(e.target.value))} />
          </FormField>
        </div>
      </div>

      {/* ── Price Options ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>Price Options (Variants)</SectionLabel>
        <p className="text-[10px] text-gray-400 -mt-1">Add variants if applicable (e.g., Hot &amp; Cold, Storage Cabinet)</p>
        {(form.priceOptions || []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={opt.label || ""}
              onChange={e => {
                const o = [...(form.priceOptions || [])];
                o[i] = { label: e.target.value, price: o[i].price || 0 };
                setForm(f => ({ ...f, priceOptions: o }));
              }}
              placeholder="Option name (e.g., 43 inch FHD)"
              className="flex-1 min-w-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-vision-blue/60 focus:ring-4 focus:ring-vision-blue/5 transition bg-white placeholder:text-gray-300"
            />
            <input
              type="number"
              value={opt.price || 0}
              onChange={e => {
                const o = [...(form.priceOptions || [])];
                o[i] = { label: o[i].label || "", price: Number(e.target.value) || 0 };
                setForm(f => ({ ...f, priceOptions: o }));
              }}
              placeholder="Price"
              className="w-32 flex-shrink-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-vision-blue/60 focus:ring-4 focus:ring-vision-blue/5 transition bg-white placeholder:text-gray-300"
            />
            <button 
              type="button" 
              onClick={() => setForm(f => ({ ...f, priceOptions: (f.priceOptions || []).filter((_, idx) => idx !== i) }))}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => setForm(f => ({ ...f, priceOptions: [...(f.priceOptions || []), { label: "", price: Number(f.price) || 0 }] }))}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:border-vision-blue hover:text-vision-blue transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Option
        </button>
      </div>

      {/* ── Tags ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4">
        <SectionLabel>Product Tags &amp; Status</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key:"isActive", label:"✓ Active", on:"bg-green-500 text-white shadow-green-200", off:"bg-white text-gray-500 border border-gray-200" },
            { key:"featured", label:"★ Featured", on:"bg-purple-500 text-white shadow-purple-200", off:"bg-white text-gray-500 border border-gray-200" },
            { key:"isNewArrival", label:"◆ New Arrival", on:"bg-blue-500 text-white shadow-blue-200", off:"bg-white text-gray-500 border border-gray-200" },
            { key:"isBestSeller", label:"⚑ Best Seller", on:"bg-amber-500 text-white shadow-amber-200", off:"bg-white text-gray-500 border border-gray-200" },
          ].map(tag => (
            <button key={tag.key} type="button" onClick={() => set(tag.key, !form[tag.key])}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all ${form[tag.key] ? tag.on + " shadow-md" : tag.off}`}>
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1 pb-2">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-vision-blue/25 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
          {saving ? <><RefreshCcw className="w-4 h-4 animate-spin"/> Saving...</> : isEdit ? "✓ Update Product" : "✓ Create Product"}
        </button>
      </div>
    </form>
  );
};

// ============================================================
// Category Form Component
// ============================================================
const CategoryForm = ({ category, onSave, onCancel, isEdit }) => {
  const [form, setForm] = useState({ ...category });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category?.image || "");
  const [newSubName, setNewSubName] = useState("");
  const [newSubId, setNewSubId] = useState("");
  const [newSubTagline, setNewSubTagline] = useState("");
  const [newSubBanner, setNewSubBanner] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const addSubcategory = () => {
    if (!newSubName || !newSubId) return;
    const subs = [...(form.subcategories || [])];
    subs.push({ id: newSubId, name: newSubName, tagline: newSubTagline, banner: newSubBanner || "" });
    setForm({ ...form, subcategories: subs });
    setNewSubName("");
    setNewSubId("");
    setNewSubTagline("");
    setNewSubBanner("");
  };

  const removeSubcategory = (id) => {
    setForm({ ...form, subcategories: (form.subcategories || []).filter(s => s.id !== id) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id?.trim()) { setSaveError("Category ID is required"); return; }
    if (!form.name?.trim()) { setSaveError("Category Name is required"); return; }
    setSaving(true); setSaveError("");
    try {
      const fd = new FormData();
      const fields = { id: form.id.trim(), name: form.name.trim(), shortName: form.shortName || "", tagline: form.tagline || "", description: form.description || "", accent: form.accent || "#0b3474", sortOrder: form.sortOrder || 0, isActive: form.isActive !== false ? "true" : "false" };
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      fd.append("subcategories", JSON.stringify(form.subcategories || []));
      if (imageFile) fd.append("image", imageFile);
      if (isEdit && form.imagePublicId) fd.append("oldImagePublicId", form.imagePublicId);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let res;
      if (isEdit) {
        res = await fetch(`${API_URL}/categories/${form.id.trim()}`, { method: "PUT", headers, body: fd });
      } else {
        res = await fetch(`${API_URL}/categories`, { method: "POST", headers, body: fd });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.message || `Server error (${res.status})`);
        setSaving(false);
        return;
      }
      onSave();
    } catch (error) {
      setSaveError(error.message || "Network error");
    }
    setSaving(false);
  };

  const catInputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-vision-blue/60 focus:ring-4 focus:ring-vision-blue/5 transition placeholder:text-gray-300";
  const CatSection = ({ icon, label }) => (
    <div className="flex items-center gap-2 mb-4 mt-1">
      <span className="text-base">{icon}</span>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-vision-blue">{label}</p>
      <div className="flex-1 h-px bg-gradient-to-r from-vision-blue/20 to-transparent rounded-full" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Image */}
      <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100">
        <CatSection icon="🖼️" label="Category Image" />
        <label className="cursor-pointer block">
          <div className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${imagePreview ? "border-vision-blue/30 bg-white" : "border-gray-200 bg-white hover:border-vision-blue/40"}`}>
            {imagePreview ? (
              <div className="relative h-32 flex items-center justify-center">
                <img src={imagePreview} alt="preview" className="h-full w-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <p className="text-white text-xs font-bold">Change Image</p>
                </div>
              </div>
            ) : (
              <div className="h-24 flex flex-col items-center justify-center gap-1.5 text-gray-300">
                <Upload className="w-6 h-6" />
                <p className="text-xs font-bold">Upload Image (Cloudinary)</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      {/* Basic Info */}
      <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100">
        <CatSection icon="🏷️" label="Basic Info" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Categories ID <span className="text-red-400">*</span></label>
            <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })}
              className={catInputCls} placeholder="e.g. ac, tv, fridge" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Short Name</label>
            <input value={form.shortName || ""} onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              className={catInputCls} placeholder="e.g. AC" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={catInputCls} placeholder="Full category name" required />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tagline</label>
            <input value={form.tagline || ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className={catInputCls} placeholder="Short tagline" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className={catInputCls + " resize-none"} placeholder="Detailed description..." />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100">
        <CatSection icon="🎨" label="Settings &amp; Color" />
        <div className="grid grid-cols-3 gap-3 items-end">
          <div className="col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Accent Color</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 focus-within:border-vision-blue/60 focus-within:ring-4 focus-within:ring-vision-blue/5 transition">
              <input type="color" value={form.accent || "#0b3474"} onChange={(e) => setForm({ ...form, accent: e.target.value })}
                className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0.5 bg-transparent" />
              <input value={form.accent || "#0b3474"} onChange={(e) => setForm({ ...form, accent: e.target.value })}
                className="flex-1 text-sm outline-none bg-transparent font-mono" placeholder="#0b3474" />
              <span className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ background: form.accent || "#0b3474" }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sort Order</label>
            <input type="number" value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className={catInputCls} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-gray-700">Status</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{form.isActive !== false ? "This category is active" : "This category is inactive"}</p>
          </div>
          <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.isActive !== false ? "bg-green-500" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${form.isActive !== false ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Subcategories */}
      <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100">
        <CatSection icon="📂" label="Subcategories" />
        {(form.subcategories || []).length > 0 && (
          <div className="space-y-2 mb-4">
            {(form.subcategories || []).map(sc => (
              <div key={sc.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vision-blue/10 to-vision-cyan/10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-vision-blue">{sc.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{sc.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{sc.id}{sc.tagline ? ` · ${sc.tagline}` : ""}</p>
                  </div>
                </div>
                <button type="button" onClick={() => removeSubcategory(sc.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-3 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add New Subcategory</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={newSubId} onChange={(e) => setNewSubId(e.target.value)} placeholder="ID (e.g. split-ac)"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50 bg-gray-50 focus:bg-white transition" />
            <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="Name"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50 bg-gray-50 focus:bg-white transition" />
            <input value={newSubTagline} onChange={(e) => setNewSubTagline(e.target.value)} placeholder="Tagline (optional)"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50 bg-gray-50 focus:bg-white transition" />
            <input value={newSubBanner} onChange={(e) => setNewSubBanner(e.target.value)} placeholder="Banner URL (optional)"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50 bg-gray-50 focus:bg-white transition" />
          </div>
          <button type="button" onClick={addSubcategory} disabled={!newSubName || !newSubId}
            className="w-full py-2 bg-gradient-to-r from-vision-blue/10 to-vision-cyan/10 text-vision-blue rounded-lg text-xs font-bold hover:from-vision-blue hover:to-vision-cyan hover:text-white disabled:opacity-40 transition-all border border-vision-blue/20 hover:border-transparent">
            + Add Subcategory
          </button>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-red-600">{saveError}</div>
      )}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" disabled={saving}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-vision-blue/25 disabled:opacity-50 transition-all">
          {saving ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

// ============================================================
// Add User Form Component
// ============================================================
const AddUserForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", phone: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) onSuccess();
    } catch (error) { console.error(error); }
    setSaving(false);
  };
  const fields = [
    { key: "name", label: "Name", placeholder: "Full name" },
    { key: "username", label: "Username", placeholder: "Username" },
    { key: "email", label: "Email", placeholder: "Email", type: "email" },
    { key: "password", label: "Password", placeholder: "Password", type: "password" },
    { key: "phone", label: "Phone", placeholder: "Phone number" },
  ];
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(f => (
        <label key={f.key} className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{f.label}</span>
          <input type={f.type || "text"} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder={f.placeholder} required />
        </label>
      ))}
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role</span>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5">
          <option value="admin">Admin</option><option value="superadmin">Super Admin</option>
        </select>
      </label>
      <button type="submit" disabled={saving} className="w-full px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">{saving ? "Saving..." : "Create User"}</button>
    </form>
  );
};

// ============================================================
// Shipping Manager Component
// ============================================================
const ShippingManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [zones, setZones] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState({ name: "", price: "" });

  useEffect(() => {
    fetch(`${API_URL}/settings/shipping`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data?.value?.zones)) setZones(data.value.zones); })
      .catch(() => {});
  }, []);

  const persistZones = async (updatedZones) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: { zones: updatedZones } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addZone = () => {
    if (!newZone.name.trim() || newZone.price === "") return;
    const updated = [...zones, { id: Date.now().toString(), name: newZone.name.trim(), price: Number(newZone.price) }];
    setZones(updated);
    setNewZone({ name: "", price: "" });
    persistZones(updated);
  };

  const deleteZone = (id) => {
    const updated = zones.filter(z => z.id !== id);
    setZones(updated);
    persistZones(updated);
  };

  const startEdit = (zone) => { setEditingId(zone.id); setEditVal({ name: zone.name, price: zone.price }); };
  const saveEdit = (id) => {
    const updated = zones.map(zone => zone.id === id ? { ...zone, name: editVal.name.trim(), price: Number(editVal.price) } : zone);
    setZones(updated);
    setEditingId(null);
    persistZones(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Shipping Zones</h3>
          <p className="text-sm text-gray-500 mt-1">Add delivery locations and prices — customers pick one at checkout</p>
        </div>
        <button onClick={() => persistZones(zones)} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : saving ? "Saving..." : <><Cog className="w-4 h-4" /> Save</>}
        </button>
      </div>

      {/* Add new zone */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h4 className="text-sm font-bold text-gray-700 mb-4">Add New Zone</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newZone.name}
            onChange={e => setNewZone(s => ({ ...s, name: e.target.value }))}
            placeholder="Zone name (e.g. New York, California)"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5"
            onKeyDown={e => e.key === "Enter" && addZone()}
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
            <input
              type="number"
              value={newZone.price}
              onChange={e => setNewZone(s => ({ ...s, price: e.target.value }))}
              placeholder="Price"
              className="w-32 rounded-xl border border-gray-200 pl-7 pr-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5"
              onKeyDown={e => e.key === "Enter" && addZone()}
            />
          </div>
          <button onClick={addZone} className="flex items-center gap-2 bg-vision-blue text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-vision-dark transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Zone
          </button>
        </div>
      </div>

      {/* Zone list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h4 className="font-bold text-gray-900 text-sm">Delivery Zones ({zones.length})</h4>
        </div>
        {zones.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No zones added yet. Add your first delivery zone above.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {zones.map(zone => (
              <div key={zone.id} className="flex items-center gap-4 px-5 py-4">
                {editingId === zone.id ? (
                  <>
                    <input
                      type="text"
                      value={editVal.name}
                      onChange={e => setEditVal(s => ({ ...s, name: e.target.value }))}
                      className="flex-1 rounded-lg border border-vision-blue/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-100"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        value={editVal.price}
                        onChange={e => setEditVal(s => ({ ...s, price: e.target.value }))}
                        className="w-24 rounded-lg border border-vision-blue/30 pl-6 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                    <button onClick={() => saveEdit(zone.id)} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-all">Save</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all">Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{zone.name}</p>
                    </div>
                    <p className="text-sm font-extrabold text-vision-blue">${Number(zone.price).toLocaleString()}</p>
                    <button onClick={() => startEdit(zone)} className="p-2 text-gray-400 hover:text-vision-blue transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteZone(zone.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Payment Settings Manager
// ============================================================
const PaymentSettingsManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paypal, setPaypal] = useState({ clientId: "", secret: "", isActive: false, isSandbox: true });
  const [stripe, setStripe] = useState({ publishableKey: "", secretKey: "", isActive: false });
  const [bankTransfer, setBankTransfer] = useState({ bankName: "", accountHolder: "", accountNumber: "", routingNumber: "", isActive: false });
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/payment-methods`).then(r => r.json()).then(d => {
      if (d?.value) {
        if (d.value.paypal) setPaypal(s => ({ ...s, ...d.value.paypal }));
        if (d.value.stripe) setStripe(s => ({ ...s, ...d.value.stripe }));
        if (d.value.bankTransfer) setBankTransfer(s => ({ ...s, ...d.value.bankTransfer }));
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/payment-methods`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: { paypal, stripe, bankTransfer } }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5";
  const labelCls = "text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Payment Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Configure payment gateways for US customers</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : saving ? "Saving..." : <><Cog className="w-4 h-4" /> Save</>}
        </button>
      </div>

      {/* PayPal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">PayPal</h4>
              <p className="text-[11px] text-gray-400">Accept PayPal and credit/debit card payments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPaypal(s => ({ ...s, isSandbox: !s.isSandbox }))}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${paypal.isSandbox ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
              {paypal.isSandbox ? "Sandbox" : "Live"}
            </button>
            <button type="button" onClick={() => setPaypal(s => ({ ...s, isActive: !s.isActive }))}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${paypal.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
              {paypal.isActive ? "Active" : "Inactive"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client ID *</label>
            <input type="text" value={paypal.clientId} onChange={e => setPaypal(s => ({ ...s, clientId: e.target.value }))} placeholder="PayPal Client ID" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Client Secret *</label>
            <div className="relative">
              <input type={showPaypalSecret ? "text" : "password"} value={paypal.secret} onChange={e => setPaypal(s => ({ ...s, secret: e.target.value }))} placeholder="PayPal Client Secret" className={inputCls + " pr-10"} />
              <button type="button" onClick={() => setShowPaypalSecret(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-[11px] text-blue-600 space-y-1">
          <p className="font-bold text-blue-700">Setup: developer.paypal.com → My Apps & Credentials → Create App</p>
          <p>Copy the Client ID and Secret. Use Sandbox for testing, switch to Live when ready.</p>
        </div>
      </div>

      {/* Stripe */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Stripe</h4>
              <p className="text-[11px] text-gray-400">Credit card, debit card, Apple Pay, Google Pay</p>
            </div>
          </div>
          <button type="button" onClick={() => setStripe(s => ({ ...s, isActive: !s.isActive }))}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${stripe.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {stripe.isActive ? "Active" : "Inactive"}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Publishable Key *</label>
            <input type="text" value={stripe.publishableKey} onChange={e => setStripe(s => ({ ...s, publishableKey: e.target.value }))} placeholder="pk_live_..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Secret Key *</label>
            <div className="relative">
              <input type={showStripeSecret ? "text" : "password"} value={stripe.secretKey} onChange={e => setStripe(s => ({ ...s, secretKey: e.target.value }))} placeholder="sk_live_..." className={inputCls + " pr-10"} />
              <button type="button" onClick={() => setShowStripeSecret(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div className="bg-violet-50 rounded-xl p-3 text-[11px] text-violet-600 space-y-1">
          <p className="font-bold text-violet-700">Setup: dashboard.stripe.com → Developers → API Keys</p>
          <p>Use keys starting with <code className="bg-violet-100 px-1 rounded">pk_test_</code> / <code className="bg-violet-100 px-1 rounded">sk_test_</code> for testing, <code className="bg-violet-100 px-1 rounded">pk_live_</code> / <code className="bg-violet-100 px-1 rounded">sk_live_</code> for production.</p>
        </div>
      </div>

      {/* US Bank Transfer */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">US Bank Transfer (ACH)</h4>
              <p className="text-[11px] text-gray-400">Direct bank transfer via routing & account number</p>
            </div>
          </div>
          <button type="button" onClick={() => setBankTransfer(s => ({ ...s, isActive: !s.isActive }))}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${bankTransfer.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {bankTransfer.isActive ? "Active" : "Inactive"}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Bank Name *</label>
            <input type="text" value={bankTransfer.bankName} onChange={e => setBankTransfer(s => ({ ...s, bankName: e.target.value }))} placeholder="e.g. Bank of America" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Account Holder Name *</label>
            <input type="text" value={bankTransfer.accountHolder} onChange={e => setBankTransfer(s => ({ ...s, accountHolder: e.target.value }))} placeholder="Business or individual name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Account Number *</label>
            <input type="text" value={bankTransfer.accountNumber} onChange={e => setBankTransfer(s => ({ ...s, accountNumber: e.target.value }))} placeholder="000000000000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Routing Number *</label>
            <input type="text" value={bankTransfer.routingNumber} onChange={e => setBankTransfer(s => ({ ...s, routingNumber: e.target.value }))} placeholder="9-digit ABA routing number" className={inputCls} />
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-600">
          <p className="font-bold text-emerald-700">These details will be shown to customers when they select Bank Transfer at checkout.</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Pixel & Analytics Manager
// ============================================================
const PixelManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [cfg, setCfg] = useState({
    fbPixelId: "", fbApiToken: "", fbTestCode: "", fbActive: false,
    ga4Id: "", ga4Active: false,
    gtmId: "", gtmActive: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/pixel`).then(r => r.json()).then(d => { if (d?.value) setCfg(s => ({ ...s, ...d.value })); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/pixel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: cfg }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const Field = ({ label, fieldKey, placeholder, type = "text", mono = false, help }) => (
    <div>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
      <input type={type} value={cfg[fieldKey] || ""} onChange={e => setCfg(s => ({ ...s, [fieldKey]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 ${mono ? "font-mono" : ""}`} />
      {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Tracking Pixel &amp; Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">Facebook Pixel, Google Analytics and GTM configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : saving ? "Saving..." : <><Cog className="w-4 h-4" /> Save</>}
        </button>
      </div>

      {/* Facebook Pixel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Facebook Pixel</h4>
              <p className="text-[10px] text-gray-400">With Meta Conversions API</p>
            </div>
          </div>
          <button type="button" onClick={() => setCfg(s => ({ ...s, fbActive: !s.fbActive }))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.fbActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {cfg.fbActive ? "Active" : "Inactive"}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Pixel ID *" fieldKey="fbPixelId" placeholder="1234567890123456" mono help="Meta Events Manager → Data Sources → Pixel ID" />
          <Field label="Test Event Code" fieldKey="fbTestCode" placeholder="TEST123456" mono help="Meta Events Manager → Test Events" />
          <div className="lg:col-span-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Conversions API Token</label>
            <div className="relative">
              <input type={showToken ? "text" : "password"} value={cfg.fbApiToken || ""} onChange={e => setCfg(s => ({ ...s, fbApiToken: e.target.value }))}
                placeholder="EAAtz..." className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm font-mono outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
              <button type="button" onClick={() => setShowToken(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Eye className="w-4 h-4" /></button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Meta Events Manager → Settings → Conversions API → Generate Access Token</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {["PageView", "ViewContent", "AddToCart", "Purchase"].map(ev => (
            <div key={ev} className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-center">
              <p className="text-[10px] font-bold text-blue-700">{ev}</p>
              <p className="text-[9px] text-blue-400">Tracking</p>
            </div>
          ))}
        </div>
      </div>

      {/* Google Analytics 4 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Google Analytics 4</h4>
              <p className="text-[10px] text-gray-400">GA4 Measurement ID</p>
            </div>
          </div>
          <button type="button" onClick={() => setCfg(s => ({ ...s, ga4Active: !s.ga4Active }))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.ga4Active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {cfg.ga4Active ? "Active" : "Inactive"}
          </button>
        </div>
        <Field label="Measurement ID" fieldKey="ga4Id" placeholder="G-XXXXXXXXXX" mono help="Google Analytics → Admin → Data Streams → Measurement ID" />
      </div>

      {/* Google Tag Manager */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Google Tag Manager</h4>
              <p className="text-[10px] text-gray-400">GTM Container ID</p>
            </div>
          </div>
          <button type="button" onClick={() => setCfg(s => ({ ...s, gtmActive: !s.gtmActive }))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.gtmActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {cfg.gtmActive ? "Active" : "Inactive"}
          </button>
        </div>
        <Field label="Container ID" fieldKey="gtmId" placeholder="GTM-XXXXXXX" mono help="tagmanager.google.com → Container → Container ID" />
      </div>
    </div>
  );
};

// ============================================================
// SMTP Email Manager
// ============================================================
const SmtpManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [cfg, setCfg] = useState({
    host: "", port: "465", encryption: "SSL", username: "", password: "", fromEmail: "", fromName: "",
    isActive: false, notifyOrder: true, notifyStatusChange: true, notifyContact: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/smtp`).then(r => r.json()).then(d => { if (d?.value) setCfg(s => ({ ...s, ...d.value })); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/smtp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: cfg }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!testEmail) return;
    setTesting(true); setTestResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/settings/smtp/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...cfg, testEmail }),
      });
      const data = await res.json();
      setTestResult(res.ok ? { ok: true, msg: "Test email sent!" } : { ok: false, msg: data.message || "Failed" });
    } catch { setTestResult({ ok: false, msg: "Connection error" }); }
    setTesting(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Email SMTP Gateway</h3>
          <p className="text-sm text-gray-500 mt-1">Email notifications and SMTP configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : saving ? "Saving..." : <><Cog className="w-4 h-4" /> Save</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">SMTP Settings</h4>
          <button type="button" onClick={() => setCfg(s => ({ ...s, isActive: !s.isActive }))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {cfg.isActive ? "Active" : "Inactive"}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Mail Host *</label>
            <input type="text" value={cfg.host} onChange={e => setCfg(s => ({ ...s, host: e.target.value }))} placeholder="mail.yourdomain.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Mail Port *</label>
            <input type="text" value={cfg.port} onChange={e => setCfg(s => ({ ...s, port: e.target.value }))} placeholder="465" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Encryption *</label>
            <select value={cfg.encryption} onChange={e => setCfg(s => ({ ...s, encryption: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5">
              <option>SSL</option><option>TLS</option><option>None</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Username (Email) *</label>
            <input type="email" value={cfg.username} onChange={e => setCfg(s => ({ ...s, username: e.target.value }))} placeholder="info@yourdomain.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Password (App Password) *</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={cfg.password} onChange={e => setCfg(s => ({ ...s, password: e.target.value }))} placeholder="••••••••••••••••" className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Eye className="w-4 h-4" /></button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">For Gmail, use an App Password</p>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">From Email *</label>
            <input type="email" value={cfg.fromEmail} onChange={e => setCfg(s => ({ ...s, fromEmail: e.target.value }))} placeholder="noreply@yourdomain.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">From Name</label>
            <input type="text" value={cfg.fromName} onChange={e => setCfg(s => ({ ...s, fromName: e.target.value }))} placeholder="Vision Store" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">Notification Settings</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: "notifyOrder", label: "Order Confirmation", desc: "Email on new order" },
            { key: "notifyStatusChange", label: "Status Change", desc: "Email on order update" },
            { key: "notifyContact", label: "Contact Form", desc: "Contact form submission" },
          ].map(n => (
            <div key={n.key} className={`rounded-xl border p-4 cursor-pointer transition-all ${cfg[n.key] ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}
              onClick={() => setCfg(s => ({ ...s, [n.key]: !s[n.key] }))}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-gray-800">{n.label}</p>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${cfg[n.key] ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                  {cfg[n.key] && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
              <p className="text-[10px] text-gray-400">{n.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
        <h4 className="text-sm font-bold text-gray-900">Send Test Email</h4>
        <div className="flex gap-3">
          <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          <button onClick={handleTest} disabled={testing || !testEmail}
            className="flex items-center gap-2 bg-vision-blue/10 text-vision-blue px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-vision-blue/20 disabled:opacity-40 transition-all">
            {testing ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
            {testing ? "Sending..." : "Send Test"}
          </button>
        </div>
        {testResult && (
          <div className={`rounded-xl border p-3 flex items-center gap-2 text-xs font-bold ${testResult.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {testResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {testResult.msg}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-4 space-y-1">
        <p className="text-xs font-bold text-yellow-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Gmail App Password Setup:</p>
        <ol className="text-[11px] text-yellow-600 list-decimal list-inside space-y-1">
          <li>Go to Google Account → Security → Enable 2-Step Verification</li>
          <li>Security → App passwords → Select "Mail"</li>
          <li>Use the generated 16-character password above</li>
        </ol>
      </div>
    </div>
  );
};

// ============================================================
// General Settings Manager
// ============================================================
const GeneralSettingsManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [cfg, setCfg] = useState({
    siteName: "Vision Appliances", tagline: "",
    phone1: "", phone2: "", email: "",
    facebook: "", instagram: "", youtube: "", github: "",
    metaTitle: "", metaDescription: "", metaKeywords: "",
    logoUrl: "", faviconUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/general`)
      .then(r => r.json())
      .then(d => { if (d?.value && typeof d.value === "object") setCfg(s => ({ ...s, ...d.value })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/settings/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Image upload failed");
    return data.url || data.secure_url || null;
  };

  const handleSave = async () => {
    setSaving(true); setUploading(true); setSaveError("");
    try {
      const token = localStorage.getItem("token");
      let updatedCfg = { ...cfg };
      if (logoFile) { const url = await uploadImage(logoFile); if (url) updatedCfg.logoUrl = url; }
      if (faviconFile) { const url = await uploadImage(faviconFile); if (url) updatedCfg.faviconUrl = url; }
      setUploading(false);
      const res = await fetch(`${API_URL}/settings/general`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: updatedCfg }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Save failed (${res.status})`); }
      setCfg(updatedCfg); setLogoFile(null); setFaviconFile(null);
      if (updatedCfg.metaTitle) document.title = updatedCfg.metaTitle;
      const setMeta = (name, content) => { let el = document.querySelector(`meta[name="${name}"]`); if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); } el.content = content; };
      if (updatedCfg.metaDescription) setMeta("description", updatedCfg.metaDescription);
      if (updatedCfg.metaKeywords) setMeta("keywords", updatedCfg.metaKeywords);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { setSaveError(e.message || "Could not save settings"); setUploading(false); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading...</div>;

  const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5";
  const labelCls = "text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1";
  const field = (label, key, placeholder, type = "text") => (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={cfg[key] || ""} onChange={e => setCfg(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className={inputCls} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">General Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Site name, logo, contact and SEO info</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : (saving || uploading) ? "Uploading..." : <><Cog className="w-4 h-4" /> Save</>}
          </button>
          {saveError && <p className="text-xs font-bold text-red-500">{saveError}</p>}
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">Branding</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Site Name *", "siteName", "Vision Store")}
            {field("Tagline", "tagline", "Quality You Can Trust")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Logo upload */}
            <div className="text-center">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Logo</label>
              <label className="cursor-pointer block">
                <div className="w-full aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:border-vision-blue/50 transition-all">
                  {(logoFile ? URL.createObjectURL(logoFile) : cfg.logoUrl) ? (
                    <img src={logoFile ? URL.createObjectURL(logoFile) : cfg.logoUrl} alt="Logo" className="w-full h-full object-contain p-2 rounded-xl" />
                  ) : (
                    <><Image className="w-6 h-6 text-gray-300 mb-1" /><span className="text-[9px] text-gray-400">Upload</span></>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files[0])} />
              </label>
            </div>
            {/* Favicon upload */}
            <div className="text-center">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Favicon</label>
              <label className="cursor-pointer block">
                <div className="w-full aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:border-vision-blue/50 transition-all">
                  {(faviconFile ? URL.createObjectURL(faviconFile) : cfg.faviconUrl) ? (
                    <img src={faviconFile ? URL.createObjectURL(faviconFile) : cfg.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                  ) : (
                    <><Image className="w-6 h-6 text-gray-300 mb-1" /><span className="text-[9px] text-gray-400">32×32 px</span></>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setFaviconFile(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">Contact Info</h4>
        <p className="text-xs text-gray-400">These appear on the Contact page (Call Us) and footer Hotline. Each number shows on its own line.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Phone Number 1", "phone1", "+1 212 555 1234")}
          {field("Phone Number 2", "phone2", "+1 212 555 5678")}
          {field("Email", "email", "contact@vision.com", "email")}
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">Social Media</h4>
        <p className="text-xs text-gray-400">Links saved here appear in the footer social icons.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Facebook URL", "facebook", "https://facebook.com/...")}
          {field("Instagram URL", "instagram", "https://instagram.com/...")}
          {field("YouTube URL", "youtube", "https://youtube.com/...")}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">SEO Settings</h4>
        {field("Meta Title", "metaTitle", "Vision Appliances - Modern Electronics")}
        <div>
          <label className={labelCls}>Meta Description</label>
          <textarea value={cfg.metaDescription || ""} onChange={e => setCfg(s => ({ ...s, metaDescription: e.target.value }))} rows={3} placeholder="Detailed description of your site..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 resize-none" />
          <p className="text-[10px] text-gray-400 mt-1">{(cfg.metaDescription || "").length}/160 characters</p>
        </div>
        {field("Keywords (comma separated)", "metaKeywords", "electronics, appliances, vision")}
      </div>

      {/* Courier API Credentials */}
      <CourierCredentialsSection />
    </div>
  );
};

// ============================================================
// Courier Credentials Section (inside General Settings)
// ============================================================
const CourierCredentialsSection = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [creds, setCreds] = useState({
    shipperName: "", shipperAddress: "", shipperCity: "", shipperState: "", shipperPostal: "", shipperCountry: "US", shipperPhone: "", shipperEmail: "",
    dhlApiKey: "", dhlApiSecret: "", dhlAccountNumber: "", dhlSandbox: true,
    fedexClientId: "", fedexClientSecret: "", fedexAccountNumber: "", fedexSandbox: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/courier/credentials`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(d => { if (d && typeof d === "object") setCreds(s => ({ ...s, ...d })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/courier/credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(creds),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || "Save failed"); }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { setSaveError(e.message); }
    setSaving(false);
  };

  const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5";
  const labelCls = "text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1";
  const cf = (label, key, placeholder, type = "text") => (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={creds[key] || ""} onChange={e => setCreds(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className={inputCls} />
    </div>
  );

  if (loading) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">Courier API Credentials</h4>
          <p className="text-xs text-gray-400 mt-0.5">DHL Express and FedEx integration for Order Management</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
            {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</> : saving ? "Saving..." : <><Cog className="w-3.5 h-3.5" /> Save Credentials</>}
          </button>
          {saveError && <p className="text-xs font-bold text-red-500">{saveError}</p>}
        </div>
      </div>

      {/* Shipper Info */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Your Shipper Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cf("Company / Shipper Name", "shipperName", "Vision Appliances")}
          {cf("Shipper Phone", "shipperPhone", "+12125551234")}
          {cf("Shipper Email", "shipperEmail", "shipping@vision.com")}
          {cf("Address Line", "shipperAddress", "123 Shipper Street")}
          {cf("City", "shipperCity", "New York")}
          {cf("State (2-letter)", "shipperState", "NY")}
          {cf("Postal Code", "shipperPostal", "10001")}
          {cf("Country Code (2-letter)", "shipperCountry", "US")}
        </div>
      </div>

      {/* DHL */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">DHL Express</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cf("DHL API Key", "dhlApiKey", "Paste from DHL Developer Portal")}
          {cf("DHL API Secret", "dhlApiSecret", "••••••••")}
          {cf("DHL Account Number", "dhlAccountNumber", "12345678")}
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input type="checkbox" checked={creds.dhlSandbox !== false} onChange={e => setCreds(s => ({ ...s, dhlSandbox: e.target.checked }))} className="rounded" />
          <span className="text-xs font-semibold">Sandbox / Test mode (uncheck for live)</span>
        </label>
        <p className="text-[10px] text-gray-400">Get credentials at <span className="font-mono text-vision-blue">developer.dhl.com</span> → MyDHL API → Create App</p>
      </div>

      {/* FedEx */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">FedEx</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cf("FedEx Client ID", "fedexClientId", "Paste from FedEx Developer Portal")}
          {cf("FedEx Client Secret", "fedexClientSecret", "••••••••")}
          {cf("FedEx Account Number", "fedexAccountNumber", "123456789")}
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input type="checkbox" checked={creds.fedexSandbox !== false} onChange={e => setCreds(s => ({ ...s, fedexSandbox: e.target.checked }))} className="rounded" />
          <span className="text-xs font-semibold">Sandbox / Test mode (uncheck for live)</span>
        </label>
        <p className="text-[10px] text-gray-400">Get credentials at <span className="font-mono text-vision-blue">developer.fedex.com</span> → Create Project → Ship API</p>
      </div>
    </div>
  );
};

// ============================================================
// Contact Messages Manager
// ============================================================
const STATUS_CONFIG = {
  new:       { label: "New",       cls: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", cls: "bg-green-100 text-green-700" },
  resolved:  { label: "Resolved",  cls: "bg-gray-100 text-gray-600" },
  spam:      { label: "Spam",      cls: "bg-red-100 text-red-600" },
};

const ContactMessagesManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const authHdr = () => { const t = localStorage.getItem("token"); return t ? { Authorization: `Bearer ${t}` } : {}; };

  const load = async (sf = statusFilter, df = dateFrom, dt = dateTo, sr = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sf && sf !== "all") params.set("status", sf);
      if (df) params.set("dateFrom", df);
      if (dt) params.set("dateTo", dt);
      if (sr) params.set("search", sr);
      const res = await fetch(`${API_URL}/contact?${params}`, { headers: authHdr() });
      const data = await res.json();
      if (Array.isArray(data)) { setMessages(data); setChecked([]); }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await fetch(`${API_URL}/contact/${id}/read`, { method: "PATCH", headers: authHdr() });
    setMessages(ms => ms.map(m => m._id === id ? { ...m, isRead: true } : m));
  };

  const changeStatus = async (id, status) => {
    await fetch(`${API_URL}/contact/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHdr() },
      body: JSON.stringify({ status }),
    });
    setMessages(ms => ms.map(m => m._id === id ? { ...m, status } : m));
    setSelected(s => s?._id === id ? { ...s, status } : s);
  };

  const deleteMsg = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    await fetch(`${API_URL}/contact/${id}`, { method: "DELETE", headers: authHdr() });
    setMessages(ms => ms.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
    setChecked(c => c.filter(x => x !== id));
  };

  const bulkDelete = async () => {
    if (!checked.length || !window.confirm(`Delete ${checked.length} message(s)?`)) return;
    setBulkDeleting(true);
    await fetch(`${API_URL}/contact/bulk`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHdr() },
      body: JSON.stringify({ ids: checked }),
    });
    setMessages(ms => ms.filter(m => !checked.includes(m._id)));
    if (checked.includes(selected?._id)) setSelected(null);
    setChecked([]);
    setBulkDeleting(false);
  };

  const unread = messages.filter(m => !m.isRead).length;

  const applyFilters = () => load(statusFilter, dateFrom, dateTo, search);
  const clearFilters = () => { setStatusFilter("all"); setDateFrom(""); setDateTo(""); setSearch(""); load("all", "", "", ""); };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Contact Messages</h3>
          <p className="text-sm text-gray-500 mt-1">
            {unread > 0 ? <span className="text-vision-blue font-bold">{unread} unread · </span> : ""}{messages.length} message(s)
          </p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all">
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyFilters()}
            placeholder="Search name, email, subject, message..."
            className="bg-transparent border-none outline-none text-xs text-gray-700 placeholder:text-gray-400 flex-1" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 outline-none">
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none" title="From date" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none" title="To date" />
        <button onClick={applyFilters} className="flex items-center gap-1.5 text-xs font-bold text-white bg-vision-blue px-4 py-2 rounded-xl hover:bg-vision-dark transition-all">
          <Search className="w-3.5 h-3.5" /> Search
        </button>
        {(statusFilter !== "all" || dateFrom || dateTo || search) && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
        )}
      </div>

      {/* Bulk delete bar */}
      {checked.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <span className="text-xs font-bold text-red-700">{checked.length} selected</span>
          <button onClick={bulkDelete} disabled={bulkDeleting}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all">
            <Trash2 className="w-3.5 h-3.5" />{bulkDeleting ? "Deleting..." : "Delete Selected"}
          </button>
          <button onClick={() => setChecked([])} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No messages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5">
          {/* List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Select all */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <input type="checkbox" checked={checked.length === messages.length && messages.length > 0}
                onChange={e => setChecked(e.target.checked ? messages.map(m => m._id) : [])} className="rounded" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select All</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {messages.map(m => (
                <div key={m._id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${selected?._id === m._id ? "bg-vision-blue/5 border-l-2 border-vision-blue" : ""} ${checked.includes(m._id) ? "bg-red-50/40" : ""}`}
                  onClick={() => { setSelected(m); if (!m.isRead) markRead(m._id); }}>
                  <input type="checkbox" checked={checked.includes(m._id)} onClick={e => e.stopPropagation()}
                    onChange={e => setChecked(c => e.target.checked ? [...c, m._id] : c.filter(x => x !== m._id))}
                    className="rounded mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!m.isRead && <span className="w-2 h-2 rounded-full bg-vision-blue flex-shrink-0" />}
                        <p className={`text-sm truncate ${!m.isRead ? "font-extrabold text-gray-900" : "font-semibold text-gray-600"}`}>{m.name}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{new Date(m.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CONFIG[m.status]?.cls || STATUS_CONFIG.new.cls}`}>
                        {STATUS_CONFIG[m.status]?.label || "New"}
                      </span>
                      <p className="text-[11px] text-gray-400 truncate">{m.subject || m.message.substring(0, 40)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">{selected.name}</h4>
                  <a href={`mailto:${selected.email}`} className="text-sm text-vision-blue hover:underline">{selected.email}</a>
                </div>
                <button onClick={() => deleteMsg(selected._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status change */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button key={k} onClick={() => changeStatus(selected._id, k)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${selected.status === k ? v.cls + " border-transparent" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {selected.subject && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Subject</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.subject}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Message</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <p className="text-[10px] text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
                <MailIcon className="w-3.5 h-3.5" /> Reply via Email
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 text-sm py-20">
              Select a message to read
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Frontend Content Manager (Highlights + Videos)
// ============================================================
const FrontendContentManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [tab, setTab] = useState("highlights");
  const [highlights, setHighlights] = useState([]);
  const [videos, setVideos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const defaultHighlight = { title: "", subtitle: "", description: "", icon: "", imageUrl: "", isActive: true };
  const defaultVideo = { title: "", subtitle: "", youtubeUrl: "", thumbnailUrl: "", isActive: true };

  useEffect(() => {
    fetch(`${API_URL}/settings/highlights`).then(r => r.json()).then(d => { if (Array.isArray(d?.value)) setHighlights(d.value); }).catch(() => {});
    fetch(`${API_URL}/settings/videos`).then(r => r.json()).then(d => { if (Array.isArray(d?.value)) setVideos(d.value); }).catch(() => {});
  }, []);

  const items = tab === "highlights" ? highlights : videos;
  const setItems = tab === "highlights" ? setHighlights : setVideos;
  const settingKey = tab === "highlights" ? "highlights" : "videos";
  const defaultItem = tab === "highlights" ? defaultHighlight : defaultVideo;

  const saveToServer = async (updatedItems) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/${settingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: updatedItems }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleOpenForm = (item = null) => {
    setEditItem(item ? { ...item, _idx: items.indexOf(item) } : { ...defaultItem, _idx: -1 });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSaveItem = async () => {
    if (!editItem) return;
    let updatedItem = { ...editItem };
    delete updatedItem._idx;

    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/settings/upload`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
        const data = await res.json();
        if (data.url) updatedItem.imageUrl = data.url;
      } catch {}
    }

    let updatedItems;
    if (editItem._idx >= 0) {
      updatedItems = items.map((it, i) => i === editItem._idx ? updatedItem : it);
    } else {
      updatedItems = [...items, updatedItem];
    }
    setItems(updatedItems);
    await saveToServer(updatedItems);
    setShowForm(false); setEditItem(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Delete this item?")) return;
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    await saveToServer(updated);
  };

  const handleToggle = async (idx) => {
    const updated = items.map((it, i) => i === idx ? { ...it, isActive: !it.isActive } : it);
    setItems(updated);
    await saveToServer(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Frontend Content</h3>
          <p className="text-sm text-gray-500 mt-1">Manage Manufacturing Highlights and Factory Videos</p>
        </div>
        <button onClick={() => handleOpenForm()} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add New {tab === "highlights" ? "Highlight" : "Video"}
        </button>
      </div>

      <div className="flex gap-2">
        {[["highlights","Manufacturing Highlights"],["videos","Factory Videos"]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t ? "bg-vision-blue text-white shadow-lg" : "bg-white border border-gray-200 text-gray-600 hover:border-vision-blue/30"}`}>{l}</button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && editItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900">{editItem._idx >= 0 ? "Edit" : "Add New"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: "title", label: "Title *", placeholder: "Enter title" },
                { key: "subtitle", label: "Subtitle", placeholder: "Subtitle" },
                { key: "description", label: tab === "highlights" ? "Description" : null, placeholder: "Description" },
                { key: "icon", label: tab === "highlights" ? "Icon (emoji or text)" : null, placeholder: "🏭 or Factory" },
                { key: "youtubeUrl", label: tab === "videos" ? "YouTube URL *" : null, placeholder: "https://youtube.com/watch?v=..." },
              ].filter(f => f.label).map(f => (
                <div key={f.key}>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{f.label}</label>
                  <input type="text" value={editItem[f.key] || ""} onChange={e => setEditItem(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
                </div>
              ))}

              {/* Image Upload */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Image</label>
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center hover:border-vision-blue/50 transition-all">
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="preview" className="h-24 object-contain rounded-lg" />
                    ) : editItem.imageUrl ? (
                      <img src={editItem.imageUrl} alt="current" className="h-24 object-contain rounded-lg" />
                    ) : (
                      <><Image className="w-8 h-8 text-gray-300 mb-1" /><span className="text-xs text-gray-400">Upload Image</span></>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <button type="button" onClick={() => setEditItem(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editItem.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {editItem.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveItem} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all ${item.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
            {item.imageUrl && (
              <div className="aspect-video overflow-hidden bg-gray-50">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            {tab === "videos" && item.youtubeUrl && !item.imageUrl && (
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-8 border-b-8 border-l-[16px] border-transparent border-l-white ml-1" />
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <h4 className="text-sm font-bold text-gray-900 truncate mt-0.5">{item.title}</h4>
                  {item.subtitle && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.subtitle}</p>}
                  {item.description && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                  {tab === "videos" && item.youtubeUrl && (
                    <p className="text-[10px] text-blue-500 mt-1 truncate">{item.youtubeUrl}</p>
                  )}
                </div>
                <button onClick={() => handleToggle(idx)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-bold border ${item.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {item.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => handleOpenForm(item)} className="p-1.5 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center text-center">
            <Layers className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm font-bold text-gray-400">No {tab === "highlights" ? "highlights" : "videos"} yet</p>
            <p className="text-xs text-gray-300 mt-1">Click "+ Add New" above to get started</p>
          </div>
        )}
      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 z-50">
          <CheckCircle2 className="w-4 h-4" /> Saved!
        </div>
      )}
    </div>
  );
};

const FilterSettingsManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const getToken = () => localStorage.getItem("token");
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

  const [ranges, setRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRange, setNewRange] = useState({ label: "", min: "", max: "" });
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/filter-ranges`);
      const d = await res.json();
      setRanges(Array.isArray(d?.value) ? d.value : []);
    } catch { setRanges([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (updated) => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/settings/filter-ranges`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ value: updated }),
      });
      setRanges(updated);
      alert("✅ Saved!");
    } catch { alert("❌ Error saving"); }
    setSaving(false);
  };

  const handleAdd = () => {
    if (!newRange.label) return alert("Please enter a label");
    const r = {
      id: newRange.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now(),
      label: newRange.label,
      ...(newRange.min !== "" ? { min: Number(newRange.min) } : {}),
      ...(newRange.max !== "" ? { max: Number(newRange.max) } : {}),
    };
    const updated = [...ranges, r];
    setRanges(updated);
    setNewRange({ label: "", min: "", max: "" });
    setShowAdd(false);
    save(updated);
  };

  const handleDelete = (id) => {
    const updated = ranges.filter(r => r.id !== id);
    setRanges(updated);
    save(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Filter Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Customize price range filters on the Products page</p>
        </div>
        <button onClick={() => setShowAdd(true)} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Saving...</> : <><Plus className="w-4 h-4" /> New Range</>}
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h4 className="text-base font-extrabold text-gray-900">New Price Range</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Label *</label>
                <input value={newRange.label} onChange={e => setNewRange({ ...newRange, label: e.target.value })}
                  placeholder="e.g. Under $20,000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Min Price</label>
                  <input type="number" value={newRange.min} onChange={e => setNewRange({ ...newRange, min: e.target.value })}
                    placeholder="e.g. 20000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Max Price</label>
                  <input type="number" value={newRange.max} onChange={e => setNewRange({ ...newRange, max: e.target.value })}
                    placeholder="e.g. 40000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400">Leave min/max empty to skip that limit (e.g., for $70,000+ enter only the minimum)</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg">Add</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8"><RefreshCcw className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500">The "All Prices" option always appears automatically as the first filter</p>
          </div>
          {ranges.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No custom price ranges yet. Add a new one.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Label", "Min ($)", "Max ($)", ""].map((h, i) => (
                    <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ranges.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{r.label}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{r.min !== undefined ? `$${Number(r.min).toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{r.max !== undefined ? `$${Number(r.max).toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {ranges.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-700 mb-2">Preview (as shown on the Products page):</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-vision-blue text-white rounded-lg text-xs font-bold">All Prices</span>
            {ranges.map(r => (
              <span key={r.id} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700">{r.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
