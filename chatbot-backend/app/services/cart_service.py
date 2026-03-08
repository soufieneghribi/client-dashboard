"""
Cart Service - Handles product matching and cart operations via chatbot
Parses user messages to extract product names, quantities, and matches them to catalog
"""
import re
from typing import List, Dict, Optional, Tuple
from app.models import CartProduct, ChatAction, ActionType
from app.services.vector_store import search_products


# ==================== QUANTITY EXTRACTION ====================

# French quantity patterns
QUANTITY_PATTERNS = [
    # "2 kg de tomates", "1.5kg tomates"
    (r"(\d+[.,]?\d*)\s*(?:kg|kilo|kilos)\s+(?:de\s+)?(.+?)(?:\s+et\s+|,|$)", "kg"),
    # "500g de poulet", "500 g poulet"
    (r"(\d+[.,]?\d*)\s*(?:g|gr|grammes?)\s+(?:de\s+)?(.+?)(?:\s+et\s+|,|$)", "g"),
    # "2 litres de lait", "1l de lait"
    (r"(\d+[.,]?\d*)\s*(?:l|litre|litres)\s+(?:de\s+)?(.+?)(?:\s+et\s+|,|$)", "l"),
    # "3 bouteilles de ...", "2 paquets de ..."
    (r"(\d+)\s+(?:bouteilles?|paquets?|boîtes?|sachets?|pièces?|unités?)\s+(?:de\s+)?(.+?)(?:\s+et\s+|,|$)", "unit"),
    # "2 tomates", "3 poulets"
    (r"(\d+)\s+(.+?)(?:\s+et\s+|,|$)", "unit"),
]

# Simple product mentions without quantity: "du lait", "des tomates", "de la farine"
PRODUCT_MENTION_PATTERNS = [
    r"(?:du|de la|des|de l'|le|la|les|un|une)\s+(.+?)(?:\s+et\s+|,|$)",
]


def extract_products_from_message(message: str) -> List[Dict]:
    """
    Extract product names and quantities from a user message.
    Examples:
        "ajoute 1kg de tomates et 500g de poulet" -> [{"name": "tomates", "qty": 1, "unit": "kg"}, ...]
        "mets du lait dans le panier" -> [{"name": "lait", "qty": 1, "unit": "unit"}]
    """
    msg = message.lower().strip()
    extracted = []
    seen_names = set()

    # Try quantity patterns first
    for pattern, unit in QUANTITY_PATTERNS:
        for match in re.finditer(pattern, msg):
            qty_str = match.group(1).replace(",", ".")
            name = match.group(2).strip().rstrip(".")
            # Clean up name
            name = re.sub(r"\s+", " ", name).strip()
            if name and name not in seen_names and len(name) > 1:
                try:
                    qty = float(qty_str)
                except ValueError:
                    qty = 1.0
                extracted.append({"name": name, "quantity": qty, "unit": unit})
                seen_names.add(name)

    # If no quantity patterns matched, try simple product mentions
    if not extracted:
        for pattern in PRODUCT_MENTION_PATTERNS:
            for match in re.finditer(pattern, msg):
                name = match.group(1).strip().rstrip(".")
                name = re.sub(r"\s+", " ", name).strip()
                if name and name not in seen_names and len(name) > 1:
                    extracted.append({"name": name, "quantity": 1, "unit": "unit"})
                    seen_names.add(name)

    # Fallback: extract product name by removing cart keywords from message
    if not extracted:
        cleaned = msg
        # Remove cart action words (FR + Tounsi + Arabic)
        cleaned = re.sub(
            r"\b(?:ajoute[rz]?|rajoute[rz]?|mets?|mettre|met|7ot|7otli|7othom|حط|زيد|زيدني"
            r"|na7eb\s*nzid|n7eb\s*nzid|zidni|zidli|nzid|a3tini)\b",
            "", cleaned
        )
        # Remove cart destination words
        cleaned = re.sub(
            r"\b(?:dans|au|à|fil|fi|f|في)\s*(?:mon|le|el)?\s*(?:panier|cart|سلة)\b",
            "", cleaned
        )
        # Remove common filler
        cleaned = re.sub(r"\b(?:s'?il\s*(?:te|vous)\s*pla[iî]t|svp|stp|please)\b", "", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip().strip(".,!?")
        if cleaned and len(cleaned) > 1:
            extracted.append({"name": cleaned, "quantity": 1, "unit": "unit"})

    return extracted


# keywords that should NEVER be mistaken for cart actions
_NON_CART_KEYWORDS = [
    "réclamation", "reclamation", "plainte", "problème", "retour",
    "remboursement", "recette", "cuisine", "cuisiner", "aide", "support",
    "livraison", "retard", "endommag", "manquant", "mauvais",
]


def detect_cart_intent(message: str) -> Optional[str]:
    """
    Detect specific cart-related intent from message.
    Returns: 'add', 'remove', 'view', 'clear', or None
    """
    msg = message.lower()

    # If message contains non-cart keywords, skip cart detection
    if any(kw in msg for kw in _NON_CART_KEYWORDS):
        return None

    # Add to cart — require explicit product + quantity signals
    # 'je veux / voudrais / commander' are too vague → excluded
    if re.search(
        r"\bajoute(?:r)?\b|\brajoute(?:r)?\b|\bmettre?\b.*panier|\bmet(?:s)?\b.*panier"
        r"|\bdans\s+(?:mon|le)\s+panier|\bau\s+panier|\badd\b"
        r"|\bzidni\b|\bzidli\b|\bzidhom\b|\bzidhomli\b|\bnzid\b|\b7ot\b|\b7otli\b|\b7othom\b"
        r"|\bna7eb\s*nzid\b|\bn7eb\s*nzid\b"
        r"|\bf(?:il)?\s+(?:el\s+)?panier\b|\bfil\s+cart\b",
        msg
    ):
        if not re.search(r"supprim|enlev|retir|remove|vider|clear", msg):
            return "add"

    # Add with explicit quantity (number + product) — accept any "number + word" pattern
    if re.search(r"(?:prend[sz]?|achète(?:r)?|veux|voudrais|donne|commander)\s+(?:\d+|du\b|de\s+la|des\b|un(?:e)?\b)", msg):
        if not re.search(r"supprim|enlev|retir|remove", msg):
            if re.search(r"\d+\s*(?:kg|g|l|ml|bouteill|paquet|pièce|boite|unité|\w{3,})", msg):
                return "add"

    # Remove from cart — must explicitly mention cart
    if re.search(r"(?:supprim|enlev|retir|enlève).+(?:panier|cart|commande)", msg):
        return "remove"
    if re.search(r"(?:du|de\s+la|des|le|la)\s+.+\s+(?:du|de\s+la|des)\s+panier", msg):
        return "remove"

    # View cart
    if re.search(
        r"(?:voir|affich|montr|show|qu'est.ce qu'il y a dans|contenu\s+du)\s+(?:mon\s+)?(?:panier|cart|caddie)"
        r"|mon\s+panier\s*[?!]?",
        msg
    ):
        return "view"

    # Clear cart
    if re.search(r"vide(?:r)?\s+(?:mon|le)\s+panier|effac.+panier|réinitialis.+panier", msg):
        return "clear"

    return None


def _relevance_score(query_name: str, product_name: str) -> float:
    """Score how relevant a product is to the query. Higher = better match.
    Prefers products whose name starts with the query keyword."""
    q_lower = query_name.lower()
    p_lower = product_name.lower()

    fillers = {"de", "la", "le", "les", "des", "du", "d", "l", "au", "aux", "à", "en", "un", "une", "et"}
    q_words = [w for w in q_lower.split() if w not in fillers and len(w) >= 2]
    p_words = [w for w in p_lower.split() if w not in fillers and len(w) >= 2]

    if not q_words:
        return 0.0

    matches = 0
    for qw in q_words:
        for pw in p_words:
            if qw == pw or (len(qw) >= 3 and len(pw) >= 3 and (qw in pw or pw in qw)):
                matches += 1
                break

    if matches == 0:
        return 0.0

    base_score = matches / len(q_words)

    # Strong bonus: product name starts with a query word → it IS the product
    first_p = p_words[0] if p_words else ""
    for qw in q_words:
        if qw == first_p or (len(qw) >= 3 and len(first_p) >= 3 and (qw in first_p or first_p in qw)):
            base_score += 0.6
            break

    return base_score


async def match_products_to_catalog(product_requests: List[Dict]) -> Tuple[List[CartProduct], List[str]]:
    """
    Match extracted product names to the product catalog via semantic search.
    Uses relevance scoring to avoid returning wrong products.
    Returns: (matched_products, unmatched_names)
    """
    matched = []
    unmatched = []
    seen_ids = set()

    for req in product_requests:
        name = req["name"]
        raw_qty = float(req.get("quantity", 1))
        quantity = max(1, int(raw_qty) if raw_qty == int(raw_qty) else int(raw_qty) + 1)

        # Search in ChromaDB with minimum relevance score
        results = search_products(query=name, k=5, min_score=0.15)

        # Score each result and pick the best relevant match
        best = None
        best_rel = 0.0
        for r in results:
            rel = _relevance_score(name, r["name"])
            if rel > best_rel:
                best_rel = rel
                best = r
        # Require at least 50% of query words to match product name
        if best_rel < 0.5:
            best = None

        if best:
            rid = str(best["id"])
            if rid not in seen_ids:
                seen_ids.add(rid)
                matched.append(CartProduct(
                    id=rid,
                    name=best["name"],
                    price=best["price"],
                    old_price=best.get("old_price", 0),
                    quantity=quantity,
                    category=best.get("category", ""),
                    brand=best.get("brand", ""),
                    has_promo=best.get("has_promo", False),
                    discount_pct=best.get("discount_pct", 0),
                ))
        else:
            unmatched.append(name)

    return matched, unmatched


async def process_cart_action(message: str, current_cart: List[CartProduct] = None) -> Optional[ChatAction]:
    """
    Process a cart-related message and return a structured action.
    """
    cart_intent = detect_cart_intent(message)
    if not cart_intent:
        return None

    if cart_intent == "view":
        return ChatAction(
            type=ActionType.SHOW_CART,
            products=current_cart or [],
            message="Voici votre panier actuel."
        )

    if cart_intent == "clear":
        return ChatAction(
            type=ActionType.CLEAR_CART,
            message="Votre panier a été vidé."
        )

    if cart_intent == "add":
        product_requests = extract_products_from_message(message)
        if not product_requests:
            return None  # Let the RAG handle it as a general query

        matched, unmatched = await match_products_to_catalog(product_requests)

        msg_parts = []
        if matched:
            names = ", ".join([f"{p.name} ({p.price} TND)" for p in matched])
            msg_parts.append(f"J'ai ajouté au panier : {names}")
        if unmatched:
            msg_parts.append(f"Je n'ai pas trouvé : {', '.join(unmatched)}")

        return ChatAction(
            type=ActionType.ADD_TO_CART,
            products=matched if matched else None,
            message=" | ".join(msg_parts) if msg_parts else None
        )

    if cart_intent == "remove":
        product_requests = extract_products_from_message(message)
        if not product_requests:
            return None

        matched, _ = await match_products_to_catalog(product_requests)

        if matched:
            names = ", ".join([p.name for p in matched])
            return ChatAction(
                type=ActionType.REMOVE_FROM_CART,
                products=matched,
                message=f"J'ai retiré du panier : {names}"
            )

    return None


def format_cart_summary(cart: List[CartProduct]) -> str:
    """Format cart for display in chat context"""
    if not cart:
        return "Le panier est vide."

    lines = ["🛒 **Votre panier :**"]
    total = 0.0
    for item in cart:
        line_total = item.price * item.quantity
        total += line_total
        promo = f" ~~{item.old_price} TND~~ " if item.has_promo and item.old_price else ""
        lines.append(f"- {item.name} x{item.quantity} : {promo}{item.price} TND")

    lines.append(f"\n**Total : {total:.2f} TND**")
    return "\n".join(lines)
