const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

const getFileHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
};

// Products
export const getProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products`);
    return await handleResponse(res);
  } catch { return []; }
};

export const createProduct = async (formData) => {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: getFileHeaders(),
      body: formData,
    });
    return await handleResponse(res);
  } catch (error) { throw error; }
};

export const updateProduct = async (id, formData) => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: getFileHeaders(),
      body: formData,
    });
    return await handleResponse(res);
  } catch (error) { throw error; }
};

export const deleteProduct = async (id) => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch (error) { throw error; }
};

// Dashboard
export const getDashboardStats = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/stats`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return null; }
};

export const getSalesReport = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/sales-report`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return null; }
};

// Orders
export const getOrders = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/dashboard/orders?${query}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return null; }
};

export const updateOrderStatus = async (id, data) => {
  const res = await fetch(`${API_URL}/dashboard/orders/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

// Users
export const getUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/users`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const updateUserStatus = async (id, isActive) => {
  const res = await fetch(`${API_URL}/dashboard/users/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });
  return await handleResponse(res);
};

export const updateUser = async (id, data) => {
  const res = await fetch(`${API_URL}/dashboard/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/admin/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

// Fraud
export const getFraudCheckData = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/fraud-check`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return null; }
};

export const resolveFraudOrder = async (id) => {
  const res = await fetch(`${API_URL}/dashboard/fraud-check/${id}/resolve`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// Pages
export const getPages = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/pages`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const createPage = async (data) => {
  const res = await fetch(`${API_URL}/dashboard/pages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const updatePage = async (id, data) => {
  const res = await fetch(`${API_URL}/dashboard/pages/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const updatePageStatus = async (id, isActive) => {
  const res = await fetch(`${API_URL}/dashboard/pages/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });
  return await handleResponse(res);
};

export const deletePage = async (id) => {
  const res = await fetch(`${API_URL}/dashboard/pages/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// Categories
export const getCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories/all`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const createCategory = async (data) => {
  const fd = data instanceof FormData ? data : (() => {
    const f = new FormData();
    Object.entries(data).forEach(([k,v]) => {
      if (v instanceof File) f.append(k, v);
      else if (Array.isArray(v)) f.append(k, JSON.stringify(v));
      else if (v !== undefined && v !== null) f.append(k, v);
    });
    return f;
  })();
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getFileHeaders(),
    body: fd,
  });
  return await handleResponse(res);
};

export const updateCategory = async (id, data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k,v]) => {
    if (k === 'image' && v instanceof File) fd.append('image', v);
    else if (k === 'subcategories' && Array.isArray(v)) fd.append(k, JSON.stringify(v));
    else fd.append(k, v);
  });
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getFileHeaders(),
    body: fd,
  });
  return await handleResponse(res);
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// Banners
export const getBanners = async () => {
  try {
    const res = await fetch(`${API_URL}/banners/all`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const createBanner = async (formData) => {
  const res = await fetch(`${API_URL}/banners`, {
    method: "POST",
    headers: getFileHeaders(),
    body: formData,
  });
  return await handleResponse(res);
};

export const updateBanner = async (id, data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k,v]) => {
    if (k === 'image' && v instanceof File) fd.append('image', v);
    else fd.append(k, v);
  });
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: "PUT",
    headers: getFileHeaders(),
    body: fd,
  });
  return await handleResponse(res);
};

export const deleteBanner = async (id) => {
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// Flash Sales
export const getFlashSales = async (all = false) => {
  try {
    const res = await fetch(`${API_URL}/flashsales?${all ? 'all=true' : ''}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const createFlashSale = async (data) => {
  const res = await fetch(`${API_URL}/flashsales`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const updateFlashSale = async (id, data) => {
  const res = await fetch(`${API_URL}/flashsales/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const deleteFlashSale = async (id) => {
  const res = await fetch(`${API_URL}/flashsales/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// Content (Blogs)
export const getBlogs = async (all = false) => {
  try {
    const res = await fetch(`${API_URL}/content/blogs?${all ? 'all=true' : ''}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const createBlog = async (formData) => {
  const res = await fetch(`${API_URL}/content/blogs`, {
    method: "POST",
    headers: getFileHeaders(),
    body: formData,
  });
  return await handleResponse(res);
};

export const updateBlog = async (id, formData) => {
  const res = await fetch(`${API_URL}/content/blogs/${id}`, {
    method: "PUT",
    headers: getFileHeaders(),
    body: formData,
  });
  return await handleResponse(res);
};

export const deleteBlog = async (id) => {
  const res = await fetch(`${API_URL}/content/blogs/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// Content (Reviews)
export const getReviews = async (all = false) => {
  try {
    const res = await fetch(`${API_URL}/content/reviews?${all ? 'all=true' : ''}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const updateReview = async (id, data) => {
  const res = await fetch(`${API_URL}/content/reviews/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const deleteReview = async (id) => {
  const res = await fetch(`${API_URL}/content/reviews/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};

// Stock
export const getStockProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/stock/products?${query}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const updateProductStock = async (id, data) => {
  const res = await fetch(`${API_URL}/stock/products/${id}/update`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const getStockTransactions = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/stock/transactions?${query}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return { transactions: [], total: 0, page: 1, pages: 1 }; }
};

export const getStockAlerts = async () => {
  try {
    const res = await fetch(`${API_URL}/stock/alerts`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return { lowStock: [], outOfStock: [], total: 0 }; }
};

// Settings
export const getSetting = async (key) => {
  try {
    const res = await fetch(`${API_URL}/settings/${key}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return { key, value: {} }; }
};

export const saveSetting = async (key, value) => {
  const res = await fetch(`${API_URL}/settings/${key}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ value: typeof value === 'object' ? value : value }),
  });
  return await handleResponse(res);
};

export const saveSettingWithFile = async (key, formData) => {
  const res = await fetch(`${API_URL}/settings/${key}`, {
    method: "PUT",
    headers: getFileHeaders(),
    body: formData,
  });
  return await handleResponse(res);
};

// Auth
export const login = async (credentials) => {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return await handleResponse(res);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("admin");
};

// Coupons
export const getCoupons = async () => {
  try {
    const res = await fetch(`${API_URL}/coupons`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  } catch { return []; }
};

export const createCoupon = async (data) => {
  const res = await fetch(`${API_URL}/coupons`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const updateCoupon = async (id, data) => {
  const res = await fetch(`${API_URL}/coupons/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
};

export const deleteCoupon = async (id) => {
  const res = await fetch(`${API_URL}/coupons/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await handleResponse(res);
};