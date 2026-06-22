const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (error) {
    console.warn("Using fallback stats data");
    return null;
  }
};

// Sales Report
export const getSalesReport = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/sales-report`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch sales report");
    return await res.json();
  } catch (error) {
    console.warn("Using fallback sales data");
    return null;
  }
};

// Orders
export const getOrders = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/dashboard/orders?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  } catch (error) {
    console.warn("Using fallback orders data");
    return null;
  }
};

export const updateOrderStatus = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update order");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

// Users
export const getUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/users`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (error) {
    console.warn("Using fallback users data");
    return null;
  }
};

export const updateUserStatus = async (id, isActive) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/users/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

// Fraud Checker
export const getFraudCheckData = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/fraud-check`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch fraud data");
    return await res.json();
  } catch (error) {
    console.warn("Using fallback fraud data");
    return null;
  }
};

export const resolveFraudOrder = async (id) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/fraud-check/${id}/resolve`, {
      method: "PUT",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to resolve fraud");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

// Fallback data
export const getFallbackStats = () => ({
  totalOrders: 321,
  totalSales: 234490,
  totalCustomers: 319,
  totalProducts: 61,
  pendingOrders: 1,
  completedOrders: 0,
  inCourier: 284,
  cancelledOrders: 28,
  monthlyRevenue: 85420,
  revenueGrowth: 23.8,
  ordersGrowth: 12.5,
  customersGrowth: 5.7,
  salesGrowth: 8.2,
  productsGrowth: -2.1,
  monthlySalesData: [],
  recentOrders: [],
  fraudOrders: 0,
});

// Pages
export const getPages = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/pages`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch pages");
    return await res.json();
  } catch (error) {
    console.warn("Using fallback pages data");
    return null;
  }
};

export const createPage = async (data) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create page");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const updatePage = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update page");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const updatePageStatus = async (id, isActive) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/pages/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error("Failed to update page status");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const deletePage = async (id) => {
  try {
    const res = await fetch(`${API_URL}/dashboard/pages/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to delete page");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getFallbackSalesReport = () => ({
  monthly: [
    { month: "জানু", sales: 45000, orders: 28 },
    { month: "ফেব্রু", sales: 52000, orders: 35 },
    { month: "মার্চ", sales: 48000, orders: 30 },
    { month: "এপ্রি", sales: 61000, orders: 42 },
    { month: "মে", sales: 78000, orders: 55 },
    { month: "জুন", sales: 85420, orders: 61 },
  ],
  totalSales: 369420,
  totalOrders: 251,
  averageOrderValue: 1472,
});