import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

/**
 * Order Redux Slice - AMÉLIORÉ
 * 
 * Améliorations:
 * 1. ✅ Gestion d'erreur complète avec codes de statut
 * 2. ✅ Validation de la réponse API
 * 3. ✅ Support pour data.data ou data direct
 * 4. ✅ Messages d'erreur plus clairs
 * 5. ✅ Logging pour debugging
 */

/**
 * ✅ Async thunk pour récupérer la liste des commandes
 * @param {string} auth_token - Token d'authentification
 * @returns {Promise} Données des commandes depuis l'API
 */
export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (auth_token, { rejectWithValue }) => {
    try {
      console.log("🔄 Chargement des commandes...");

      const response = await axios.get(
        API_ENDPOINTS.ORDERS.LIST,
        {
          headers: getAuthHeaders(auth_token),
          timeout: 10000 // ✅ Timeout de 10 secondes
        }
      );

      // ✅ Valider la réponse
      if (!response.data) {
        throw new Error("Réponse vide du serveur");
      }

      // ✅ Gérer différents formats de réponse
      // Format 1: { success: true, data: [...] }
      // Format 2: { data: [...] }
      // Format 3: [...]
      let orders = [];

      if (response.data.success === true && response.data.data) {
        // Format avec success et data
        orders = response.data.data;
      } else if (response.data.data) {
        // Format avec data direct
        orders = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Format array direct
        orders = response.data;
      } else {
        console.warn("Format de réponse inconnu:", response.data);
        orders = [];
      }

      // ✅ Valider que c'est bien un array
      if (!Array.isArray(orders)) {
        console.error("Les commandes ne sont pas un array:", orders);
        throw new Error("Format de données invalide");
      }

      console.log(`✅ ${orders.length} commande(s) chargée(s)`);

      return orders;

    } catch (err) {
      console.error("❌ Erreur lors du chargement des commandes:", err);

      // ✅ Gestion d'erreur détaillée
      let errorMessage = "Erreur lors du chargement des commandes.";
      let errorDetails = null;

      if (err.response) {
        // Erreur de réponse du serveur
        const status = err.response.status;

        switch (status) {
          case 401:
          case 403:
            errorMessage = "Session expirée. Veuillez vous reconnecter.";
            // Nettoyer le token
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

        toast.error(errorMessage);

        return rejectWithValue({
          status,
          message: errorMessage,
          details: errorDetails || err.response.data
        });

      } else if (err.request) {
        // Pas de réponse du serveur
        errorMessage = "Pas de réponse du serveur. Vérifiez votre connexion.";
        toast.error(errorMessage);

        return rejectWithValue({
          message: errorMessage,
          type: 'network_error'
        });

      } else {
        // Erreur lors de la configuration de la requête
        errorMessage = err.message || "Une erreur inattendue est survenue.";
        toast.error(errorMessage);

        return rejectWithValue({
          message: errorMessage,
          type: 'request_error'
        });
      }
    }
  }
);

/**
 * ✅ Configuration du slice Order
 */
const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: [], // Array des commandes
    loading: false,
    error: null,
    lastFetch: null, // ✅ Timestamp de la dernière récupération
  },
  reducers: {
    /**
     * ✅ Vider les commandes
     */
    clearOrders: (state) => {
      state.order = [];
      state.error = null;
      state.lastFetch = null;
    },

    /**
     * ✅ NOUVEAU: Mettre à jour une commande spécifique
     */
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.order.findIndex(o => o.id === updatedOrder.id);

      if (index !== -1) {
        state.order[index] = { ...state.order[index], ...updatedOrder };
      }
    },

    /**
     * ✅ NOUVEAU: Ajouter une nouvelle commande
     */
    addOrder: (state, action) => {
      state.order.unshift(action.payload); // Ajouter au début
    },

    /**
     * ✅ NOUVEAU: Supprimer une commande
     */
    removeOrder: (state, action) => {
      state.order = state.order.filter(o => o.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // ✅ Gérer l'état de chargement
    builder.addCase(fetchOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    // ✅ Gérer le succès
    builder.addCase(fetchOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload;
      state.error = null;
      state.lastFetch = new Date().toISOString(); // ✅ Enregistrer le timestamp
    });

    // ✅ Gérer les erreurs
    builder.addCase(fetchOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || {
        message: "Erreur inconnue",
        type: 'unknown_error'
      };

      // ✅ Ne pas vider les commandes en cas d'erreur
      // Garder les anciennes commandes si disponibles
    });
  },
});

// ✅ Sélecteurs utiles
export const selectOrders = (state) => state.order.order;
export const selectOrdersLoading = (state) => state.order.loading;
export const selectOrdersError = (state) => state.order.error;
export const selectLastFetch = (state) => state.order.lastFetch;

// ✅ Sélecteur pour commandes en cours
export const selectCurrentOrders = (state) => {
  const orders = state.order.order;
  if (!Array.isArray(orders)) return [];

  return orders.filter(o =>
    ["pending", "confirmed", "processing", "out_for_delivery", "preparing"].includes(o.order_status)
  );
};

// ✅ Sélecteur pour historique
export const selectHistoricalOrders = (state) => {
  const orders = state.order.order;
  if (!Array.isArray(orders)) return [];

  return orders.filter(o =>
    ["delivered", "canceled", "failed", "returned", "refund_requested"].includes(o.order_status)
  );
};

// ✅ Sélecteur pour une commande spécifique
export const selectOrderById = (orderId) => (state) => {
  const orders = state.order.order;
  if (!Array.isArray(orders)) return null;

  return orders.find(o => o.id === parseInt(orderId));
};

export const { clearOrders, updateOrder, addOrder, removeOrder } = orderSlice.actions;
export default orderSlice.reducer;