import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { fetchUserProfileForce } from "./user";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

// ===================================
// HELPERS
// ===================================

const getAuthToken = () => localStorage.getItem("token") || null;

// Helper pour vérifier si tous les objectifs sont complétés
const isDealFullyCompleted = (deal) => {
  if (deal.type === "frequence") {
    const visites = Math.floor(parseFloat(deal.compteur_frequence) || 0);
    const objectif = parseFloat(deal.objectif_frequence) || 5;
    return visites >= objectif;
  }

  const objectives = [
    { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0 },
    { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0 },
    { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0 },
    { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0 },
    { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0 },
  ].filter(obj => obj.value > 0);

  if (objectives.length === 0) return false;

  // ✅ Vérifier plusieurs champs possibles pour le compteur
  const current = parseFloat(deal.compteur_objectif) ||
    parseFloat(deal.montant_achats) ||
    parseFloat(deal.total_achats) ||
    parseFloat(deal.current_amount) || 0;
  const highestObjective = objectives[objectives.length - 1];

  return current >= highestObjective.value;
};

// ===================================
// DATA TRANSFORMERS - ✅ MODIFIÉS
// ===================================

const transformDealsData = (deals) => {
  return deals.map(deal => {
    // ✅ Chercher le compteur dans plusieurs champs possibles
    const compteur = parseFloat(deal.compteur_objectif) ||
      parseFloat(deal.montant_achats) ||
      parseFloat(deal.total_achats) ||
      parseFloat(deal.current_amount) || 0;

    return {
      ID: deal.ID_deal_depense || deal.ID_deal_anniversaire || deal.ID,
      ID_client: deal.ID_client,
      amount_earned: parseFloat(deal.amount_earned) || 0,
      compteur_objectif: compteur, // ✅ Utiliser le compteur trouvé
      montant_achats: compteur, // ✅ Garder aussi cette valeur
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
      ...deal,
      // ✅ S'assurer que compteur_objectif est bien défini après le spread
      compteur_objectif: compteur
    };
  });
};

// ✅ Transformer pour deals marque - MODIFIÉ
const transformMarqueDealsData = (deals) => {
  return deals.map(deal => {
    // ✅ Chercher le compteur dans plusieurs champs possibles
    const compteur = parseFloat(deal.compteur_objectif) ||
      parseFloat(deal.montant_achats) ||
      parseFloat(deal.total_achats) ||
      parseFloat(deal.current_amount) ||
      parseFloat(deal.montant_marque) || 0;



    return {
      ID: deal.ID_deal_marque,
      ID_client: deal.ID_client,
      amount_earned: parseFloat(deal.amount_earned) || 0,
      compteur_objectif: compteur, // ✅ Utiliser le compteur trouvé
      montant_achats: compteur, // ✅ Garder aussi cette valeur
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
      ...deal,
      // ✅ S'assurer que compteur_objectif est bien défini après le spread
      compteur_objectif: compteur,
      montant_achats: compteur
    };
  });
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
    const amountEarned = parseFloat(deal.amount_earned) || 0;
    totalEarned += amountEarned;

    if (deal.type === "frequence") {
      const visites = Math.floor(parseFloat(deal.compteur_frequence) || 0);
      const objectif = parseFloat(deal.objectif_frequence) || 5;
      const gain = parseFloat(deal.gain) || 5;
      if (visites < objectif) {
        totalPending += gain;
      }
    } else {
      const objectives = [
        { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0 },
        { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0 },
        { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0 },
        { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0 },
        { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0 },
      ].filter(obj => obj.value > 0);

      if (objectives.length > 0) {
        // ✅ Utiliser le même compteur que dans le transformer
        const current = parseFloat(deal.compteur_objectif) ||
          parseFloat(deal.montant_achats) || 0;

        let nextObjectiveGain = 0;
        for (let i = 0; i < objectives.length; i++) {
          if (current < objectives[i].value) {
            nextObjectiveGain = objectives[i].gain;
            break;
          }
        }
        totalPending += nextObjectiveGain;
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

export const fetchClientDeals = createAsyncThunk(
  "deals/fetchClientDeals",
  async (clientId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) return rejectWithValue("No authentication token");

      const headers = getAuthHeaders(token);

      const fetchWithCatch = async (endpoint) => {
        try {
          const response = await axios.get(endpoint, { headers });
          return response.data;
        } catch (err) {
          return { data: [] }; // Return empty data on success failure
        }
      };

      const [depenseRes, marqueRes, frequenceRes, anniversaireRes] = await Promise.all([
        fetchWithCatch(API_ENDPOINTS.DEALS.DEPENSE.BY_CLIENT(clientId)),
        fetchWithCatch(API_ENDPOINTS.DEALS.MARQUE.BY_CLIENT(clientId)),
        fetchWithCatch(API_ENDPOINTS.DEALS.FREQUENCE.BY_CLIENT(clientId)),
        fetchWithCatch(API_ENDPOINTS.DEALS.ANNIVERSAIRE.BY_CLIENT(clientId))
      ]);

      const depenseDeals = transformDealsData(depenseRes?.data || []).map(d => ({ ...d, type: 'depense' }));
      const marqueDeals = transformMarqueDealsData(marqueRes?.data || []).map(d => ({ ...d, type: 'marque' }));
      const frequenceDeals = transformFrequenceDealsData(frequenceRes?.data || []).map(d => ({ ...d, type: 'frequence' }));
      const anniversaireDeals = transformDealsData(anniversaireRes?.data || []).map(d => ({ ...d, type: 'anniversaire' }));

      // ✅ Log pour debug


      return { depense: depenseDeals, marque: marqueDeals, frequence: frequenceDeals, anniversaire: anniversaireDeals };
    } catch (error) {

      return rejectWithValue(error.response?.data?.message || "Failed to fetch deals");
    }
  }
);

export const transferDealToCagnotte = createAsyncThunk(
  "deals/transferDealToCagnotte",
  async ({ dealType, dealId, amount }, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = getAuthToken();
      if (!token) return rejectWithValue("No authentication token");

      const state = getState();
      const dealArray = state.deals[dealType];
      const deal = dealArray?.find(d => d.ID === dealId);

      if (!deal) return rejectWithValue("Deal non trouvé");
      if (!isDealFullyCompleted(deal)) return rejectWithValue("Le deal n'est pas encore complètement terminé");

      let endpoint = '';
      switch (dealType) {
        case 'depense': endpoint = API_ENDPOINTS.DEALS.DEPENSE.TRANSFER(dealId); break;
        case 'marque': endpoint = API_ENDPOINTS.DEALS.MARQUE.TRANSFER(dealId); break;
        case 'frequence': endpoint = API_ENDPOINTS.DEALS.FREQUENCE.TRANSFER(dealId); break;
        case 'anniversaire': endpoint = API_ENDPOINTS.DEALS.ANNIVERSAIRE.TRANSFER(dealId); break;
        default: return rejectWithValue("Type de deal invalide");
      }

      const response = await axios.post(endpoint, {}, { headers: getAuthHeaders(token) });
      const userProfile = await dispatch(fetchUserProfileForce()).unwrap();
      if (userProfile?.ID_client) {
        await dispatch(fetchClientDeals(userProfile.ID_client)).unwrap();
      }

      return { dealType, dealId, amount, success: true, message: `${amount} DT transférés avec succès vers votre cagnotte!` };
    } catch (error) {

      return rejectWithValue(error.response?.data?.message || "Échec du transfert");
    }
  }
);

// ===================================
// SLICE
// ===================================

const dealsSlice = createSlice({
  name: "deals",
  initialState: {
    depense: [], marque: [], frequence: [], anniversaire: [],
    activeDeal: null, loading: false, error: null,
    totalEarned: 0, totalPending: 0, lastFetchTime: null,
    transferLoading: false, transferError: null, transferredDeals: []
  },
  reducers: {
    setActiveDeal: (state, action) => { state.activeDeal = action.payload; },
    clearError: (state) => { state.error = null; state.transferError = null; },
    markDealAsTransferred: (state, action) => {
      const { dealType, dealId } = action.payload;
      state.transferredDeals.push(`${dealType}_${dealId}`);
    },
    updateDealProgress: (state, action) => {
      const { dealType, dealId, progress } = action.payload;
      const deal = state[dealType]?.find(d => d.ID === dealId);
      if (deal) {
        if (dealType === 'frequence') deal.compteur_frequence = progress;
        else { deal.compteur_objectif = progress; deal.montant_achats = progress; }
        const allDeals = [...state.depense, ...state.marque, ...state.frequence, ...state.anniversaire];
        const totals = calculateTotals(allDeals);
        state.totalEarned = totals.totalEarned;
        state.totalPending = totals.totalPending;
      }
    },
    clearDeals: (state) => {
      state.depense = []; state.marque = []; state.frequence = []; state.anniversaire = [];
      state.totalEarned = 0; state.totalPending = 0; state.activeDeal = null;
      state.error = null; state.transferError = null; state.transferredDeals = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientDeals.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClientDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.depense = action.payload.depense || [];
        state.marque = action.payload.marque || [];
        state.frequence = action.payload.frequence || [];
        state.anniversaire = action.payload.anniversaire || [];
        state.lastFetchTime = Date.now();
        const allDeals = [...state.depense, ...state.marque, ...state.frequence, ...state.anniversaire];
        const totals = calculateTotals(allDeals);
        state.totalEarned = totals.totalEarned;
        state.totalPending = totals.totalPending;
      })
      .addCase(fetchClientDeals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(transferDealToCagnotte.pending, (state) => { state.transferLoading = true; state.transferError = null; })
      .addCase(transferDealToCagnotte.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.transferredDeals.push(`${action.payload.dealType}_${action.payload.dealId}`);
        // 
      })
      .addCase(transferDealToCagnotte.rejected, (state, action) => {
        state.transferLoading = false;
        state.transferError = action.payload;
        // 
      });
  }
});

export const { setActiveDeal, clearError, updateDealProgress, clearDeals, markDealAsTransferred } = dealsSlice.actions;
export { isDealFullyCompleted };
export default dealsSlice.reducer;


