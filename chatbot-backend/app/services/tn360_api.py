"""
TN360 API Service - Fetches product data and manages operations via TN360 backend
Supports: products, categories, promotions, stores, complaints, orders
"""
import httpx
from typing import Optional, Dict
from app.config import TN360_API_URL

# Reusable async client
_client: Optional[httpx.AsyncClient] = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            base_url=TN360_API_URL,
            timeout=15.0,
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


async def fetch_all_products_paginated(max_pages: int = 10) -> list:
    """Fetch all products across multiple pages for indexing"""
    all_products = []
    for page in range(1, max_pages + 1):
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
                    break
            elif isinstance(data, list):
                products = data
                if not products:
                    break

            all_products.extend(products)
            print(f"   [PAGE] Page {page}: {len(products)} produits")
        except Exception as e:
            print(f"   [ERROR] Page {page} error: {e}")
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


async def create_complaint(
    auth_token: str,
    category: str,
    description: str,
    order_reference: str = "",
) -> Optional[dict]:
    """Create a customer complaint via TN360 API"""
    try:
        client = get_client()
        payload = {
            "type": category,
            "description": description,
        }
        if order_reference:
            payload["order_reference"] = order_reference

        headers = {"Authorization": f"Bearer {auth_token}"}
        response = await client.post("/claims", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data
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
