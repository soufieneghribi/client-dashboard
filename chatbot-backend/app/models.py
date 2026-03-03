"""
Pydantic models for the Chatbot API
Structured actions allow React and Flutter to process chatbot responses programmatically
"""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


# ==================== ENUMS ====================

class ActionType(str, Enum):
    ADD_TO_CART = "add_to_cart"
    REMOVE_FROM_CART = "remove_from_cart"
    SHOW_CART = "show_cart"
    CLEAR_CART = "clear_cart"
    SHOW_PRODUCTS = "show_products"
    SHOW_RECIPE = "show_recipe"
    ADD_RECIPE_BASKET = "add_recipe_basket"
    CREATE_COMPLAINT = "create_complaint"
    NAVIGATE = "navigate"
    NONE = "none"


class ComplaintCategory(str, Enum):
    MISSING_PRODUCT = "produit_manquant"
    WRONG_PRODUCT = "mauvais_produit"
    DELIVERY_DELAY = "retard_livraison"
    DAMAGED_PRODUCT = "produit_endommage"
    REFUND = "remboursement"
    RETURN = "retour"
    OTHER = "autre"


# ==================== PRODUCT MODELS ====================

class CartProduct(BaseModel):
    id: str
    name: str
    price: float
    old_price: Optional[float] = 0
    quantity: int = 1
    category: Optional[str] = ""
    brand: Optional[str] = ""
    has_promo: bool = False
    discount_pct: int = 0
    image: Optional[str] = ""


# ==================== RECIPE MODELS ====================

class RecipeIngredient(BaseModel):
    name: str
    quantity: str
    unit: str
    product: Optional[CartProduct] = None  # Matched product from catalog


class Recipe(BaseModel):
    id: str
    title: str
    description: str
    prep_time: Optional[str] = ""
    cook_time: Optional[str] = ""
    servings: Optional[int] = 4
    ingredients: List[RecipeIngredient] = []
    steps: List[str] = []
    matched_products: List[CartProduct] = []  # Products available in catalog


# ==================== COMPLAINT MODELS ====================

class ComplaintData(BaseModel):
    category: Optional[str] = ""
    description: Optional[str] = ""
    order_reference: Optional[str] = ""
    customer_name: Optional[str] = ""
    customer_email: Optional[str] = ""
    status: Optional[str] = "pending"


# ==================== ACTION MODEL ====================

class ChatAction(BaseModel):
    """Structured action sent alongside chat text via SSE"""
    type: ActionType
    products: Optional[List[CartProduct]] = None
    recipe: Optional[Recipe] = None
    complaint: Optional[ComplaintData] = None
    navigate_to: Optional[str] = None
    message: Optional[str] = None


# ==================== REQUEST/RESPONSE MODELS ====================

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    stream: Optional[bool] = True
    cart: Optional[List[CartProduct]] = []  # Current cart state from frontend
    auth_token: Optional[str] = None  # For authenticated operations

class SearchRequest(BaseModel):
    query: str
    n_results: Optional[int] = 10
    price_max: Optional[float] = None
    category: Optional[str] = None

class RecipeSearchRequest(BaseModel):
    query: str
    servings: Optional[int] = 4

class ComplaintRequest(BaseModel):
    category: str
    description: str
    order_reference: Optional[str] = ""
    auth_token: Optional[str] = None
