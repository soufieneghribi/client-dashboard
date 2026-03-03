/**
 * ChatBot Service - API client for the RAG chatbot backend
 * Handles SSE streaming, action parsing, and cart integration
 */

const CHATBOT_API = import.meta.env.VITE_CHATBOT_URL || '';

// ==================== TYPES ====================
// Action types matching the backend ActionType enum
export const ACTION_TYPES = {
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  SHOW_CART: 'show_cart',
  CLEAR_CART: 'clear_cart',
  SHOW_PRODUCTS: 'show_products',
  SHOW_RECIPE: 'show_recipe',
  ADD_RECIPE_BASKET: 'add_recipe_basket',
  CREATE_COMPLAINT: 'create_complaint',
  NAVIGATE: 'navigate',
  NONE: 'none',
};


// ==================== STREAM CHAT ====================
/**
 * Stream chat response from the chatbot backend via SSE.
 * Calls onChunk for each text chunk and onAction for structured actions.
 *
 * @param {Object} params
 * @param {string} params.message - User message
 * @param {Array} params.history - Conversation history [{role, content}]
 * @param {Array} params.cart - Current cart items from cookies
 * @param {string|null} params.authToken - Auth token for authenticated operations
 * @param {Function} params.onChunk - Called with each text chunk string
 * @param {Function} params.onAction - Called with parsed action object
 * @param {Function} params.onDone - Called when stream completes
 * @param {Function} params.onError - Called on error
 */
export async function streamChat({
  message,
  history = [],
  cart = [],
  authToken = null,
  onChunk,
  onAction,
  onDone,
  onError,
}) {
  try {
    const response = await fetch(`${CHATBOT_API}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        message,
        history: history.slice(-10), // last 10 messages
        stream: true,
        cart: cart.map(item => ({
          id: String(item.id),
          name: item.name,
          price: parseFloat(item.price || item.Initialprice || 0),
          old_price: parseFloat(item.Initialprice || item.old_price || 0),
          quantity: parseInt(item.quantity) || 1,
          category: item.category || '',
          brand: item.brand || '',
          has_promo: item.isPromotion || false,
          discount_pct: 0,
          image: item.image || '',
        })),
        auth_token: authToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();

        if (data === '[DONE]') {
          onDone?.();
          return;
        }

        try {
          const parsed = JSON.parse(data);

          if (parsed.content !== undefined) {
            // Text chunk
            onChunk?.(parsed.content);
          } else if (parsed.action !== undefined) {
            // Structured action
            onAction?.(parsed.action);
          } else if (parsed.error) {
            onError?.(parsed.error);
          }
        } catch (e) {
          // Ignore parse errors for malformed chunks
        }
      }
    }

    onDone?.();
  } catch (err) {
    onError?.(err.message || 'Erreur de connexion au chatbot');
  }
}


// ==================== SIMPLE CHAT (non-streaming) ====================
export async function sendMessage({ message, history = [], cart = [], authToken = null }) {
  const response = await fetch(`${CHATBOT_API}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      stream: false,
      cart,
      auth_token: authToken,
    }),
  });
  const data = await response.json();
  return data.response || '';
}


// ==================== RECIPE API ====================
export async function getRecipes(query, addToCart = false) {
  const response = await fetch(`${CHATBOT_API}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, add_to_cart: addToCart }),
  });
  return response.json();
}


// ==================== COMPLAINT API ====================
export async function submitComplaint({ category, description, orderReference = '', authToken }) {
  const response = await fetch(`${CHATBOT_API}/api/complaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      description,
      order_reference: orderReference,
      auth_token: authToken,
    }),
  });
  return response.json();
}


// ==================== HEALTH CHECK ====================
export async function checkHealth() {
  try {
    const response = await fetch(`${CHATBOT_API}/api/health`, { timeout: 3000 });
    return response.ok;
  } catch {
    return false;
  }
}
