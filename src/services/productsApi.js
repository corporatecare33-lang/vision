const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id,
  price: String(product.price ?? ""),
  specs: Array.isArray(product.specs) ? product.specs : [],
});

// Admin Auth API
export const adminLogin = async (username, password) => {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Login failed");
  }

  localStorage.setItem("token", payload.token);
  localStorage.setItem("admin", JSON.stringify(payload.admin));
  localStorage.setItem("isLoggedIn", "true");
  return payload;
};

export const adminLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("admin");
  localStorage.removeItem("isLoggedIn");
};

export const seedAdmin = async () => {
  const response = await fetch(`${API_URL}/admin/seed`, {
    method: "POST",
  });
  return response.json();
};

export const getApiProducts = async () => {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Could not load API products");
  }

  const products = await response.json();
  return products.map(normalizeProduct);
};

export const createApiProduct = async (formData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Could not save product");
  }

  return normalizeProduct(payload);
};

export const updateApiProduct = async (productId, formData) => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Could not update product");
  }

  return normalizeProduct(payload);
};

export const deleteApiProduct = async (productId) => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Could not delete product");
  }
};
