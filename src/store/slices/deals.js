import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { fetchUserProfile } from "./user";

const BASE_URL = "https://tn360-back-office-122923924979.europe-west1.run.app";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token") || null;
};

// Fetch all deals for a specific client
export const fetchClientDeals = createAsyncThunk(
  "deals/fetchClientDeals",
  async (clientId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [depenseRes, marqueRes, frequenceRes, anniversaireRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/dealDepense/clientId/${clientId}`, { headers }),
        axios.get(`${BASE_URL}/api/v1/dealMarque/clientId/${clientId}`, { headers }),
        axios.get(`${BASE_URL}/api/v1/dealFrequence/clientId/${clientId}`, { headers }),
        axios.get(`${BASE_URL}/api/v1/dealAnniversaire/clientId/${clientId}`, { headers })
      ]);

      return {
        depense: transformDealsData(depenseRes.data?.data || []),
        marque: transformMarqueDealsData(marqueRes.data?.data || []),
        frequence: transformFrequenceDealsData(frequenceRes.data?.data || []),
        anniversaire: transformDealsData(anniversaireRes.data?.data || [])
      };
    } catch (error) {
      console.error("Error fetching client deals:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deals"
      );
    }
  }
);

// Helper function to transform deal data
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
    marque_name: deal.marque?.nom_marque || 'Unknown Brand',
    marque_logo: deal.marque?.image_url || '',
    code_marque: deal.code_marque,
    ...deal
  }));
};

// Special transformer for frequence deals
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

// Transfer deal to cagnotte - FIXED VERSION
export const transferDealToCagnotte = createAsyncThunk(
  "deals/transferToCagnotte",
  async ({ dealType, dealId, amount }, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        return rejectWithValue("No auth token");
      }

      const endpoints = {
        depense: `/api/v1/dealDepense/${dealId}/transfer-cagnotte`,
        marque: `/api/v1/dealMarque/${dealId}/transfer-cagnotte`,
        frequence: `/api/v1/dealFrequence/${dealId}/transfer-cagnotte`,
        anniversaire: `/api/v1/dealAnniversaire/${dealId}/transfer-cagnotte`
      };

      const endpoint = endpoints[dealType];
      
      if (!endpoint) {
        toast.error("Type de deal invalide");
        return rejectWithValue("Invalid deal type");
      }

      console.log('Transferring to backend:', {
        endpoint: `${BASE_URL}${endpoint}`,
        amount: amount,
        dealType: dealType,
        dealId: dealId
      });

      // Send the amount in the request body
      const response = await axios.post(
        `${BASE_URL}${endpoint}`,
        { amount: amount },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Transfer response:', response.data);

      // Refresh user profile to get updated cagnotte balance
      dispatch(fetchUserProfile());

      toast.success(`${amount} DT transféré avec succès à votre cagnotte!`);
      
      return { 
        dealType, 
        dealId, 
        amount: amount,
        data: response.data 
      };
    } catch (error) {
      console.error("Error transferring deal:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || "Échec du transfert";
      toast.error(errorMessage);
      
      return rejectWithValue(errorMessage);
    }
  }
);

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
    transferLoading: false
  },
  reducers: {
    setActiveDeal: (state, action) => {
      state.activeDeal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateDealProgress: (state, action) => {
      const { dealType, dealId, progress } = action.payload;
      const deal = state[dealType].find(d => d.ID === dealId);
      if (deal) {
        deal.compteur_objectif = progress;
      }
    },
    clearDeals: (state) => {
      state.depense = [];
      state.marque = [];
      state.frequence = [];
      state.anniversaire = [];
      state.totalEarned = 0;
      state.totalPending = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch client deals
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
        
        // Calculate totals
        const allDeals = [
          ...state.depense,
          ...state.marque,
          ...state.frequence,
          ...state.anniversaire
        ];
        
        state.totalEarned = allDeals.reduce((sum, deal) => {
          // For frequence deals
          if (deal.compteur_frequence !== undefined) {
            return sum + (deal.compteur_frequence >= deal.objectif_frequence ? deal.gain : 0);
          }
          
          // For other deals, find highest achieved objective
          let earned = 0;
          const objectives = [
            { value: deal.objectif_1, gain: deal.gain_objectif_1 },
            { value: deal.objectif_2, gain: deal.gain_objectif_2 },
            { value: deal.objectif_3, gain: deal.gain_objectif_3 },
            { value: deal.objectif_4, gain: deal.gain_objectif_4 },
            { value: deal.objectif_5, gain: deal.gain_objectif_5 }
          ];
          
          objectives.forEach(obj => {
            if (deal.compteur_objectif >= obj.value) {
              earned = obj.gain;
            }
          });
          
          return sum + earned;
        }, 0);
        
        state.totalPending = allDeals.reduce((sum, deal) => {
          if (deal.status === 'en_cours' || deal.status === 'pending') {
            // For frequence
            if (deal.gain !== undefined) {
              return sum + deal.gain;
            }
            // For others
            return sum + (deal.gain_objectif_5 || 0);
          }
          return sum;
        }, 0);
      })
      .addCase(fetchClientDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to fetch deals:', action.payload);
      })
      
      // Transfer to cagnotte
      .addCase(transferDealToCagnotte.pending, (state) => {
        state.transferLoading = true;
        state.error = null;
      })
      .addCase(transferDealToCagnotte.fulfilled, (state, action) => {
        state.transferLoading = false;
        const { dealType, dealId, amount } = action.payload;
        
        // Find and update the deal
        const dealArray = state[dealType];
        const deal = dealArray.find(d => d.ID === dealId);
        
        if (deal) {
          // Reset the earned amount and mark as transferred
          deal.amount_earned = 0;
          deal.status = 'transferred';
          
          // For frequence deals, reset counter
          if (deal.compteur_frequence !== undefined) {
            deal.compteur_frequence = 0;
          } else {
            // For other deals, reset compteur_objectif
            deal.compteur_objectif = 0;
          }
        }
        
        // Recalculate totals
        const allDeals = [
          ...state.depense,
          ...state.marque,
          ...state.frequence,
          ...state.anniversaire
        ];
        
        state.totalEarned = allDeals.reduce((sum, d) => {
          if (d.compteur_frequence !== undefined) {
            return sum + (d.compteur_frequence >= d.objectif_frequence ? d.gain : 0);
          }
          
          let earned = 0;
          const objectives = [
            { value: d.objectif_1, gain: d.gain_objectif_1 },
            { value: d.objectif_2, gain: d.gain_objectif_2 },
            { value: d.objectif_3, gain: d.gain_objectif_3 },
            { value: d.objectif_4, gain: d.gain_objectif_4 },
            { value: d.objectif_5, gain: d.gain_objectif_5 }
          ];
          
          objectives.forEach(obj => {
            if (d.compteur_objectif >= obj.value) {
              earned = obj.gain;
            }
          });
          
          return sum + earned;
        }, 0);
      })
      .addCase(transferDealToCagnotte.rejected, (state, action) => {
        state.transferLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setActiveDeal, 
  clearError, 
  updateDealProgress,
  clearDeals 
} = dealsSlice.actions;

export default dealsSlice.reducer;