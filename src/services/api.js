import axios from "axios";

const api = axios.create({
  baseURL: "https://tn360-122923924979.europe-west1.run.app", // Replace with your Laravel API URL
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
