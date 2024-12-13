/* eslint-disable no-unused-vars */
import React from "react";
import '../styles/Home.css';  // Import Home styles
import Categories from "../components/Categories";
import ProductRecommande from "../components/ProductRecommande";




const Home = () => {
    
    return (
        <div className="home-container">
            <h1>Welcome to 360TN</h1>
            <section className="grid ">
                {/* Add more content here */}
               <Categories/>

               <ProductRecommande/>

               
               
             </section>
        </div>
    );
};

export default Home;
