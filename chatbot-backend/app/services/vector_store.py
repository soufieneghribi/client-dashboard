"""
Vector Store Service - LangChain + ChromaDB + HuggingFace Embeddings
RAG-ready vector database for product semantic search
"""
import os
from typing import List, Dict, Optional
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from app.config import EMBEDDING_MODEL, CHROMA_PERSIST_DIR, CHROMA_COLLECTION

# Global embeddings instance
_embeddings: Optional[HuggingFaceEmbeddings] = None
_vectorstore: Optional[Chroma] = None


def get_embeddings() -> HuggingFaceEmbeddings:
    """Get or initialize HuggingFace embeddings model"""
    global _embeddings
    if _embeddings is None:
        print(f"[AI] Loading HuggingFace embeddings: {EMBEDDING_MODEL}...")
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        print(f"[OK] Embeddings model loaded!")
    return _embeddings


def get_vectorstore() -> Chroma:
    """Get or initialize ChromaDB vector store"""
    global _vectorstore
    if _vectorstore is None:
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        embeddings = get_embeddings()
        _vectorstore = Chroma(
            collection_name=CHROMA_COLLECTION,
            embedding_function=embeddings,
            persist_directory=CHROMA_PERSIST_DIR,
        )
        print(f"[OK] ChromaDB initialized at {CHROMA_PERSIST_DIR}")
    return _vectorstore


def product_to_text(product: dict) -> str:
    """Convert product to searchable text"""
    parts = []

    name = product.get("designation") or product.get("name") or product.get("title") or ""
    if name:
        parts.append(f"Produit: {name}")

    # Handle both formats: old format (prix_vente) and new API format (promo_price, price)
    promo_price = product.get("promo_price", "")
    regular_price = product.get("price", "")

    # Determine actual price and old price
    if promo_price:
        price = promo_price
        old_price = regular_price if regular_price and regular_price != promo_price else None
    else:
        price = product.get("prix_vente") or regular_price or product.get("prix") or 0
        old_price = product.get("ancien_prix") or product.get("old_price") or 0

    if price:
        parts.append(f"Prix: {price} TND")

    if old_price and float(old_price) > float(price) and float(price) > 0:
        discount = round((1 - float(price) / float(old_price)) * 100)
        parts.append(f"Promotion: {old_price} TND → {price} TND (-{discount}%)")

    type_article = product.get("type_article") or {}
    category = ""
    if isinstance(type_article, dict):
        category = type_article.get("libelle") or type_article.get("name") or ""
    if category:
        parts.append(f"Catégorie: {category}")

    desc = product.get("description") or product.get("desc") or ""
    if desc and len(str(desc)) > 10:
        parts.append(f"Description: {str(desc)[:200]}")

    brand = product.get("marque") or product.get("brand") or ""
    if brand:
        parts.append(f"Marque: {brand}")

    return " | ".join(parts)


def product_to_metadata(product: dict) -> dict:
    """Extract metadata for filtering"""
    # Handle both formats: old format (prix_vente) and new API format (promo_price, price)
    promo_price = product.get("promo_price", "")
    regular_price = product.get("price", "")

    if promo_price:
        price = promo_price
        old_price = regular_price if regular_price and regular_price != promo_price else 0
    else:
        price = product.get("prix_vente") or regular_price or product.get("prix") or 0
        old_price = product.get("ancien_prix") or product.get("old_price") or 0

    type_article = product.get("type_article") or {}
    category = ""
    if isinstance(type_article, dict):
        category = type_article.get("libelle") or type_article.get("name") or ""

    try:
        price_f = float(price) if price else 0.0
        old_price_f = float(old_price) if old_price else 0.0
    except (ValueError, TypeError):
        price_f = 0.0
        old_price_f = 0.0

    has_promo = bool(old_price_f > price_f and price_f > 0)

    return {
        "product_id": str(product.get("id") or product.get("code_article") or ""),
        "name": str(product.get("designation") or product.get("name") or product.get("title") or "Unknown"),
        "price": price_f,
        "old_price": old_price_f,
        "category": str(category),
        "brand": str(product.get("marque") or product.get("brand") or ""),
        "has_promo": str(has_promo),  # ChromaDB needs strings
        "discount_pct": str(round((1 - price_f / old_price_f) * 100) if has_promo else 0),
    }


async def index_products(products: List[dict]) -> dict:
    """Index products into ChromaDB using LangChain"""
    if not products:
        return {"status": "error", "message": "No products to index"}

    print(f"[PRODUCT] Indexing {len(products)} products into ChromaDB with LangChain...")

    vectorstore = get_vectorstore()

    # Prepare LangChain Documents
    documents = []
    for product in products:
        product_id = str(product.get("id") or product.get("code_article") or "")
        if not product_id:
            continue

        text = product_to_text(product)
        if not text or len(text) < 10:
            continue

        metadata = product_to_metadata(product)

        doc = Document(
            page_content=text,
            metadata=metadata
        )
        documents.append(doc)

    if not documents:
        return {"status": "error", "message": "No valid products to index"}

    print(f"[AI] Generating embeddings and storing in ChromaDB...")

    # Add documents to ChromaDB (LangChain handles embeddings automatically)
    vectorstore.add_documents(documents)

    total = vectorstore._collection.count()
    print(f"[SUCCESS] Indexing complete! Total products in ChromaDB: {total}")

    return {
        "status": "success",
        "indexed": len(documents),
        "total_in_store": total,
    }


def search_products(
    query: str,
    k: int = 15,
    price_max: Optional[float] = None,
    category: Optional[str] = None,
    min_score: float = 0.0
) -> List[Dict]:
    """Semantic search using LangChain + ChromaDB with relevance scoring"""
    vectorstore = get_vectorstore()

    # Build metadata filter
    where_filter = {}
    if category:
        where_filter["category"] = {"$contains": category}

    # Perform similarity search WITH scores to filter bad matches
    try:
        if where_filter:
            scored_docs = vectorstore.similarity_search_with_relevance_scores(
                query, k=k, filter=where_filter
            )
        else:
            scored_docs = vectorstore.similarity_search_with_relevance_scores(query, k=k)
    except Exception as e:
        print(f"[WARN] Scored search failed, falling back: {e}")
        try:
            scored_docs = vectorstore.similarity_search_with_relevance_scores(query, k=k)
        except Exception:
            docs = vectorstore.similarity_search(query, k=k)
            scored_docs = [(doc, 0.5) for doc in docs]

    # Format results — filter by minimum relevance score
    results = []
    for doc, score in scored_docs:
        if score < min_score:
            continue

        metadata = doc.metadata
        price = float(metadata.get("price", 0))

        # Apply price filter manually if needed
        if price_max and price_max > 0:
            if price <= 0 or price > price_max:
                continue

        results.append({
            "id": metadata.get("product_id", ""),
            "name": metadata.get("name", ""),
            "price": price,
            "old_price": float(metadata.get("old_price", 0)),
            "category": metadata.get("category", ""),
            "brand": metadata.get("brand", ""),
            "has_promo": metadata.get("has_promo", "False") == "True",
            "discount_pct": int(metadata.get("discount_pct", 0)),
            "document": doc.page_content,
            "score": round(score, 4),
        })

    return results


def warm_up():
    """Pre-load embedding model and do a dummy search to avoid 8s delay on first user request."""
    try:
        print("[WARMUP] Pre-loading embedding model...")
        vectorstore = get_vectorstore()
        total = vectorstore._collection.count()
        if total > 0:
            # Dummy search to force model weights into memory
            vectorstore.similarity_search("test", k=1)
            print(f"[WARMUP] Embedding model ready! ({total} products indexed)")
        else:
            # Just loading embeddings is enough
            get_embeddings()
            print("[WARMUP] Embedding model loaded (no products yet)")
    except Exception as e:
        print(f"[WARMUP WARN] {e}")


def get_store_stats() -> dict:
    """Get vector store statistics"""
    try:
        vectorstore = get_vectorstore()
        total = vectorstore._collection.count()
        return {
            "total_products": total,
            "collection_name": CHROMA_COLLECTION,
            "embedding_model": EMBEDDING_MODEL,
            "persist_dir": CHROMA_PERSIST_DIR,
            "backend": "LangChain + ChromaDB",
        }
    except Exception as e:
        return {
            "error": str(e),
            "total_products": 0,
        }
