import { useState, useEffect, useCallback } from 'react';
import { dealApi } from '../services/dealApi';
import { toast } from 'react-toastify';

export const useClientDeals = (clientId) => {

    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(!!clientId);
    const [error, setError] = useState(null);
    const [pendingRewards, setPendingRewards] = useState(0);

    const fetchDeals = useCallback(async () => {

        if (!clientId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await dealApi.getClientDeals(clientId, 'all');

            // Parse V2 response structure
            let dealsData = [];
            if (response.status === 'success' && response.data) {
                dealsData = Array.isArray(response.data) ? response.data : [];
            }

            // Filter out expired deals
            const now = new Date();
            const activeDeals = dealsData.filter(deal => {
                if (!deal.date_fin) return true;
                const endDate = new Date(deal.date_fin);
                return endDate >= now;
            });

            // Categorize deals by type
            const categorizedDeals = {
                spend: [],
                brand: [],
                frequency: [],
                birthday: []
            };

            activeDeals.forEach(deal => {
                if (deal.ID_deal_depense) {
                    categorizedDeals.spend.push({ ...deal, dealType: 'spend' });
                } else if (deal.ID_deal_marque) {
                    categorizedDeals.brand.push({ ...deal, dealType: 'brand' });
                } else if (deal.ID_deal_frequence) {
                    categorizedDeals.frequency.push({ ...deal, dealType: 'frequency' });
                } else if (deal.ID_deal_anniversaire) {
                    categorizedDeals.birthday.push({ ...deal, dealType: 'birthday' });
                }
            });

            setDeals(categorizedDeals);

            // Calculate total pending rewards
            const totalRewards = activeDeals.reduce((sum, deal) => {
                return sum + (deal.amount_earned || 0);
            }, 0);
            setPendingRewards(totalRewards);

        } catch (err) {
            console.error('Error fetching deals:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des offres';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });
            setDeals({ spend: [], brand: [], frequency: [], birthday: [] });
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const transferDeal = async (dealId) => {
        try {
            const response = await dealApi.transferDeal(dealId);

            if (response.success) {
                toast.success(`${response.data.transferred_amount.toFixed(2)} DT transférés vers votre cagnotte !`, {
                    position: "top-right",
                    autoClose: 4000,
                });

                // Refresh deals after successful transfer
                await fetchDeals();

                return { success: true, data: response.data };
            } else {
                const errorMsg = response.error || 'Échec du transfert';
                toast.error(errorMsg, {
                    position: "top-right",
                    autoClose: 5000,
                });
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            console.error('Transfer error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du transfert';
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });
            return { success: false, error: errorMessage };
        }
    };

    return {
        deals,
        loading,
        error,
        pendingRewards,
        transferDeal,
        refresh: fetchDeals
    };
};
