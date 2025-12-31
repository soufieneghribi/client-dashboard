import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditRules } from '../store/slices/credit';

/**
 * Hook personnalisé pour gérer les règles de crédit
 * @param {string} typeCredit - Type de crédit sélectionné
 * @returns {object} - Règles et limites pour le type de crédit
 */
export const useCreditRules = (typeCredit) => {
    const dispatch = useDispatch();
    const { rules, rulesLoading } = useSelector((state) => state.credit);
    const [currentRule, setCurrentRule] = useState(null);

    useEffect(() => {
        if (rules.length === 0 && !rulesLoading) {
            dispatch(fetchCreditRules());
        }
    }, [dispatch, rules.length, rulesLoading]);

    useEffect(() => {
        if (typeCredit && rules.length > 0) {
            const rule = rules.find(r => r.type_credit === typeCredit);
            setCurrentRule(rule || null);
        } else {
            setCurrentRule(null);
        }
    }, [typeCredit, rules]);

    const getLimits = useCallback(() => {
        if (!currentRule) {
            return {
                montantMin: 100,
                montantMax: 50000,
                dureeMin: 6,
                dureeMax: 60,
                tauxInteret: 0,
                tauxEndettementMax: 33
            };
        }

        return {
            montantMin: parseFloat(currentRule.montant_min) || 100,
            montantMax: parseFloat(currentRule.montant_max) || 50000,
            dureeMin: parseInt(currentRule.duree_min) || 6,
            dureeMax: parseInt(currentRule.duree_max) || 60,
            tauxInteret: parseFloat(currentRule.taux_interet) || 0,
            tauxEndettementMax: parseFloat(currentRule.taux_endettement_max) || 33
        };
    }, [currentRule]);

    return {
        rules,
        currentRule,
        limits: getLimits(),
        loading: rulesLoading
    };
};

/**
 * Hook personnalisé pour la logique de crédit
 * @returns {object} - Fonctions utilitaires pour le crédit
 */
export const useCredit = () => {
    /**
     * Valide les données de simulation
     */
    const validateSimulation = useCallback((data, limits) => {
        const errors = {};

        if (!data.type_credit) {
            errors.type_credit = 'Veuillez sélectionner un type de crédit';
        }

        if (!data.montant_panier || data.montant_panier < limits.montantMin) {
            errors.montant_panier = `Le montant doit être au moins ${limits.montantMin} DT`;
        }

        if (data.montant_panier > limits.montantMax) {
            errors.montant_panier = `Le montant ne peut pas dépasser ${limits.montantMax} DT`;
        }

        if (data.apport < 0) {
            errors.apport = 'L\'apport ne peut pas être négatif';
        }

        if (data.apport >= data.montant_panier) {
            errors.apport = 'L\'apport doit être inférieur au montant total';
        }

        if (!data.duree || data.duree < limits.dureeMin) {
            errors.duree = `La durée doit être au moins ${limits.dureeMin} mois`;
        }

        if (data.duree > limits.dureeMax) {
            errors.duree = `La durée ne peut pas dépasser ${limits.dureeMax} mois`;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }, []);

    /**
     * Valide les données d'éligibilité
     */
    const validateEligibility = useCallback((data) => {
        const errors = {};

        if (!data.salaire_net || data.salaire_net <= 0) {
            errors.salaire_net = 'Veuillez saisir votre salaire net';
        }

        if (data.charges < 0) {
            errors.charges = 'Les charges ne peuvent pas être négatives';
        }

        if (!data.mensualite || data.mensualite <= 0) {
            errors.mensualite = 'Mensualité invalide';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }, []);

    /**
     * Calcule le taux d'endettement
     */
    const calculateTauxEndettement = useCallback((mensualite, salaireNet, charges) => {
        if (!salaireNet || salaireNet <= 0) return 0;
        const totalCharges = (parseFloat(mensualite) || 0) + (parseFloat(charges) || 0);
        return (totalCharges / salaireNet) * 100;
    }, []);

    /**
     * Formate un montant en devise
     */
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency: 'TND',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }, []);

    /**
     * Formate un pourcentage
     */
    const formatPercentage = useCallback((value) => {
        return `${parseFloat(value).toFixed(2)}%`;
    }, []);

    return {
        validateSimulation,
        validateEligibility,
        calculateTauxEndettement,
        formatCurrency,
        formatPercentage
    };
};
