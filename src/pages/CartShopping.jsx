import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/slices/authSlice";

const CartShopping = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Load cart from cookies and manage user login
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
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];
    setCartItems(cart);
  }, [dispatch, auth.isLoggedIn]);

  // Watch for logout and reset cart
  useEffect(() => {
    if (!auth.isLoggedIn) {
      setCartItems([]);
      Cookies.remove("cart");
    }
  }, [auth.isLoggedIn]);

  // Calculate cart totals
  const calculateTotal = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.total), 0);
    const QTotal = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const delivery = QTotal >= 5 ? 0 : 5; // Free delivery for 5+ items
    const totalTTC = (subtotal + delivery).toFixed(2);
    return { subtotal, delivery, totalTTC };
  }, [cartItems]);

  const { subtotal, delivery, totalTTC } = calculateTotal;

  // Handle remove item from cart
  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    Cookies.set("cart", JSON.stringify(updatedCart), { expires: 7 });
    setCartItems(updatedCart);
    toast.error("Produit supprimé du panier.");
  };
  const orderDetails = cartItems.map((el) => ({
    id: el.id,
    quantity: el.quantity,
  }));
  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    toast.success("Commande validée ! Merci pour votre achat.");
    Cookies.remove("cart");
    navigate("/order-confirmation", { state: { orderDetails, subtotal, totalTTC } });
  };

  // Handle quantity update
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1
    
    const updatedCart = cartItems.map((item) => {
      if (item.id === itemId) {
        const price = item.price === 0 ? item.Initialprice : item.price;
        return { ...item, quantity: newQuantity, total: (price * newQuantity).toFixed(2) };
      }
      return item;
    });
    Cookies.set("cart", JSON.stringify(updatedCart), { expires: 7 });
    setCartItems(updatedCart);
  };

  return (
    <div className="cart-container p-4 sm:p-8">
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p>Votre panier est vide.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Continuer vos achats
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Cart Items */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-4">Panier</h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="flex justify-between p-4 font-bold bg-gray-100">
                <p className="flex-1">Produit</p>
                <div className="flex w-1/2 justify-between">
                  <p className="w-1/3 text-center">Prix</p>
                  <p className="w-1/3 text-center">Quantité</p>
                  <p className="w-1/3 text-center">Total</p>
                </div>
              </div>
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 px-4 border-b"
                >
                  <p
                    className="flex-1 cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/product/${item.id}`, { state: { subId: item.subId } })
                    }
                  >
                    {item.name}
                  </p>
                  <div className="flex w-1/2 justify-between items-center">
                    <p className="w-1/3 text-center">{item.price} DT</p>
                    <div className="w-1/3 flex items-center justify-center">
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-1/3 flex justify-between items-center">
                      <p>{item.total} DT</p>
                      <button
                        className="text-red-500 font-bold hover:underline ml-4"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        X
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Totals */}
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <div className="p-4 border rounded shadow-lg">
              <h2 className="text-xl font-bold text-blue-360 mb-4">Panier Total </h2>
              <div className="flex justify-between py-2">
                <p>Montant global :</p>
                <p>{subtotal.toFixed(2)} DT</p>
              </div>
              <div className="flex justify-between py-2">
                <p>Livraison :</p>
                <p>{delivery.toFixed(2)} DT</p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between py-2 font-bold text-lg">
                <p>Total TTC :</p>
                <p>{totalTTC} DT</p>
              </div>
              <button
                onClick={handleCheckout}
                className="mt-6 w-full px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Commander
              </button>
              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Continuer vos achats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartShopping;
