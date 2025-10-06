import axios from "axios";

export const API_BASE_URL = "https://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL, // Replace with your Laravel API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Example: Fetch popular products
export const getPopularProducts = async () => {
  try {
    const response = await api.get("/products/popular");
    return response.data;
  } catch (error) {
    console.error("Error fetching popular products:", error);
    throw error;
  }
};

export default api;
