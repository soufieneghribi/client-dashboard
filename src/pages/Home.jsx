import React from "react";
import "../styles/Home.css";  
import Categories from "../components/Categories";
import ProductRecommande from "../components/ProductRecommande";
import Banners from "../components/Banners";
import Popular from "../components/Popular";
import FeaturedRecipes from "../components/FeaturedRecipes";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from 'react-bootstrap';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Container fluid>
        {/* Bannière principale */}
        <Banners />

        {/* Catégories */}
        <Categories />

        {/* Deals & Catalogue */}
        <Row className="mt-4 px-2">
          <Col xs={6}>
            <div
              className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
              style={{ backgroundImage: "url('../assets/mydealsImg.png')", height: '160px' }}
              onClick={() => navigate("/MesDeals")}
            >
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-20 d-flex align-items-center justify-content-center">
                <span className="fs-5 fw-bold text-white">Mes Deals</span>
              </div>
            </div>
          </Col>
          <Col xs={6}>
            <div
              className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
              style={{ backgroundImage: "url('../assets/recommnededImg.png')", height: '160px' }}
              onClick={() => navigate("/Catalogue")}
            >
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-20 d-flex align-items-center justify-content-center">
                <span className="fs-5 fw-bold text-white">Catalogue</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Nos recettes du jour */}
        <FeaturedRecipes />

        {/* Produits populaires */}
        <Popular />

        {/* Produits recommandés */}
        <ProductRecommande />
      </Container>
    </div>
  );
};

export default Home;