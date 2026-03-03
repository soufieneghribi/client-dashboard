import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { streamChat, ACTION_TYPES } from '../../services/chatbotService';
import './ChatBot.css';

// ==================== ARABIC TEXT DETECTION ====================
function isArabicText(text) {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
}

// ==================== QUICK SUGGESTIONS (FR + Tounsi + عربي) ====================
const QUICK_SUGGESTIONS = [
    { label: '🛒 Ajouter au panier', text: 'Ajoute 1kg de tomates et 6 oeufs à mon panier' },
    { label: '🍽️ Recette poulet', text: 'Je cherche une recette avec du poulet' },
    { label: '🔥 Promos', text: 'Ajoute tous les produits en promotion au panier' },
    { label: '💰 Budget 50 TND', text: "J'ai un budget de 50 TND, que me conseillez-vous ?" },
    { label: '📝 Réclamation', text: 'Je veux déposer une réclamation' },
    { label: '🛒 زيد في السلة', text: 'na7eb nzid 1kg tomate w 6 bidhat fil panier' },
    { label: '🔥 شنيا البرومو؟', text: 'chnahiya el promo lyoum?' },
    { label: '💰 عندي 50 دينار', text: '3andi budget 50 dinar, chnowa tansehouni?' },
];

// ==================== MARKDOWN RENDERER ====================
function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<s>$1</s>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="cb-link">$1</a>')
        .replace(/\n/g, '<br/>');
}


// ==================== COMPLAINT FORM ====================
const COMPLAINT_TYPES = [
    { value: 'produit_manquant', label: '📦 Produit manquant' },
    { value: 'mauvais_produit', label: '🔄 Mauvais produit reçu' },
    { value: 'retard_livraison', label: '🚚 Retard de livraison' },
    { value: 'produit_endommage', label: '💥 Produit endommagé' },
    { value: 'remboursement', label: '💰 Demande de remboursement' },
    { value: 'retour', label: '🔄 Retour produit' },
    { value: 'autre', label: '❓ Autre' },
];

const ComplaintForm = ({ onSubmit, onCancel, isLoggedIn }) => {
    const [category, setCategory] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [orderRef, setOrderRef] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !description.trim()) return;
        setLoading(true);
        await onSubmit({ category, description, orderRef });
        setLoading(false);
    };

    return (
        <div className="cb-complaint-form">
            <form onSubmit={handleSubmit}>
                <div className="cb-form-group">
                    <label>Type de réclamation *</label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        required
                        className="cb-select"
                    >
                        <option value="">-- Choisir --</option>
                        {COMPLAINT_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="cb-form-group">
                    <label>N° commande (optionnel)</label>
                    <input
                        type="text"
                        value={orderRef}
                        onChange={e => setOrderRef(e.target.value)}
                        placeholder="Ex: CMD-2024-001"
                        className="cb-text-input"
                    />
                </div>

                <div className="cb-form-group">
                    <label>Description *</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Décrivez votre problème en détail..."
                        rows={3}
                        required
                        className="cb-textarea-field"
                    />
                </div>

                {!isLoggedIn && (
                    <div className="cb-form-warn">
                        ⚠️ Connectez-vous pour soumettre une réclamation. <a href="/login">Se connecter</a>
                    </div>
                )}

                <div className="cb-form-actions">
                    <button type="button" onClick={onCancel} className="cb-btn-cancel">Annuler</button>
                    <button
                        type="submit"
                        className="cb-btn-submit"
                        disabled={loading || !category || !description.trim() || !isLoggedIn}
                    >
                        {loading ? 'Envoi...' : '📤 Soumettre'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ==================== MESSAGE BUBBLE ====================
const MessageBubble = memo(({ msg, onAddToCart, onAddRecipeToCart, onNavigate, onComplaintSubmit, onComplaintClose }) => {
    const isUser = msg.role === 'user';
    const isSystem = msg.role === 'system';

    if (isSystem) {
        return (
            <div className="cb-system-msg">
                <span>{msg.content}</span>
            </div>
        );
    }

    const isRTL = isArabicText(msg.content);

    return (
        <div className={`cb-message ${isUser ? 'cb-user' : 'cb-bot'}`}>
            {!isUser && (
                <div className="cb-avatar"><span>🤖</span></div>
            )}
            <div className={`cb-bubble ${isUser ? 'cb-bubble-user' : 'cb-bubble-bot'} ${isRTL ? 'cb-rtl' : ''}`}>
                {isUser ? (
                    <p>{msg.content}</p>
                ) : (
                    <div
                        className="cb-markdown"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                )}

                {/* Inline complaint form */}
                {msg.action?.type === 'create_complaint' && msg.showComplaintForm && (
                    <ComplaintForm
                        onSubmit={onComplaintSubmit}
                        onCancel={() => onComplaintClose(msg.id)}
                        isLoggedIn={msg.isLoggedIn}
                    />
                )}

                {/* Cart action result */}
                {msg.action?.type === 'add_to_cart' && msg.action.products?.length > 0 && (
                    <div className="cb-action-card cb-action-cart">
                        <div className="cb-action-header">🛒 Produits ajoutés au panier</div>
                        {msg.action.products.map((p, i) => (
                            <div key={i} className="cb-product-row">
                                <span className="cb-product-name">{p.name}</span>
                                <span className="cb-product-price">{p.price} TND</span>
                            </div>
                        ))}
                        <button
                            className="cb-action-btn cb-btn-primary"
                            onClick={() => onNavigate('/cart-shopping')}
                        >
                            Voir le panier →
                        </button>
                    </div>
                )}

                {/* Recipe with basket */}
                {msg.action?.type === 'show_recipe' && msg.action.recipe && (
                    <div className="cb-action-card cb-action-recipe">
                        <div className="cb-action-header">🍽️ {msg.action.recipe.title}</div>
                        <div className="cb-recipe-meta">
                            ⏱️ {msg.action.recipe.prep_time} prép. | 🍳 {msg.action.recipe.cook_time} cuisson
                        </div>
                        {msg.action.products?.length > 0 && (
                            <>
                                <div className="cb-recipe-products">
                                    {msg.action.products.slice(0, 4).map((p, i) => (
                                        <div key={i} className="cb-product-row">
                                            <span className="cb-product-name">{p.name}</span>
                                            <span className="cb-product-price">{p.price} TND</span>
                                        </div>
                                    ))}
                                    {msg.action.products.length > 4 && (
                                        <p className="cb-more-items">+{msg.action.products.length - 4} autres</p>
                                    )}
                                </div>
                                <div className="cb-recipe-total">
                                    Total: {msg.action.products.reduce((s, p) => s + p.price, 0).toFixed(2)} TND
                                </div>
                                <button
                                    className="cb-action-btn cb-btn-success"
                                    onClick={() => onAddRecipeToCart(msg.action.products)}
                                >
                                    🛒 Ajouter tous les ingrédients au panier
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Products list */}
                {msg.action?.type === 'show_products' && msg.action.products?.length > 0 && (
                    <div className="cb-action-card cb-action-products">
                        <div className="cb-action-header">📦 Produits trouvés</div>
                        {msg.action.products.slice(0, 5).map((p, i) => (
                            <div key={i} className="cb-product-row">
                                <div>
                                    <span className="cb-product-name">{p.name}</span>
                                    {p.has_promo && <span className="cb-promo-badge">-{p.discount_pct}%</span>}
                                </div>
                                <div className="cb-product-price-block">
                                    {p.has_promo && p.old_price > 0 && (
                                        <span className="cb-old-price">{p.old_price} TND</span>
                                    )}
                                    <span className="cb-product-price">{p.price} TND</span>
                                </div>
                                <button
                                    className="cb-add-btn"
                                    onClick={() => onAddToCart(p)}
                                    title="Ajouter au panier"
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {msg.streaming && <span className="cb-cursor">▌</span>}
            </div>
            {isUser && (
                <div className="cb-avatar cb-avatar-user"><span>👤</span></div>
            )}
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';


// ==================== TYPING INDICATOR ====================
const TypingIndicator = () => (
    <div className="cb-message cb-bot">
        <div className="cb-avatar"><span>🤖</span></div>
        <div className="cb-bubble cb-bubble-bot cb-typing">
            <span></span><span></span><span></span>
        </div>
    </div>
);


// ==================== CART NOTIFICATION ====================
const CartNotification = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            const t = setTimeout(onClose, 3500);
            return () => clearTimeout(t);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    return (
        <div className="cb-cart-notif">
            <span>✅</span>
            <span>{notification}</span>
        </div>
    );
};


// ==================== MAIN CHATBOT ====================
const ChatBot = () => {
    const navigate = useNavigate();
    const { isLoggedIn, token } = useSelector(state => state.auth);

    const WELCOME_MSG = {
        id: 0,
        role: 'bot',
        content: "Bonjour ! 👋 Marhba bik!\nAna **Assistant MG**, n3awnek f kol chay.\n\n🛒 Panier | 🍽️ Recettes | 🔥 Promos | 📝 Réclamations\n💰 Budget | 👔 Recrutement | 📰 Presse\n\n**Français, عربي, Tounsi** — Ahki kima t7eb! 😊",
        action: null,
    };

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('mg_chat_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {}
        return [WELCOME_MSG];
    });
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [cartNotification, setCartNotification] = useState('');
    const [cartCount, setCartCount] = useState(0);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);

    // Read cart items from cookies
    const getCartItems = useCallback(() => {
        try {
            const raw = Cookies.get('cart');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }, []);

    // Update cart count badge
    const refreshCartCount = useCallback(() => {
        const items = getCartItems();
        const count = items.reduce((s, item) => s + (parseInt(item.quantity) || 1), 0);
        setCartCount(count);
    }, [getCartItems]);

    useEffect(() => {
        refreshCartCount();
        const interval = setInterval(refreshCartCount, 2000);
        return () => clearInterval(interval);
    }, [refreshCartCount]);

    // Save messages to localStorage (persist chat history)
    useEffect(() => {
        try {
            // Only save non-streaming messages
            const toSave = messages.filter(m => !m.streaming);
            if (toSave.length > 0) {
                localStorage.setItem('mg_chat_history', JSON.stringify(toSave));
            }
        } catch {}
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // ==================== CART OPERATIONS ====================

    const addProductsToCart = useCallback((products) => {
        if (!products?.length) return;
        try {
            const cart = getCartItems();

            products.forEach(product => {
                const existing = cart.find(i => String(i.id) === String(product.id));
                const qty = product.quantity || 1;
                const price = parseFloat(product.price || 0);

                if (existing) {
                    existing.quantity = (parseInt(existing.quantity) || 1) + qty;
                    existing.total = (parseFloat(existing.price || existing.Initialprice || 0) * existing.quantity).toFixed(2);
                } else {
                    cart.push({
                        id: String(product.id),
                        name: product.name,
                        price: price,
                        Initialprice: parseFloat(product.old_price || price),
                        quantity: qty,
                        total: (price * qty).toFixed(2),
                        category: product.category || '',
                        isPromotion: product.has_promo || false,
                        image: product.image || '',
                    });
                }
            });

            Cookies.set('cart', JSON.stringify(cart), { expires: 7 });
            refreshCartCount();

            const names = products.map(p => p.name).join(', ');
            setCartNotification(`${products.length} article(s) ajouté(s) : ${names.substring(0, 50)}${names.length > 50 ? '...' : ''}`);
        } catch (err) {
            console.error('CartBot error:', err);
        }
    }, [getCartItems, refreshCartCount]);

    const addRecipeToCart = useCallback((products) => {
        addProductsToCart(products);
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'bot',
            content: `✅ J'ai ajouté ${products.length} ingrédient(s) à votre panier !\n\n[Voir le panier](/cart-shopping)`,
            action: null,
        }]);
    }, [addProductsToCart]);

    const handleAction = useCallback((action) => {
        if (!action) return;

        const type = (action.type || '').toLowerCase();

        if (type === 'add_to_cart' || type === ACTION_TYPES.ADD_TO_CART) {
            if (action.products?.length) addProductsToCart(action.products);
        } else if (type === 'remove_from_cart' || type === ACTION_TYPES.REMOVE_FROM_CART) {
            if (action.products?.length) removeProductsFromCart(action.products);
        } else if (type === 'clear_cart' || type === ACTION_TYPES.CLEAR_CART) {
            Cookies.remove('cart');
            refreshCartCount();
            setCartNotification('Panier vidé');
        } else if (type === 'navigate') {
            if (action.navigate_to) setTimeout(() => navigate(action.navigate_to), 300);
        } else if (type === 'create_complaint') {
            // Show the inline complaint form on the last bot message
            setMessages(prev => prev.map((m, idx) =>
                idx === prev.length - 1 && m.role === 'bot'
                    ? { ...m, showComplaintForm: true, isLoggedIn, action }
                    : m
            ));
        }
    }, [addProductsToCart, refreshCartCount, navigate, isLoggedIn]);

    // Remove products from cart
    const removeProductsFromCart = useCallback((products) => {
        try {
            let cart = getCartItems();
            products.forEach(p => {
                cart = cart.filter(i => String(i.id) !== String(p.id) && i.name?.toLowerCase() !== p.name?.toLowerCase());
            });
            Cookies.set('cart', JSON.stringify(cart), { expires: 7 });
            refreshCartCount();
            const names = products.map(p => p.name).join(', ');
            setCartNotification(`🗑️ Retiré : ${names}`);
        } catch (err) { console.error(err); }
    }, [getCartItems, refreshCartCount]);

    // Submit complaint from inline form
    const handleComplaintSubmit = useCallback(async ({ category, description, orderRef }) => {
        const authToken = isLoggedIn ? (token || localStorage.getItem('token')) : null;
        if (!authToken) return;

        try {
            const { submitComplaint } = await import('../../services/chatbotService');
            const result = await submitComplaint({ category, description, orderReference: orderRef, authToken });

            // Close form and show result
            setMessages(prev => [
                ...prev.map(m => ({ ...m, showComplaintForm: false })),
                {
                    id: Date.now(),
                    role: 'bot',
                    content: result.status === 'success'
                        ? `✅ **Réclamation soumise avec succès !**\n\nVotre réclamation a été enregistrée.\nConsultez vos réclamations : [/reclamations](/reclamations)`
                        : `❌ Erreur : ${result.message || 'Veuillez réessayer ou aller sur /reclamations/new'}`,
                    action: null,
                }
            ]);
        } catch (err) {
            console.error(err);
        }
    }, [isLoggedIn, token]);

    const handleComplaintClose = useCallback((msgId) => {
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, showComplaintForm: false } : m
        ));
    }, []);


    // ==================== SEND MESSAGE ====================

    const sendMessage = useCallback(async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || isStreaming) return;

        setInput('');

        // Add user message
        const userMsg = { id: Date.now(), role: 'user', content: trimmed, action: null };
        setMessages(prev => [...prev, userMsg]);

        // Add streaming bot message
        const botMsgId = Date.now() + 1;
        setMessages(prev => [...prev, {
            id: botMsgId,
            role: 'bot',
            content: '',
            action: null,
            streaming: true,
        }]);

        setIsStreaming(true);

        // Build history (exclude system messages)
        const history = messages
            .filter(m => m.role === 'user' || m.role === 'bot')
            .slice(-8)
            .map(m => ({
                role: m.role === 'bot' ? 'assistant' : 'user',
                content: m.content,
            }));

        const cart = getCartItems();
        let collectedAction = null;

        try {
            await streamChat({
                message: trimmed,
                history,
                cart,
                authToken: isLoggedIn ? (token || localStorage.getItem('token')) : null,

                onChunk: (chunk) => {
                    setMessages(prev => prev.map(m =>
                        m.id === botMsgId
                            ? { ...m, content: m.content + chunk, streaming: true }
                            : m
                    ));
                },

                onAction: (action) => {
                    collectedAction = action;
                    handleAction(action);
                },

                onDone: () => {
                    setMessages(prev => prev.map(m =>
                        m.id === botMsgId
                            ? { ...m, streaming: false, action: collectedAction }
                            : m
                    ));
                    setIsStreaming(false);
                },

                onError: (err) => {
                    setMessages(prev => prev.map(m =>
                        m.id === botMsgId
                            ? {
                                ...m,
                                content: `⚠️ Erreur: ${err}\n\nVérifiez que le chatbot backend est démarré.`,
                                streaming: false,
                            }
                            : m
                    ));
                    setIsStreaming(false);
                },
            });
        } catch (err) {
            setIsStreaming(false);
        }
    }, [input, isStreaming, messages, getCartItems, isLoggedIn, token, handleAction]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleStop = () => {
        setIsStreaming(false);
        setMessages(prev => prev.map(m =>
            m.streaming ? { ...m, streaming: false } : m
        ));
    };

    const clearChat = () => {
        const freshMsg = {
            id: Date.now(),
            role: 'bot',
            content: "Marhba! 👋 Conversation jdida. Kifech n3awnek? Comment puis-je vous aider?",
            action: null,
        };
        setMessages([freshMsg]);
        localStorage.setItem('mg_chat_history', JSON.stringify([freshMsg]));
    };

    // ==================== RENDER ====================

    return (
        <>
            {/* CHAT TOGGLE BUTTON */}
            <button
                className={`cb-toggle ${isOpen ? 'cb-toggle-open' : ''}`}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Assistant MG"
                id="chatbot-toggle-btn"
            >
                {isOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
                {!isOpen && cartCount > 0 && (
                    <span className="cb-cart-badge">{cartCount}</span>
                )}
                {!isOpen && (
                    <span className="cb-toggle-label">Assistant MG</span>
                )}
            </button>

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="cb-window" id="chatbot-window">
                    {/* Header */}
                    <div className="cb-header">
                        <div className="cb-header-info">
                            <div className="cb-header-avatar">🤖</div>
                            <div>
                                <div className="cb-header-name">Assistant MG</div>
                                <div className="cb-header-status">
                                    <span className="cb-status-dot"></span>
                                    {isStreaming ? 'En train d\'écrire...' : 'En ligne'}
                                </div>
                            </div>
                        </div>
                        <div className="cb-header-actions">
                            {cartCount > 0 && (
                                <button
                                    className="cb-header-btn cb-cart-btn"
                                    onClick={() => navigate('/cart-shopping')}
                                    title="Voir le panier"
                                >
                                    🛒 <span className="cb-cart-count">{cartCount}</span>
                                </button>
                            )}
                            <button
                                className="cb-header-btn"
                                onClick={clearChat}
                                title="Nouvelle conversation"
                            >
                                ↺
                            </button>
                            <button
                                className="cb-header-btn cb-close-btn"
                                onClick={() => setIsOpen(false)}
                                title="Fermer"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="cb-messages" id="chatbot-messages">
                        {messages.map(msg => (
                            <MessageBubble
                                key={msg.id}
                                msg={msg}
                                onAddToCart={(p) => {
                                    addProductsToCart([p]);
                                    setMessages(prev => [...prev, {
                                        id: Date.now(),
                                        role: 'bot',
                                        content: `✅ **${p.name}** (${p.price} TND) ajouté au panier !`,
                                        action: null,
                                    }]);
                                }}
                                onAddRecipeToCart={addRecipeToCart}
                                onNavigate={navigate}
                                onComplaintSubmit={handleComplaintSubmit}
                                onComplaintClose={handleComplaintClose}
                            />
                        ))}

                        {isStreaming && messages[messages.length - 1]?.content === '' && (
                            <TypingIndicator />
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick suggestions */}
                    {messages.length <= 1 && (
                        <div className="cb-suggestions">
                            {QUICK_SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    className="cb-suggestion-btn"
                                    onClick={() => sendMessage(s.text)}
                                    disabled={isStreaming}
                                    id={`chatbot-suggestion-${i}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input area */}
                    <div className="cb-input-area">
                        <div className="cb-input-wrapper">
                            <textarea
                                ref={inputRef}
                                id="chatbot-input"
                                className="cb-input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Écrire ici... اكتب هنا... (FR / عربي / Tounsi)"
                                dir="auto"
                                rows={1}
                                disabled={isStreaming}
                            />
                            {isStreaming ? (
                                <button
                                    className="cb-send-btn cb-stop-btn"
                                    onClick={handleStop}
                                    title="Arrêter"
                                    id="chatbot-stop-btn"
                                >
                                    ⬛
                                </button>
                            ) : (
                                <button
                                    className="cb-send-btn"
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim()}
                                    title="Envoyer"
                                    id="chatbot-send-btn"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cart notification toast */}
            <CartNotification
                notification={cartNotification}
                onClose={() => setCartNotification('')}
            />
        </>
    );
};

export default ChatBot;
