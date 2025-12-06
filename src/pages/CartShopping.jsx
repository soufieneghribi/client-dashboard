import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/slices/authSlice";
import Modal from "react-modal";
import { fetchUserProfile } from "../store/slices/user";

const CartShopping = () => {
  const [cartItems, setCartItems] = useState([]);
  const { Userprofile } = useSelector((state) => state.user);
  const [show, setShow] = useState(false);
  const [useCagnotte, setUseCagnotte] = useState(false);
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const Annuler = () => {
    setShow(false);
  };

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

  // ✅ MODIFIÉ: Suppression des frais de livraison du calcul du panier
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
    toast.error("Produit supprimé du panier.");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    if (!auth.isLoggedIn) {
      toast.error("Vous devez être connecté pour effectuer une commande.");
      navigate("/login");
      return;
    }

    // ✅ MODIFIÉ: Ne pas inclure deliveryFee ici, il sera calculé dans OrderConfirmation
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
      totalTTC: parseFloat(totalTTC), // Total sans frais de livraison
      cagnotteDeduction: useCagnotte ? cagnotteDeduction : 0,
      useCagnotte: useCagnotte
    };
    
    toast.success("Passage à la confirmation de commande");
    Cookies.remove("cart");
    localStorage.removeItem('use_cagnotte');
    navigate("/order-confirmation", { state: checkoutData });
  };

  const calculateCagnotteDeduction = () => {
    if (!Userprofile?.cagnotte_balance) return 0;
    
    const cagnotteBalance = parseFloat(Userprofile.cagnotte_balance);
    const cartSubtotal = parseFloat(subtotal);
    
    return Math.min(cagnotteBalance, cartSubtotal);
  };

  const cagnotteConfirmation = () => {
    const deduction = calculateCagnotteDeduction();
    
    if (deduction <= 0) {
      toast.error("Solde de cagnotte insuffisant");
      return;
    }

    localStorage.setItem('use_cagnotte', 'true');
    setUseCagnotte(true);
    
    const remaining = Math.max(0, subtotal - deduction);
    
    if (remaining === 0) {
      toast.success("Votre cagnotte couvrira entièrement votre commande !");
    } else {
      toast.success(`${deduction.toFixed(2)} DT seront déduits de votre cagnotte. Montant restant: ${remaining.toFixed(2)} DT`);
    }
    
    setShow(false);
  };

  const cancelCagnotteUse = () => {
    localStorage.removeItem('use_cagnotte');
    setUseCagnotte(false);
    toast.info("Cagnotte désactivée pour cette commande");
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

  return (
    <div className="container py-4 py-md-5">
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Votre panier est vide.</p>
          <button
            onClick={() => navigate("/")}
            className="btn px-4 py-2 text-white"
            style={{ backgroundColor: '#f97316' }}
          >
            Continuer vos achats
          </button>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <h2 className="h4 fw-bold mb-4">Panier</h2>
            <div className="border rounded overflow-hidden">
              <div className="d-none d-md-flex justify-content-between p-3 fw-bold bg-light">
                <div className="flex-grow-1">Produit</div>
                <div className="d-flex" style={{ width: '50%' }}>
                  <div className="text-center" style={{ width: '25%' }}>Prix</div>
                  <div className="text-center" style={{ width: '25%' }}>Quantité</div>
                  <div className="text-center" style={{ width: '25%' }}>Total</div>
                  <div className="text-center" style={{ width: '25%' }}></div>
                </div>
              </div>

              {cartItems.map((item, index) => (
                <div key={index} className="border-bottom p-3">
                  <div className="d-md-none">
                    <p
                      className="fw-bold mb-3 text-decoration-none text-primary cursor-pointer"
                      onClick={() =>
                        navigate(`/product/${item.id}`, { state: { subId: item.subId } })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {item.name}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Prix:</span>
                      <span className="fw-semibold">
                        {item.price === 0 ? item.Initialprice : item.price} DT
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Quantité:</span>
                      <div className="btn-group" role="group">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          -
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" disabled>
                          {item.quantity}
                        </button>
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Total:</span>
                      <span className="fw-bold">{item.total} DT</span>
                    </div>
                    <button
                      className="btn btn-sm btn-danger w-100"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="d-none d-md-flex justify-content-between align-items-center">
                    <p
                      className="flex-grow-1 mb-0 text-decoration-none text-primary"
                      onClick={() =>
                        navigate(`/product/${item.id}`, { state: { subId: item.subId } })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {item.name}
                    </p>
                    <div className="d-flex align-items-center" style={{ width: '50%' }}>
                      <div className="text-center" style={{ width: '25%' }}>
                        {item.price === 0 ? item.Initialprice : item.price} DT
                      </div>
                      <div className="text-center" style={{ width: '25%' }}>
                        <div className="btn-group" role="group">
                          <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            className="btn btn-sm btn-secondary"
                          >
                            -
                          </button>
                          <button className="btn btn-sm btn-secondary" disabled>
                            {item.quantity}
                          </button>
                          <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            className="btn btn-sm btn-secondary"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-center" style={{ width: '25%' }}>
                        {item.total} DT
                      </div>
                      <div className="text-center" style={{ width: '25%' }}>
                        <button
                          className="btn btn-sm btn-link text-danger fw-bold text-decoration-none"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-4" style={{ color: '#3b82f6' }}>Panier Total</h2>
                <div className="d-flex justify-content-between py-2">
                  <span>Sous-total :</span>
                  <span>{subtotal.toFixed(2)} DT</span>
                </div>
                
                {/* ✅ Note sur les frais de livraison */}
                <div className="alert alert-info py-2 px-3 mt-2 mb-2">
                  <small>ℹ️ Les frais de livraison seront calculés à l'étape suivante</small>
                </div>
                
                {useCagnotte && cagnotteDeduction > 0 && (
                  <>
                    <hr />
                    <div className="d-flex justify-content-between py-2 align-items-center">
                      <span className="text-success fw-bold">💰 Réduction cagnotte :</span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-success fw-bold">-{cagnotteDeduction.toFixed(2)} DT</span>
                        <button
                          onClick={cancelCagnotteUse}
                          className="btn btn-sm btn-outline-danger"
                          title="Ne pas utiliser la cagnotte"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                <hr />
                <div className="d-flex justify-content-between py-2 fw-bold fs-5">
                  <span>Total :</span>
                  <span>{totalTTC} DT</span>
                </div>
                
                {useCagnotte && cagnotteDeduction > 0 && (
                  <div className="alert alert-success mt-2 py-2 px-3 mb-0">
                    <small>🎉 Vous économiserez {cagnotteDeduction.toFixed(2)} DT grâce à votre cagnotte !</small>
                  </div>
                )}
                
                <div className="row g-2 mt-3">
                  <div className="col-6">
                    <button
                      onClick={handleCheckout}
                      className="btn w-100 fw-medium text-white"
                      style={{ backgroundColor: '#f97316' }}
                    >
                      Commander
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={handleShow}
                      className="btn w-100 fw-medium text-white"
                      style={{ backgroundColor: useCagnotte ? '#28a745' : '#f97316' }}
                      disabled={!Userprofile?.cagnotte_balance || Userprofile.cagnotte_balance <= 0 || useCagnotte}
                    >
                      {useCagnotte ? '✓ Activée' : 'Utiliser Cagnotte'}
                    </button>
                  </div>
                </div>

                <Modal
                  isOpen={show}
                  onRequestClose={handleClose}
                  contentLabel="Confirmation de cagnotte"
                  className="modal-content p-4 mx-auto bg-white rounded shadow-lg"
                  overlayClassName="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                  style={{
                    content: {
                      maxWidth: '500px',
                      margin: '0 1rem'
                    },
                    overlay: {
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      zIndex: 1050
                    }
                  }}
                >
                  <h2 className="h4 fw-bold mb-4">Utiliser Ma Cagnotte</h2>
                  <div className="alert alert-info">
                    <small>💡 L&apos;utilisation de la cagnotte est optionnelle. La déduction sera effectuée uniquement lors de la confirmation finale de votre commande.</small>
                  </div>
                  <div className="mt-4 fw-medium">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total du panier :</span>  
                      <span>{subtotal.toFixed(2)} DT</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Cagnotte disponible :</span>  
                      <span className="text-success">{Userprofile?.cagnotte_balance || 0} DT</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold">Montant à déduire :</span>  
                      <span className="fw-bold text-primary">
                        {calculateCagnotteDeduction().toFixed(2)} DT
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Montant restant :</span>  
                      <span>
                        {Math.max(0, subtotal - calculateCagnotteDeduction()).toFixed(2)} DT
                      </span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between gap-2 mt-4">
                    <button
                      onClick={Annuler}
                      className="btn flex-fill rounded-pill text-white"
                      style={{ backgroundColor: '#6c757d' }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={cagnotteConfirmation}
                      className="btn flex-fill rounded-pill text-white"
                      style={{ backgroundColor: '#28a745' }}
                    >
                      Confirmer
                    </button>
                  </div>
                </Modal>

                <button
                  onClick={() => navigate("/")}
                  className="btn w-100 mt-3 fw-medium"
                  style={{ backgroundColor: '#e5e7eb', color: '#1f2937' }}
                >
                  Continuer vos achats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartShopping;