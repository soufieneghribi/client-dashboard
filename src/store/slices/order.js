import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

/**
 * Order Redux Slice
 */

export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (auth_token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.ORDERS.LIST,
        {
          headers: getAuthHeaders(auth_token),
          timeout: 10000
        }
      );

      if (!response.data) {
        throw new Error("Réponse vide du serveur");
      }

      let orders = [];
      if (response.data.success === true && response.data.data) {
        orders = response.data.data;
      } else if (response.data.data) {
        orders = response.data.data;
      } else if (Array.isArray(response.data)) {
        orders = response.data;
      } else {
        orders = [];
      }

      return orders;

    } catch (err) {
      let errorMessage = "Erreur lors du chargement des commandes.";
      let errorDetails = null;

      if (err.response) {
        const status = err.response.status;
        switch (status) {
          case 401:
          case 403:
            errorMessage = "Session expirée. Veuillez vous reconnecter.";
            localStorage.removeItem("token");
            break;
          case 404:
            errorMessage = "Endpoint des commandes introuvable.";
            break;
          case 500:
            errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
            break;
          case 422:
            errorMessage = "Données invalides.";
            errorDetails = err.response.data?.errors;
            break;
          default:
            errorMessage = `Erreur ${status}: ${err.response.data?.message || err.message}`;
        }
        return rejectWithValue({
          status,
          message: errorMessage,
          details: errorDetails || err.response.data
        });
      } else if (err.request) {
        errorMessage = "Pas de réponse du serveur. Vérifiez votre connexion.";
        return rejectWithValue({
          message: errorMessage,
          type: 'network_error'
        });
      } else {
        errorMessage = err.message || "Une erreur inattendue est survenue.";
        return rejectWithValue({
          message: errorMessage,
          type: 'request_error'
        });
      }
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: [],
    loading: false,
    error: null,
    lastFetch: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.order = [];
      state.error = null;
      state.lastFetch = null;
    },
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.order.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        state.order[index] = { ...state.order[index], ...updatedOrder };
      }
    },
    addOrder: (state, action) => {
      state.order.unshift(action.payload);
    },
    removeOrder: (state, action) => {
      state.order = state.order.filter(o => o.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload;
      state.error = null;
      state.lastFetch = new Date().toISOString();
    });
    builder.addCase(fetchOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || {
        message: "Erreur inconnue",
        type: 'unknown_error'
      };
    });
  },
});

export const selectOrders = (state) => state.order.order;
export const selectOrdersLoading = (state) => state.order.loading;
export const selectOrdersError = (state) => state.order.error;
export const selectLastFetch = (state) => state.order.lastFetch;

export const selectCurrentOrders = (state) => {
  const orders = state.order.order;
  if (!Array.isArray(orders)) return [];
  return orders.filter(o =>
    ["pending", "confirmed", "processing", "out_for_delivery", "preparing"].includes(o.order_status)
  );
};

export const selectHistoricalOrders = (state) => {
  const orders = state.order.order;
  if (!Array.isArray(orders)) return [];
  return orders.filter(o =>
    ["delivered", "canceled", "failed", "returned", "refund_requested"].includes(o.order_status)
  );
};

export const selectOrderById = (orderId) => (state) => {
  const orders = state.order.order;
  if (!Array.isArray(orders)) return null;
  return orders.find(o => o.id === parseInt(orderId));
};

export const { clearOrders, updateOrder, addOrder, removeOrder } = orderSlice.actions;
export default orderSlice.reducer;
