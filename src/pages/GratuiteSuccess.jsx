import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCheckCircle,
  FaStore,
  FaTruck,
  FaMobileAlt,
  FaQrcode,
  FaHome,
  FaHistory,
  FaShare,
  FaCopy,
} from "react-icons/fa";

import { QRCodeSVG } from "qrcode.react";

const GratuiteSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { offer, pickupCode, mode, storeName } = location.state || {};

  if (!offer || !pickupCode) {
    navigate("/gratuite");
    return null;
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case "pickup":
        return <FaStore className="text-blue-500 text-3xl" />;
      case "delivery":
        return <FaTruck className="text-green-500 text-3xl" />;
      case "digital":
        return <FaMobileAlt className="text-purple-500 text-3xl" />;
      default:
        return <FaStore className="text-gray-500 text-3xl" />;
    }
  };

  const getModeInstructions = (mode) => {
    switch (mode) {
      case "pickup":
        return `Présentez ce code en caisse dans le magasin ${storeName || "sélectionné"
          } avant la date d'expiration pour récupérer votre produit gratuit.`;
      case "delivery":
        return "Conservez ce code. Il pourra vous être demandé lors de la livraison de votre commande.";
      case "digital":
        return "Utilisez ce code pour profiter de votre avantage digital. Gardez-le précieusement.";
      default:
        return "Conservez ce code pour récupérer votre produit gratuit.";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pickupCode);
    // 
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Code de réservation",
          text: `Mon code de réservation pour ${offer.title}: ${pickupCode}`,
        });
      } catch (error) {

      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-bounce">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4 shadow-lg">
            <FaCheckCircle className="text-white text-5xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
            Réservation réussie !
          </h1>
          <p className="text-gray-600 text-lg">
            Votre produit gratuit a été réservé avec succès
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          {/* Product Info */}
          <div className="relative h-48 bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <div className="absolute top-4 right-4">{getModeIcon(mode)}</div>
            <h2 className="text-2xl font-bold mb-2">{offer.title}</h2>
            {offer.partner_name && (
              <p className="text-white/90 flex items-center gap-2">
                <FaStore />
                {offer.partner_name}
              </p>
            )}
          </div>

          {/* QR Code Section */}
          <div className="p-8">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Code de réservation
              </p>
              <div className="inline-block p-4 bg-white border-4 border-gray-200 rounded-2xl shadow-lg mb-4">
                <QRCodeSVG
                  value={pickupCode}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-3xl font-bold text-gray-800 tracking-wider">
                  {pickupCode}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copier le code"
                >
                  <FaCopy className="text-gray-600" />
                </button>
              </div>
              <button
                onClick={shareCode}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto transition-colors"
              >
                <FaShare />
                Partager le code
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaQrcode className="text-blue-600" />
                Comment utiliser ce code ?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {getModeInstructions(mode)}
              </p>
            </div>

            {/* Store Info for Pickup */}
            {mode === "pickup" && storeName && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaStore className="text-green-600" />
                  Magasin de retrait
                </h3>
                <p className="text-gray-700 text-lg font-semibold">
                  {storeName}
                </p>
              </div>
            )}

            {/* Important Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-800 mb-3">
                Informations importantes
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    Conservez ce code précieusement jusqu'à la récupération de
                    votre produit
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    Vous pouvez consulter ce code à tout moment dans "Mes
                    Réservations"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    N'oubliez pas de vérifier la date d'expiration de votre
                    réservation
                  </span>
                </li>
                {mode === "pickup" && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Présentez ce code en caisse pour récupérer votre produit
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/gratuite")}
            className="px-6 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
          >
            <FaHome />
            Retour aux offres
          </button>
          <button
            onClick={() => navigate("/mes-reservations")}
            className="px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
          >
            <FaHistory />
            Mes Réservations
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
          >
            <FaHome />
            Accueil
          </button>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Merci pour votre réservation ! 🎉
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Profitez bien de votre produit gratuit
          </p>
        </div>
      </div>
    </div>
  );
};

export default GratuiteSuccess;


