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
    }, [dispatch, auth.isLoggedIn]);

    useEffect(() => {
        if (!auth.isLoggedIn) {
            Cookies.remove("cart");
            localStorage.removeItem('use_cagnotte');
            setUseCagnotte(false);
        }
    }, [auth.isLoggedIn]);

    const calculateTotal = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.total), 0);
        let cagnotteDeduction = 0;
        if (useCagnotte && Userprofile?.cagnotte_balance) {
            const cagnotteBalance = parseFloat(Userprofile.cagnotte_balance);
            cagnotteDeduction = Math.min(cagnotteBalance, subtotal);
        }
        const totalTTC = Math.max(0, subtotal - cagnotteDeduction).toFixed(2);
        return { subtotal, totalTTC, cagnotteDeduction };
    }, [cartItems, useCagnotte, Userprofile?.cagnotte_balance]);

    const { subtotal, totalTTC, cagnotteDeduction } = calculateTotal;

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
        Cookies.remove("cart");
        localStorage.removeItem('use_cagnotte');
        navigate("/order-confirmation", { state: checkoutData });
    };

    const calculateCagnotteDeduction = () => {
        if (!Userprofile?.cagnotte_balance) return 0;
        return Math.min(parseFloat(Userprofile.cagnotte_balance), parseFloat(subtotal));
    };

    const confirmCagnotteUse = () => {
        const deduction = calculateCagnotteDeduction();
        if (deduction <= 0) {
            // 
            return;
        }
        localStorage.setItem('use_cagnotte', 'true');
        setUseCagnotte(true);
        setShowCagnotteModal(false);
        // } DT seront déduits de votre cagnotte.`);
    };

    const cancelCagnotteUse = () => {
        localStorage.removeItem('use_cagnotte');
        setUseCagnotte(false);
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
                <div className="row g-4">
                    <div className="col-lg-8">
                        <h1 className="h3 fw-bold mb-4">Mon Panier</h1>
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

                        <button onClick={() => navigate("/")} className="btn mt-4 text-muted fw-medium d-flex align-items-center gap-2">
                            <span>←</span> Continuer mes achats
                        </button>
                    </div>

                    <div className="col-lg-4">
                        <CartSummary
                            subtotal={subtotal}
                            totalTTC={totalTTC}
                            cagnotteDeduction={cagnotteDeduction}
                            useCagnotte={useCagnotte}
                            handleCheckout={handleCheckout}
                            handleShowCagnotte={() => setShowCagnotteModal(true)}
                            cancelCagnotteUse={cancelCagnotteUse}
                            canUseCagnotte={Userprofile?.cagnotte_balance > 0}
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


