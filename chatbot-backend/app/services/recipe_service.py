"""
Recipe Service - Fetches recipes from TN360 API and maps to chatbot models.
Uses REAL product data from the backend instead of hardcoded recipes.
"""
import re
import unicodedata
from typing import List, Optional

from app.models import Recipe, RecipeIngredient, CartProduct, ChatAction, ActionType
from app.services.tn360_api import get_client


def _normalize(text: str) -> str:
    """Remove accents and lowercase for accent-insensitive matching."""
    return unicodedata.normalize("NFD", text.lower()).encode("ascii", "ignore").decode("ascii")

# ==================== RECIPE CACHE ====================
# Fetched from TN360 API, cached in memory
_recipes_cache: List[dict] = []


async def _fetch_recipes_from_api() -> List[dict]:
    """Fetch all recipes from the TN360 backend API using shared client."""
    global _recipes_cache
    try:
        client = get_client()
        resp = await client.get("/recipes")
        resp.raise_for_status()
        data = resp.json()
        recipes = data.get("data", []) if isinstance(data, dict) else data
        if recipes:
            _recipes_cache = recipes
            print(f"[RECIPE] Fetched {len(recipes)} recipes from API")
        return recipes
    except Exception as e:
        print(f"[RECIPE WARN] API fetch failed: {e}")
        return _recipes_cache


async def _get_recipes() -> List[dict]:
    """Get recipes from cache or fetch from API."""
    if not _recipes_cache:
        await _fetch_recipes_from_api()
    return _recipes_cache


def _api_recipe_to_internal(api_recipe: dict) -> dict:
    """Convert API recipe format to internal format used by the chatbot."""
    articles = api_recipe.get("articles", [])

    ingredients = []
    for art in articles:
        pivot = art.get("pivot", {})
        ingredients.append({
            "name": art.get("name", ""),
            "quantity": str(pivot.get("quantity", "1")).rstrip("0").rstrip("."),
            "unit": pivot.get("unit", "unité"),
            "product_id": str(art.get("id", "")),
            "product_name": art.get("name", ""),
            "product_price": float(art.get("price", 0)),
            "product_img": art.get("img", "") or art.get("image_url", ""),
        })

    # Parse instructions into steps
    instructions = api_recipe.get("instructions", "") or ""
    steps = [s.strip() for s in instructions.split("\n") if s.strip()] if instructions else []

    prep_time = api_recipe.get("prep_time")
    cook_time = api_recipe.get("cook_time")

    return {
        "id": str(api_recipe.get("id", "")),
        "title": api_recipe.get("name", ""),
        "description": api_recipe.get("description", ""),
        "prep_time": f"{prep_time} min" if prep_time else "",
        "cook_time": f"{cook_time} min" if cook_time else "",
        "servings": api_recipe.get("servings", 4) or 4,
        "ingredients": ingredients,
        "steps": steps,
        "img": api_recipe.get("img", ""),
    }


def detect_recipe_intent(message: str) -> Optional[str]:
    """
    Detect recipe-related intent.
    Returns: 'search', 'basket', 'list', or None
    """
    msg = message.lower()

    if re.search(r"recette|cuisine|cuisiner|préparer|faire.*plat|cook|recipe", msg):
        if re.search(r"panier|acheter|ingrédients?.*panier|ajoute.*ingrédient|basket", msg):
            return "basket"
        return "search"

    if re.search(r"qu'est.ce (que|qu'on) (je peux|peut).*(?:faire|cuisiner|préparer)", msg):
        return "search"

    if re.search(r"idée.*(?:repas|dîner|déjeuner|manger)|que manger|quoi manger", msg):
        return "search"

    return None


async def search_recipes(query: str) -> List[dict]:
    """Search recipes from API by keyword (accent-insensitive)."""
    api_recipes = await _get_recipes()
    # Remove generic intent words that pollute search
    noise = {"recette", "recettes", "cuisine", "cuisiner", "preparer", "faire", "plat",
             "recipe", "cook", "donne", "moi", "une", "cherche", "veux", "comment"}
    msg_words = _normalize(query).split()
    clean_words = [w for w in msg_words if w not in noise and len(w) >= 3]
    msg = " ".join(clean_words) if clean_words else _normalize(query)
    results = []

    for api_recipe in api_recipes:
        score = 0
        title = _normalize(api_recipe.get("name") or "")
        desc = _normalize(api_recipe.get("description") or "")

        # Check title
        for word in msg.split():
            if len(word) >= 3 and word in title:
                score += 3
        # Check description
        for word in msg.split():
            if len(word) >= 3 and word in desc:
                score += 2
        # Check article names
        for art in api_recipe.get("articles", []):
            art_name = _normalize(art.get("name") or "")
            for word in msg.split():
                if len(word) >= 3 and word in art_name:
                    score += 1

        if score > 0:
            results.append({**api_recipe, "_score": score})

    results.sort(key=lambda x: x["_score"], reverse=True)

    # If no keyword results but user just said "recette" generically, return all
    if not results and not clean_words:
        results = [{**r, "_score": 0} for r in api_recipes]

    return results[:5]


def _build_recipe_action(internal_recipe: dict) -> ChatAction:
    """Build a ChatAction from an internal recipe dict (already has products)."""
    ingredients = []
    matched_products = []

    for ing in internal_recipe["ingredients"]:
        product = None
        if ing.get("product_id") and ing.get("product_name"):
            # Always add 1 unit of the product (same as website behavior)
            # The pivot quantity is just how much the recipe needs, not how many to buy
            product = CartProduct(
                id=ing["product_id"],
                name=ing["product_name"],
                price=ing["product_price"],
                old_price=0,
                quantity=1,
                category="",
                brand="",
                has_promo=False,
                discount_pct=0,
            )
            matched_products.append(product)

        ingredients.append(RecipeIngredient(
            name=ing["name"],
            quantity=ing["quantity"],
            unit=ing["unit"],
            product=product,
        ))

    recipe = Recipe(
        id=internal_recipe["id"],
        title=internal_recipe["title"],
        description=internal_recipe["description"],
        prep_time=internal_recipe.get("prep_time", ""),
        cook_time=internal_recipe.get("cook_time", ""),
        servings=internal_recipe.get("servings", 4),
        ingredients=ingredients,
        steps=internal_recipe.get("steps", []),
        matched_products=matched_products,
    )

    total = sum(p.price * p.quantity for p in matched_products)

    return ChatAction(
        type=ActionType.SHOW_RECIPE,
        recipe=recipe,
        products=matched_products,
        message=f"Recette : {recipe.title} - {len(matched_products)} produits ({total:.2f} TND)"
    )


async def get_recipe_with_products(recipe_id: str) -> Optional[ChatAction]:
    """Get a recipe by ID and return it with matched products."""
    api_recipes = await _get_recipes()
    for r in api_recipes:
        if str(r.get("id")) == str(recipe_id):
            internal = _api_recipe_to_internal(r)
            return _build_recipe_action(internal)
    return None


async def process_recipe_request(message: str) -> Optional[ChatAction]:
    """Process a recipe-related message and return an action."""
    intent = detect_recipe_intent(message)
    if not intent:
        return None

    results = await search_recipes(message)

    if not results:
        return ChatAction(
            type=ActionType.NONE,
            message="Je n'ai pas trouvé de recette correspondante. Essayez avec d'autres mots-clés."
        )

    # Convert best match to internal format and build action
    best = results[0]
    internal = _api_recipe_to_internal(best)

    if intent == "basket":
        return _build_recipe_action(internal)

    return _build_recipe_action(internal)


def format_recipe_suggestions(recipes: List[dict]) -> str:
    """Format recipe list for chat display."""
    if not recipes:
        return "Aucune recette trouvée."

    lines = ["🍽️ **Voici quelques recettes :**\n"]
    for i, r in enumerate(recipes, 1):
        title = r.get("name") or r.get("title", "?")
        desc = r.get("description", "")
        prep = r.get("prep_time", "?")
        cook = r.get("cook_time", "?")
        lines.append(f"{i}. **{title}** - {desc}")
        lines.append(f"   ⏱️ Préparation: {prep} min | Cuisson: {cook} min")
        art_names = [a.get("name", "") for a in r.get("articles", [])[:4]]
        if art_names:
            lines.append(f"   Ingrédients: {', '.join(art_names)}...")
        lines.append("")

    lines.append("💡 Dites-moi quelle recette vous intéresse !")
    return "\n".join(lines)


def format_recipe_detail(recipe: Recipe) -> str:
    """Format a single recipe with ingredients and matched products."""
    lines = [f"🍽️ **{recipe.title}**"]
    lines.append(f"_{recipe.description}_\n")
    if recipe.prep_time or recipe.cook_time:
        lines.append(f"⏱️ Préparation: {recipe.prep_time} | Cuisson: {recipe.cook_time} | Pour {recipe.servings} personnes\n")

    lines.append("**📝 Ingrédients :**")
    total = 0.0
    for ing in recipe.ingredients:
        if ing.product:
            total += ing.product.price * ing.product.quantity
            lines.append(f"- {ing.quantity} {ing.unit} {ing.name} → **{ing.product.name}** ({ing.product.price} TND) ✅")
        else:
            lines.append(f"- {ing.quantity} {ing.unit} {ing.name} ❌ (non disponible)")

    lines.append(f"\n**🛒 Total panier estimé : {total:.2f} TND**")
    lines.append(f"({len(recipe.matched_products)} produits disponibles sur {len(recipe.ingredients)})")

    if recipe.steps:
        lines.append("\n**📋 Étapes :**")
        for i, step in enumerate(recipe.steps, 1):
            lines.append(f"{i}. {step}")

    lines.append("\n💡 Voulez-vous ajouter tous les ingrédients au panier ?")
    return "\n".join(lines)
