import React from "react";
import "../styles/Home.css";  
import Categories from "../components/Categories";
import ProductRecommande from "../components/ProductRecommande";
import Banners from "../components/Banners";
import Popular from "../components/Popular";
import FeaturedRecipes from "../components/FeaturedRecipes";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <section className="grid w-full">
        {/* Bannière principale */}
        <Banners />

        {/* Catégories */}
        <Categories />

        {/* Deals & Catalogue */}
        <div className="grid grid-cols-2 gap-4 px-4 mt-6">
          {/* Deals */}
          <div
            className="relative border rounded-2xl shadow-lg h-40 bg-cover bg-center overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('../assets/mydealsImg.png')" }}
            onClick={() => navigate("/MesDeals")}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-lg font-bold text-white">Mes Deals</span>
            </div>
          </div>

          {/* Catalogue */}
          <div
            className="relative border rounded-2xl shadow-lg h-40 bg-cover bg-center overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('../assets/recommnededImg.png')" }}
            onClick={() => navigate("/Catalogue")}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-lg font-bold text-white">Catalogue</span>
            </div>
          </div>
        </div>

        {/* Nos recettes du jour - NOUVELLE SECTION */}
        <FeaturedRecipes />

        {/* Produits populaires */}
        <Popular />

        {/* Produits recommandés */}
        <ProductRecommande />
      </section>
    </div>
  );
};

export default Home;