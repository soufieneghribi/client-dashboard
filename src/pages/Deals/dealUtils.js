export const getBrandColor = (brandName) => {
    if (!brandName) return "#673AB7";
    const brand = brandName.toUpperCase();
    switch (brand) {
        case "CARREFOUR": return "#0066CC";
        case "MONOPRIX": return "#E31837";
        case "AZIZA": return "#FF6B35";
        case "MG": return "#00A651";
        case "DELICE": return "#1A237E";
        default: return "#673AB7";
    }
};

export const getBrandInitials = (brandName) => {
    if (!brandName) return "?";
    const words = brandName.trim().split(" ");
    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return brandName.length >= 2
        ? brandName.substring(0, 2).toUpperCase()
        : brandName[0].toUpperCase();
};

export const getHighestGain = (deal) => {
    if (deal.type === "frequence") {
        return parseFloat(deal.gain) || 0;
    }
    let highestGain = 0;
    if ((deal.gain_objectif_5 ?? 0) > 0) highestGain = deal.gain_objectif_5;
    else if ((deal.gain_objectif_4 ?? 0) > 0) highestGain = deal.gain_objectif_4;
    else if ((deal.gain_objectif_3 ?? 0) > 0) highestGain = deal.gain_objectif_3;
    else if ((deal.gain_objectif_2 ?? 0) > 0) highestGain = deal.gain_objectif_2;
    else if ((deal.gain_objectif_1 ?? 0) > 0) highestGain = deal.gain_objectif_1;
    return highestGain;
};

export const getDealProgress = (deal) => {
    if (deal.type === "frequence") {
        return {
            current: Math.floor(parseFloat(deal.compteur_frequence) || 0),
            isFrequence: true,
        };
    }
    const compteur =
        parseFloat(deal.compteur_objectif) ||
        parseFloat(deal.montant_achats) ||
        parseFloat(deal.total_achats) ||
        parseFloat(deal.current_amount) ||
        0;
    return {
        current: compteur,
        isFrequence: false,
    };
};
