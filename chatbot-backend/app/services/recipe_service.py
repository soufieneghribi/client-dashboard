"""
Recipe Service - Recipe suggestions and ingredient basket generation
Matches ingredients to product catalog via ChromaDB vector search.
"""
import json
import re
from typing import List, Optional

from app.models import Recipe, RecipeIngredient, CartProduct, ChatAction, ActionType
from app.services.vector_store import search_products

# ==================== BUILT-IN RECIPES DATABASE ====================
# Common Tunisian/Mediterranean recipes for quick suggestions

RECIPES_DB = [
    {
        "id": "couscous_poulet",
        "title": "Couscous au Poulet",
        "description": "Le plat traditionnel tunisien par excellence",
        "prep_time": "30 min",
        "cook_time": "1h30",
        "servings": 4,
        "ingredients": [
            {"name": "poulet", "quantity": "1", "unit": "kg"},
            {"name": "couscous", "quantity": "500", "unit": "g"},
            {"name": "tomates", "quantity": "3", "unit": "pièces"},
            {"name": "oignon", "quantity": "2", "unit": "pièces"},
            {"name": "pois chiches", "quantity": "200", "unit": "g"},
            {"name": "carottes", "quantity": "3", "unit": "pièces"},
            {"name": "courgettes", "quantity": "2", "unit": "pièces"},
            {"name": "huile d'olive", "quantity": "4", "unit": "cuillères"},
            {"name": "harissa", "quantity": "1", "unit": "cuillère"},
            {"name": "sel", "quantity": "1", "unit": "cuillère"},
        ],
        "steps": [
            "Faire revenir le poulet avec l'oignon dans l'huile d'olive",
            "Ajouter la tomate concentrée et la harissa, mélanger",
            "Ajouter l'eau, les pois chiches et les légumes coupés",
            "Laisser mijoter 1h à feu doux",
            "Préparer le couscous à la vapeur",
            "Servir le couscous avec la sauce et les légumes",
        ]
    },
    {
        "id": "salade_mechouia",
        "title": "Salade Mechouia",
        "description": "Salade grillée tunisienne, parfaite en entrée",
        "prep_time": "15 min",
        "cook_time": "30 min",
        "servings": 4,
        "ingredients": [
            {"name": "poivrons", "quantity": "4", "unit": "pièces"},
            {"name": "tomates", "quantity": "4", "unit": "pièces"},
            {"name": "piments", "quantity": "2", "unit": "pièces"},
            {"name": "oignon", "quantity": "1", "unit": "pièce"},
            {"name": "ail", "quantity": "3", "unit": "gousses"},
            {"name": "huile d'olive", "quantity": "3", "unit": "cuillères"},
            {"name": "thon", "quantity": "1", "unit": "boîte"},
            {"name": "oeufs", "quantity": "2", "unit": "pièces"},
            {"name": "citron", "quantity": "1", "unit": "pièce"},
        ],
        "steps": [
            "Griller les poivrons, tomates et piments au four",
            "Éplucher et écraser les légumes grillés",
            "Ajouter l'ail haché et l'oignon émincé",
            "Assaisonner avec l'huile d'olive, sel et citron",
            "Garnir avec le thon émietté et les oeufs durs",
        ]
    },
    {
        "id": "ojja_merguez",
        "title": "Ojja aux Merguez",
        "description": "Plat épicé tunisien aux oeufs et merguez",
        "prep_time": "10 min",
        "cook_time": "25 min",
        "servings": 4,
        "ingredients": [
            {"name": "merguez", "quantity": "8", "unit": "pièces"},
            {"name": "tomates", "quantity": "4", "unit": "pièces"},
            {"name": "oeufs", "quantity": "4", "unit": "pièces"},
            {"name": "poivrons", "quantity": "2", "unit": "pièces"},
            {"name": "harissa", "quantity": "2", "unit": "cuillères"},
            {"name": "ail", "quantity": "2", "unit": "gousses"},
            {"name": "huile d'olive", "quantity": "2", "unit": "cuillères"},
            {"name": "cumin", "quantity": "1", "unit": "cuillère"},
        ],
        "steps": [
            "Couper les merguez en morceaux et les faire revenir",
            "Ajouter les poivrons coupés et l'ail",
            "Ajouter les tomates concassées et la harissa",
            "Laisser mijoter 15 minutes",
            "Casser les oeufs sur la sauce et couvrir",
            "Cuire jusqu'à ce que les oeufs soient pris",
        ]
    },
    {
        "id": "lablabi",
        "title": "Lablabi (Soupe de Pois Chiches)",
        "description": "Soupe populaire tunisienne, réconfortante et nourrissante",
        "prep_time": "10 min",
        "cook_time": "45 min",
        "servings": 4,
        "ingredients": [
            {"name": "pois chiches", "quantity": "500", "unit": "g"},
            {"name": "pain rassis", "quantity": "4", "unit": "tranches"},
            {"name": "harissa", "quantity": "2", "unit": "cuillères"},
            {"name": "ail", "quantity": "4", "unit": "gousses"},
            {"name": "cumin", "quantity": "2", "unit": "cuillères"},
            {"name": "oeufs", "quantity": "4", "unit": "pièces"},
            {"name": "huile d'olive", "quantity": "4", "unit": "cuillères"},
            {"name": "citron", "quantity": "2", "unit": "pièces"},
        ],
        "steps": [
            "Faire tremper les pois chiches la veille",
            "Cuire les pois chiches dans l'eau salée 45 min",
            "Préparer la sauce: harissa, ail, cumin, huile d'olive",
            "Déchirer le pain dans les bols",
            "Verser les pois chiches et le bouillon chaud",
            "Ajouter la sauce, un oeuf dur et du citron",
        ]
    },
    {
        "id": "tajine_tunisien",
        "title": "Tajine Tunisien (aux Oeufs)",
        "description": "Tajine cuit au four, spécialité tunisienne",
        "prep_time": "20 min",
        "cook_time": "40 min",
        "servings": 6,
        "ingredients": [
            {"name": "oeufs", "quantity": "6", "unit": "pièces"},
            {"name": "poulet", "quantity": "300", "unit": "g"},
            {"name": "fromage râpé", "quantity": "200", "unit": "g"},
            {"name": "pommes de terre", "quantity": "3", "unit": "pièces"},
            {"name": "oignon", "quantity": "1", "unit": "pièce"},
            {"name": "persil", "quantity": "1", "unit": "bouquet"},
            {"name": "huile d'olive", "quantity": "3", "unit": "cuillères"},
            {"name": "sel", "quantity": "1", "unit": "cuillère"},
            {"name": "poivre", "quantity": "1", "unit": "cuillère"},
        ],
        "steps": [
            "Cuire les pommes de terre et le poulet",
            "Émincer l'oignon et le persil",
            "Mélanger les oeufs battus, fromage, poulet émietté",
            "Ajouter les pommes de terre coupées en dés",
            "Verser dans un plat huilé",
            "Cuire au four 35-40 min à 180°C",
        ]
    },
    {
        "id": "brik_thon",
        "title": "Brik au Thon",
        "description": "Entrée croustillante tunisienne, incontournable du Ramadan",
        "prep_time": "15 min",
        "cook_time": "10 min",
        "servings": 4,
        "ingredients": [
            {"name": "feuilles de brick", "quantity": "4", "unit": "pièces"},
            {"name": "thon", "quantity": "2", "unit": "boîtes"},
            {"name": "oeufs", "quantity": "4", "unit": "pièces"},
            {"name": "oignon", "quantity": "1", "unit": "pièce"},
            {"name": "persil", "quantity": "1", "unit": "bouquet"},
            {"name": "câpres", "quantity": "2", "unit": "cuillères"},
            {"name": "pommes de terre", "quantity": "2", "unit": "pièces"},
            {"name": "huile de friture", "quantity": "500", "unit": "ml"},
        ],
        "steps": [
            "Cuire et écraser les pommes de terre",
            "Mélanger thon, pommes de terre, oignon haché, persil, câpres",
            "Placer la farce sur une feuille de brick",
            "Casser un oeuf au centre",
            "Plier en triangle",
            "Frire dans l'huile chaude jusqu'à dorure",
        ]
    },
]


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


def search_recipes(query: str) -> List[dict]:
    """Search recipes by keyword"""
    msg = query.lower()
    results = []

    for recipe in RECIPES_DB:
        score = 0
        # Check title
        if any(word in recipe["title"].lower() for word in msg.split()):
            score += 3
        # Check description
        if any(word in recipe["description"].lower() for word in msg.split()):
            score += 2
        # Check ingredients
        for ing in recipe["ingredients"]:
            if any(word in ing["name"].lower() for word in msg.split()):
                score += 1

        if score > 0:
            results.append({**recipe, "_score": score})

    # Sort by relevance
    results.sort(key=lambda x: x["_score"], reverse=True)

    # If no results, return all recipes
    if not results:
        results = [{**r, "_score": 0} for r in RECIPES_DB]

    return results[:5]


async def match_ingredients_to_catalog(ingredients: List[dict]) -> List[RecipeIngredient]:
    """Match recipe ingredients to products in the catalog"""
    matched = []

    for ing in ingredients:
        name = ing["name"]
        # Search in ChromaDB
        results = search_products(query=name, k=2)

        product = None
        if results:
            best = results[0]
            product = CartProduct(
                id=str(best["id"]),
                name=best["name"],
                price=best["price"],
                old_price=best.get("old_price", 0),
                quantity=1,
                category=best.get("category", ""),
                brand=best.get("brand", ""),
                has_promo=best.get("has_promo", False),
                discount_pct=best.get("discount_pct", 0),
            )

        matched.append(RecipeIngredient(
            name=ing["name"],
            quantity=ing["quantity"],
            unit=ing["unit"],
            product=product,
        ))

    return matched


async def get_recipe_with_products(recipe_id: str) -> Optional[ChatAction]:
    """Get a recipe and match its ingredients to catalog products"""
    recipe_data = None
    for r in RECIPES_DB:
        if r["id"] == recipe_id:
            recipe_data = r
            break

    if not recipe_data:
        return None

    # Match ingredients to catalog
    ingredients = await match_ingredients_to_catalog(recipe_data["ingredients"])

    # Collect matched products
    matched_products = [ing.product for ing in ingredients if ing.product]

    recipe = Recipe(
        id=recipe_data["id"],
        title=recipe_data["title"],
        description=recipe_data["description"],
        prep_time=recipe_data.get("prep_time", ""),
        cook_time=recipe_data.get("cook_time", ""),
        servings=recipe_data.get("servings", 4),
        ingredients=ingredients,
        steps=recipe_data.get("steps", []),
        matched_products=matched_products,
    )

    total = sum(p.price for p in matched_products)

    return ChatAction(
        type=ActionType.SHOW_RECIPE,
        recipe=recipe,
        products=matched_products,
        message=f"Recette : {recipe.title} - {len(matched_products)} produits trouvés ({total:.2f} TND)"
    )


async def process_recipe_request(message: str) -> Optional[ChatAction]:
    """Process a recipe-related message and return an action"""
    intent = detect_recipe_intent(message)
    if not intent:
        return None

    # Search recipes
    results = search_recipes(message)

    if not results:
        return ChatAction(
            type=ActionType.NONE,
            message="Je n'ai pas trouvé de recette correspondante. Essayez avec d'autres mots-clés."
        )

    # If user wants to add ingredients to basket
    if intent == "basket" and results:
        return await get_recipe_with_products(results[0]["id"])

    # Otherwise, show recipe suggestions
    recipe_data = results[0]
    ingredients = await match_ingredients_to_catalog(recipe_data["ingredients"])
    matched_products = [ing.product for ing in ingredients if ing.product]

    recipe = Recipe(
        id=recipe_data["id"],
        title=recipe_data["title"],
        description=recipe_data["description"],
        prep_time=recipe_data.get("prep_time", ""),
        cook_time=recipe_data.get("cook_time", ""),
        servings=recipe_data.get("servings", 4),
        ingredients=ingredients,
        steps=recipe_data.get("steps", []),
        matched_products=matched_products,
    )

    return ChatAction(
        type=ActionType.SHOW_RECIPE,
        recipe=recipe,
        products=matched_products,
        message=f"Voici la recette : {recipe.title}"
    )


def format_recipe_suggestions(recipes: List[dict]) -> str:
    """Format recipe list for chat display"""
    if not recipes:
        return "Aucune recette trouvée."

    lines = ["🍽️ **Voici quelques recettes :**\n"]
    for i, r in enumerate(recipes, 1):
        lines.append(f"{i}. **{r['title']}** - {r['description']}")
        lines.append(f"   ⏱️ Préparation: {r.get('prep_time', '?')} | Cuisson: {r.get('cook_time', '?')}")
        ing_names = [ing['name'] for ing in r.get('ingredients', [])[:5]]
        lines.append(f"   Ingrédients: {', '.join(ing_names)}...")
        lines.append("")

    lines.append("💡 Dites-moi quelle recette vous intéresse et je prépare le panier d'ingrédients !")
    return "\n".join(lines)


def format_recipe_detail(recipe: Recipe) -> str:
    """Format a single recipe with ingredients and matched products"""
    lines = [f"🍽️ **{recipe.title}**"]
    lines.append(f"_{recipe.description}_\n")
    lines.append(f"⏱️ Préparation: {recipe.prep_time} | Cuisson: {recipe.cook_time} | Pour {recipe.servings} personnes\n")

    lines.append("**📝 Ingrédients :**")
    total = 0.0
    for ing in recipe.ingredients:
        if ing.product:
            total += ing.product.price
            lines.append(f"- {ing.quantity} {ing.unit} {ing.name} → **{ing.product.name}** ({ing.product.price} TND) ✅")
        else:
            lines.append(f"- {ing.quantity} {ing.unit} {ing.name} ❌ (non disponible)")

    lines.append(f"\n**🛒 Total panier estimé : {total:.2f} TND**")
    lines.append(f"({len(recipe.matched_products)} produits disponibles sur {len(recipe.ingredients)})")

    lines.append("\n**📋 Étapes :**")
    for i, step in enumerate(recipe.steps, 1):
        lines.append(f"{i}. {step}")

    lines.append("\n💡 Voulez-vous ajouter tous les ingrédients disponibles au panier ?")
    return "\n".join(lines)
