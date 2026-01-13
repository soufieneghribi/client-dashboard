import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { fetchWishlist, removeFromWishlist } from "../../store/slices/wishlist";
import FavoriteCard from "./components/FavoriteCard";
import "./Favorites.css";

const Favorites = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, loading } = useSelector((state) => state.wishlist);

    useEffect(() => {
        dispatch(fetchWishlist());
    }, [dispatch]);

    const handleRemove = (productId) => {
        dispatch(removeFromWishlist(productId));
        // 
    };

    const handleProductClick = (product) => {
        navigate(`/product/${product.id}`, { state: { subId: product.type_id } });
    };

    const addToCartHandler = (product) => {
        try {
            const quantity = 1;
            const price = parseFloat(product.price) || 0;
            const finalPrice = product.discount_price ? parseFloat(product.discount_price) : price;
            const total = (finalPrice * quantity).toFixed(3);

            const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

            const newItem = {
                id: product.id,
                name: product.name,
                img: product.img,
                Initialprice: price.toFixed(3),
                price: finalPrice.toFixed(3),
                total,
                quantity,
                isPromotion: !!product.discount_price
            };

            const existingItemIndex = cart.findIndex((el) => el.id === newItem.id);

            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += newItem.quantity;
                cart[existingItemIndex].total = (
                    parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)
                ).toFixed(3);
            } else {
                cart.push(newItem);
            }

            Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
            toast.success(`${product.name} ajouté au panier !`);

            // Optional: trigger a custom event or store update if header needs immediate refresh
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            toast.error("Erreur lors de l'ajout au panier");
        }
    };

    const calculateDiscount = (price, discountPrice) => {
        if (!discountPrice || discountPrice >= price) return 0;
        return Math.round(((price - discountPrice) / price) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-container">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between mb-5">
                    <div>
                        <h1 className="display-6 fw-bold text-dark mb-1">Mes Favoris</h1>
                        <p className="text-muted mb-0">
                            {items?.length || 0} produit(s) dans votre liste de souhaits
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="btn btn-outline-primary fw-bold"
                        style={{ borderRadius: '10px' }}
                    >
                        Continuer mes achats
                    </button>
                </div>

                {!items || items.length === 0 ? (
                    <div className="empty-favorites-card shadow-sm border">
                        <div className="mb-4 d-inline-block p-4 bg-primary bg-opacity-10 rounded-circle">
                            <FiHeart className="w-12 h-12 text-primary" style={{ fontSize: '3rem' }} />
                        </div>
                        <h2 className="h3 fw-bold text-dark mb-3">Votre liste est vide</h2>
                        <p className="text-muted mb-5 max-w-md mx-auto">
                            Vous n'avez pas encore ajouté de produits à vos favoris. Explorez notre catalogue pour trouver vos coups de cœur !
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="btn btn-lg btn-primary px-5 py-3 fw-bold shadow-lg"
                            style={{ borderRadius: '15px' }}
                        >
                            Découvrir les produits
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {items.map((product) => (
                            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                                <FavoriteCard
                                    product={product}
                                    handleRemove={handleRemove}
                                    handleProductClick={handleProductClick}
                                    addToCartHandler={addToCartHandler}
                                    calculateDiscount={calculateDiscount}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;


