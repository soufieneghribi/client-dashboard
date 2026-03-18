"""
RAG Engine - ChromaDB + OpenAI GPT-4.1-mini
Enhanced with cart actions, recipe suggestions, and complaint handling.
Emits: text chunks + structured JSON actions via SSE.
All non-action responses are DYNAMIC via LLM (no hardcoded text).
"""
import re
import json
import unicodedata
from typing import AsyncGenerator, Optional
from openai import AsyncOpenAI

from app.config import OPENAI_API_KEY, OPENAI_MODEL, SYSTEM_PROMPT, TEMPERATURE
from app.services.vector_store import search_products
from app.services.tn360_api import (
    fetch_categories,
    fetch_promotions,
    fetch_stores,
    fetch_recommended_products,
    create_complaint,
    fetch_promo_codes,
    reserve_promo_code,
    fetch_product_by_id,
)
from app.services.cart_service import (
    detect_cart_intent,
    extract_products_from_message,
    match_products_to_catalog,
    process_cart_action,
    format_cart_summary,
    _relevance_score,
)
from app.services.recipe_service import (
    detect_recipe_intent,
    search_recipes,
    process_recipe_request,
    format_recipe_suggestions,
    get_recipe_with_products,
)
from app.services.tounsi_utils import translate_tounsi_query, TOUNSI_PRODUCT_SYNONYMS
from app.models import CartProduct, ChatAction, ActionType


# OpenAI GPT-4.1-mini client
client = AsyncOpenAI(api_key=OPENAI_API_KEY)


# ============================================================
# LANGUAGE DETECTION
# ============================================================

def detect_language(message: str) -> str:
    """Detect language: 'arabic', 'tounsi', or 'french'.
    Tounsi uses latin numbers as letters (3=ع, 7=ح, 9=ق, 5=خ)
    """
    msg = message.strip()

    # Check for Arabic script (فصحى)
    arabic_chars = len(re.findall(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]', msg))
    total_chars = max(len(re.findall(r'\S', msg)), 1)
    arabic_ratio = arabic_chars / total_chars

    if arabic_ratio > 0.3:
        return "arabic"

    # Check for Tounsi (latin script with numbers = arabizi)
    tounsi_patterns = [
        r'\b3a[sz]lema\b', r'\b9addech\b', r'\bna7eb\b', r'\bn7eb\b',
        r'\bchnahiya\b', r'\bchnowa\b', r'\bbarcha\b', r'\bbehi\b',
        r'\bye5i\b', r'\blabess?\b', r'\bbech\b', r'\bkifech\b',
        r'\bwinek\b', r'\b7ot\b', r'\bfamma\b', r'\blyoum\b',
        r'\bena\b', r'\bhedha\b', r'\bhedhi\b', r'\bl9rib\b',
        r'\btansehouni\b', r'\bn3awnek\b', r'\b3andi\b', r'\bnzid\b',
        r'\bnraja3\b', r'\bna3mel\b', r'\bchhal\b', r'\b5edma\b',
        r'\bkhedma\b', r'\bahki\b', r'\bbidhat?\b', r'\bw\b',
        r'\bel\b', r'\bmta3\b', r'\bfi[l]?\b',
        r'\bzidni\b', r'\bzidli\b', r'\b7otli\b', r'\ba3tini\b',
        r'\bya3tik\b', r'\bwallah\b', r'\binchallah\b', r'\bsma7ni\b',
        r'\bchkoun\b', r'\bwahed\b', r'\bzouz\b', r'\btleta\b',
        r'\bma3andich\b', r'\bma3labalech\b', r'\bna3ref\b',
        r'\bchbik\b', r'\bwin\b', r'\bmouch\b', r'\bkif\b',
        r'\bmthabet\b', r'\bnechri\b', r'\b3dham\b', r'\b7lib\b',
        r'\bkhobz\b', r'\bzidha\b', r'\bzdedni\b', r'\bokhra\b',
        r'\bn7ab\b', r'\bnekho\b', r'\bnachri\b',
        r'\bna77i\b', r'\bse3a\b', r'\btfaddal\b', r'\b5alli\b',
        r'\byezzi\b', r'\bbarsha\b', r'\byfoutech\b', r'\bsoumeha\b',
        r'\bma\s*yfoutech\b', r'\bnheb\b', r'\bchay\b', r'\b7aja\b',
        r'\byekhi\b', r'\b3lech\b', r'\bkbal\b', r'\btaw\b',
        r'\bnharek\b', r'\bsa77a\b', r'\byaatik\b', r'\bchnoua\b',
    ]
    # Also detect arabizi number patterns: 3, 5, 7, 9 used as letters (inside words, not standalone)
    arabizi_numbers = len(re.findall(r'(?<=[a-zA-Z])[3579]|[3579](?=[a-zA-Z])', msg))
    has_tounsi_words = any(re.search(p, msg.lower()) for p in tounsi_patterns)
    # Check if any word is in the Tounsi synonym map
    msg_words = [w.strip(".,!?;:'\"").lower() for w in msg.split()]
    has_tounsi_product = any(w in TOUNSI_PRODUCT_SYNONYMS for w in msg_words)

    if has_tounsi_words or has_tounsi_product or (arabizi_numbers >= 2 and not msg.isdigit()):
        return "tounsi"

    return "french"


def get_fewshot_examples(lang: str) -> str:
    """Get few-shot examples to teach the model HOW to respond in the target language.
    Small models learn better from examples than from instructions.
    """
    if lang == "arabic":
        return (
            "\n\n=== أمثلة على المحادثة بالعربية ===\n"
            "Client: ما هي العروض المتاحة اليوم؟\n"
            "Assistant MG: مرحبا! 😊 عندنا عدة عروض اليوم:\n"
            "- شاميا باللوز 350غ: 4.75 د.ت (تخفيض 5%)\n"
            "- مناديل ماكس رول: 7.6 د.ت (تخفيض 5%)\n"
            "هل تريد إضافتها إلى السلة؟\n\n"
            "Client: كيف أسجل حساب جديد؟\n"
            "Assistant MG: أهلا! لإنشاء حساب جديد، اذهب إلى صفحة [التسجيل](/inscrire) واملأ البيانات: الاسم، البريد الإلكتروني، رقم الهاتف وكلمة المرور. إذا احتجت مساعدة أنا هنا! 😊\n"
            "=== نهاية الأمثلة ===\n"
            "⚠️ أجب بالعربية فقط. الأسعار بالدينار التونسي (د.ت)."
        )
    elif lang == "tounsi":
        return (
            "\n\n=== EXEMPLES CONVERSATION EN TOUNSI (100% LATIN, JAMAIS de caracteres arabes) ===\n"
            "Client: 3aslema, chnahiya el promo lyoum?\n"
            "Assistant MG: Marhba bik! 😊 Lyoum 3andna barcha promo:\n"
            "- Chamia bl louz 350g: 4.75 TND (promo -5%)\n"
            "- Essuie tout max roll: 7.6 TND (promo -5%)\n"
            "T7eb nzidhomlk fil panier?\n\n"
            "Client: 9addech el prix mta3 el mayonnaise?\n"
            "Assistant MG: El mayonnaise JADIDA b 7.64 TND. T7eb n7otha fil panier? 😊\n\n"
            "Client: kifech na3mel compte?\n"
            "Assistant MG: Behi! Emchi l page [inscription](/inscrire), a3bi el formulaire: esm, email, numero w mot de passe. Ken t7eb n3awnek, ahki!\n\n"
            "Client: zidni chamia fil panier\n"
            "Assistant MG: Behi, 7atithomlek fil panier! T7eb nzidlek 7aja okhra? 😊\n"
            "=== FIN EXEMPLES ===\n"
            "⚠️ REPONDS EN TOUNSI LATIN UNIQUEMENT. Jamais de حروف عربية dans ta reponse."
        )
    else:
        return ""


# ============================================================
# INTENT DETECTION (with Tounsi / Arabic support)
# ============================================================

def detect_intent(message: str) -> str:
    """Detect user intent from French, Arabic, Tounsi, or mixed input.
    Priority: complaint > promo_basket > cart > recipe > budget > others
    """
    msg = message.lower()

    # ---- HIGHEST PRIORITY: Complaints ----
    if re.search(
        r"réclamation|reclamation|plainte|claim"
        r"|problème\s+(?:de\s+)?(?:commande|livraison|produit)"
        r"|produit\s+(?:manquant|endommag|mauvais)"
        r"|retard\s+de\s+livraison|demande\s+de\s+retour"
        r"|déposer|signaler\s+un|faire\s+une\s+plainte"
        r"|شكوى|شكاية|مشكل|مشكلة|n7eb\s*nraja3|nraja3|reklama",
        msg
    ):
        return "complaint_new"

    if re.search(
        r"\baide\b|support|service\s*client|contacter|contact"
        r"|مساعدة|3awni|3awnouni|aidouni",
        msg
    ):
        return "support"

    # ---- PROMO BASKET (before general cart) ----
    if re.search(
        r"(?:tous?|toutes?).+(?:promo|promotion|solde|offre)"
        r"|(?:promo|promotion|solde|offre).+(?:panier|ajouter|mettre)"
        r"|ajoute(?:r)?\s+(?:les\s+)?(?:produits\s+en\s+)?(?:promo|promotion|solde)"
        r"|7ot.+promo.+panier|زيد.+برومو",
        msg
    ):
        return "promo_basket"

    # ---- Cart intents ----
    cart_intent = detect_cart_intent(msg)
    if cart_intent in ("add", "remove", "clear"):
        return f"cart_{cart_intent}"
    if cart_intent == "view":
        return "cart_view"

    # ---- Broad cart-add patterns (FR + Tounsi) ----
    if re.search(
        r"ajoute(?:r)?\b.{1,40}(?:pan+ier|cart)"
        r"|(?:pan+ier|cart).{1,20}ajoute(?:r)?"
        r"|mets?.{1,30}dans\s+(?:mon\s+)?(?:le\s+)?pan+ier"
        r"|7ot.{1,30}(?:pan+ier|cart)|na7eb\s*nzid|زيد.+سلة|حط",
        msg
    ):
        return "cart_add"

    # ---- Modify cart quantity ----
    if re.search(
        r"(?:change|modifie|met[sz]?|passe[z]?|mets)\s+(?:la\s+)?(?:quantité|qte)\s+(?:de\s+)?\S+\s+(?:à|a)\s+\d+"
        r"|(?:mets?|change|modifie)\s+\d+\s+(?:de\s+)?\S"
        r"|à\s+la\s+place\s+(?:de\s+)?\d+|augmente|diminue\s+(?:la\s+quantité|le\s+nombre)",
        msg
    ):
        return "cart_modify"

    # ---- Recipe intents ----
    recipe_intent = detect_recipe_intent(msg)
    if recipe_intent:
        return f"recipe_{recipe_intent}"

    # ---- Product details / characteristics ----
    if re.search(
        r"caractéristique|caracteristique|fiche\s*technique|détail|detail|spécification|specification"
        r"|info(?:rmation)?s?\s+(?:sur|de|du|mta3)"
        r"|a3tini.*(?:détail|info|caractéristique|se3a)"
        r"|مواصفات|تفاصيل"
        r"|c'est\s*quoi\s*(?:exactement|comme)"
        r"|describe|description\s+(?:de|du|mta3)",
        msg
    ):
        return "product_detail"

    # ---- Budget / price search ----
    # "9addech" alone = asking a price → general, NOT budget
    # Budget requires a number or "less than" / "under" intent
    if re.search(
        r"budget\s*\d|j'ai\s*\d+|dépenser|pas\s*cher|moins\s*de\s*\d"
        r"|akal\s*(?:m[ei]?n|mn)|ta7t\s*\d|ar5as|أرخص|أقل\s*من\s*\d"
        r"|ma\s*(?:yfoutech|yefoutech)\s*\d"
        r"|\d+\s*(?:tnd|dt|dinars?)",
        msg
    ):
        return "budget"
    # Price inquiry WITH a standalone number → budget search
    # Exclude digits embedded in Tounsi words (9addech, 7lib, 3dham)
    if re.search(
        r"9addech|قداش|بشحال|chhal|combien|prix|b?kaddesh|soumeha|yfoutech",
        msg
    ) and re.search(r'(?<![a-zA-Z])\d+(?![a-zA-Z])', re.sub(r'9addech|7lib|3dham|3andi|5obz|7out|9ahwa', '', msg)):
        return "budget"

    # ---- Recommendations ----
    if re.search(
        r"recommand|meilleur|top|populaire|suggest|conseill|best|préfér"
        r"|أحسن|a7sen|wech\s*t(an)?conseilli|chnou\s*t(an)?conseilli",
        msg
    ):
        return "recommendation"

    # ---- Promo code (code promo, coupon) ----
    if re.search(
        r"code\s*promo|promo\s*code|coupon|bon\s*de\s*réduction|bon\s*reduction"
        r"|كود\s*برومو|code\s*de\s*réduction|code\s*reduction"
        r"|3andi\s*code|3andi\s*coupon|kod\s*promo|code\s*mta3",
        msg
    ):
        return "promo_code"

    # ---- Promotions (info only, not basket) ----
    if re.search(
        r"promo|promotion|réduction|remise|solde|offre|deal"
        r"|تخفيض|عرض|famma\s*promo|promo\s*lyoum"
        r"|reduction\s*de\s*prix|mthabet.*reduction|ta5fidh"
        r"|en\s*promo|article.*promotion|produit.*promo",
        msg
    ):
        return "promotion"

    # ---- Recrutement ----
    if re.search(
        r"recrut|emploi|job|travaill|candidat|postuler|offre\s*d'emploi|cv|stage"
        r"|خدمة|وظيفة|5edma|khedma|tawdhif",
        msg
    ):
        return "recrutement"

    # ---- Presse ----
    if re.search(r"presse|communiqué|actualité|article|journal|media|parution|صحافة", msg):
        return "presse"

    # ---- Category navigation ----
    if re.search(r"catégorie|rayon|type|famille|gamme|أصناف|asnef|categori", msg):
        return "category"

    # ---- Auth / account ----
    if re.search(
        r"connect|login|connexion|inscri|compte|mot de passe|register|profil"
        r"|تسجيل|حساب|كلمة السر|kifech\s*na3mel\s*compte|compte",
        msg
    ):
        return "navigation_auth"

    # ---- Orders / cart navigation ----
    if re.search(
        r"mes?\s*commandes?|suivi\s*commande|historique\s*commande"
        r"|livraison|payer|checkout"
        r"|طلب|توصيل",
        msg
    ):
        return "navigation_order"

    # ---- Stores ----
    if re.search(
        r"magasin|store|boutique|adresse|proche|nearby"
        r"|محل|وين|winek.+magasin|magasin\s*l9rib|fin\s*el\s*magasin",
        msg
    ):
        return "store"

    # ---- Loyalty ----
    if re.search(r"fidélité|loyalty|carte|point|cagnotte|cadeau|بطاقة|نقاط", msg):
        return "loyalty"

    # ---- Credit ----
    if re.search(r"crédit|financement|simulation|dossier|قرض|تمويل", msg):
        return "credit"

    return "general"


def extract_budget(message: str) -> Optional[float]:
    """Extract budget amount from message (FR + Tounsi + Arabic)"""
    patterns = [
        r"(\d+[\s.,]?\d*)\s*(?:tnd|dinars?|dt|دينار)",
        r"budget\s*(?:de|est|:)?\s*(\d+[\s.,]?\d*)",
        r"j'ai\s*(\d+[\s.,]?\d*)",
        r"avec\s*(\d+[\s.,]?\d*)",
        r"moins\s*de\s*(\d+[\s.,]?\d*)",
        r"akal\s*(?:m[ei]?n|mn)\s*(\d+[\s.,]?\d*)",
        r"ta7t\s*(\d+[\s.,]?\d*)",
        r"أقل\s*من\s*(\d+[\s.,]?\d*)",
        r"3andi\s*(\d+[\s.,]?\d*)",
        r"ma\s*(?:yfoutech|y(?:e|i)foutech)\s*(\d+[\s.,]?\d*)",
        r"soumeha\s*(?:ma\s*)?(?:yfoutech|y(?:e|i)foutech)?\s*(\d+[\s.,]?\d*)",
        r"b(\d+[\s.,]?\d*)\s*(?:dinar|dt|tnd)?",
        r"عندي\s*(\d+[\s.,]?\d*)",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            value = match.group(1).replace(" ", "").replace(",", ".")
            try:
                return float(value)
            except ValueError:
                continue
    return None


# ============================================================
# CONTEXT BUILDER
# ============================================================

async def build_context(message: str, intent: str, cart: list = None) -> str:
    """Build RAG context from vector search + live API data"""
    context_parts = []

    # --- Cart context ---
    if cart:
        cart_products = [CartProduct(**p) if isinstance(p, dict) else p for p in cart]
        summary = format_cart_summary(cart_products)
        context_parts.append(f"[CART] PANIER ACTUEL DU CLIENT:\n{summary}")

    # --- Product search (semantic RAG) ---
    budget = extract_budget(message) if "budget" in intent else None

    rag_results = []

    if any(k in intent for k in ("budget", "recommend", "promo", "general", "cart", "recipe", "product_detail")):
        search_query = translate_tounsi_query(message)
        if "budget" in intent and budget:
            # Keep original message keywords for semantic search, budget filter handles the price
            # Remove budget amounts/words to keep product keywords
            # Remove standalone numbers + currency (but NOT digits inside Tounsi words like n7ab, 7lib, 3dham)
            clean_msg = re.sub(r'(?<![a-zA-Z])\d+[\s.,]?\d*\s*(?:tnd|dinars?|dt|دينار)?(?![a-zA-Z])', '', message, flags=re.IGNORECASE)
            clean_msg = re.sub(
                r'\b(?:budget|moins de|akal\s*(?:m[ei]?n|mn)|ta7t|prix\s*max|j\'ai|avec'
                r'|3andi|عندي|أقل\s*من|andi'
                r'|n7[ae]b|na7[ae]b|n7eb|nheb|nhb'
                r'|nekho|nechri|nachri|n7ab'
                r'|soumeha|ma\s*yfoutech|ma\s*yefoutech)\b\s*',
                '', clean_msg, flags=re.IGNORECASE
            ).strip()
            # Also apply Tounsi translations for the keywords
            translations = {
                "ordinatuer": "ordinateur", "ordinateur": "ordinateur",
                "telephon": "telephone", "tilifoun": "telephone", "telephone": "telephone smartphone",
                "ecran": "ecran moniteur televiseur tv", "chasheh": "ecran moniteur",
                "halib": "lait", "7lib": "lait", "roz": "riz", "rouz": "riz",
                "zit": "huile", "djej": "poulet", "lahm": "viande",
                "pc": "ordinateur pc portable", "laptop": "ordinateur portable",
                "tablette": "tablette tablet", "smartphone": "smartphone telephone",
            }
            words = clean_msg.lower().split()
            translated = [translations.get(w.strip("?!.,"), w) for w in words]
            clean_msg = " ".join(translated)
            search_query = clean_msg if len(clean_msg) > 2 else message
        else:
            # Tounsi/Arabic → French translations for common product words
            translations = {
                "halib": "lait", "7lib": "lait", "hlib": "lait",
                "zebda": "beurre", "khobz": "pain",
                "djej": "poulet", "lahm": "viande", "samak": "poisson", "3sel": "miel",
                "zit": "huile", "roz": "riz", "rouz": "riz",
                "sokar": "sucre", "9ahwa": "cafe",
                "atay": "the", "fromage": "fromage", "beid": "oeufs",
                "tomatich": "tomate", "batata": "pomme de terre", "besla": "oignon",
                "tawabel": "epices", "felfel": "poivre", "mel7": "sel",
                "حليب": "lait", "خبز": "pain", "دجاج": "poulet", "لحم": "viande",
                "زيت": "huile", "أرز": "riz", "سكر": "sucre", "قهوة": "cafe",
                "ماء": "eau", "بيض": "oeufs", "عسل": "miel", "زبدة": "beurre",
            }
            # Translate Tounsi/Arabic words in the message
            words = message.lower().split()
            translated = [translations.get(w.strip("?!.,"), w) for w in words]
            if translated != words:
                search_query = " ".join(translated)

        search_k = 20 if budget else 10
        print(f"[SEARCH] query='{search_query}' | k={search_k} | price_max={budget} | intent={intent}")
        rag_results = search_products(query=search_query, k=search_k, price_max=budget)
        print(f"[SEARCH] Found {len(rag_results)} results")

        if rag_results:
            if "budget" in intent and budget:
                context_parts.append(f"[BUDGET] BUDGET CLIENT: {budget} TND")
                rag_results.sort(key=lambda x: x["price"])

            products_text = []
            for p in rag_results:
                promo = ""
                if p.get("has_promo") and p.get("old_price"):
                    promo = f" (PROMO: {p['old_price']} → {p['price']} TND, -{p['discount_pct']}%)"
                cat = f" | Cat: {p['category']}" if p.get("category") else ""
                products_text.append(f"- {p['name']} | {p['price']} TND{promo} | ID: {p['id']}{cat}")

            label = {
                "budget": f"[PRODUCT] PRODUITS DANS LE BUDGET ({len(rag_results)} trouvés)",
                "recommendation": "[STAR] PRODUITS RECOMMANDÉS",
                "promotion": "[PROMO] PRODUITS EN PROMOTION",
            }.get(intent.split("_")[0], "[PRODUCT] PRODUITS PERTINENTS")
            context_parts.append(f"{label}:\n" + "\n".join(products_text))
        else:
            context_parts.append("[PRODUCT] Aucun produit trouvé pour cette recherche. Propose au client de préciser sa demande ou de chercher par catégorie.")

    # --- Intent-specific data ---
    if intent == "product_detail":
        # Fetch detailed product info from API
        if rag_results:
            best_id = rag_results[0].get("id", "")
            if best_id:
                try:
                    full_product = await fetch_product_by_id(best_id)
                    if full_product:
                        detail_parts = []
                        name = full_product.get("designation") or full_product.get("name") or ""
                        desc = full_product.get("description") or ""
                        brand = full_product.get("marque") or full_product.get("brand") or ""
                        weight = full_product.get("poids") or full_product.get("weight") or ""
                        specs = full_product.get("specifications") or full_product.get("caracteristiques") or ""
                        detail_parts.append(f"Nom: {name}")
                        if brand: detail_parts.append(f"Marque: {brand}")
                        if desc: detail_parts.append(f"Description: {desc[:500]}")
                        if weight: detail_parts.append(f"Poids: {weight}")
                        if specs: detail_parts.append(f"Caractéristiques: {specs}")
                        context_parts.append(
                            f"[DETAIL PRODUIT] INFORMATIONS DÉTAILLÉES:\n" + "\n".join(detail_parts)
                            + f"\nLien: [Voir le produit](/product/{best_id})"
                            + "\n\nIMPORTANT: Présente les infos de CE produit. Ne propose PAS un autre produit."
                        )
                except Exception:
                    pass

    elif "recommendation" in intent:
        try:
            recommended = await fetch_recommended_products()
            if recommended:
                rec_text = []
                for p in recommended[:8]:
                    name = p.get("designation") or p.get("name") or ""
                    price = p.get("prix_vente") or p.get("price") or 0
                    pid = p.get("id") or ""
                    rec_text.append(f"- {name} | {price} TND | ID: {pid}")
                context_parts.append("[STAR] RECOMMANDÉS PAR LE SITE:\n" + "\n".join(rec_text))
        except Exception:
            pass

    elif "promotion" in intent:
        # 1) Search vector store for products with has_promo=True
        try:
            promo_rag = search_products(query="promotion reduction solde promo", k=20)
            promo_products = [p for p in promo_rag if p.get("has_promo")]
            if promo_products:
                promo_prod_text = []
                for p in promo_products[:12]:
                    promo_prod_text.append(
                        f"- {p['name']} | ~~{p['old_price']} TND~~ -> **{p['price']} TND** (-{p['discount_pct']}%) | ID: {p['id']}"
                    )
                context_parts.append("[PROMO] PRODUITS EN PROMOTION (reductions actives):\n" + "\n".join(promo_prod_text))
        except Exception:
            pass
        # 2) Also fetch promotions from API (banners, campaigns)
        try:
            promos = await fetch_promotions()
            if promos:
                promo_text = []
                for p in promos[:8]:
                    pct = f" (-{p.get('pourcentage')}%)" if p.get("pourcentage") else ""
                    promo_text.append(f"- {p.get('titre') or p.get('title', 'Promo')}: {p.get('description', '')}{pct}")
                context_parts.append("[CAMPAGNE] PROMOTIONS ACTIVES:\n" + "\n".join(promo_text))
        except Exception:
            pass

    elif intent == "promo_code":
        try:
            codes = await fetch_promo_codes()
            if codes:
                code_text = []
                for c in codes[:10]:
                    code_val = c.get("code") or c.get("code_value") or c.get("name") or ""
                    desc = c.get("description") or c.get("label") or ""
                    discount = c.get("discount") or c.get("reduction") or c.get("pourcentage") or ""
                    code_text.append(f"- Code: **{code_val}** | {desc} | Reduction: {discount}")
                context_parts.append(
                    "[CODE PROMO] CODES PROMO DISPONIBLES:\n" + "\n".join(code_text)
                    + "\n\nPage codes promo: /code-promo"
                )
            else:
                context_parts.append("[CODE PROMO] Aucun code promo disponible. Page: /code-promo")
        except Exception:
            context_parts.append("[CODE PROMO] Page codes promo: /code-promo")

    elif "category" in intent:
        try:
            categories = await fetch_categories()
            if categories:
                cat_text = [f"- {c.get('libelle') or c.get('name', '')} (ID: {c.get('id', '')})" for c in categories]
                context_parts.append("[CATEGORY] CATÉGORIES:\n" + "\n".join(cat_text))
        except Exception:
            pass

    elif "store" in intent:
        try:
            stores = await fetch_stores()
            if stores:
                store_text = [
                    f"- {s.get('name') or s.get('nom', '')}: {s.get('address') or s.get('adresse', '')} {s.get('phone') or s.get('tel', '')}"
                    for s in stores[:10]
                ]
                context_parts.append("[STORE] MAGASINS:\n" + "\n".join(store_text))
        except Exception:
            pass

    elif "navigation_auth" in intent:
        context_parts.append("""[AUTH] PAGES CONNEXION/COMPTE:
- Se connecter: /login | Créer un compte: /inscrire
- Mot de passe oublié: /forgot-password | Modifier profil: /profile""")

    elif "navigation_order" in intent:
        context_parts.append("""[ORDER] PAGES COMMANDES:
- Panier: /cart-shopping | Mes commandes: /Mes-Commandes | Suivi: depuis Mes Commandes""")

    elif "loyalty" in intent:
        context_parts.append("""[LOYALTY] PAGES FIDÉLITÉ:
- Carte: /loyalty-card | Cagnotte: /my-cagnotte | Cadeaux: /cadeaux
- Deals: /MesDeals | Codes promo: /code-promo | Gratuits: /gratuite""")

    elif "support" in intent or "complaint" in intent:
        context_parts.append("""[SUPPORT] RÉCLAMATIONS & SUPPORT:
- Réclamations: /reclamations | Nouvelle: /reclamations/new | Tel: +216 50 963 367
- Types: produit manquant, mauvais produit, retard livraison, retour, remboursement""")

    elif "credit" in intent:
        context_parts.append("""[CREDIT] PAGES CRÉDIT:
- Simulation: /credit/simulation | Dossier: /credit/dossier | Mes dossiers: /credit/mes-dossiers""")

    elif "recrutement" in intent:
        context_parts.append("""[RH] RECRUTEMENT:
- Offres: /recrutement | Postuler: /recrutement/postuler | Contact: rh@mg.tn
- Postes: caissier, gestionnaire, commercial, logistique, IT, marketing""")

    elif "presse" in intent:
        context_parts.append("""[PRESSE] ESPACE PRESSE:
- Articles: /espace-presse | Contact presse: presse@mg.tn""")

    return "\n\n".join(context_parts) if context_parts else ""


# ============================================================
# LLM RESPONSE GENERATOR (all non-action intents go through here)
# ============================================================

async def generate_llm_response(
    user_message: str,
    intent: str,
    chat_history: list = None,
    cart: list = None,
) -> AsyncGenerator[str, None]:
    """Generate a dynamic LLM response with RAG context.
    ALL non-action responses go through here — no hardcoded text.
    """
    context = await build_context(user_message, intent, cart)

    # Detect language and get few-shot examples
    lang = detect_language(user_message)
    fewshot = get_fewshot_examples(lang)

    # Build system message with context + fewshot + language reminder
    full_system = SYSTEM_PROMPT
    if context:
        full_system += f"\n\n--- DONNÉES CONTEXTUELLES ---\n{context}\n--- FIN DONNÉES ---"
        full_system += "\n⚠️ RAPPEL: Base ta réponse UNIQUEMENT sur les données ci-dessus. N'invente aucun produit ni prix."
    else:
        full_system += "\n\n--- DONNÉES CONTEXTUELLES ---\nAucune donnée spécifique disponible.\n--- FIN DONNÉES ---"
    full_system += fewshot

    if lang == "tounsi":
        full_system += "\n\n⚠️ RAPPEL CRITIQUE: Le client parle en TOUNSI. Reponds en TOUNSI avec LETTRES LATINES UNIQUEMENT (a-z + 3,5,7,9). JAMAIS de caracteres arabes. Ex: 'Marhba! Famma barcha produits en promo lyoum...'"
    elif lang == "arabic":
        full_system += "\n\n⚠️ تذكير حاسم: العميل يتحدث بالعربية الفصحى. يجب أن تجيب بالعربية الفصحى فقط."

    # Build messages array for OpenAI
    messages = [{"role": "system", "content": full_system}]

    for msg in (chat_history or [])[-8:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant"):
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    # Stream from OpenAI
    try:
        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            stream=True,
        )
        async for chunk in response:
            delta = chunk.choices[0].delta.content if chunk.choices[0].delta.content else ""
            if delta:
                yield delta
    except Exception as e:
        error_msg = str(e)
        print(f"[OPENAI ERROR] {type(e).__name__}: {error_msg}")
        print(f"[OPENAI DEBUG] Key present: {bool(OPENAI_API_KEY)}, Key prefix: {OPENAI_API_KEY[:12] if OPENAI_API_KEY else 'EMPTY'}, Model: {OPENAI_MODEL}")
        yield f"⚠️ Erreur OpenAI: {error_msg}"


# ============================================================
# MAIN CHAT STREAM (with structured actions via SSE)
# ============================================================

async def chat_stream(
    user_message: str,
    chat_history: list = None,
    cart: list = None,
    auth_token: str = None,
) -> AsyncGenerator[str, None]:
    """
    Stream chat response.
    Yields two types of SSE events:
    - text chunks → displayed as chat text
    - __ACTION__{json} → structured action for React/Flutter frontend

    Cart/Recipe/Promo actions use structured responses.
    ALL other intents go through the LLM for dynamic, natural responses.
    """
    if chat_history is None:
        chat_history = []

    intent = detect_intent(user_message)
    lang = detect_language(user_message)
    print(f"[INTENT] {intent} | [LANG] {lang} | Message: {user_message[:60]}...")

    # ---- CART FOLLOW-UP: user responds to disambiguation ("les deux", "ajouter tous", etc.) ----
    if chat_history and intent in ("general", "cart_add", "cart_view"):
        followup_match = re.search(
            r"\bles?\s*deux\b|\bles?\s*trois\b|\btous?\b|\btoutes?\b"
            r"|\bla?\s*premi[eè]re?\b|\bla?\s*deuxi[eè]me\b"
            r"|\ble?\s*1\b|\ble?\s*2\b|\ble?\s*3\b"
            r"|\boui\b|\bok\b|\bd'accord\b|\bbehi\b|\bey\b|\byes\b"
            r"|\bajoute(?:r|s)?\s+(?:les?|tous?|ces|au\s+pan+ier)"
            r"|\bajoute(?:r|s)?\s*$|\bachete(?:r|z)?\b"
            r"|\b7ot(?:hom|ha)?\s+(?:lkol|fil\s+pan+ier|f\s+pan+ier)"
            r"|\bzidhom\b|\bzidha\b|\bzid(?:hom|ha|ni|li)?\s+(?:f(?:il)?\s*pan+ier|lkol)"
            r"|\bses\s+produi?ts?\b|\bles\s+produi?ts?\b",
            user_message.lower()
        )
        if followup_match:
            # Check if last assistant message was about products/cart
            last_assistant = ""
            for msg in reversed(chat_history[-4:]):
                if msg.get("role") == "assistant":
                    last_assistant = msg.get("content", "")
                    break

            if last_assistant and re.search(
                r"TND|panier|ajouter|laquelle|lequel|les\s*deux|voir\s*produit",
                last_assistant, re.IGNORECASE
            ):
                # Extract product names from assistant's previous message
                # Handles formats: "Name | Price TND", "Name à Price TND", "Name - Price TND"
                product_lines = re.findall(
                    r"[-•*]\s*(.+?)\s*(?:\||\bà\b|\ben\s*promo\s*à\b|\bb\s)?\s*(\d+[.,]?\d*)\s*TND",
                    last_assistant
                )
                if product_lines:
                    product_requests = [{"name": name.strip(), "quantity": 1, "unit": "unit"} for name, _ in product_lines]

                    # Filter based on user's choice
                    user_lower = user_message.lower()
                    if re.search(r"premi[eè]re?|\b1\b", user_lower) and len(product_requests) > 0:
                        product_requests = [product_requests[0]]
                    elif re.search(r"deuxi[eè]me|\b2\b", user_lower) and len(product_requests) > 1:
                        product_requests = [product_requests[1]]
                    elif re.search(r"\bles?\s*deux\b|\btous?\b|\btoutes?\b|\blkol\b", user_lower):
                        pass  # keep all
                    else:
                        # User may have named specific products — filter by relevance
                        # Remove action keywords to get product name keywords
                        user_keywords = re.sub(
                            r"\b(?:zidhom|zidha|zid(?:hom|ha|ni|li)?|7ot(?:hom|ha)?|ajoute[rz]?|rajoute[rz]?"
                            r"|mets?|mettre|dans|mon|le|la|les|au|et|fil|f|fel|fi|panier|cart"
                            r"|n7eb|na7eb|nzid|nechri|behi|ok|oui|svp|stp)\b",
                            "", user_lower
                        ).strip()
                        if user_keywords and len(user_keywords) > 3:
                            # Score each product from previous message against user's keywords
                            scored = []
                            for req in product_requests:
                                rel = _relevance_score(user_keywords, req["name"])
                                scored.append((req, rel))
                            filtered = [req for req, rel in scored if rel >= 0.5]
                            if filtered:
                                product_requests = filtered
                        elif len(product_requests) > 1:
                            # No product name given — check if singular ("zidha" = add it)
                            # vs plural ("zidhom" = add them)
                            if re.search(r"\bzidha\b|\b7otha\b|\bajoute\s+le\b|\bajoute\s+la\b", user_lower):
                                product_requests = [product_requests[0]]  # singular → first product

                    matched, _ = await match_products_to_catalog(product_requests)
                    if matched:
                        action = ChatAction(type=ActionType.ADD_TO_CART, products=matched)
                        action_data = json.dumps({"action": action.dict()}, ensure_ascii=False)
                        yield f"__ACTION__{action_data}"
                        names = ", ".join([f"{p.name} ({p.price} TND)" for p in matched])
                        total = sum(p.price * p.quantity for p in matched)
                        confirm_ctx = f"[ACTION EFFECTUÉE] Produits ajoutés au panier: {names}. Total ajouté: {total:.2f} TND. Confirme au client et propose d'autres idées."
                        async for chunk in _quick_llm(user_message, confirm_ctx, chat_history):
                            yield chunk
                        return

    # ---- CART ACTIONS (structured, not LLM) ----
    if intent.startswith("cart_") or intent == "cart_add":
        cart_products = []
        if cart:
            cart_products = [CartProduct(**p) if isinstance(p, dict) else p for p in cart]

        action = await process_cart_action(user_message, cart_products)

        if action and action.type == ActionType.ADD_TO_CART and action.products:
            action_data = json.dumps({"action": action.dict()}, ensure_ascii=False)
            yield f"__ACTION__{action_data}"
            # Dynamic LLM confirmation instead of hardcoded
            names = ", ".join([f"{p.name} ({p.price} TND)" for p in action.products])
            total = sum(p.price * p.quantity for p in action.products)
            confirm_ctx = f"[ACTION EFFECTUÉE] Produits ajoutés au panier: {names}. Total ajouté: {total:.2f} TND. Confirme au client et propose d'autres idées."
            async for chunk in _quick_llm(user_message, confirm_ctx, chat_history):
                yield chunk
            return

        elif action and action.type == ActionType.REMOVE_FROM_CART and action.products:
            action_data = json.dumps({"action": action.dict()}, ensure_ascii=False)
            yield f"__ACTION__{action_data}"
            names = ", ".join([p.name for p in action.products])
            confirm_ctx = f"[ACTION EFFECTUÉE] Produits retirés du panier: {names}. Confirme au client."
            async for chunk in _quick_llm(user_message, confirm_ctx, chat_history):
                yield chunk
            return

        elif action and action.type == ActionType.SHOW_CART:
            if cart_products:
                summary = format_cart_summary(cart_products)
                show_ctx = f"[PANIER DU CLIENT]\n{summary}\nPrésente le panier de manière naturelle et propose des idées."
                async for chunk in _quick_llm(user_message, show_ctx, chat_history):
                    yield chunk
            else:
                empty_ctx = "[PANIER VIDE] Le panier du client est vide. Propose des produits ou des idées."
                async for chunk in _quick_llm(user_message, empty_ctx, chat_history):
                    yield chunk
            return

        elif action and action.type == ActionType.CLEAR_CART:
            action_data = json.dumps({"action": action.dict()}, ensure_ascii=False)
            yield f"__ACTION__{action_data}"
            clear_ctx = "[ACTION EFFECTUÉE] Le panier a été vidé. Confirme et propose de recommencer les achats."
            async for chunk in _quick_llm(user_message, clear_ctx, chat_history):
                yield chunk
            return

        # Cart action returned None → try extracting products from previous assistant message
        # BUT filter by user's current message to avoid adding unrelated products
        if chat_history and not (action and action.products):
            last_assistant = ""
            for msg in reversed(chat_history[-4:]):
                if msg.get("role") == "assistant":
                    last_assistant = msg.get("content", "")
                    break
            if last_assistant and "TND" in last_assistant:
                product_lines = re.findall(
                    r"[-•*]\s*(.+?)\s*(?:\||\bà\b|\ben\s*promo\s*à\b|\bb\s)?\s*(\d+[.,]?\d*)\s*TND",
                    last_assistant
                )
                if product_lines:
                    # Filter products from previous message by relevance to user's current request
                    user_keywords = re.sub(
                        r"\b(?:ajoute[rz]?|rajoute[rz]?|mets?|mettre|dans|mon|le|la|les|au|panier"
                        r"|7ot(?:ou|li|ni|ha|hom|houm)?|zid(?:ni|li|hom)?|nzid|n7eb|na7eb|nechri)\b",
                        "", user_message.lower()
                    ).strip()
                    if user_keywords and len(user_keywords) > 1:
                        # Score each product from previous message against user's request
                        scored = []
                        for name, price in product_lines:
                            rel = _relevance_score(user_keywords, name.strip())
                            scored.append((name.strip(), price, rel))
                        # Only keep products that match the user's request (score >= 0.5)
                        best_matches = [(n, p) for n, p, r in scored if r >= 0.5]
                        # If no match found with filtering, pick the single best match
                        if not best_matches and scored:
                            best = max(scored, key=lambda x: x[2])
                            if best[2] > 0.0:
                                best_matches = [(best[0], best[1])]
                        product_requests = [{"name": n, "quantity": 1, "unit": "unit"} for n, _ in best_matches]
                    else:
                        product_requests = [{"name": name.strip(), "quantity": 1, "unit": "unit"} for name, _ in product_lines]

                    if product_requests:
                        matched, _ = await match_products_to_catalog(product_requests)
                        if matched:
                            action = ChatAction(type=ActionType.ADD_TO_CART, products=matched)
                            action_data = json.dumps({"action": action.dict()}, ensure_ascii=False)
                            yield f"__ACTION__{action_data}"
                            names = ", ".join([f"{p.name} ({p.price} TND)" for p in matched])
                            total = sum(p.price * p.quantity for p in matched)
                            confirm_ctx = f"[ACTION EFFECTUÉE] Produits ajoutés au panier: {names}. Total ajouté: {total:.2f} TND. Confirme au client."
                            async for chunk in _quick_llm(user_message, confirm_ctx, chat_history):
                                yield chunk
                            return
        # Fall through to LLM

    # ---- PROMO BASKET ---- (add all promo products to cart)
    if intent == "promo_basket":
        try:
            promos = await fetch_promotions()
            if not promos:
                # Fallback: search vector store for products with has_promo
                promo_products = search_products(query="promotion solde reduction promo", k=20)
                promo_with_discount = [p for p in promo_products if p.get("has_promo")]
                if promo_with_discount:
                    promos = [{"id": p["id"], "designation": p["name"], "promo_price": p["price"],
                               "price": p.get("old_price", p["price"])} for p in promo_with_discount[:8]]
                else:
                    promos = [{"id": p["id"], "designation": p["name"], "prix_vente": p["price"],
                               "promo_price": p["price"], "price": p.get("old_price", p["price"])} for p in promo_products[:8]]

            if promos:
                cart_promo = []
                for p in promos[:8]:
                    pid = str(p.get("produit_id") or p.get("id") or p.get("product_id") or "")
                    name = p.get("designation") or p.get("name") or p.get("titre") or "Produit promo"
                    price = float(p.get("promo_price") or p.get("prix_vente") or p.get("price") or 0)
                    old_price = float(p.get("price") or p.get("old_price") or 0)
                    if pid and price > 0:
                        cart_promo.append(CartProduct(
                            id=pid, name=name, price=price, old_price=old_price,
                            quantity=1, has_promo=True,
                        ))

                if cart_promo:
                    action = ChatAction(type=ActionType.ADD_TO_CART, products=cart_promo)
                    action_data = json.dumps({"action": action.dict()}, ensure_ascii=False)
                    yield f"__ACTION__{action_data}"
                    names = ", ".join([f"{p.name} ({p.price} TND)" for p in cart_promo])
                    total = sum(p.price for p in cart_promo)
                    promo_ctx = f"[ACTION EFFECTUÉE] {len(cart_promo)} produits promo ajoutés au panier: {names}. Total: {total:.2f} TND. Présente-les joyeusement."
                    async for chunk in _quick_llm(user_message, promo_ctx, chat_history):
                        yield chunk
                    return
        except Exception as e:
            print(f"[ERROR] Promo basket: {e}")

        # No promos found → LLM explains
        async for chunk in generate_llm_response(user_message, intent, chat_history, cart):
            yield chunk
        return

    # ---- RECIPE ACTIONS ----
    if intent.startswith("recipe_"):
        recipe_action = await process_recipe_request(user_message)

        if recipe_action:
            action_data = json.dumps({"action": recipe_action.dict()}, ensure_ascii=False)
            yield f"__ACTION__{action_data}"

            if recipe_action.recipe:
                r = recipe_action.recipe
                total = sum(p.price for p in (recipe_action.products or []))
                matched_count = len(recipe_action.products or [])
                total_ing = len(r.ingredients)

                ingredients_text = []
                for ing in r.ingredients[:8]:
                    if ing.product:
                        ingredients_text.append(f"{ing.quantity} {ing.unit} {ing.name} → {ing.product.name} ({ing.product.price} TND) ✅")
                    else:
                        ingredients_text.append(f"{ing.quantity} {ing.unit} {ing.name} ❌")

                recipe_ctx = (
                    f"[RECETTE TROUVÉE] {r.title} - {r.description}\n"
                    f"Prep: {r.prep_time} | Cuisson: {r.cook_time} | {r.servings} personnes\n"
                    f"Ingrédients ({matched_count}/{total_ing} dispo): {'; '.join(ingredients_text)}\n"
                    f"Total panier estimé: {total:.2f} TND\n"
                    f"Présente la recette naturellement et propose d'ajouter les ingrédients au panier."
                )
                async for chunk in _quick_llm(user_message, recipe_ctx, chat_history):
                    yield chunk
            else:
                results = await search_recipes(user_message)
                if results:
                    recipes_text = "; ".join([f"{r.get('name', r.get('title', ''))} ({r.get('prep_time', '')})" for r in results[:5]])
                    recipe_ctx = f"[RECETTES TROUVÉES] {recipes_text}. Présente ces recettes et demande laquelle intéresse le client."
                    async for chunk in _quick_llm(user_message, recipe_ctx, chat_history):
                        yield chunk
                else:
                    async for chunk in generate_llm_response(user_message, intent, chat_history, cart):
                        yield chunk
            return

    # ---- PROMO CODE ---- Fetch and present promo codes
    if intent == "promo_code":
        try:
            codes = await fetch_promo_codes()
            if codes:
                code_match = re.search(
                    r"(?:code|coupon|kod)\s*(?:promo)?\s*[:\s]*[\"']?([A-Za-z0-9_-]{3,20})[\"']?",
                    user_message, re.IGNORECASE
                )
                if code_match and auth_token:
                    code_value = code_match.group(1)
                    result = await reserve_promo_code(auth_token, code_value)
                    if result and "error" not in result:
                        reserve_ctx = f"[ACTION EFFECTUEE] Code promo '{code_value}' reserve avec succes. Confirme et explique comment l'utiliser au checkout."
                        async for chunk in _quick_llm(user_message, reserve_ctx, chat_history):
                            yield chunk
                        return
        except Exception as e:
            print(f"[ERROR] Promo code: {e}")
        async for chunk in generate_llm_response(user_message, intent, chat_history, cart):
            yield chunk
        return

    # ---- COMPLAINT ---- Show form + guide user with context
    if intent == "complaint_new":
        form_action = {"action": {"type": "create_complaint", "message": "Formulaire de réclamation"}}
        yield f"__ACTION__{json.dumps(form_action, ensure_ascii=False)}"
        complaint_ctx = (
            "[ACTION: FORMULAIRE DE RÉCLAMATION AFFICHÉ]\n"
            "Le formulaire de réclamation est affiché au client.\n"
            "Guide-le étape par étape pour remplir sa réclamation:\n"
            "1. Choisir la catégorie: produit manquant, mauvais produit, retard livraison, produit endommagé, remboursement, retour, autre\n"
            "2. Décrire le problème en détail\n"
            "3. Ajouter la référence de commande si disponible\n"
            "4. Le formulaire sera soumis via /reclamations/new\n"
            "Sois empathique et rassurant. Dis-lui que son problème sera traité rapidement.\n"
            "Numéro support: +216 50 963 367"
        )
        async for chunk in _quick_llm(user_message, complaint_ctx, chat_history):
            yield chunk
        return

    # ---- ALL OTHER INTENTS → Dynamic LLM response ----
    async for chunk in generate_llm_response(user_message, intent, chat_history, cart):
        yield chunk


# ============================================================
# HELPER: Quick LLM response with action context
# ============================================================

async def _quick_llm(
    user_message: str,
    action_context: str,
    chat_history: list = None,
) -> AsyncGenerator[str, None]:
    """Generate a short, dynamic LLM response after a structured action."""
    lang = detect_language(user_message)
    fewshot = get_fewshot_examples(lang)

    system_content = f"{SYSTEM_PROMPT}\n\n{action_context}{fewshot}"

    if lang == "tounsi":
        system_content += "\n\n⚠️ RAPPEL: Reponds en TOUNSI LATIN UNIQUEMENT (a-z + 3,5,7,9). JAMAIS de caracteres arabes. Ex: 'Behi, 7atithomlek fil panier!'"
    elif lang == "arabic":
        system_content += "\n\n⚠️ تذكير: أجب بالعربية فقط"

    messages = [{"role": "system", "content": system_content}]

    for msg in (chat_history or [])[-4:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant"):
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    try:
        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            stream=True,
        )
        async for chunk in response:
            delta = chunk.choices[0].delta.content if chunk.choices[0].delta.content else ""
            if delta:
                yield delta
    except Exception as e:
        yield "✅ Action effectuée !"


# ============================================================
# SYNC VERSION
# ============================================================

async def chat_sync(user_message: str, chat_history: list = None, cart: list = None) -> str:
    """Non-streaming chat"""
    full_response = ""
    async for chunk in chat_stream(user_message, chat_history, cart):
        if not chunk.startswith("__ACTION__"):
            full_response += chunk
    return full_response
