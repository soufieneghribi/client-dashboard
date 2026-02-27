/**
 * Check if a deal is fully completed and ready for transfer
 * A deal is only fully completed when ALL objectives are achieved
 */
export const isDealFullyCompleted = (deal) => {
    if (!deal) return false;

    // For frequency deals
    if (deal.dealType === 'frequency') {
        const current = deal.compteur_frequence || 0;
        const target = deal.objectif_frequence || 0;
        return current >= target && target > 0;
    }

    // For spend, brand, birthday deals (tiered objectives)
    // Check if the highest objective is reached
    const current = deal.compteur_objectif || 0;

    // Find the highest objective that has a value
    let highestObjective = 0;
    for (let i = 5; i >= 1; i--) {
        const objValue = parseFloat(deal[`objectif_${i}`]);
        if (!isNaN(objValue) && objValue > 0) {
            highestObjective = objValue;
            break;
        }
    }

    // Deal is fully completed only if current progress >= highest objective
    return highestObjective > 0 && current >= highestObjective;
};

/**
 * Get the progress percentage for a deal
 */
export const getDealProgress = (deal) => {
    if (!deal) return { current: 0, target: 0, percentage: 0 };

    if (deal.dealType === 'frequency') {
        const current = deal.compteur_frequence || 0;
        const target = deal.objectif_frequence || 0;
        return {
            current,
            target,
            percentage: target > 0 ? (current / target) * 100 : 0
        };
    }

    // For tiered deals
    const current = deal.compteur_objectif || 0;
    let highestObjective = 0;

    for (let i = 5; i >= 1; i--) {
        const objValue = parseFloat(deal[`objectif_${i}`]);
        if (!isNaN(objValue) && objValue > 0) {
            highestObjective = objValue;
            break;
        }
    }

    return {
        current,
        target: highestObjective,
        percentage: highestObjective > 0 ? (current / highestObjective) * 100 : 0
    };
};

/**
 * Get the highest gain/reward for a deal
 */
export const getHighestGain = (deal) => {
    if (!deal) return 0;

    if (deal.dealType === 'frequency') {
        return deal.gain || 0;
    }

    // For tiered deals, find the highest gain
    let maxGain = 0;
    for (let i = 1; i <= 5; i++) {
        const gain = parseFloat(deal[`gain_objectif_${i}`]);
        if (!isNaN(gain) && gain > maxGain) {
            maxGain = gain;
        }
    }

    return maxGain;
};

/**
 * Get brand color based on brand name
 */
export const getBrandColor = (brandName) => {
    if (!brandName) return '#6366f1';

    const colors = {
        'delice': '#00a8e8',
        'signal': '#000000',
        'judy': '#e91e63',
        'default': '#6366f1'
    };

    const name = brandName.toLowerCase();
    return colors[name] || colors.default;
};
