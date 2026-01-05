// TodaysOffers.jsx – Version Optimisée & Compacte

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { API_ENDPOINTS, getAuthHeaders } from "../services/api";
import { FaArrowRight, FaShoppingCart, FaFire } from "react-icons/fa";

const TodaysOffers = () => {
  const navigate = useNavigate();
  const [todaysOffers, setTodaysOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const userProfile = useSelector((state) => state.auth?.user);
  const clientId =
    userProfile?.ID_client ||
    userProfile?.id ||
    localStorage.getItem("client_id");

  useEffect(() => {
    const fetchTodaysOffers = async () => {
      if (!clientId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          API_ENDPOINTS.PROMOTIONS.BY_CLIENT(clientId),
          {
            method: "GET",
            headers: getAuthHeaders(token),
          }
        );

        const result = await response.json();

        if (result.success && result.data) {
          const products = [];
          result.data.forEach((promo) => {
            if (promo.articles)
              promo.articles.forEach((a) =>
                products.push({ ...a, discount_value: promo.discount_value })
              );
          });

          setTodaysOffers(products.slice(0, 4));
        }
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    fetchTodaysOffers();
  }, [clientId]);

  if (!clientId || todaysOffers.length === 0) return null;

  return (
    <div className="today-offers-wrapper">
      {/* HEADER COMPACT AVEC BADGE */}
      <div className="offers-header">
        <div className="header-left">
          <div className="fire-icon">
            <FaFire />
          </div>
          <div>
            <h2>🔥 Offres du Jour</h2>
            <p>Profitez de nos promotions exclusives !</p>
          </div>
        </div>

        <button className="see-all-btn" onClick={() => navigate("/promotions")}>
          Tout voir <FaArrowRight />
        </button>
      </div>

      {/* GRILLE PRODUITS COMPACTE */}
      <div className="offers-grid">
        {todaysOffers.map((article) => {
          const original = parseFloat(article.pivot.original_price);
          const promo = parseFloat(article.pivot.promo_price);
          const discount = Math.round(((original - promo) / original) * 100);

          return (
            <div
              key={article.id}
              className="offer-card"
              onClick={() => navigate(`/product/${article.id}`)}
            >
              <div className="badge">-{discount}%</div>

              <div className="img-box">
                <img src={article.img} alt={article.name} />
              </div>

              <div className="card-content">
                <h4>{article.name}</h4>

                <div className="price-row">
                  <span className="new-price">{promo.toFixed(2)} DT</span>
                  <span className="old-price">{original.toFixed(2)} DT</span>
                </div>

                <button className="add-cart-btn">
                  <FaShoppingCart /> Voir détails
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .today-offers-wrapper {
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          padding: 20px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          margin: 20px 0;
        }

        .offers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fire-icon {
          background: linear-gradient(135deg, #ff6b6b, #ff3b30);
          width: 45px;
          height: 45px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .offers-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .offers-header p {
          margin: 0;
          color: #666;
          font-size: 0.88rem;
        }

        .see-all-btn {
          background: #0A84FF;
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 50px;
          padding: 9px 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: 0.25s;
          font-size: 0.9rem;
        }

        .see-all-btn:hover {
          background: #0066cc;
          transform: translateX(3px);
        }

        .offers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .offer-card {
          background: white;
          border-radius: 16px;
          padding: 12px;
          border: 1px solid #e8e8e8;
          cursor: pointer;
          transition: 0.3s ease;
          position: relative;
        }

        .offer-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #ff6b6b, #ff3b30);
          padding: 5px 10px;
          color: white;
          font-size: 0.8rem;
          border-radius: 10px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(255,59,48,0.3);
        }

        .img-box {
          width: 100%;
          height: 130px;
          background: #f7f7f7;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .img-box img {
          width: auto;
          max-height: 120px;
          object-fit: contain;
        }

        .card-content h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #222;
          margin: 0 0 8px 0;
          height: 38px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .new-price {
          color: #ff3b30;
          font-size: 1.15rem;
          font-weight: 700;
        }

        .old-price {
          text-decoration: line-through;
          color: #999;
          font-size: 0.85rem;
        }

        .add-cart-btn {
          width: 100%;
          background: #0A84FF;
          border: none;
          padding: 7px 0;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: 0.25s;
          font-size: 0.88rem;
        }

        .add-cart-btn:hover {
          background: #0066cc;
        }

        @media (max-width: 768px) {
          .today-offers-wrapper {
            padding: 16px;
          }

          .offers-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .offers-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TodaysOffers;
