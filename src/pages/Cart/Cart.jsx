import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";
import { fetchUserProfile } from "../../store/slices/user";

import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import CagnotteModal from "./components/CagnotteModal";
import "./Cart.css";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const { Userprofile } = useSelector((state) => state.user);
    const [showCagnotteModal, setShowCagnotteModal] = useState(false);
    const [useCagnotte, setUseCagnotte] = useState(false);
    const [cagnotteAmount, setCagnotteAmount] = useState(0);
    const navigate = useNavigate();
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
            try {
                const parsedUser = user !== "undefined" ? JSON.parse(user) : null;
                if (parsedUser && !auth.isLoggedIn) {
                    dispatch(loginSuccess({ token, user: parsedUser }));
                }
            } catch (error) {
                localStorage.removeItem("user");
            }
        }

        const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];
        setCartItems(cart);

        const savedUseCagnotte = localStorage.getItem('use_cagnotte') === 'true';
        setUseCagnotte(savedUseCagnotte);
        const savedCagnotteAmount = parseFloat(localStorage.getItem('cagnotte_amount') || 0);
        setCagnotteAmount(savedCagnotteAmount);
    }, [dispatch, auth.isLoggedIn]);

    useEffect(() => {
        if (!auth.isLoggedIn) {
            Cookies.remove("cart");
            localStorage.removeItem('use_cagnotte');
            setUseCagnotte(false);
        }
    }, [auth.isLoggedIn]);

    // Auto-disable cagnotte if subtotal falls below used amount
    useEffect(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.total), 0);
        if (useCagnotte && subtotal < cagnotteAmount) {
            const newAmount = Math.min(cagnotteAmount, subtotal);
            if (newAmount === 0) {
                localStorage.removeItem('use_cagnotte');
                localStorage.removeItem('cagnotte_amount');
                setUseCagnotte(false);
                setCagnotteAmount(0);
            } else {
                localStorage.setItem('cagnotte_amount', newAmount.toString());
                setCagnotteAmount(newAmount);
            }
        }
    }, [cartItems, useCagnotte, cagnotteAmount]);

    const calculateTotal = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.total), 0);
        let cagnotteDeduction = 0;
        const threshold = 300; // Only for credit simulation threshold display

        if (useCagnotte && Userprofile?.cagnotte_balance) {
            const cagnotteBalance = parseFloat(Userprofile.cagnotte_balance);
            // Use the manual amount if set, otherwise default to full balance (clipped to subtotal)
            const maxPossibleDeduction = Math.min(cagnotteBalance, subtotal);
            cagnotteDeduction = cagnotteAmount > 0 ? Math.min(cagnotteAmount, maxPossibleDeduction) : maxPossibleDeduction;
        }
        const totalTTC = Math.max(0, subtotal - cagnotteDeduction).toFixed(2);
        return { subtotal, totalTTC, cagnotteDeduction, threshold, subtotalMetThreshold: subtotal >= threshold };
    }, [cartItems, useCagnotte, Userprofile?.cagnotte_balance, cagnotteAmount]);

    const { subtotal, totalTTC, cagnotteDeduction, threshold, subtotalMetThreshold } = calculateTotal;

    const handleRemoveItem = (itemId) => {
        const updatedCart = cartItems.filter((item) => item.id !== itemId);
        Cookies.set("cart", JSON.stringify(updatedCart), { expires: 7 });
        setCartItems(updatedCart);
        // 
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            // 
            return;
        }
        if (!auth.isLoggedIn) {
            // 
            navigate("/login");
            return;
        }
        const checkoutData = {
            orderDetails: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price === 0 ? item.Initialprice : item.price),
                quantity: parseInt(item.quantity),
                total: parseFloat(item.total),
                isPromotion: item.isPromotion || false,
                promo_id: item.promo_id || null,
                Initialprice: item.Initialprice || item.price
            })),
            subtotal: parseFloat(subtotal),
            totalTTC: parseFloat(totalTTC),
            cagnotteDeduction: useCagnotte ? cagnotteDeduction : 0,
            useCagnotte: useCagnotte
        };
        // Don't clear cart here - it will be cleared after successful order placement
        navigate("/order-confirmation", { state: checkoutData });
    };

    const calculateCagnotteDeduction = () => {
        if (!Userprofile?.cagnotte_balance) return 0;
        return Math.min(parseFloat(Userprofile.cagnotte_balance), parseFloat(subtotal));
    };

    const confirmCagnotteUse = (appliedAmount) => {
        if (!appliedAmount || appliedAmount <= 0) return;

        localStorage.setItem('use_cagnotte', 'true');
        localStorage.setItem('cagnotte_amount', appliedAmount.toString());
        setUseCagnotte(true);
        setCagnotteAmount(appliedAmount);
        setShowCagnotteModal(false);
    };

    const cancelCagnotteUse = () => {
        localStorage.removeItem('use_cagnotte');
        localStorage.removeItem('cagnotte_amount');
        setUseCagnotte(false);
        setCagnotteAmount(0);
        // 
    };

    const handleQuantityUpdate = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        const updatedCart = cartItems.map((item) => {
            if (item.id === itemId) {
                const prices = item.price === 0 ? item.Initialprice : item.price;
                return { ...item, quantity: newQuantity, total: (prices * newQuantity).toFixed(2) };
            }
            return item;
        });
        Cookies.set("cart", JSON.stringify(updatedCart), { expires: 7 });
        setCartItems(updatedCart);
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-container d-flex align-items-center justify-content-center">
                <div className="text-center p-5 bg-white rounded-3 shadow-sm border" style={{ maxWidth: '400px' }}>
                    <div className="mb-4" style={{ fontSize: '4rem' }}>🛒</div>
                    <h2 className="h4 fw-bold mb-3">Votre panier est vide</h2>
                    <p className="text-muted mb-4 text-sm">Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.</p>
                    <button onClick={() => navigate("/")} className="btn btn-lg w-100 text-white fw-bold shadow-sm" style={{ backgroundColor: '#f97316', borderRadius: '12px' }}>
                        Découvrir nos produits
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="container">
                <div className="row g-3 g-md-4">
                    <div className="col-12 col-lg-8">
                        <h1 className="h3 h2-md fw-bold mb-3 mb-md-4">Mon Panier</h1>
                        <div className="cart-card overflow-hidden">
                            <div className="d-none d-md-flex justify-content-between p-3 fw-bold bg-light text-muted border-bottom" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                <div className="flex-grow-1">Produit</div>
                                <div className="d-flex" style={{ width: '60%' }}>
                                    <div className="text-center" style={{ width: '25%' }}>Prix</div>
                                    <div className="text-center" style={{ width: '35%' }}>Quantité</div>
                                    <div className="text-center" style={{ width: '25%' }}>Total</div>
                                    <div className="text-center" style={{ width: '15%' }}></div>
                                </div>
                            </div>

                            {cartItems.map((item, index) => (
                                <CartItem
                                    key={item.id || index}
                                    item={item}
                                    handleQuantityUpdate={handleQuantityUpdate}
                                    handleRemoveItem={handleRemoveItem}
                                />
                            ))}
                        </div>

                        <button onClick={() => navigate("/")} className="btn mt-3 mt-md-4 text-muted fw-medium d-flex align-items-center gap-2">
                            <span>←</span> Continuer mes achats
                        </button>
                    </div>

                    <div className="col-12 col-lg-4 mt-4 mt-lg-0">
                        <CartSummary
                            subtotal={subtotal}
                            totalTTC={totalTTC}
                            cagnotteDeduction={cagnotteDeduction}
                            useCagnotte={useCagnotte}
                            handleCheckout={handleCheckout}
                            handleShowCagnotte={() => setShowCagnotteModal(true)}
                            cancelCagnotteUse={cancelCagnotteUse}
                            canUseCagnotte={Userprofile?.cagnotte_balance > 0}
                            threshold={threshold}
                            subtotalMetThreshold={subtotalMetThreshold}
                            cagnotteBalance={parseFloat(Userprofile?.cagnotte_balance || 0)}
                        />
                    </div>
                </div>
            </div>

            <CagnotteModal
                isOpen={showCagnotteModal}
                onClose={() => setShowCagnotteModal(false)}
                onConfirm={confirmCagnotteUse}
                subtotal={subtotal}
                cagnotteBalance={parseFloat(Userprofile?.cagnotte_balance || 0)}
                calculatedDeduction={calculateCagnotteDeduction()}
            />
        </div>
    );
};

export default Cart;


