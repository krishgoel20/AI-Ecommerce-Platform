const BASE_URL = "http://127.0.0.1:8000/api";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
});

export const api = {
  // Auth
  register: (data) =>
    fetch(`${BASE_URL}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then((r) => r.json()),

  login: (data) =>
    fetch(`${BASE_URL}/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then((r) => r.json()),

  // Products
  getProducts: () =>
    fetch(`${BASE_URL}/products/`, { headers: headers() }).then((r) => r.json()),

  getProduct: (id) =>
    fetch(`${BASE_URL}/products/${id}`, { headers: headers() }).then((r) => r.json()),

  getProductVariants: (id) =>
    fetch(`${BASE_URL}/products/${id}/variants`, { headers: headers() }).then((r) => r.json()),

  // Cart
  getCart: () =>
    fetch(`${BASE_URL}/cart/`, { headers: headers() }).then((r) => r.json()),

  addToCart: (data) =>
    fetch(`${BASE_URL}/cart/`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then((r) => r.json()),

  removeFromCart: (productId) =>
    fetch(`${BASE_URL}/cart/${productId}`, { method: "DELETE", headers: headers() }).then((r) => r.json()),

  updateCartItem: (productId, quantity) =>
    fetch(`${BASE_URL}/cart/${productId}`, { method: "PUT", headers: headers(), body: JSON.stringify({ quantity })}).then((r) => r.json()),

  // Orders
  getOrders: () =>
    fetch(`${BASE_URL}/orders/`, { headers: headers() }).then((r) => r.json()),

  placeOrder: (data) =>
    fetch(`${BASE_URL}/orders/`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then((r) => r.json()),

  // AI
  nlSearch: (query) =>
    fetch(`${BASE_URL}/ai/search`, { method: "POST", headers: headers(), body: JSON.stringify({ query }) }).then((r) => r.json()),

  productQA: (product_id, question) =>
    fetch(`${BASE_URL}/ai/qa`, { method: "POST", headers: headers(), body: JSON.stringify({ product_id, question }) }).then((r) => r.json()),

  nlAnalytics: (query) =>
    fetch(`${BASE_URL}/ai/analytics`, { method: "POST", headers: headers(), body: JSON.stringify({ query }) }).then((r) => r.json()),

  getRecommendations: (user_id) =>
    fetch(`${BASE_URL}/ai/recommendations?user_id=${user_id}`, { headers: headers() }).then((r) => r.json()),

  compareProducts: (product_id, compare_with, query = "") =>
    fetch(`${BASE_URL}/ai/compare`, { method: "POST", headers: headers(), body: JSON.stringify({ product_id, compare_with, query }) }).then((r) => r.json()),
};