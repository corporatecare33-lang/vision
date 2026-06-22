import { useState, useEffect, useCallback } from "react";
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
  PhoneCall,
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
  Flag,
  ScanEye,
  Fingerprint,
  Gavel,
  Warehouse,
  IndianRupee,
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
  Cable,
  Smartphone as SmartphoneIcon,
  Radio,
  Contact,
  Store,
  Upload
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
  getFraudCheckData,
  resolveFraudOrder,
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
  getFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
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
import FlashSaleManager from "../components/FlashSaleManager";

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
    pending: "বাকি", processing: "প্রক্রিয়াধীন", shipped: "কুরিয়ারে",
    delivered: "ডেলিভারি সম্পন্ন", cancelled: "বাতিল", returned: "রিটার্ন",
    paid: "পরিশোধিত", failed: "ব্যর্থ", refunded: "রিফান্ড",
    active: "সক্রিয়", inactive: "নিষ্ক্রিয়", superadmin: "সুপার এডমিন", admin: "এডমিন",
    instock: "স্টকে আছে", lowstock: "স্টক শেষের পথে", outofstock: "স্টক নেই",
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

  const Dashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(() => {
    return localStorage.getItem("dashboardActiveNav") || "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [users, setUsers] = useState([]);
  const [fraudData, setFraudData] = useState(null);
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
  const [productCategories, setProductCategories] = useState([]);
  const [stockProducts, setStockProducts] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [stockAlerts, setStockAlerts] = useState({ lowStock: [], outOfStock: [], total: 0 });
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [adjustStockProduct, setAdjustStockProduct] = useState(null);
  const [showStockAdjust, setShowStockAdjust] = useState(false);
  const [stockTxPage, setStockTxPage] = useState(1);
  const [activeStockTab, setActiveStockTab] = useState("overview");
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

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
  const loadFraudData = useCallback(async () => { const data = await getFraudCheckData(); if (data) setFraudData(data); }, []);
  const loadPages = useCallback(async () => { const data = await getPages(); if (data) setPages(data); }, []);
  const loadProducts = useCallback(async () => { const data = await getProducts(); if (data) setProducts(data); }, []);

  const loadStockProducts = useCallback(async () => {
    const params = {};
    if (stockSearch) params.search = stockSearch;
    if (stockCategoryFilter !== "all") params.category = stockCategoryFilter;
    if (stockStatusFilter !== "all") params.stockStatus = stockStatusFilter;
    const data = await getStockProducts(params);
    if (Array.isArray(data)) setStockProducts(data);
  }, [stockSearch, stockCategoryFilter, stockStatusFilter]);

  const loadStockTransactions = useCallback(async () => { const data = await getStockTransactions({ page: stockTxPage, limit: 50 }); if (data) setStockTransactions(data); }, [stockTxPage]);
  const loadStockAlerts = useCallback(async () => { const data = await getStockAlerts(); if (data) setStockAlerts(data); }, []);

  const loadCategories = useCallback(async () => {
    const data = await getCategories();
    if (Array.isArray(data)) { setCategories(data); setProductCategories(data); }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardActiveNav", activeNav);
    if (activeNav === "dashboard") loadDashboardData();
    if (activeNav === "orders") loadOrders();
    if (activeNav === "users") loadUsers();
    if (activeNav === "fraud-check") loadFraudData();
    if (activeNav === "page-management") loadPages();
    if (activeNav === "products") { loadProducts(); loadCategories(); }
    if (activeNav === "price-edit") { loadProducts(); loadCategories(); }
    if (activeNav === "marketing") { loadProducts(); loadDashboardData(); }
    if (activeNav === "stock-management") { loadStockProducts(); loadStockTransactions(); loadStockAlerts(); loadCategories(); }
    if (activeNav === "category-management") { loadCategories(); }
  }, [activeNav, loadDashboardData, loadOrders, loadUsers, loadFraudData, loadPages, loadProducts, loadStockProducts, loadStockTransactions, loadStockAlerts, loadCategories]);

  const handleOrderStatusUpdate = async (id, status) => { await updateOrderStatus(id, { orderStatus: status }); loadOrders(); };

  const handleSendToSteadfast = async (order) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/orders/${order._id}/steadfast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          recipient_name: order.customer?.name,
          recipient_phone: order.customer?.phone,
          recipient_address: order.customer?.address,
          cod_amount: order.totalAmount,
          note: `Order: ${order.orderId}`,
        }),
      });
      const data = await res.json();
      if (res.ok) { alert(`✅ Steadfast এ পাঠানো হয়েছে!\nTracking: ${data.trackingCode || data.consignment?.tracking_code || "N/A"}`); loadOrders(); }
      else { alert(`❌ ব্যর্থ: ${data.message || "Unknown error"}`); }
    } catch { alert("❌ কুরিয়ার সার্ভারে সংযোগ ব্যর্থ"); }
  };
  const handleUserToggleStatus = async (id, currentStatus) => { await updateUserStatus(id, !currentStatus); loadUsers(); };
  const handleUpdateUser = async () => { if (editUser) { await updateUser(editUser._id, { name: editUser.name, email: editUser.email, phone: editUser.phone, role: editUser.role }); setEditUser(null); loadUsers(); } };
  const handleResolveFraud = async (id) => { await resolveFraudOrder(id); loadFraudData(); };
  const handleTogglePageStatus = async (id, isActive) => { await updatePageStatus(id, !isActive); loadPages(); };

  const handleSavePage = async () => {
    if (editPage?._id) { await updatePage(editPage._id, { name: editPage.name, title: editPage.title, content: editPage.content, isActive: editPage.isActive }); }
    else if (editPage) { await createPage({ name: editPage.name, title: editPage.title, content: editPage.content }); }
    setEditPage(null); setShowAddPage(false); loadPages();
  };

  const handleDeletePage = async (id) => { if (window.confirm("পেজটি মুছবেন?")) { await deletePage(id); loadPages(); } };
  const handleDeleteProduct = async (id) => { if (window.confirm("পণ্যটি মুছবেন?")) { await deleteProduct(id); loadProducts(); } };
  const handleSaveProduct = async () => { setShowAddProduct(false); setEditProduct(null); loadProducts(); };

  const handleStockAdjust = async () => {
    if (!adjustStockProduct) return;
    const { type, quantity, reason } = adjustStockProduct;
    await updateProductStock(adjustStockProduct.id, { type, quantity: Number(quantity), reason, performedBy: "admin" });
    setShowStockAdjust(false); setAdjustStockProduct(null); loadStockProducts(); loadStockTransactions(); loadStockAlerts();
  };

  const handleSaveCategory = async () => {
    if (editCategory?._id) { await updateCategory(editCategory._id, editCategory); }
    else if (editCategory) { await createCategory(editCategory); }
    setEditCategory(null); setShowAddCategory(false); loadCategories();
  };

  const handleDeleteCategory = async (id) => { if (window.confirm("ক্যাটাগরিটি মুছবেন?")) { await deleteCategory(id); loadCategories(); } };
  const handleLogout = () => { apiLogout(); navigate("/login"); };

  const formatTk = (value) => `৳${Number(value || 0).toLocaleString()}`;
  const dashboardCards = [
    { bg: "bg-gradient-to-br from-blue-50 to-blue-100", iconBg: "bg-blue-500", icon: ShoppingCart, value: stats?.totalOrders || 0, label: "মোট অর্ডার", valueColor: "text-blue-900" },
    { bg: "bg-gradient-to-br from-green-50 to-green-100", iconBg: "bg-green-500", icon: DollarSign, value: formatTk(stats?.totalSales), label: "মোট বিক্রয়", valueColor: "text-green-900" },
    { bg: "bg-gradient-to-br from-purple-50 to-purple-100", iconBg: "bg-purple-500", icon: Users, value: stats?.totalCustomers || 0, label: "মোট গ্রাহক", valueColor: "text-purple-900" },
    { bg: "bg-gradient-to-br from-orange-50 to-orange-100", iconBg: "bg-orange-500", icon: Package, value: stats?.totalProducts || 0, label: "মোট পণ্য", valueColor: "text-orange-900" },
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
      label: "প্রোডাক্ট",
      items: [
        { id: "products", icon: ShoppingBag, label: "সকল প্রোডাক্ট" },
        { id: "price-edit", icon: IndianRupee, label: "প্রাইস এডিট" },
        { id: "category-management", icon: Layers, label: "ক্যাটাগরি" },
      ]
    },
    {
      label: "মার্কেটিং",
      items: [
        { id: "marketing", icon: Megaphone, label: "মার্কেটিং" },
        { id: "coupons", icon: TicketPercent, label: "কুপন" },
        { id: "banners", icon: Image, label: "ব্যানার" },
        { id: "flash-sale", icon: Zap, label: "ফ্ল্যাশ সেল" },
      ]
    },
    {
      label: "অর্ডার ও ডেলিভারি",
      items: [
        { id: "orders", icon: ShoppingCart, label: "অর্ডার" },
        { id: "shipping-charge", icon: Truck, label: "শিপিং চার্জ" },
        { id: "courier-api", icon: Cable, label: "কুরিয়ার API" },
      ]
    },
    {
      label: "পেমেন্ট",
      items: [
        { id: "bkash", icon: SmartphoneIcon, label: "বিকাশ পেমেন্ট" },
        { id: "payment-settings", icon: Wallet, label: "পেমেন্ট সেটিংস" },
      ]
    },
    {
      label: "কন্টেন্ট",
      items: [
        { id: "page-management", icon: FileText, label: "পেজ ম্যানেজ" },
        { id: "frontend-content", icon: Layers, label: "ফ্রন্টএন্ড কন্টেন্ট" },
        { id: "filter-settings", icon: Filter, label: "ফিল্টার সেটিংস" },
      ]
    },
    {
      label: "এনালিটিক্স ও ইন্টিগ্রেশন",
      items: [
        { id: "tracking-pixel", icon: LineChart, label: "ট্র্যাকিং পিক্সেল" },
        { id: "facebook-pixel", icon: Radio, label: "Facebook Pixel" },
        { id: "smtp-email", icon: MailIcon, label: "SMTP ইমেইল" },
      ]
    },
    {
      label: "সাধারণ সেটিংস",
      items: [
        { id: "general-settings", icon: Settings, label: "জেনারেল সেটিংস" },
      ]
    },
    {
      label: "সেটিংস",
      items: [
        { id: "site-settings", icon: Store, label: "সাইট সেটিংস" },
        { id: "fraud-check", icon: ScanEye, label: "ফ্রড চেকার" },
        { id: "users", icon: Users, label: "ইউজার ম্যানেজমেন্ট" },
        { id: "stock-management", icon: Warehouse, label: "স্টক ম্যানেজমেন্ট" },
      ]
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-vision-blue to-vision-cyan rounded-xl flex items-center justify-center shadow-lg shadow-vision-blue/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">এডমিন প্যানেল</h1>
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
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-white hover:text-vision-blue hover:shadow-sm transition-all duration-200"><Home className="w-4.5 h-4.5" /> হোমপেজ</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"><LogOut className="w-4.5 h-4.5" /> লগআউট</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-auto bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden transition-colors"><Menu className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <BellRing className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right"><p className="text-sm font-semibold text-gray-900">superadmin</p><p className="text-xs text-gray-500">এডমিন</p></div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold">ক</div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* ============ DASHBOARD ============ */}
          {activeNav === "dashboard" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                  <Home className="w-4 h-4" />
                  হোমপেজ
                </button>
              </div>

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
                  { bg: "bg-gradient-to-br from-yellow-50 to-yellow-100", icon: Clock, iconColor: "text-yellow-600", value: 1, label: "Pending" },
                  { bg: "bg-gradient-to-br from-green-50 to-green-100", icon: CheckCircle2, iconColor: "text-green-600", value: 9, label: "Completed" },
                  { bg: "bg-gradient-to-br from-blue-50 to-blue-100", icon: Truck, iconColor: "text-blue-600", value: 284, label: "In Courier" },
                  { bg: "bg-gradient-to-br from-red-50 to-red-100", icon: XCircle, iconColor: "text-red-600", value: 28, label: "Cancelled" },
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
                    <h3 className="text-sm font-semibold text-gray-800">বিক্রয় অ্যানালিটিক্স</h3>
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
                      ইন-ভেন্টরি অ্যালার্ট
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "রিফ্রিজারেটর ডব্লিউয়া-284", status: "low" },
                      { name: "এয়ার কন্ডিশনার 1.5 টন", status: "out" },
                      { name: "মাইক্রোওয়েভ ওভেন 25L", status: "low" },
                      { name: "ইন্ডাকশন কুকার 2000W", status: "low" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'out' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                        <p className="text-xs text-gray-600 flex-1 truncate">{item.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${item.status === 'out' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.status === 'out' ? 'স্টক নেই' : 'কম স্টক'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Selling Products & Quick Links */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Selling Products */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">টপ সেলিং প্রোডাক্ট</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Vision Rice Cooker 1.8L Capacity", sales: 145, price: 3200 },
                      { name: "Vision Blender 500W 2 Jar", sales: 120, price: 4500 },
                      { name: "Vision Electric Kettle 1.7L", sales: 98, price: 1800 },
                      { name: "Vision Induction Cooker 2000W", sales: 85, price: 5800 },
                      { name: "Vision Gas Stove 2 Burner", sales: 72, price: 7200 },
                    ].map((product, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-xs text-gray-700 truncate">{product.name}</p>
                            <p className="text-[10px] text-gray-400">{product.sales} বিক্রি</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-yellow-600">৳{product.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">কুইক অ্যাকশন</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "পণ্য যোগ করুন", icon: Package, bg: "bg-yellow-100 text-yellow-700" },
                      { label: "অর্ডার দেখুন", icon: ShoppingCart, bg: "bg-blue-100 text-blue-700" },
                      { label: "ক্যাটাগরি", icon: Layers, bg: "bg-orange-100 text-orange-700" },
                      { label: "কুপন", icon: Tags, bg: "bg-green-100 text-green-700" },
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
                  <h3 className="text-sm font-semibold text-gray-800">সাম্প্রতিক অর্ডার</h3>
                  <button className="text-xs text-orange-500 hover:text-orange-600">সব দেখুন →</button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2">আইডি</th>
                      <th className="pb-2">কাস্টমার</th>
                      <th className="pb-2">তারিখ</th>
                      <th className="pb-2">পরিমাণ</th>
                      <th className="pb-2">স্ট্যাটাস</th>
                      <th className="pb-2 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {[
                      { id: "ORD-7845624890034-1", customer: "মোহাম্মদ রহমান", date: "2025-12-15", amount: 12500, status: "delivered" },
                      { id: "ORD-7845624890042-20", customer: "ফাতেমা বেগম", date: "2025-12-14", amount: 8900, status: "shipped" },
                      { id: "ORD-7845624890059-3", customer: "করিম উদ্দিন", date: "2025-12-14", amount: 15600, status: "pending" },
                      { id: "ORD-7845624890066-4", customer: "সালমা খাতুন", date: "2025-12-13", amount: 3200, status: "cancelled" },
                      { id: "ORD-7845624890073-5", customer: "আব্দুল হালিম", date: "2025-12-12", amount: 9800, status: "delivered" },
                    ].map((order, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 font-mono text-gray-600">{order.id}</td>
                        <td className="py-2 text-gray-700">{order.customer}</td>
                        <td className="py-2 text-gray-500">{order.date}</td>
                        <td className="py-2 font-bold text-gray-700">৳{order.amount.toLocaleString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            order.status === "delivered" ? "bg-green-100 text-green-700" :
                            order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                            order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {order.status === "delivered" ? "Delivered" :
                             order.status === "shipped" ? "Shipped" :
                             order.status === "pending" ? "Pending" : "Cancelled"}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <button className="text-orange-500 hover:text-orange-600">বিস্তারিত</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ USER MANAGEMENT ============ */}
          {activeNav === "users" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">ইউজার ম্যানেজমেন্ট</h3>
                </div>
                <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                  <Plus className="w-4 h-4" />
                  নতুন অ্যাডমিন তৈরি করুন
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold">
                  <List className="w-4 h-4" />
                  রেজিস্টার্ড ইউজার <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded">18</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">
                  <Users className="w-4 h-4" />
                  কাস্টমার (অর্ডার) <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">337</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold">
                  <Users className="w-4 h-4" />
                  অ্যাডমিন / ম্যানেজার <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">1</span>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 max-w-xs">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" placeholder="সার্চ করুন..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">ইমেইল</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">রেজিস্ট্রেশন</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">সর্বশেষ লগইন</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { email: "onikmondol809@gmail.com", reg: "৩ জুন, ২০২৬", lastLogin: "৩ জুন, ২০২৬" },
                      { email: "onikkumardas@gmail.com", reg: "৩ জুন, ২০২৬", lastLogin: "৩ জুন, ২০২৬" },
                      { email: "onikkumardas4455@gmail.com", reg: "৩ জুন, ২০২৬", lastLogin: "৩ জুন, ২০২৬" },
                      { email: "onikmondol611@gmail.com", reg: "২ জুন, ২০২৬", lastLogin: "২ জুন, ২০২৬" },
                      { email: "mdshawoun5@gmail.com", reg: "৩০ মে, ২০২৬", lastLogin: "৩০ মে, ২০২৬" },
                      { email: "199anasahmed@gmail.com", reg: "২৪ মে, ২০২৬", lastLogin: "২৪ মে, ২০২৬" },
                      { email: "afub11@gmail.com", reg: "২৩ মে, ২০২৬", lastLogin: "২৩ মে, ২০২৬" },
                      { email: "sakir6971@yahoo.com", reg: "২৬ এপ্রি, ২০২৬", lastLogin: "২৬ এপ্রি, ২০২৬" },
                      { email: "apu2003@gmail.com", reg: "১৮ এপ্রি, ২০২৬", lastLogin: "১৮ এপ্রি, ২০২৬" },
                    ].map((user, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.reg}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.lastLogin}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="ইউজার সম্পাদনা">
                {editUser && (
                  <div className="space-y-4">
                    {["name", "email", "phone"].map((field) => (
                      <label key={field} className="space-y-1.5">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{field === "name" ? "নাম" : field === "email" ? "ইমেইল" : "ফোন"}</span>
                        <input value={editUser[field]} onChange={(e) => setEditUser({ ...editUser, [field]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
                      </label>
                    ))}
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">রোল</span>
                      <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 bg-white">
                        <option value="admin">এডমিন</option><option value="superadmin">সুপার এডমিন</option>
                      </select>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditUser(null)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
                      <button onClick={handleUpdateUser} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">আপডেট করুন</button>
                    </div>
                  </div>
                )}
              </Modal>
              <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="নতুন ইউজার">
                <AddUserForm onSuccess={() => { setShowAddUser(false); loadUsers(); }} />
              </Modal>
            </div>
          )}

          {/* ============ PRODUCT MANAGEMENT ============ */}
          {activeNav === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">পণ্য ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">পণ্য যোগ, সম্পাদনা, মূল্য পরিবর্তন ও পরিচালনা</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={async () => {
                    if (!window.confirm("ডেমো পণ্যগুলো Cloudinary তে আপলোড করে MongoDB তে সেভ করবেন? এটা কিছুক্ষণ সময় নেবে।")) return;
                    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    const token = localStorage.getItem("token");
                    try {
                      const res = await fetch(`${API_URL}/admin/seed-products`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
                      const d = await res.json();
                      alert(d.message || (res.ok ? "✅ সম্পন্ন!" : "❌ সমস্যা হয়েছে"));
                      if (res.ok) loadProducts();
                    } catch { alert("❌ সংযোগ ব্যর্থ — সার্ভার চালু আছে কিনা দেখুন"); }
                  }} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:border-vision-blue hover:text-vision-blue transition-all">
                    <RefreshCcw className="w-3.5 h-3.5" /> ডেমো ইম্পোর্ট
                  </button>
                  <button onClick={() => { setEditProduct({ name: "", model: "", price: "", originalPrice: "", category: "", subcategory: "", description: "", specs: "", stock: 10, lowStockThreshold: 5, isActive: true, color: "#0b3474", priceOptions: [] }); setShowAddProduct(true); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                    <Plus className="w-4 h-4" /> নতুন পণ্য
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="নাম, মডেল বা আইডি দিয়ে সার্চ করুন..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
                    <option value="all">সব ক্যাটাগরি</option>
                    {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["পণ্য", "মডেল", "মূল্য", "মূল মূল্য", "ক্যাটাগরি", "স্টক", "স্ট্যাটাস", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 7 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.filter(p => {
                      const matchesSearch = !productSearch || p.name?.includes(productSearch) || p.model?.includes(productSearch) || p.id?.includes(productSearch);
                      const matchesCat = productCategoryFilter === "all" || p.category === productCategoryFilter;
                      return matchesSearch && matchesCat;
                    }).map((product) => {
                      const stockVal = product.stock !== undefined ? product.stock : 10;
                      const threshold = product.lowStockThreshold || 5;
                      return (
                        <tr key={product.id || product._id} className="hover:bg-gray-50 transition-colors">
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
                            <span className="text-xs font-extrabold text-emerald-600">৳{Number(product.price).toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-4">
                            {product.originalPrice > 0 ? (
                              <span className="text-xs text-gray-400 line-through">৳{Number(product.originalPrice).toLocaleString()}</span>
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
                              <button onClick={() => { setEditProduct({ ...product }); setShowAddProduct(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="সম্পাদনা"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="মুছুন"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && <tr><td colSpan="8" className="text-center py-12 text-gray-400 text-xs">কোনো পণ্য নেই</td></tr>}
                  </tbody>
                </table>
              </div>
              {/* Add/Edit Product Modal */}
              <Modal isOpen={showAddProduct} onClose={() => { setShowAddProduct(false); setEditProduct(null); }} title={editProduct?.id ? "পণ্য সম্পাদনা করুন" : "নতুন পণ্য যোগ করুন"} size="xl">
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
                  <h3 className="text-2xl font-extrabold text-gray-900">স্টক ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">পণ্যের স্টক ট্র্যাক ও আপডেট করুন</p>
                </div>
                <button onClick={() => { loadStockProducts(); loadStockAlerts(); }} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> রিফ্রেশ
                </button>
              </div>

              {/* Real Stats from DB */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { bg: "bg-white border border-gray-100", icon: Package, iconBg: "bg-orange-50", iconColor: "text-orange-500", value: stockAlerts.total || stockProducts.length, label: "মোট প্রোডাক্ট" },
                  { bg: "bg-yellow-50 border border-yellow-100", icon: AlertTriangle, iconBg: "bg-yellow-100", iconColor: "text-yellow-600", value: (stockAlerts.lowStock || []).length, label: "লো স্টক" },
                  { bg: "bg-red-50 border border-red-100", icon: XCircle, iconBg: "bg-red-100", iconColor: "text-red-500", value: (stockAlerts.outOfStock || []).length, label: "স্টক শেষ" },
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
                  <p className="text-xs font-bold text-yellow-700 mb-3 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> লো স্টক সতর্কতা</p>
                  <div className="flex flex-wrap gap-2">
                    {(stockAlerts.lowStock || []).map((p, i) => (
                      <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[11px] font-bold">{p.name} — {p.stock}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Products Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["পণ্য", "ক্যাটাগরি", "মূল্য (৳)", "স্টক", "স্ট্যাটাস", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 5 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs">
                    {stockProducts.map((p) => {
                      const isOut = (p.stock ?? 0) === 0;
                      const isLow = !isOut && (p.stock ?? 0) <= (p.lowStockThreshold || 5);
                      return (
                        <tr key={p._id || p.id} className="hover:bg-gray-50 transition-colors">
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
                              {isOut ? "স্টক শেষ" : isLow ? "লো স্টক" : "স্বাভাবিক"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { setAdjustStockProduct(p); setShowStockAdjust(true); }} className="px-3 py-1.5 bg-vision-blue/10 text-vision-blue rounded-lg text-[10px] font-bold hover:bg-vision-blue/20 transition-all">স্টক আপডেট</button>
                          </td>
                        </tr>
                      );
                    })}
                    {stockProducts.length === 0 && (
                      <tr><td colSpan="6" className="text-center py-12 text-gray-400">কোনো পণ্য নেই</td></tr>
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
                  <h3 className="text-2xl font-extrabold text-gray-900">ক্যাটাগরি ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">ক্যাটাগরি ও সাবক্যাটাগরি যোগ, সম্পাদনা ও পরিচালনা</p>
                </div>
                <button onClick={() => { setEditCategory({ id: "", name: "", shortName: "", description: "", tagline: "", accent: "#0b3474", subcategories: [], sortOrder: categories.length + 1, isActive: true }); setShowAddCategory(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                  <Plus className="w-4 h-4" /> নতুন ক্যাটাগরি
                </button>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="ক্যাটাগরির নাম সার্চ করুন..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
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
                          <p className="text-[10px] text-gray-400">{cat.shortName} • সর্ট: {cat.sortOrder}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={cat.isActive !== false ? "active" : "inactive"} />
                        <button onClick={() => { setEditCategory({ ...cat }); setShowAddCategory(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">সাবক্যাটাগরি ({cat.subcategories?.length || 0})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(cat.subcategories || []).map(sc => (
                          <span key={sc.id} className="text-[10px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">{sc.name}</span>
                        ))}
                        {(!cat.subcategories || cat.subcategories.length === 0) && <span className="text-xs text-gray-400">কোনো সাবক্যাটাগরি নেই</span>}
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
                      <p className="text-[10px] text-gray-400">{cat.description || "কোনো বর্ণনা নেই"}</p>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-400">কোনো ক্যাটাগরি নেই</p>
                  </div>
                )}
              </div>

              {/* Add/Edit Category Modal */}
              <Modal isOpen={showAddCategory} onClose={() => { setShowAddCategory(false); setEditCategory(null); }} title={editCategory?._id ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}>
                {editCategory && (
                  <CategoryForm category={editCategory} onSave={handleSaveCategory} onCancel={() => { setShowAddCategory(false); setEditCategory(null); }} isEdit={!!editCategory?._id} />
                )}
              </Modal>
            </div>
          )}

          {/* ============ FRAUD CHECKER ============ */}
          {activeNav === "fraud-check" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-900">ফ্রড চেকার</h3>
                <p className="text-xs text-gray-500 mt-1">ফোন নম্বর দিয়ে কাস্টমারের অর্ডার ইতিহাস ও ডেলিভারি চেক করুন</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2 flex-1 max-w-md"><PhoneCall className="w-4 h-4 text-gray-400" />                  <input type="text" placeholder="01000000000" className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 flex items-center gap-2"><Search className="w-4 h-4" />                  চেক করুন
                </button>
              </div>
            </div>
          )}

          {/* ============ ORDER MANAGEMENT ============ */}
          {activeNav === "orders" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">অর্ডার ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">সকল অর্ডার ট্র্যাক ও ম্যানেজ করুন</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl font-bold">{orders.length} অর্ডার</span>
                  <button onClick={loadOrders} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all"><RefreshCcw className="w-3.5 h-3.5" /> রিফ্রেশ</button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="অর্ডার ID বা ফোন সার্চ করুন..." value={orderSearch} onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={orderFilter} onChange={(e) => { setOrderFilter(e.target.value); setOrderPage(1); }} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
                    <option value="">সব স্ট্যাটাস</option>
                    {[["pending","অপেক্ষমাণ"],["processing","প্রক্রিয়াধীন"],["shipped","কুরিয়ারে"],["delivered","ডেলিভারি সম্পন্ন"],["cancelled","বাতিল"],["returned","রিটার্ন"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["অর্ডার", "ক্রেতা", "পণ্য", "মোট", "পেমেন্ট", "স্ট্যাটাস", "অ্যাকশন"].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-vision-blue">{order.orderId}</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-vision-blue/10 rounded-full flex items-center justify-center shrink-0"><User className="w-4 h-4 text-vision-blue" /></div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{order.customer?.name || "অজানা"}</p>
                              <p className="text-[10px] text-gray-400">{order.customer?.phone}</p>
                              <p className="text-[10px] text-gray-300 truncate max-w-[120px]">{order.customer?.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-gray-600 truncate max-w-[150px]">{(order.items || []).map(i => i.name).join(", ") || "—"}</p>
                          <p className="text-[10px] text-gray-400">{(order.items || []).length}টি আইটেম</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-extrabold text-gray-900">৳{order.totalAmount?.toLocaleString()}</span>
                          <p className="text-[10px] text-gray-400">{order.paymentMethod || "COD"}</p>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={order.paymentStatus} /></td>
                        <td className="px-5 py-4">
                          <div className="relative group">
                            <button className="flex items-center gap-1 cursor-pointer"><StatusBadge status={order.orderStatus} /><ChevronDown className="w-3 h-3 text-gray-400" /></button>
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                              {[["pending","অপেক্ষমাণ"],["processing","প্রক্রিয়াধীন"],["shipped","কুরিয়ারে"],["delivered","ডেলিভারি সম্পন্ন"],["cancelled","বাতিল"]].map(([s, l]) => (
                                <button key={s} onClick={() => handleOrderStatusUpdate(order._id, s)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${order.orderStatus === s ? "bg-vision-blue/10 text-vision-blue" : "text-gray-600 hover:bg-gray-50"}`}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendToSteadfast(order)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${order.orderStatus === "shipped" || order.courierTrackingId ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-vision-blue/10 text-vision-blue hover:bg-vision-blue hover:text-white"}`}
                              disabled={order.orderStatus === "shipped" || !!order.courierTrackingId}
                              title="Steadfast কুরিয়ারে পাঠান"
                            >
                              <Truck className="w-3 h-3" />{order.courierTrackingId ? "পাঠানো হয়েছে" : "কুরিয়ার"}
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">কোনো অর্ডার নেই</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ PRICE EDIT ============ */}
          {activeNav === "price-edit" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">প্রাইস এডিট</h3>
                  <p className="text-sm text-gray-500 mt-1">পণ্যের মূল্য পরিবর্তন ও বাল্ক প্রাইস এডিট করুন</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><RefreshCcw className="w-4 h-4" /> রিফ্রেশ</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr><th className="px-4 py-3 text-left">পণ্য</th><th className="px-4 py-3 text-left">ক্যাটাগরি</th><th className="px-4 py-3 text-left">বিক্রয় মূল্য</th><th className="px-4 py-3 text-left">মূল মূল্য</th><th className="px-4 py-3 text-left">স্টক</th><th className="px-4 py-3 text-right">অ্যাকশন</th></tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-semibold text-gray-800">{product.name}<p className="text-[11px] text-gray-400">{product.model}</p></td>
                        <td className="px-4 py-3 text-gray-500">{product.category}</td>
                        <td className="px-4 py-3"><input type="number" value={product.price || ""} onChange={(e) => handleInlinePriceChange(product.id, "price", e.target.value)} className="w-28 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-vision-blue" /></td>
                        <td className="px-4 py-3"><input type="number" value={product.originalPrice || ""} onChange={(e) => handleInlinePriceChange(product.id, "originalPrice", e.target.value)} className="w-28 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-vision-blue" /></td>
                        <td className="px-4 py-3"><input type="number" value={product.stock ?? 0} onChange={(e) => handleInlinePriceChange(product.id, "stock", e.target.value)} className="w-24 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-vision-blue" /></td>
                        <td className="px-4 py-3 text-right"><button onClick={() => handleSaveInlinePrice(product)} className="px-4 py-2 rounded-lg bg-vision-blue text-white text-xs font-bold hover:bg-vision-cyan">সেভ</button></td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-400">কোনো পণ্য নেই</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ MARKETING ============ */}
          {activeNav === "marketing" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">মার্কেটিং</h3>
                  <p className="text-sm text-gray-500 mt-1">মার্কেটিং ক্যাম্পেইন ও প্রমোশন ম্যানেজ করুন</p>
                </div>
                <button onClick={() => setActiveNav("coupons")} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><TicketPercent className="w-4 h-4" /> কুপন তৈরি করুন</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-gray-400">মোট বিক্রয়</p><h4 className="text-2xl font-black text-gray-900">{formatTk(stats?.totalSales)}</h4></div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-gray-400">গ্রাহক</p><h4 className="text-2xl font-black text-gray-900">{stats?.totalCustomers || 0}</h4></div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-gray-400">প্রমোশন পণ্য</p><h4 className="text-2xl font-black text-gray-900">{products.filter(p => p.featured || p.isBestSeller || p.isNewArrival).length}</h4></div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-bold text-gray-900 mb-4">ক্যাম্পেইন অ্যাকশন</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{label:"কুপন", nav:"coupons", icon:TicketPercent},{label:"ব্যানার", nav:"banners", icon:Image},{label:"ফ্ল্যাশ সেল", nav:"flash-sale", icon:Zap},{label:"প্রাইস এডিট", nav:"price-edit", icon:IndianRupee}].map((action) => (
                    <button key={action.nav} onClick={() => setActiveNav(action.nav)} className="rounded-xl border border-gray-100 p-4 text-left hover:border-vision-blue/40 hover:bg-vision-blue/5 transition-all"><action.icon className="w-5 h-5 text-vision-blue mb-2" /><p className="text-sm font-bold text-gray-700">{action.label}</p></button>
                  ))}
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

          {/* ============ FLASH SALE ============ */}
          {activeNav === "flash-sale" && (
            <FlashSaleManager />
          )}

          {/* ============ SHIPPING CHARGE ============ */}
          {activeNav === "shipping-charge" && <ShippingManager />}

          {/* ============ COURIER API ============ */}
          {activeNav === "courier-api" && <SteadfastManager />}

          {/* ============ BKASH ============ */}
          {activeNav === "bkash" && <BkashManager />}

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

          {/* ============ PAGE MANAGEMENT ============ */}
          {activeNav === "page-management" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">পেজ ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">ওয়েবসাইটের পেজসমূহ পরিচালনা করুন</p>
                </div>
                <button onClick={() => { setEditPage({ name: "", title: "", content: "", isActive: true }); setShowAddPage(true); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                  <Plus className="w-4 h-4" /> নতুন পেজ যোগ করুন
                </button>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="পেজের নাম বা টাইটেল সার্চ করুন..." value={pageSearch} onChange={(e) => setPageSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["ক্রম", "নাম", "টাইটেল", "স্লাগ", "স্ট্যাটাস", "তৈরির তারিখ", ""].map((h, i) => (
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
                        <td className="px-5 py-4"><span className="text-xs text-gray-400">{page.createdAt ? new Date(page.createdAt).toLocaleDateString("bn-BD") : "—"}</span></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setEditPage(page); setShowAddPage(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="সম্পাদনা"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeletePage(page._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="মুছুন"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pages.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">কোনো পেজ নেই</td></tr>}
                  </tbody>
                </table>
              </div>
              <Modal isOpen={showAddPage} onClose={() => { setShowAddPage(false); setEditPage(null); }} title={editPage?._id ? "পেজ সম্পাদনা" : "নতুন পেজ"}>
                {editPage && (
                  <div className="space-y-4">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">নাম</span>
                      <input value={editPage.name} onChange={(e) => setEditPage({ ...editPage, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="পেজের নাম" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">টাইটেল</span>
                      <input value={editPage.title} onChange={(e) => setEditPage({ ...editPage, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="পেজ টাইটেল" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">কন্টেন্ট</span>
                      <textarea value={editPage.content} onChange={(e) => setEditPage({ ...editPage, content: e.target.value })} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="পেজ কন্টেন্ট" />
                    </label>
                    {editPage._id && (
                      <label className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</span>
                        <button onClick={() => setEditPage({ ...editPage, isActive: !editPage.isActive })} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editPage.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {editPage.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </button>
                      </label>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => { setShowAddPage(false); setEditPage(null); }} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
                      <button onClick={handleSavePage} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">{editPage._id ? "আপডেট করুন" : "তৈরি করুন"}</button>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          )}
        </div>
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
  const [form, setForm] = useState(product);
  const [saving, setSaving] = useState(false);
  const [mainPreview, setMainPreview] = useState(product?.image || "");
  const [galleryFiles, setGalleryFiles] = useState([]);

  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (file) { setForm(f => ({ ...f, imageFile: file })); setMainPreview(URL.createObjectURL(file)); }
  };

  const handleGallery = (e) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
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
      if (form.imageFile) fd.append("image", form.imageFile);
      galleryFiles.forEach(f => fd.append("images", f));

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const url = isEdit ? `${API_URL}/products/${form.id}` : `${API_URL}/products`;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "সেভ করতে সমস্যা হয়েছে"); }
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
        <SectionLabel>ছবি</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          {/* Main image */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">প্রধান ছবি *</p>
            <label className="cursor-pointer block">
              <div className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${mainPreview ? "border-vision-blue/30 bg-white" : "border-gray-200 bg-white hover:border-vision-blue/40"}`}>
                {mainPreview ? (
                  <div className="relative aspect-square">
                    <img src={mainPreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-bold">পরিবর্তন করুন</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center gap-2 text-gray-300">
                    <Upload className="w-8 h-8" />
                    <p className="text-xs font-bold">ছবি আপলোড করুন</p>
                    <p className="text-[10px]">Cloudinary তে যাবে</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
            </label>
          </div>

          {/* Gallery */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">গ্যালারি ছবি</p>
            <label className="cursor-pointer block">
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-vision-blue/40 transition-all p-3 min-h-[80px] flex flex-wrap gap-1.5 items-start">
                {galleryFiles.map((file, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.preventDefault(); setGalleryFiles(p => p.filter((_, idx) => idx !== i)); }}
                      className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl-lg text-[9px] flex items-center justify-center">×</button>
                  </div>
                ))}
                {galleryFiles.length === 0 && (
                  <div className="w-full flex flex-col items-center justify-center gap-1 text-gray-300 py-4">
                    <Plus className="w-6 h-6" />
                    <p className="text-[10px] font-bold">একাধিক ছবি</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" multiple onChange={handleGallery} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>মূল তথ্য</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="পণ্যের নাম" required>
            <input className={inputCls} value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="Vision SmartView 43" required />
          </FormField>
          <FormField label="মডেল নম্বর" required>
            <input className={inputCls} value={form.model || ""} onChange={e => set("model", e.target.value)} placeholder="VSV-43S" required />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="ক্যাটাগরি" required>
            <select className={inputCls} value={form.category || ""} onChange={e => set("category", e.target.value)} required>
              <option value="">নির্বাচন করুন</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="সাবক্যাটাগরি">
            <select className={inputCls} value={form.subcategory || ""} onChange={e => set("subcategory", e.target.value)}>
              <option value="">নির্বাচন করুন</option>
              {subcategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="বিবরণ">
          <textarea className={inputCls} rows={2} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="পণ্যের সংক্ষিপ্ত বিবরণ..." />
        </FormField>
        <FormField label="স্পেসিফিকেশন (কমা দিয়ে)">
          <input className={inputCls} value={form.specs || ""} onChange={e => set("specs", e.target.value)} placeholder="43 inch, Full HD, Wifi, Bluetooth" />
        </FormField>
      </div>

      {/* ── Pricing ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>মূল্য ও রঙ</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="বিক্রয় মূল্য (৳)" required>
            <input className={inputCls} type="number" value={form.price || ""} onChange={e => set("price", e.target.value)} placeholder="25000" required />
          </FormField>
          <FormField label="আসল মূল্য (৳)">
            <input className={inputCls} type="number" value={form.originalPrice || ""} onChange={e => set("originalPrice", e.target.value)} placeholder="28000" />
          </FormField>
        </div>
        <FormField label="ব্র্যান্ড কালার">
          <div className="flex items-center gap-3">
            <input type="color" value={form.color || "#0b3474"} onChange={e => set("color", e.target.value)}
              className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer flex-shrink-0 p-0.5" />
            <input className={inputCls} value={form.color || "#0b3474"} onChange={e => set("color", e.target.value)} placeholder="#0b3474" />
          </div>
        </FormField>
      </div>

      {/* ── Inventory ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>ইনভেন্টরি</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="স্টক পরিমাণ">
            <input className={inputCls} type="number" value={form.stock ?? 10} onChange={e => set("stock", Number(e.target.value))} />
          </FormField>
          <FormField label="লো স্টক সতর্কতা">
            <input className={inputCls} type="number" value={form.lowStockThreshold ?? 5} onChange={e => set("lowStockThreshold", Number(e.target.value))} />
          </FormField>
        </div>
      </div>

      {/* ── Price Options ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
        <SectionLabel>মূল্য অপশন (ভেরিয়েন্ট)</SectionLabel>
        <p className="text-[10px] text-gray-400 -mt-1">একাধিক ভ্যারিয়েন্ট থাকলে যোগ করুন (যেমন: Hot &amp; Cold, Storage Cabinet)</p>
        {(form.priceOptions || []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={opt.label} onChange={e => { const o = [...(form.priceOptions||[])]; o[i]={...o[i],label:e.target.value}; set("priceOptions",o); }}
              placeholder="অপশন নাম" className={inputCls + " flex-1"} />
            <input type="number" value={opt.price} onChange={e => { const o=[...(form.priceOptions||[])]; o[i]={...o[i],price:Number(e.target.value)}; set("priceOptions",o); }}
              placeholder="মূল্য" className={inputCls + " w-28"} />
            <button type="button" onClick={() => set("priceOptions",(form.priceOptions||[]).filter((_,idx)=>idx!==i))}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"><X className="w-4 h-4"/></button>
          </div>
        ))}
        <button type="button" onClick={() => set("priceOptions",[...(form.priceOptions||[]),{label:"",price:Number(form.price)||0}])}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:border-vision-blue hover:text-vision-blue transition-all">
          <Plus className="w-3.5 h-3.5"/> অপশন যোগ করুন
        </button>
      </div>

      {/* ── Tags ── */}
      <div className="bg-gray-50/80 rounded-2xl p-4">
        <SectionLabel>পণ্য ট্যাগ ও স্ট্যাটাস</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key:"isActive", label:"✓ সক্রিয়", on:"bg-green-500 text-white shadow-green-200", off:"bg-white text-gray-500 border border-gray-200" },
            { key:"featured", label:"★ ফিচার্ড", on:"bg-purple-500 text-white shadow-purple-200", off:"bg-white text-gray-500 border border-gray-200" },
            { key:"isNewArrival", label:"◆ নতুন আগমন", on:"bg-blue-500 text-white shadow-blue-200", off:"bg-white text-gray-500 border border-gray-200" },
            { key:"isBestSeller", label:"⚑ বেস্ট সেলার", on:"bg-amber-500 text-white shadow-amber-200", off:"bg-white text-gray-500 border border-gray-200" },
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
          বাতিল
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-vision-blue/25 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
          {saving ? <><RefreshCcw className="w-4 h-4 animate-spin"/> সেভ হচ্ছে...</> : isEdit ? "✓ আপডেট করুন" : "✓ পণ্য তৈরি করুন"}
        </button>
      </div>
    </form>
  );
};

// ============================================================
// Category Form Component
// ============================================================
const CategoryForm = ({ category, onSave, onCancel, isEdit }) => {
  const [form, setForm] = useState(category);
  const [saving, setSaving] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubId, setNewSubId] = useState("");
  const [newSubTagline, setNewSubTagline] = useState("");
  const [newSubBanner, setNewSubBanner] = useState("");

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
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      if (isEdit) {
        await fetch(`${API_URL}/categories/${form._id}`, { method: "PUT", headers, body: JSON.stringify(form) });
      } else {
        await fetch(`${API_URL}/categories`, { method: "POST", headers, body: JSON.stringify(form) });
      }
      onSave();
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ক্যাটাগরি ID</span>
        <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" required />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">নাম</span>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" required />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">শর্ট নেম</span>
        <input value={form.shortName || ""} onChange={(e) => setForm({ ...form, shortName: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ট্যাগলাইন</span>
        <input value={form.tagline || ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">বিবরণ</span>
        <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">একসেন্ট কালার</span>
          <div className="flex items-center gap-2">
            <input type="color" value={form.accent || "#0b3474"} onChange={(e) => setForm({ ...form, accent: e.target.value })}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <input value={form.accent || "#0b3474"} onChange={(e) => setForm({ ...form, accent: e.target.value })}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-vision-blue/50" />
          </div>
        </label>
        <label className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সর্ট অর্ডার</span>
          <input type="number" value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
        </label>
      </div>
      <label className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সক্রিয়</span>
        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${form.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {form.isActive !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
        </button>
      </label>

      {/* Subcategories */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">সাবক্যাটাগরি</p>
        <div className="space-y-2 mb-3">
          {(form.subcategories || []).map(sc => (
            <div key={sc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-xs font-bold text-gray-900">{sc.name}</p>
                <p className="text-[10px] text-gray-400">{sc.id}</p>
              </div>
              <button type="button" onClick={() => removeSubcategory(sc.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <input value={newSubId} onChange={(e) => setNewSubId(e.target.value)} placeholder="ID"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
          <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="নাম"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
          <input value={newSubTagline} onChange={(e) => setNewSubTagline(e.target.value)} placeholder="ট্যাগলাইন"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
          <div className="flex gap-1">
            <input value={newSubBanner} onChange={(e) => setNewSubBanner(e.target.value)} placeholder="ব্যানার (URL)"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
            <button type="button" onClick={addSubcategory} disabled={!newSubName || !newSubId}
              className="px-3 py-2 bg-vision-blue text-white rounded-xl text-[10px] font-bold hover:bg-vision-cyan disabled:opacity-50 transition-all">+</button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
        <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? "সেভ হচ্ছে..." : isEdit ? "আপডেট করুন" : "তৈরি করুন"}
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
    { key: "name", label: "নাম", placeholder: "পূর্ণ নাম" },
    { key: "username", label: "ইউজারনেম", placeholder: "ইউজারনেম" },
    { key: "email", label: "ইমেইল", placeholder: "ইমেইল", type: "email" },
    { key: "password", label: "পাসওয়ার্ড", placeholder: "পাসওয়ার্ড", type: "password" },
    { key: "phone", label: "ফোন", placeholder: "ফোন নম্বর" },
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
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">রোল</span>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5">
          <option value="admin">এডমিন</option><option value="superadmin">সুপার এডমিন</option>
        </select>
      </label>
      <button type="submit" disabled={saving} className="w-full px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">{saving ? "সেভ হচ্ছে..." : "ইউজার তৈরি করুন"}</button>
    </form>
  );
};

// ============================================================
// Shipping Manager Component
// ============================================================
const ShippingManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [shipping, setShipping] = useState({ inside: 60, outside: 130, freeThreshold: 2000, insideActive: true, outsideActive: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/shipping`)
      .then(r => r.json())
      .then(data => { if (data?.value) setShipping(s => ({ ...s, ...data.value })); })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: shipping }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const zones = [
    { key: "inside", activeKey: "insideActive", label: "ঢাকা সিটির মধ্যে", desc: "Inside Dhaka delivery charge" },
    { key: "outside", activeKey: "outsideActive", label: "ঢাকা সিটির বাইরে", desc: "Outside Dhaka delivery charge" },
    { key: "freeThreshold", activeKey: null, label: "ফ্রি শিপিং থ্রেশহোল্ড", desc: "Order amount above which delivery is free" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">শিপিং চার্জ</h3>
          <p className="text-sm text-gray-500 mt-1">ডেলিভারি চার্জ ও শিপিং জোন সেটআপ</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে</> : saving ? "সেভ হচ্ছে..." : <><Cog className="w-4 h-4" /> সেভ করুন</>}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {zones.map(z => (
          <div key={z.key} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{z.label}</p>
              {z.activeKey && (
                <button type="button" onClick={() => setShipping(s => ({ ...s, [z.activeKey]: !s[z.activeKey] }))}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${shipping[z.activeKey] !== false ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {shipping[z.activeKey] !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-gray-400">৳</span>
              <input type="number" value={shipping[z.key] || 0} onChange={e => setShipping(s => ({ ...s, [z.key]: Number(e.target.value) }))}
                className="flex-1 text-2xl font-extrabold text-gray-900 bg-transparent border-b-2 border-gray-200 focus:border-vision-blue outline-none py-1 transition-colors" />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">{z.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
        <p className="text-xs font-bold text-blue-700">💡 টিপস: ফ্রি শিপিং থ্রেশহোল্ড ৳{(shipping.freeThreshold || 2000).toLocaleString()} সেট আছে। এর বেশি অর্ডারে ডেলিভারি চার্জ নেওয়া হবে না।</p>
      </div>
    </div>
  );
};

// ============================================================
// Steadfast Courier Manager
// ============================================================
const SteadfastManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [cfg, setCfg] = useState({ apiKey: "", secretKey: "", isActive: false, baseUrl: "https://portal.steadfast.com.bd/api/v1" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/settings/steadfast`).then(r => r.json()).then(d => { if (d?.value) setCfg(s => ({ ...s, ...d.value })); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/steadfast`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: cfg }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch(`${cfg.baseUrl}/status_check`, {
        headers: { "Api-Key": cfg.apiKey, "Secret-Key": cfg.secretKey },
      });
      const data = await res.json();
      setTestResult(data?.status === 1 ? { ok: true, msg: "সংযোগ সফল! API কাজ করছে।" } : { ok: false, msg: data?.message || "API ত্রুটি" });
    } catch { setTestResult({ ok: false, msg: "সংযোগ ব্যর্থ। API Key পরীক্ষা করুন।" }); }
    setTesting(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Steadfast কুরিয়ার API</h3>
          <p className="text-sm text-gray-500 mt-1">Steadfast কুরিয়ার সার্ভিস ইন্টিগ্রেশন</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleTest} disabled={testing || !cfg.apiKey} className="flex items-center gap-2 border border-vision-blue text-vision-blue px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-vision-blue/5 disabled:opacity-40 transition-all">
            <RefreshCcw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} /> {testing ? "পরীক্ষা হচ্ছে..." : "সংযোগ পরীক্ষা"}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
            {saved ? <><CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে</> : saving ? "সেভ হচ্ছে..." : <><Cog className="w-4 h-4" /> সেভ করুন</>}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`rounded-xl border p-3 flex items-center gap-2 text-xs font-bold ${testResult.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {testResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {testResult.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">API কনফিগারেশন</h4>
          <button type="button" onClick={() => setCfg(s => ({ ...s, isActive: !s.isActive }))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {cfg.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { key: "apiKey", label: "API Key *", placeholder: "Steadfast API Key" },
            { key: "secretKey", label: "Secret Key *", placeholder: "Steadfast Secret Key" },
            { key: "baseUrl", label: "Base URL", placeholder: "https://portal.steadfast.com.bd/api/v1" },
          ].map(f => (
            <div key={f.key} className={f.key === "baseUrl" ? "lg:col-span-2" : ""}>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{f.label}</label>
              <input type="text" value={cfg[f.key] || ""} onChange={e => setCfg(s => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 font-mono" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-1">
        <p className="text-xs font-bold text-blue-700">📦 Steadfast API সেটআপ গাইড:</p>
        <ol className="text-[11px] text-blue-600 list-decimal list-inside space-y-1">
          <li>portal.steadfast.com.bd তে অ্যাকাউন্ট খুলুন</li>
          <li>Settings → API Key থেকে API Key ও Secret Key নিন</li>
          <li>উপরের ফর্মে পেস্ট করে "সংযোগ পরীক্ষা" ক্লিক করুন</li>
          <li>সফল হলে "সেভ করুন" ক্লিক করুন</li>
        </ol>
      </div>
    </div>
  );
};

// ============================================================
// bKash Manager Component
// ============================================================
const BkashManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [cfg, setCfg] = useState({
    merchantNumber: "", appKey: "", appSecret: "", username: "", password: "",
    isActive: false, isSandbox: true,
    baseUrl: "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/bkash`).then(r => r.json()).then(d => { if (d?.value) setCfg(s => ({ ...s, ...d.value })); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/bkash`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: cfg }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const toggleSandbox = () => {
    const isSandbox = !cfg.isSandbox;
    setCfg(s => ({
      ...s, isSandbox,
      baseUrl: isSandbox ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta",
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">বিকাশ পেমেন্ট</h3>
          <p className="text-sm text-gray-500 mt-1">bKash Merchant API ইন্টিগ্রেশন ও সেটিংস</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে</> : saving ? "সেভ হচ্ছে..." : <><Cog className="w-4 h-4" /> সেভ করুন</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">মার্চেন্ট কনফিগারেশন</h4>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleSandbox}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.isSandbox ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
              {cfg.isSandbox ? "Sandbox (টেস্ট)" : "Production (Live)"}
            </button>
            <button type="button" onClick={() => setCfg(s => ({ ...s, isActive: !s.isActive }))}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
              {cfg.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">মার্চেন্ট নম্বর *</label>
            <input type="text" value={cfg.merchantNumber} onChange={e => setCfg(s => ({ ...s, merchantNumber: e.target.value }))} placeholder="01XXXXXXXXX" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">App Key *</label>
            <input type="text" value={cfg.appKey} onChange={e => setCfg(s => ({ ...s, appKey: e.target.value }))} placeholder="bKash App Key" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">App Secret *</label>
            <div className="relative">
              <input type={showSecret ? "text" : "password"} value={cfg.appSecret} onChange={e => setCfg(s => ({ ...s, appSecret: e.target.value }))} placeholder="bKash App Secret" className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm font-mono outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
              <button type="button" onClick={() => setShowSecret(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Username *</label>
            <input type="text" value={cfg.username} onChange={e => setCfg(s => ({ ...s, username: e.target.value }))} placeholder="bKash Username" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Password *</label>
            <input type="password" value={cfg.password} onChange={e => setCfg(s => ({ ...s, password: e.target.value }))} placeholder="bKash Password" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Base URL</label>
            <input type="text" value={cfg.baseUrl} onChange={e => setCfg(s => ({ ...s, baseUrl: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50" />
          </div>
        </div>
      </div>

      <div className="bg-pink-50 rounded-2xl border border-pink-100 p-4 space-y-1">
        <p className="text-xs font-bold text-pink-700">📱 bKash API সেটআপ গাইড:</p>
        <ol className="text-[11px] text-pink-600 list-decimal list-inside space-y-1">
          <li>merchant.bkash.com থেকে Merchant অ্যাকাউন্ট খুলুন</li>
          <li>Developer Portal থেকে App Key, App Secret পান</li>
          <li>Sandbox দিয়ে টেস্ট করুন, তারপর Production তে switch করুন</li>
          <li>Callback URL সেট করুন: <code className="bg-pink-100 px-1 rounded">/api/bkash/callback</code></li>
        </ol>
      </div>
    </div>
  );
};

// ============================================================
// Payment Settings Manager
// ============================================================
const PaymentSettingsManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [methods, setMethods] = useState([
    { id: "cod", name: "Cash on Delivery", namebn: "ক্যাশ অন ডেলিভারি", isActive: true },
    { id: "bkash", name: "bKash", namebn: "বিকাশ", isActive: false },
    { id: "nagad", name: "Nagad", namebn: "নগদ", isActive: false },
    { id: "rocket", name: "Rocket (DBBL)", namebn: "রকেট", isActive: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/payment-methods`).then(r => r.json()).then(d => { if (Array.isArray(d?.value)) setMethods(d.value); }).catch(() => {});
  }, []);

  const toggle = (id) => setMethods(m => m.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/settings/payment-methods`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: methods }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const icons = { cod: Banknote, bkash: SmartphoneIcon, nagad: SmartphoneIcon, rocket: SmartphoneIcon };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">পেমেন্ট সেটিংস</h3>
          <p className="text-sm text-gray-500 mt-1">পেমেন্ট মেথড সক্রিয় / নিষ্ক্রিয় করুন</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে</> : saving ? "সেভ হচ্ছে..." : <><Cog className="w-4 h-4" /> সেভ করুন</>}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {methods.map(p => {
          const Icon = icons[p.id] || Wallet;
          return (
            <div key={p.id} className={`bg-white rounded-2xl border p-5 flex items-center justify-between hover:shadow-md transition-all ${p.isActive ? "border-green-200" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.isActive ? "bg-green-50" : "bg-gray-100"}`}>
                  <Icon className={`w-6 h-6 ${p.isActive ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.namebn}</p>
                </div>
              </div>
              <button type="button" onClick={() => toggle(p.id)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${p.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {p.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </button>
            </div>
          );
        })}
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
          <h3 className="text-2xl font-extrabold text-gray-900">ট্র্যাকিং পিক্সেল ও অ্যানালিটিক্স</h3>
          <p className="text-sm text-gray-500 mt-1">Facebook Pixel, Google Analytics ও GTM কনফিগারেশন</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে</> : saving ? "সেভ হচ্ছে..." : <><Cog className="w-4 h-4" /> সেভ করুন</>}
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
              <p className="text-[10px] text-gray-400">Meta Conversions API সহ</p>
            </div>
          </div>
          <button type="button" onClick={() => setCfg(s => ({ ...s, fbActive: !s.fbActive }))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.fbActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {cfg.fbActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
              <p className="text-[9px] text-blue-400">ট্র্যাক হচ্ছে</p>
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
            {cfg.ga4Active ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
            {cfg.gtmActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
      setTestResult(res.ok ? { ok: true, msg: "টেস্ট ইমেইল পাঠানো হয়েছে!" } : { ok: false, msg: data.message || "ব্যর্থ হয়েছে" });
    } catch { setTestResult({ ok: false, msg: "সংযোগ ত্রুটি" }); }
    setTesting(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Email SMTP Gateway</h3>
          <p className="text-sm text-gray-500 mt-1">ইমেইল নোটিফিকেশন ও SMTP কনফিগারেশন</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে</> : saving ? "সেভ হচ্ছে..." : <><Cog className="w-4 h-4" /> সেভ করুন</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">SMTP সেটিংস</h4>
          <button type="button" onClick={() => setCfg(s => ({ ...s, isActive: !s.isActive }))}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${cfg.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {cfg.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
            <p className="text-[10px] text-gray-400 mt-1">Gmail এর জন্য App Password ব্যবহার করুন</p>
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
        <h4 className="text-sm font-bold text-gray-900">নোটিফিকেশন সেটিংস</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: "notifyOrder", label: "অর্ডার কনফার্মেশন", desc: "নতুন অর্ডারে ইমেইল" },
            { key: "notifyStatusChange", label: "স্ট্যাটাস পরিবর্তন", desc: "অর্ডার আপডেটে ইমেইল" },
            { key: "notifyContact", label: "যোগাযোগ ফর্ম", desc: "Contact form submission" },
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
        <h4 className="text-sm font-bold text-gray-900">টেস্ট ইমেইল পাঠান</h4>
        <div className="flex gap-3">
          <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          <button onClick={handleTest} disabled={testing || !testEmail}
            className="flex items-center gap-2 bg-vision-blue/10 text-vision-blue px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-vision-blue/20 disabled:opacity-40 transition-all">
            {testing ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
            {testing ? "পাঠানো হচ্ছে..." : "টেস্ট পাঠান"}
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
        <p className="text-xs font-bold text-yellow-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Gmail App Password সেটআপ:</p>
        <ol className="text-[11px] text-yellow-600 list-decimal list-inside space-y-1">
          <li>Google Account → Security → 2-Step Verification চালু করুন</li>
          <li>Security → App passwords → অ্যাপ নির্বাচন করুন "Mail"</li>
          <li>জেনারেট করা 16-ক্যারেক্টার পাসওয়ার্ড উপরে ব্যবহার করুন</li>
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
    siteName: "Vision Store", tagline: "", phone: "", email: "", address: "",
    whatsapp: "", facebook: "", instagram: "", youtube: "",
    metaTitle: "", metaDescription: "", metaKeywords: "",
    logoUrl: "", faviconUrl: "",
    copyrightYear: new Date().getFullYear().toString(),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/general`).then(r => r.json()).then(d => { if (d?.value) setCfg(s => ({ ...s, ...d.value })); }).catch(() => {});
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
    return data.url || data.secure_url || null;
  };

  const handleSave = async () => {
    setSaving(true);
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      let updatedCfg = { ...cfg };
      if (logoFile) { const url = await uploadImage(logoFile); if (url) updatedCfg.logoUrl = url; }
      if (faviconFile) { const url = await uploadImage(faviconFile); if (url) updatedCfg.faviconUrl = url; }
      setUploading(false);
      await fetch(`${API_URL}/settings/general`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ value: updatedCfg }),
      });
      setCfg(updatedCfg);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); setUploading(false); }
    setSaving(false);
  };

  const F = ({ label, fieldKey, placeholder, type = "text" }) => (
    <div>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
      <input type={type} value={cfg[fieldKey] || ""} onChange={e => setCfg(s => ({ ...s, [fieldKey]: e.target.value }))} placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">সাধারণ সেটিংস</h3>
          <p className="text-sm text-gray-500 mt-1">সাইটের নাম, লোগো, যোগাযোগ ও SEO তথ্য</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে</> : (saving || uploading) ? "আপলোড হচ্ছে..." : <><Cog className="w-4 h-4" /> সেভ করুন</>}
        </button>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">ব্র্যান্ডিং</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="সাইটের নাম *" fieldKey="siteName" placeholder="Vision Store" />
            <F label="ট্যাগলাইন" fieldKey="tagline" placeholder="Quality You Can Trust" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Logo upload */}
            <div className="text-center">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">লোগো</label>
              <label className="cursor-pointer block">
                <div className="w-full aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:border-vision-blue/50 transition-all">
                  {(logoFile ? URL.createObjectURL(logoFile) : cfg.logoUrl) ? (
                    <img src={logoFile ? URL.createObjectURL(logoFile) : cfg.logoUrl} alt="Logo" className="w-full h-full object-contain p-2 rounded-xl" />
                  ) : (
                    <><Image className="w-6 h-6 text-gray-300 mb-1" /><span className="text-[9px] text-gray-400">আপলোড করুন</span></>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files[0])} />
              </label>
            </div>
            {/* Favicon upload */}
            <div className="text-center">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">ফ্যাভিকন</label>
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
        <h4 className="text-sm font-bold text-gray-900">যোগাযোগের তথ্য</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <F label="ফোন" fieldKey="phone" placeholder="+8801XXXXXXXXX" />
          <F label="ইমেইল" fieldKey="email" placeholder="info@visionstore.com" type="email" />
          <F label="WhatsApp" fieldKey="whatsapp" placeholder="+8801XXXXXXXXX" />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">ঠিকানা</label>
            <textarea value={cfg.address || ""} onChange={e => setCfg(s => ({ ...s, address: e.target.value }))} rows={2} placeholder="সম্পূর্ণ ঠিকানা"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 resize-none" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">সোশ্যাল মিডিয়া</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <F label="Facebook URL" fieldKey="facebook" placeholder="https://facebook.com/..." />
          <F label="Instagram URL" fieldKey="instagram" placeholder="https://instagram.com/..." />
          <F label="YouTube URL" fieldKey="youtube" placeholder="https://youtube.com/..." />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">SEO সেটিংস</h4>
        <F label="মেটা টাইটেল" fieldKey="metaTitle" placeholder="Vision Store - Quality Electronics Bangladesh" />
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">মেটা ডেসক্রিপশন</label>
          <textarea value={cfg.metaDescription || ""} onChange={e => setCfg(s => ({ ...s, metaDescription: e.target.value }))} rows={3} placeholder="আপনার সাইটের বিস্তারিত বিবরণ..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 resize-none" />
          <p className="text-[10px] text-gray-400 mt-1">{(cfg.metaDescription || "").length}/160 ক্যারেক্টার</p>
        </div>
        <F label="কীওয়ার্ড (কমা দিয়ে আলাদা করুন)" fieldKey="metaKeywords" placeholder="electronics, gadgets, vision, bangladesh" />
        <F label="কপিরাইট বছর" fieldKey="copyrightYear" placeholder="2024" />
      </div>
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
    if (!window.confirm("মুছবেন?")) return;
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
          <h3 className="text-2xl font-extrabold text-gray-900">ফ্রন্টএন্ড কন্টেন্ট</h3>
          <p className="text-sm text-gray-500 mt-1">Manufacturing Highlights ও Factory Videos পরিচালনা করুন</p>
        </div>
        <button onClick={() => handleOpenForm()} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> নতুন {tab === "highlights" ? "হাইলাইট" : "ভিডিও"} যোগ করুন
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
              <h3 className="text-base font-extrabold text-gray-900">{editItem._idx >= 0 ? "সম্পাদনা" : "নতুন যোগ করুন"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: "title", label: "টাইটেল *", placeholder: "টাইটেল লিখুন" },
                { key: "subtitle", label: "সাবটাইটেল", placeholder: "সাবটাইটেল" },
                { key: "description", label: tab === "highlights" ? "বিবরণ" : null, placeholder: "বিবরণ" },
                { key: "icon", label: tab === "highlights" ? "আইকন (emoji বা text)" : null, placeholder: "🏭 বা Factory" },
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
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">ছবি</label>
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center hover:border-vision-blue/50 transition-all">
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="preview" className="h-24 object-contain rounded-lg" />
                    ) : editItem.imageUrl ? (
                      <img src={editItem.imageUrl} alt="current" className="h-24 object-contain rounded-lg" />
                    ) : (
                      <><Image className="w-8 h-8 text-gray-300 mb-1" /><span className="text-xs text-gray-400">ছবি আপলোড করুন</span></>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</label>
                <button type="button" onClick={() => setEditItem(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editItem.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {editItem.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">বাতিল</button>
                <button onClick={handleSaveItem} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50">
                  {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
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
                  {item.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
            <p className="text-sm font-bold text-gray-400">কোনো {tab === "highlights" ? "হাইলাইট" : "ভিডিও"} নেই</p>
            <p className="text-xs text-gray-300 mt-1">উপরে "+ নতুন যোগ করুন" ক্লিক করুন</p>
          </div>
        )}
      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 z-50">
          <CheckCircle2 className="w-4 h-4" /> সেভ হয়েছে!
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
      alert("✅ সেভ হয়েছে!");
    } catch { alert("❌ সেভ করতে সমস্যা"); }
    setSaving(false);
  };

  const handleAdd = () => {
    if (!newRange.label) return alert("লেবেল দিন");
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
          <h3 className="text-2xl font-extrabold text-gray-900">ফিল্টার সেটিংস</h3>
          <p className="text-sm text-gray-500 mt-1">প্রোডাক্ট পেজের প্রাইস রেঞ্জ ফিল্টার কাস্টমাইজ করুন</p>
        </div>
        <button onClick={() => setShowAdd(true)} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? <><RefreshCcw className="w-4 h-4 animate-spin" /> সেভ হচ্ছে...</> : <><Plus className="w-4 h-4" /> নতুন রেঞ্জ</>}
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h4 className="text-base font-extrabold text-gray-900">নতুন প্রাইস রেঞ্জ</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">লেবেল *</label>
                <input value={newRange.label} onChange={e => setNewRange({ ...newRange, label: e.target.value })}
                  placeholder="যেমন: Under Tk 20,000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">সর্বনিম্ন মূল্য</label>
                  <input type="number" value={newRange.min} onChange={e => setNewRange({ ...newRange, min: e.target.value })}
                    placeholder="যেমন: 20000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">সর্বোচ্চ মূল্য</label>
                  <input type="number" value={newRange.max} onChange={e => setNewRange({ ...newRange, max: e.target.value })}
                    placeholder="যেমন: 40000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400">সর্বনিম্ন/সর্বোচ্চ ফাঁকা রাখলে সেই সীমা প্রযোজ্য হবে না (যেমন: Tk 70,000+ এর জন্য শুধু সর্বনিম্ন দিন)</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">বাতিল</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg">যোগ করুন</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8"><RefreshCcw className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500">"All Prices" অপশনটি সবসময় স্বয়ংক্রিয়ভাবে প্রথমে থাকবে</p>
          </div>
          {ranges.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">কোনো কাস্টম প্রাইস রেঞ্জ নেই। নতুন যোগ করুন।</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["লেবেল", "সর্বনিম্ন (৳)", "সর্বোচ্চ (৳)", ""].map((h, i) => (
                    <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ranges.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{r.label}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{r.min !== undefined ? `৳${Number(r.min).toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{r.max !== undefined ? `৳${Number(r.max).toLocaleString()}` : "—"}</td>
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
          <p className="text-xs font-bold text-blue-700 mb-2">প্রিভিউ (প্রোডাক্ট পেজে যেভাবে দেখাবে):</p>
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
