import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ps_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const api = {
  // auth
  register: (data) => client.post("/auth/register", data).then((r) => r.data),
  login: (data) => client.post("/auth/login", data).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
  // catalog
  categories: () => client.get("/categories").then((r) => r.data),
  category: (slug) => client.get(`/categories/${slug}`).then((r) => r.data),
  brands: () => client.get("/brands").then((r) => r.data),
  printerModels: () => client.get("/printer-models").then((r) => r.data),
  products: (params) => client.get("/products", { params }).then((r) => r.data),
  product: (slug) => client.get(`/products/${slug}`).then((r) => r.data),
  settings: () => client.get("/settings").then((r) => r.data),
  blogList: () => client.get("/blog").then((r) => r.data),
  blog: (slug) => client.get(`/blog/${slug}`).then((r) => r.data),
  shippingCheck: (data) => client.post("/shipping/check", data).then((r) => r.data),
  // orders / account
  createOrder: (data) => client.post("/orders", data).then((r) => r.data),
  myOrders: () => client.get("/orders").then((r) => r.data),
  order: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  invoice: (id) => client.get(`/orders/${id}/invoice`).then((r) => r.data),
  wishlist: () => client.get("/wishlist").then((r) => r.data),
  toggleWishlist: (id) => client.post(`/wishlist/${id}`).then((r) => r.data),
  addresses: () => client.get("/addresses").then((r) => r.data),
  addAddress: (data) => client.post("/addresses", data).then((r) => r.data),
  // admin
  adminStats: () => client.get("/admin/stats").then((r) => r.data),
  adminProducts: (params) => client.get("/admin/products", { params }).then((r) => r.data),
  adminCreateProduct: (data) => client.post("/admin/products", data).then((r) => r.data),
  adminUpdateProduct: (id, data) => client.put(`/admin/products/${id}`, data).then((r) => r.data),
  adminDeleteProduct: (id) => client.delete(`/admin/products/${id}`).then((r) => r.data),
  adminImportCsv: (formData) => client.post("/admin/products/import-csv", formData).then((r) => r.data),
  adminImportLogs: () => client.get("/admin/import-logs").then((r) => r.data),
  importTemplateUrl: `${API}/admin/products/import-template`,
  adminCreateCategory: (data) => client.post("/admin/categories", data).then((r) => r.data),
  adminUpdateCategory: (id, data) => client.put(`/admin/categories/${id}`, data).then((r) => r.data),
  adminDeleteCategory: (id) => client.delete(`/admin/categories/${id}`).then((r) => r.data),
  adminCreateBrand: (data) => client.post("/admin/brands", data).then((r) => r.data),
  adminDeleteBrand: (id) => client.delete(`/admin/brands/${id}`).then((r) => r.data),
  adminOrders: (params) => client.get("/admin/orders", { params }).then((r) => r.data),
  adminUpdateOrder: (id, data) => client.put(`/admin/orders/${id}/status`, data).then((r) => r.data),
  adminCustomers: () => client.get("/admin/customers").then((r) => r.data),
  adminPincodes: () => client.get("/admin/pincodes").then((r) => r.data),
  adminCreatePincode: (data) => client.post("/admin/pincodes", data).then((r) => r.data),
  adminDeletePincode: (id) => client.delete(`/admin/pincodes/${id}`).then((r) => r.data),
  adminBlog: () => client.get("/admin/blog").then((r) => r.data),
  adminCreateBlog: (data) => client.post("/admin/blog", data).then((r) => r.data),
  adminUpdateBlog: (id, data) => client.put(`/admin/blog/${id}`, data).then((r) => r.data),
  adminDeleteBlog: (id) => client.delete(`/admin/blog/${id}`).then((r) => r.data),
  adminUpdateSettings: (data) => client.put("/admin/settings", data).then((r) => r.data),
};

export default client;
