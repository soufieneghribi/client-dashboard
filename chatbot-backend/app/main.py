"""
TN360 RAG Chatbot API - FastAPI Backend
Full RAG pipeline: TN360 API → ChromaDB → Ollama LLM
Enhanced with: Cart actions, Recipe baskets, Complaint handling
SSE format: text chunks + structured JSON actions
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import asyncio
from contextlib import asynccontextmanager

from app.config import CORS_ORIGINS, HOST, PORT
from app.services.vector_store import index_products, search_products, get_store_stats
from app.services.tn360_api import (
    fetch_all_products_paginated,
    fetch_recommended_products,
    close_client,
    create_complaint,
)
from app.services.rag_engine import chat_stream, chat_sync
from app.services.recipe_service import (
    search_recipes,
    get_recipe_with_products,
    format_recipe_suggestions,
)
from app.models import CartProduct, ChatAction, ActionType


# ==================== LIFESPAN ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown"""
    print("[START] Starting TN360 RAG Chatbot Backend...")

    stats = get_store_stats()
    total = stats.get("total_products", 0)

    if total == 0:
        print("[PRODUCT] No products indexed. Syncing from TN360 API...")
        try:
            products = await fetch_all_products_paginated(max_pages=10)
            if products:
                result = await index_products(products)
                print(f"[OK] Initial sync: {result}")
            else:
                print("[WARN] No products fetched from API. Index is empty.")
        except Exception as e:
            print(f"[ERROR] Initial sync failed: {e}")
            print("   You can manually sync later via POST /api/sync")
    else:
        print(f"[OK] Vector store has {total} products indexed")

    yield
    print("[STOP] Shutting down...")
    await close_client()


# ==================== APP ====================

app = FastAPI(
    title="TN360 RAG Chatbot API",
    description="AI Chatbot with Cart, Recipe & Complaint support",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== SCHEMAS ====================

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    stream: Optional[bool] = True
    cart: Optional[List[dict]] = []        # Current cart state from frontend
    auth_token: Optional[str] = None      # For authenticated operations

class SearchRequest(BaseModel):
    query: str
    n_results: Optional[int] = 10
    price_max: Optional[float] = None
    category: Optional[str] = None

class RecipeRequest(BaseModel):
    query: str
    add_to_cart: Optional[bool] = False

class ComplaintRequest(BaseModel):
    category: str
    description: str
    order_reference: Optional[str] = ""
    auth_token: str


# ==================== ROUTES ====================

@app.get("/")
async def root():
    return {
        "service": "TN360 RAG Chatbot API v2",
        "status": "running",
        "version": "2.0.0",
        "capabilities": ["chat", "cart", "recipes", "complaints"],
        "endpoints": {
            "chat": "POST /api/chat",
            "search": "POST /api/search",
            "recipes": "POST /api/recipes",
            "complaint": "POST /api/complaint",
            "sync": "POST /api/sync",
            "stats": "GET /api/stats",
            "health": "GET /api/health",
        }
    }


@app.get("/api/health")
async def health():
    stats = get_store_stats()
    return {"status": "healthy", "vector_store": stats}


@app.get("/api/stats")
async def stats():
    return get_store_stats()


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Enhanced chat endpoint.
    SSE stream format:
    - data: {"content": "text chunk"}    → text to display
    - data: {"action": {...}}            → structured action for React/Flutter
    - data: [DONE]
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    cart = request.cart or []

    if request.stream:
        async def event_stream():
            try:
                async for chunk in chat_stream(
                    request.message,
                    history,
                    cart=cart,
                    auth_token=request.auth_token,
                ):
                    if chunk.startswith("__ACTION__"):
                        # Structured action event
                        action_json = chunk[len("__ACTION__"):]
                        yield f"data: {action_json}\n\n"
                    else:
                        # Text chunk
                        data = json.dumps({"content": chunk}, ensure_ascii=False)
                        yield f"data: {data}\n\n"

                yield "data: [DONE]\n\n"
            except Exception as e:
                error_data = json.dumps({"error": str(e)}, ensure_ascii=False)
                yield f"data: {error_data}\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
    else:
        try:
            response = await chat_sync(request.message, history, cart=cart)
            return {"response": response}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search")
async def search(request: SearchRequest):
    """Semantic search across products"""
    results = search_products(
        query=request.query,
        k=request.n_results or 10,
        price_max=request.price_max,
        category=request.category,
    )
    return {
        "query": request.query,
        "results": results,
        "count": len(results),
    }


@app.post("/api/recipes")
async def get_recipes(request: RecipeRequest):
    """Get recipe suggestions with matched products"""
    recipes = search_recipes(request.query)

    if not recipes:
        return {"recipes": [], "message": "Aucune recette trouvée"}

    if request.add_to_cart and recipes:
        # Return first recipe with full product matching
        action = await get_recipe_with_products(recipes[0]["id"])
        if action:
            return {
                "recipes": recipes[:3],
                "action": action.dict(),
                "message": action.message,
            }

    # Return recipe list with basic info
    return {
        "recipes": recipes[:5],
        "message": format_recipe_suggestions(recipes[:3]),
    }


@app.post("/api/complaint")
async def submit_complaint(request: ComplaintRequest):
    """Submit a customer complaint via TN360 API"""
    if not request.auth_token:
        raise HTTPException(status_code=401, detail="Authentication required")

    result = await create_complaint(
        auth_token=request.auth_token,
        category=request.category,
        description=request.description,
        order_reference=request.order_reference or "",
    )

    if result and "error" not in result:
        return {
            "status": "success",
            "message": "Réclamation soumise avec succès",
            "data": result,
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Erreur lors de la soumission")
        )


@app.post("/api/sync")
async def sync_products():
    """Sync products from TN360 API into vector store"""
    print("[SYNC] Manual sync triggered...")
    try:
        products = await fetch_all_products_paginated(max_pages=10)
        if not products:
            return {"status": "warning", "message": "No products fetched from API"}
        result = await index_products(products)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== RUN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
