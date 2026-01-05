import React from "react";
import { useNavigate } from "react-router-dom";

const CartItem = ({ item, handleQuantityUpdate, handleRemoveItem }) => {
    const navigate = useNavigate();
    const price = item.price === 0 ? item.Initialprice : item.price;

    return (
        <div className="cart-item-row">
            {/* Mobile Layout */}
            <div className="d-md-none">
                <p
                    className="fw-bold mb-3 text-primary"
                    onClick={() => navigate(`/product/${item.id}`, { state: { subId: item.subId } })}
                    style={{ cursor: 'pointer' }}
                >
                    {item.name}
                </p>
                <div className="d-flex justify-content-between align-items-center mb-2 text-sm">
                    <span className="text-muted">Prix:</span>
                    <span className="fw-semibold">{parseFloat(price).toFixed(3)} DT</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Quantité:</span>
                    <div className="d-flex align-items-center gap-2">
                        <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            className="cart-quantity-btn"
                        >-</button>
                        <span className="fw-bold px-2">{item.quantity}</span>
                        <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            className="cart-quantity-btn"
                        >+</button>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Total:</span>
                    <span className="fw-bold text-primary">{parseFloat(item.total).toFixed(3)} DT</span>
                </div>
                <button
                    className="btn btn-sm btn-outline-danger w-100 mt-2"
                    onClick={() => handleRemoveItem(item.id)}
                >
                    Supprimer
                </button>
            </div>

            {/* Desktop Layout */}
            <div className="d-none d-md-flex justify-content-between align-items-center">
                <div className="flex-grow-1">
                    <p
                        className="mb-0 text-primary fw-medium"
                        onClick={() => navigate(`/product/${item.id}`, { state: { subId: item.subId } })}
                        style={{ cursor: 'pointer' }}
                    >
                        {item.name}
                    </p>
                </div>
                <div className="d-flex align-items-center" style={{ width: '60%' }}>
                    <div className="text-center" style={{ width: '25%' }}>
                        {parseFloat(price).toFixed(3)} DT
                    </div>
                    <div className="text-center d-flex justify-content-center" style={{ width: '35%' }}>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                className="cart-quantity-btn"
                            >-</button>
                            <span className="fw-bold px-1" style={{ minWidth: '20px' }}>{item.quantity}</span>
                            <button
                                onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                className="cart-quantity-btn"
                            >+</button>
                        </div>
                    </div>
                    <div className="text-center fw-bold text-primary" style={{ width: '25%' }}>
                        {parseFloat(item.total).toFixed(3)} DT
                    </div>
                    <div className="text-center" style={{ width: '15%' }}>
                        <button
                            className="cart-remove-btn"
                            onClick={() => handleRemoveItem(item.id)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
