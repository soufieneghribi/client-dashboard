"""
TN360 API Service - Fetches product data and manages operations via TN360 backend
Supports: products, categories, promotions, stores, complaints, orders
"""
import httpx
import asyncio
from typing import Optional, Dict
from app.config import TN360_API_URL

# Reusable async client
_client: Optional[httpx.AsyncClient] = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            base_url=TN360_API_URL,
            timeout=30.0,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )
    return _client


async def fetch_all_products(page: int = 1) -> list:
    """Fetch all products from TN360 API"""
    try:
        client = get_client()
        response = await client.get("/products/allproducts", params={"page": page, "channel": "web"})
        response.raise_for_status()
        data = response.json()
        # Handle paginated response - API returns {"products": [...], "total_size": N}
        if isinstance(data, dict):
            if "products" in data:
                return data["products"]
            elif "data" in data:
                return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching products: {e}")
        return []


async def fetch_recommended_products() -> list:
    """Fetch recommended products"""
    try:
        client = get_client()
        response = await client.get("/products/recommended")
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching recommended: {e}")
        return []


async def fetch_popular_products() -> list:
    """Fetch popular products"""
    try:
        client = get_client()
        response = await client.get("/products/popular")
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching popular: {e}")
        return []


async def fetch_categories() -> list:
    """Fetch all categories"""
    try:
        client = get_client()
        response = await client.get("/categories/article-types")
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching categories: {e}")
        return []


async def fetch_promotions() -> list:
    """Fetch active promotions"""
    try:
        client = get_client()
        response = await client.get("/promotions")
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching promotions: {e}")
        return []


async def fetch_stores() -> list:
    """Fetch all stores"""
    try:
        client = get_client()
        response = await client.get("/stores")
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching stores: {e}")
        return []


async def fetch_all_products_paginated(max_pages: int = 50, max_retries: int = 3) -> list:
    """Fetch all products across multiple pages for indexing (with retries for GCP cold start)"""
    all_products = []
    for page in range(1, max_pages + 1):
        last_error = None
        for attempt in range(1, max_retries + 1):
            try:
                client = get_client()
                response = await client.get("/products/allproducts", params={"page": page, "channel": "web"})
                response.raise_for_status()
                data = response.json()

                products = []
                if isinstance(data, dict):
                    # API returns {"products": [...], "total_size": N}
                    products = data.get("products", data.get("data", []))
                    # Check if we've reached the last page
                    total_size = data.get("total_size", 0)
                    if not products or (total_size > 0 and len(all_products) + len(products) >= total_size):
                        all_products.extend(products)
                        print(f"   [PAGE] Page {page}: {len(products)} produits (last page)")
                        return all_products
                elif isinstance(data, list):
                    products = data
                    if not products:
                        return all_products

                all_products.extend(products)
                print(f"   [PAGE] Page {page}: {len(products)} produits")
                last_error = None
                break  # Success, go to next page
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    wait = 2 ** attempt  # 2s, 4s, 8s
                    print(f"   [RETRY] Page {page} attempt {attempt}/{max_retries} failed: {e}. Retrying in {wait}s...")
                    await asyncio.sleep(wait)
                else:
                    print(f"   [ERROR] Page {page} failed after {max_retries} attempts: {e}")

        if last_error:
            # If first page fails, all products are unavailable
            if page == 1:
                print(f"   [ERROR] Cannot fetch ANY products - API unreachable")
                return []
            # For later pages, return what we have
            break

    return all_products


async def fetch_product_by_id(product_id: str) -> Optional[dict]:
    """Fetch a single product by ID"""
    try:
        client = get_client()
        response = await client.get(f"/products/{product_id}")
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict):
            return data.get("data", data)
        return data
    except Exception as e:
        print(f"[ERROR] Error fetching product {product_id}: {e}")
        return None


async def fetch_claim_types(auth_token: str) -> list:
    """Fetch available claim types from TN360 API"""
    try:
        client = get_client()
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = await client.get("/claims/types", headers=headers)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching claim types: {e}")
        return []


# Map chatbot category names to possible claim type names in DB
_CATEGORY_TO_LABEL = {
    "produit_manquant": ["produit manquant", "missing product", "manquant"],
    "mauvais_produit": ["mauvais produit", "wrong product", "mauvais"],
    "retard_livraison": ["retard de livraison", "retard livraison", "delivery delay", "retard"],
    "produit_endommage": ["produit endommagé", "produit endommage", "damaged product", "endommagé"],
    "remboursement": ["remboursement", "refund"],
    "retour": ["retour", "return", "retour produit"],
    "autre": ["autre", "other"],
}


async def _resolve_claim_type_id(auth_token: str, category: str) -> Optional[int]:
    """Resolve a category name to a claim_type_id by fetching types from API"""
    claim_types = await fetch_claim_types(auth_token)
    if not claim_types:
        return None

    # Try exact match on name/slug first
    category_lower = category.lower().strip()
    for ct in claim_types:
        ct_name = (ct.get("name") or ct.get("label") or ct.get("libelle") or "").lower()
        ct_slug = (ct.get("slug") or "").lower()
        if category_lower == ct_name or category_lower == ct_slug:
            return ct.get("id")

    # Try fuzzy match using our label map
    labels = _CATEGORY_TO_LABEL.get(category_lower, [category_lower])
    for ct in claim_types:
        ct_name = (ct.get("name") or ct.get("label") or ct.get("libelle") or "").lower()
        for label in labels:
            if label in ct_name or ct_name in label:
                return ct.get("id")

    # Fallback: prefer "autre" type, then first type
    if claim_types:
        for ct in claim_types:
            ct_name = (ct.get("name") or ct.get("label") or ct.get("libelle") or "").lower()
            if "autre" in ct_name or "other" in ct_name:
                return ct.get("id")
        return claim_types[0].get("id")

    return None


async def create_complaint(
    auth_token: str,
    category: str,
    description: str,
    order_reference: str = "",
) -> Optional[dict]:
    """Create a customer complaint via TN360 API"""
    try:
        # Resolve category name to claim_type_id
        claim_type_id = await _resolve_claim_type_id(auth_token, category)
        if not claim_type_id:
            return {"error": "Impossible de trouver le type de réclamation. Veuillez réessayer."}

        # Build subject from category
        subject_map = {
            "produit_manquant": "Produit manquant",
            "mauvais_produit": "Mauvais produit reçu",
            "retard_livraison": "Retard de livraison",
            "produit_endommage": "Produit endommagé",
            "remboursement": "Demande de remboursement",
            "retour": "Retour produit",
            "autre": "Autre réclamation",
        }
        subject = subject_map.get(category.lower(), f"Réclamation - {category}")

        client = get_client()
        payload = {
            "claim_type_id": claim_type_id,
            "subject": subject,
            "description": description,
        }
        if order_reference:
            payload["order_reference"] = order_reference

        headers = {"Authorization": f"Bearer {auth_token}"}
        response = await client.post("/claims", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data
    except httpx.HTTPStatusError as e:
        error_body = ""
        try:
            error_body = e.response.json()
        except Exception:
            error_body = e.response.text
        print(f"[ERROR] Error creating complaint (HTTP {e.response.status_code}): {error_body}")
        return {"error": f"Erreur HTTP {e.response.status_code}: {error_body}"}
    except Exception as e:
        print(f"[ERROR] Error creating complaint: {e}")
        return {"error": str(e)}


async def fetch_customer_orders(auth_token: str) -> list:
    """Fetch customer orders (for complaint reference)"""
    try:
        client = get_client()
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = await client.get("/customer/order/list", headers=headers)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[ERROR] Error fetching orders: {e}")
        return []


async def prepare_order(auth_token: str, cart_items: list) -> Optional[dict]:
    """Prepare an order from cart items"""
    try:
        client = get_client()
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {"items": cart_items}
        response = await client.post("/customer/order/prepare", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[ERROR] Error preparing order: {e}")
        return {"error": str(e)}


async def close_client():
    """Close the HTTP client"""
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None
