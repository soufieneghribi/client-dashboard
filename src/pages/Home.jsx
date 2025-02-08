import React from "react";
import '../styles/Home.css';  // Import Home styles
import Categories from "../components/Categories";
import ProductRecommande from "../components/ProductRecommande";

import Banners from "../components/Banners";
import Popular from "../components/Popular";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="home-container">
            
            <section className="grid w-full">
                {/* Categories and Banners */}
                <Categories />
                <Banners />
                {/* Section for featured images */}
                <div className="flex flex-row justify-between">
                    {/* Deals Section */}
                    <div
                        className="border rounded-2xl shadow-xl m-4 w-1/2 h-72 bg-[url('../assets/mydealsImg.png')] bg-blue-360 bg-contain bg-no-repeat bg-center hover:scale-105 transition-transform duration-300 hover:brightness-150"
                        onClick={() => navigate('/MesDeals')}
                        aria-label="Go to My Deals"
                    >
                    </div>
                    {/* Recommended Section */}
                    <div
                        className="border rounded-2xl shadow-xl m-4 w-1/2 h-72 bg-[url('../assets/recommnededImg.png')] bg-orange-360 bg-contain bg-no-repeat bg-center hover:scale-105 transition-transform duration-300 hover:brightness-150"
                        onClick={() => navigate('/Catalogue')}
                        aria-label="Go to Catalogue"
                    >
                    </div>
                </div>

                {/* Popular and Recommended Products */}
                <Popular />
                <ProductRecommande />
            </section>

        </div>
    );
};

export default Home;