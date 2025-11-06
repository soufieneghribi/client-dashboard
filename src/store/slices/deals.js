import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { fetchUserProfileForce } from "./user";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

// ===================================
// HELPERS
// ===================================

const getAuthToken = () => {
  return localStorage.getItem("token") || null;
};

// Helper pour vérifier si tous les objectifs sont complétés
const isDealFullyCompleted = (deal) => {
  if (deal.type === "frequence") {
    const visites = Math.floor(parseFloat(deal.compteur_frequence) || 0);
    const objectif = parseFloat(deal.objectif_frequence) || 5;
    return visites >= objectif;
  }
  
  // Pour les deals avec objectifs multiples
  const objectives = [
    { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0 },
    { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0 },
    { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0 },
    { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0 },
    { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0 },
  ].filter(obj => obj.value > 0); // Filtrer seulement les objectifs actifs

  if (objectives.length === 0) return false;

  const current = parseFloat(deal.compteur_objectif) || 0;
  const highestObjective = objectives[objectives.length - 1];
  
  // Vérifier si le dernier objectif (le plus élevé) est atteint
  return current >= highestObjective.value;
};

// ===================================
// DATA TRANSFORMERS
// ===================================

const transformDealsData = (deals) => {
  return deals.map(deal => ({
    ID: deal.ID_deal_depense || deal.ID_deal_anniversaire || deal.ID,
    ID_client: deal.ID_client,
    amount_earned: parseFloat(deal.amount_earned) || 0,
    compteur_objectif: parseFloat(deal.compteur_objectif) || 0,
    objectif_1: parseFloat(deal.objectif_1) || 0,
    objectif_2: parseFloat(deal.objectif_2) || 0,
    objectif_3: parseFloat(deal.objectif_3) || 0,
    objectif_4: parseFloat(deal.objectif_4) || 0,
    objectif_5: parseFloat(deal.objectif_5) || 0,
    gain_objectif_1: parseFloat(deal.gain_objectif_1) || 0,
    gain_objectif_2: parseFloat(deal.gain_objectif_2) || 0,
    gain_objectif_3: parseFloat(deal.gain_objectif_3) || 0,
    gain_objectif_4: parseFloat(deal.gain_objectif_4) || 0,
    gain_objectif_5: parseFloat(deal.gain_objectif_5) || 0,
    status: deal.statut || 'en_cours',
    date_fin: deal.date_fin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...deal
  }));
};

// Special transformer for marque deals
const transformMarqueDealsData = (deals) => {
  return deals.map(deal => ({
    ID: deal.ID_deal_marque,
    ID_client: deal.ID_client,
    amount_earned: parseFloat(deal.amount_earned) || 0,
    compteur_objectif: parseFloat(deal.compteur_objectif) || 0,
    objectif_1: parseFloat(deal.objectif_1) || 0,
    objectif_2: parseFloat(deal.objectif_2) || 0,
    objectif_3: parseFloat(deal.objectif_3) || 0,
    objectif_4: parseFloat(deal.objectif_4) || 0,
    objectif_5: parseFloat(deal.objectif_5) || 0,
    gain_objectif_1: parseFloat(deal.gain_objectif_1) || 0,
    gain_objectif_2: parseFloat(deal.gain_objectif_2) || 0,
    gain_objectif_3: parseFloat(deal.gain_objectif_3) || 0,
    gain_objectif_4: parseFloat(deal.gain_objectif_4) || 0,
    gain_objectif_5: parseFloat(deal.gain_objectif_5) || 0,
    status: deal.statut || 'en_cours',
    date_fin: deal.date_fin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    marque_name: deal.marque?.nom_marque || deal.nom_marque || 'Unknown Brand',
    marque_logo: deal.marque?.image_url || deal.image_url || '',
    code_marque: deal.code_marque,
    ...deal
  }));
};

const transformFrequenceDealsData = (deals) => {
  return deals.map(deal => ({
    ID: deal.ID_deal_frequence,
    ID_client: deal.ID_client,
    amount_earned: parseFloat(deal.amount_earned) || 0,
    compteur_frequence: parseFloat(deal.compteur_frequence) || 0,
    objectif_frequence: parseFloat(deal.objectif_frequence) || 5,
    gain: parseFloat(deal.gain) || 5,
    status: deal.statut || 'en_cours',
    date_fin: deal.date_fin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...deal
  }));
};

// ===================================
// CALCULATE TOTALS HELPER
// ===================================

const calculateTotals = (allDeals) => {
  let totalEarned = 0;
  let totalPending = 0;

  allDeals.forEach(deal => {
    // Le backend met à jour amount_earned avec le CUMUL des gains
    // Donc on utilise directement amount_earned
    const amountEarned = parseFloat(deal.amount_earned) || 0;
    totalEarned += amountEarned;
    
    // Pour totalPending, on calcule le gain potentiel restant
    if (deal.type === "frequence") {
      const visites = Math.floor(parseFloat(deal.compteur_frequence) || 0);
      const objectif = parseFloat(deal.objectif_frequence) || 5;
      const gain = parseFloat(deal.gain) || 5;
      
      // Si pas encore complété, le gain est pending
      if (visites < objectif) {
        totalPending += gain;
      }
    } else {
      // Pour les deals avec objectifs multiples
      const objectives = [
        { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0 },
        { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0 },
        { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0 },
        { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0 },
        { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0 },
      ].filter(obj => obj.value > 0);
      
      if (objectives.length > 0) {
        const current = parseFloat(deal.compteur_objectif) || 0;
        const lastObjective = objectives[objectives.length - 1];
        
        // Si le dernier objectif n'est pas atteint, on compte le cumul comme pending
        if (current < lastObjective.value) {
          // Calculer le total de tous les gains possibles
          const totalPossibleGain = objectives.reduce((sum, obj) => sum + obj.gain, 0);
          // Soustraire ce qui est déjà gagné
          const remainingGain = totalPossibleGain - amountEarned;
          totalPending += Math.max(0, remainingGain);
        }
      }
    }
  });

  return {
    totalEarned: Math.max(0, totalEarned),
    totalPending: Math.max(0, totalPending)
  };
};

// ===================================
// ASYNC THUNKS
// ===================================

// Fetch all deals for a specific client
export const fetchClientDeals = createAsyncThunk(
  "deals/fetchClientDeals",
  async (clientId, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("No authentication token");
      }

      const headers = getAuthHeaders(token);

      const [depenseRes, marqueRes, frequenceRes, anniversaireRes] = await Promise.all([
        axios.get(API_ENDPOINTS.DEALS.DEPENSE.BY_CLIENT(clientId), { headers }),
        axios.get(API_ENDPOINTS.DEALS.MARQUE.BY_CLIENT(clientId), { headers }),
        axios.get(API_ENDPOINTS.DEALS.FREQUENCE.BY_CLIENT(clientId), { headers }),
        axios.get(API_ENDPOINTS.DEALS.ANNIVERSAIRE.BY_CLIENT(clientId), { headers })
      ]);

      const depenseDeals = transformDealsData(depenseRes.data?.data || []).map(d => ({ ...d, type: 'depense' }));
      const marqueDeals = transformMarqueDealsData(marqueRes.data?.data || []).map(d => ({ ...d, type: 'marque' }));
      const frequenceDeals = transformFrequenceDealsData(frequenceRes.data?.data || []).map(d => ({ ...d, type: 'frequence' }));
      const anniversaireDeals = transformDealsData(anniversaireRes.data?.data || []).map(d => ({ ...d, type: 'anniversaire' }));

      return {
        depense: depenseDeals,
        marque: marqueDeals,
        frequence: frequenceDeals,
        anniversaire: anniversaireDeals
      };
    } catch (error) {
      console.error("Error fetching client deals:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deals"
      );
    }
  }
);

// Transfer deal amount to cagnotte - ONLY WHEN FULLY COMPLETED
export const transferDealToCagnotte = createAsyncThunk(
  "deals/transferDealToCagnotte",
  async ({ dealType, dealId, amount }, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue("No authentication token");
      }

      // Vérifier si le deal est complètement terminé
      const state = getState();
      const dealArray = state.deals[dealType];
      const deal = dealArray?.find(d => d.ID === dealId);
      
      if (!deal) {
        return rejectWithValue("Deal non trouvé");
      }

      // VÉRIFICATION CRITIQUE: Le deal doit être complètement terminé
      if (!isDealFullyCompleted(deal)) {
        return rejectWithValue("Le deal n'est pas encore complètement terminé");
      }

      let endpoint = '';
      
      switch (dealType) {
        case 'depense':
          endpoint = API_ENDPOINTS.DEALS.DEPENSE.TRANSFER(dealId);
          break;
        case 'marque':
          endpoint = API_ENDPOINTS.DEALS.MARQUE.TRANSFER(dealId);
          break;
        case 'frequence':
          endpoint = API_ENDPOINTS.DEALS.FREQUENCE.TRANSFER(dealId);
          break;
        case 'anniversaire':
          endpoint = API_ENDPOINTS.DEALS.ANNIVERSAIRE.TRANSFER(dealId);
          break;
        default:
          return rejectWithValue("Type de deal invalide");
      }

      console.log(`🔄 Transfert MANUEL pour le deal ${dealType} ${dealId}`);

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: getAuthHeaders(token)
        }
      );

      console.log(`✅ Transfert réussi pour ${dealType} deal ${dealId}:`, response.data);

      // Rafraîchir le profil utilisateur SANS CACHE pour mettre à jour la cagnotte immédiatement
      const userProfile = await dispatch(fetchUserProfileForce()).unwrap();

      // Rafraîchir les deals avec le clientId correct
      if (userProfile?.ID_client) {
        await dispatch(fetchClientDeals(userProfile.ID_client)).unwrap();
      }

      return {
        dealType,
        dealId,
        amount,
        success: true,
        message: `${amount} DT transférés avec succès vers votre cagnotte!`
      };

    } catch (error) {
      console.error(`❌ Transfert échoué pour ${dealType} deal ${dealId}:`, error);
      return rejectWithValue(
        error.response?.data?.message || "Échec du transfert"
      );
    }
  }
);

// ===================================
// SLICE
// ===================================

const dealsSlice = createSlice({
  name: "deals",
  initialState: {
    depense: [],
    marque: [],
    frequence: [],
    anniversaire: [],
    activeDeal: null,
    loading: false,
    error: null,
    totalEarned: 0,
    totalPending: 0,
    lastFetchTime: null,
    transferLoading: false,
    transferError: null,
    transferredDeals: []
  },
  reducers: {
    setActiveDeal: (state, action) => {
      state.activeDeal = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
      state.transferError = null;
    },
    
    markDealAsTransferred: (state, action) => {
      const { dealType, dealId } = action.payload;
      state.transferredDeals.push(`${dealType}_${dealId}`);
    },
    
    updateDealProgress: (state, action) => {
      const { dealType, dealId, progress } = action.payload;
      const dealArray = state[dealType];
      const deal = dealArray?.find(d => d.ID === dealId);
      
      if (deal) {
        if (dealType === 'frequence') {
          deal.compteur_frequence = progress;
        } else {
          deal.compteur_objectif = progress;
        }
        
        const allDeals = [
          ...state.depense,
          ...state.marque,
          ...state.frequence,
          ...state.anniversaire
        ];
        
        const totals = calculateTotals(allDeals);
        state.totalEarned = totals.totalEarned;
        state.totalPending = totals.totalPending;
      }
    },
    
    clearDeals: (state) => {
      state.depense = [];
      state.marque = [];
      state.frequence = [];
      state.anniversaire = [];
      state.totalEarned = 0;
      state.totalPending = 0;
      state.activeDeal = null;
      state.error = null;
      state.transferError = null;
      state.transferredDeals = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.depense = action.payload.depense || [];
        state.marque = action.payload.marque || [];
        state.frequence = action.payload.frequence || [];
        state.anniversaire = action.payload.anniversaire || [];
        state.lastFetchTime = Date.now();
        
        const allDeals = [
          ...state.depense,
          ...state.marque,
          ...state.frequence,
          ...state.anniversaire
        ];
        
        const totals = calculateTotals(allDeals);
        state.totalEarned = totals.totalEarned;
        state.totalPending = totals.totalPending;
      })
      .addCase(fetchClientDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch deals";
      })
      .addCase(transferDealToCagnotte.pending, (state) => {
        state.transferLoading = true;
        state.transferError = null;
      })
      .addCase(transferDealToCagnotte.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.transferError = null;
        
        const { dealType, dealId, amount, message } = action.payload;
        
        state.transferredDeals.push(`${dealType}_${dealId}`);
        
        toast.success(message || `${amount} DT transférés avec succès!`);
      })
      .addCase(transferDealToCagnotte.rejected, (state, action) => {
        state.transferLoading = false;
        state.transferError = action.payload || "Transfer failed";
        toast.error(action.payload || "Échec du transfert");
      });
  }
});

// ===================================
// EXPORTS
// ===================================

export const { 
  setActiveDeal, 
  clearError, 
  updateDealProgress,
  clearDeals,
  markDealAsTransferred
} = dealsSlice.actions;

// Export the helper function
export { isDealFullyCompleted };

export default dealsSlice.reducer;