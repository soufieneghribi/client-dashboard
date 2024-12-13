import React, { useState } from "react";

const products = [
  { id: 1, name: "Produit A", price: 29.99 },
  { id: 2, name: "Produit B", price: 49.99 },
  { id: 3, name: "Produit C", price: 19.99 },
];

const  CartShopping= () => {
  const [cart, setCart] = useState([]);

  // Ajouter un produit au panier
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Supprimer un produit du panier
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== productId)
    );
  };

  // Modifier la quantité d'un produit
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Calculer le total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sopping Cart</h1>
      
      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-700">Prix: ${product.price}</p>
            <button
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => addToCart(product)}
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>

      {/* Panier */}
      <h2 className="text-xl font-bold mb-4">Votre Panier</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">Votre panier est vide.</p>
      ) : (
        <div className="border rounded-lg p-4 shadow-md">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-700">Prix: ${item.price}</p>
                <div className="flex items-center mt-2">
                  <button
                    className="px-2 py-1 bg-gray-300 rounded"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    className="px-2 py-1 bg-gray-300 rounded"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="text-red-500 hover:underline"
                onClick={() => removeFromCart(item.id)}
              >
                Supprimer
              </button>
            </div>
          ))}
          <div className="mt-4 text-right font-bold">
            Total: ${calculateTotal()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartShopping;
