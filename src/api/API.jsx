import axios from "axios";
import { orders } from "../data/orders";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrl = (configuredApiUrl || (import.meta.env.DEV ? "/api" : "")).replace(/\/$/, "");

const API = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Unable to reach the backend. Make sure the Spring server is running on port 8080."));
    }

    if (
      !configuredApiUrl &&
      !import.meta.env.DEV &&
      error.response.status === 405
    ) {
      return Promise.reject(
        new Error("Backend API is not configured for production. Set VITE_API_URL to your deployed Spring backend URL before redeploying.")
      );
    }

    return Promise.reject(error);
  }
);

export default API;
export const initialArtisanOrders = orders.flatMap((order) => order.items.map((item) => ({
  orderId: order.id,
  status: order.status,
  placedAt: order.placedAt,
  productId: item.productId,
  product: item.product,
  quantity: item.quantity
}))
);
