"""
Tounsi (Tunisian Dialect) Utilities
Maps Tunisian Arabic/Derja words to French equivalents for product search.
"""

# ============================================================
# TOUNSI → FRENCH SYNONYM MAP (for product search)
# ============================================================
TOUNSI_PRODUCT_SYNONYMS = {
    # Oeufs / Eggs
    "3dham": "oeuf oeufs", "3adham": "oeuf oeufs", "beidh": "oeuf oeufs",
    "beidha": "oeuf oeufs", "bid": "oeuf oeufs", "bayedh": "oeuf oeufs",
    "beid": "oeuf oeufs", "bidha": "oeuf oeufs",
    # Lait / Milk
    "7lib": "lait", "halib": "lait", "7aleb": "lait", "hlib": "lait",
    # Pain / Bread
    "khobz": "pain", "5obz": "pain", "khobza": "pain",
    # Eau / Water
    "maa": "eau",
    # Sucre / Sugar
    "sokkar": "sucre", "sokor": "sucre", "sokar": "sucre",
    # Huile / Oil
    "zit": "huile", "zeit": "huile", "zit zitoun": "huile olive",
    # Beurre / Butter
    "zebda": "beurre", "zibda": "beurre",
    # Fromage / Cheese
    "jben": "fromage", "jebna": "fromage", "fromaj": "fromage",
    # Poulet / Chicken
    "djej": "poulet", "djeja": "poulet", "djejna": "poulet",
    # Viande / Meat
    "la7em": "viande", "la7m": "viande", "lahm": "viande",
    # Poisson / Fish
    "7out": "poisson", "hout": "poisson", "samak": "poisson",
    # Tomate / Tomato
    "tmatem": "tomate", "tmatim": "tomate", "tomati": "tomate", "tomatich": "tomate",
    # Pomme de terre / Potato
    "batata": "pomme de terre",
    # Oignon / Onion
    "bsal": "oignon", "basla": "oignon", "besla": "oignon",
    # Ail / Garlic
    "thoum": "ail", "thom": "ail",
    # Farine / Flour
    "f9uss": "farine", "d9i9": "farine", "dkik": "farine", "farina": "farine",
    # Pâtes / Pasta
    "makarona": "pates macaroni", "makrouna": "pates macaroni",
    # Riz / Rice
    "rouz": "riz", "roz": "riz",
    # Thé / Tea
    "tey": "the", "tay": "the", "atey": "the", "atay": "the",
    # Café / Coffee
    "9ahwa": "cafe", "kahwa": "cafe", "gahwa": "cafe",
    # Yaourt / Yogurt
    "yawort": "yaourt", "rayeb": "yaourt lait fermente",
    # Miel / Honey
    "3sel": "miel",
    # Sel / Salt
    "mel7": "sel",
    # Poivre / Pepper
    "felfel": "poivre piment",
    # Epices
    "tawabel": "epices",
    # Chamia
    "chamia": "chamia halva",
    # Harissa
    "hrissa": "harissa", "hrisa": "harissa",
    # Thon / Tuna
    "ton": "thon", "toun": "thon",
    # Sardine
    "sardin": "sardine",
    # Jus / Juice
    "3asir": "jus",
    # Chocolat
    "choklata": "chocolat", "chokla": "chocolat",
    # Biscuit
    "biskit": "biscuit", "biskwi": "biscuit",
    # Machine à laver
    "ghassala": "machine a laver", "ghassela": "machine a laver", "5assala": "machine a laver",
    # Réfrigérateur
    "tallaja": "refrigerateur frigo", "talaja": "refrigerateur frigo",
    # Climatiseur
    "klima": "climatiseur",
    # Papier / Tissue
    "klennex": "mouchoir", "clinex": "mouchoir",
    # Couche / Diaper
    "kouch": "couche bebe",
    # Lessive / Detergent
    "sabouna": "savon lessive", "saboun": "savon lessive",
    "javel": "eau de javel",
    # Café soluble
    "nescafe": "cafe soluble nescafe",
    # Lben / Lait fermenté
    "lben": "lait fermente leben",
    # Bsisa
    "bsisa": "bsisa cereales",
    # Confiture
    "konfitir": "confiture",
    # Margarine
    "margarin": "margarine",
}


def translate_tounsi_query(message: str) -> str:
    """Translate Tounsi product words to French equivalents for better search."""
    words = message.lower().split()
    translated_parts = []
    changed = False
    for word in words:
        clean = word.strip(".,!?;:'\"")
        if clean in TOUNSI_PRODUCT_SYNONYMS:
            translated_parts.append(TOUNSI_PRODUCT_SYNONYMS[clean])
            changed = True
        else:
            translated_parts.append(word)
    if changed:
        return " ".join(translated_parts) + " " + message
    return message
