const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Stock Products
export const getStockProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/stock/products?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch stock products");
    return await res.json();
  } catch (error) {
    console.warn("Using empty stock products data");
    return [];
  }
};

export const updateProductStock = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/stock/products/${id}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update stock");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

// Stock Transactions
export const getStockTransactions = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/stock/transactions?${query}`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return await res.json();
  } catch (error) {
    console.warn("Using empty transactions data");
    return { transactions: [], total: 0, page: 1, pages: 1 };
  }
};

// Stock Alerts
export const getStockAlerts = async () => {
  try {
    const res = await fetch(`${API_URL}/stock/alerts`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch alerts");
    return await res.json();
  } catch (error) {
    console.warn("Using empty alerts data");
    return { lowStock: [], outOfStock: [], total: 0 };
  }
};

// Categories
export const getCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories/all`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
  } catch (error) {
    console.warn("Using fallback categories");
    return [];
  }
};

export const createCategory = async (data) => {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to delete category");
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const updateCategorySubcategories = async (id, subcategories) => {
  try {
    const res = await fetch(`${API_URL}/categories/${id}/subcategories`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ subcategories }),
    });
    if (!res.ok) throw new Error("Failed to update subcategories");
    return await res.json();
  } catch (error) {
    throw error;
  }
};
