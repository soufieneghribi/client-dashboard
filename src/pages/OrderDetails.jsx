import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaDownload
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../services/api";

/**
 * OrderDetails - Affichage direct du PDF de la commande
 */
const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
      return;
    }

    // Simuler un petit délai pour le chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  const handleDownload = () => {
    toast.success("Téléchargement du PDF...");
    const downloadUrl = API_ENDPOINTS.ORDERS.PDF(orderId);
    
    // Ouvrir dans un nouvel onglet pour téléchargement
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du PDF...</p>
        </div>
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-xl text-gray-800 mb-4 font-semibold">
            Impossible de charger le PDF
          </p>
          <p className="text-gray-600 mb-6">
            Le document de la commande #{orderId} n'a pas pu être chargé.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/Mes-Commandes")}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Retour
            </button>
            <button
              onClick={() => {
                setPdfError(false);
                setLoading(true);
                setTimeout(() => setLoading(false), 500);
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pdfUrl = API_ENDPOINTS.ORDERS.PDF(orderId);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-100">
      {/* En-tête fixe */}
      <div className="flex-shrink-0 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => navigate("/Mes-Commandes")}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Retour aux commandes"
              >
                <FaArrowLeft className="text-gray-700 text-lg" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                  Commande #{orderId}
                </h1>
                <p className="text-xs text-gray-500">Document PDF</p>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
              title="Télécharger le PDF"
            >
              <FaDownload className="text-sm" />
              <span className="hidden sm:inline">Télécharger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visionneuse PDF - prend tout l'espace restant */}
      <div className="flex-1 overflow-hidden bg-gray-800">
        <iframe
          src={pdfUrl}
          title={`Commande #${orderId}`}
          className="w-full h-full border-0"
          onError={() => {
            setPdfError(true);
            toast.error("Erreur de chargement du PDF");
          }}
        />
      </div>
    </div>
  );
};

export default OrderDetails;