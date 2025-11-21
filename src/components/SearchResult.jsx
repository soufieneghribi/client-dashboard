import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  SearchProduct, 
  clearSearch,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError
} from "../store/slices/search";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Container, Row, Col, Card, Button, Breadcrumb, Badge, Pagination, Spinner, Alert } from 'react-bootstrap';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);
  const searchError = useSelector(selectSearchError);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const IMAGE_BASE_URL = "https://tn360-lqd25ixbvq-ew.a.run.app/uploads";

  // Styles CSS intégrés
  const styles = `
    .product-card {
      transition: all 0.2s ease-in-out;
      border: 1px solid #dee2e6;
      user-select: none;
      -webkit-user-select: none;
    }
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
    }
    .card-img-placeholder {
      height: 150px;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
      font-size: 0.8rem;
    }
    .pagination .page-link {
      cursor: pointer;
    }
    .product-title {
      cursor: default;
    }
  `;

  // Injecter le CSS dans le head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Debug
  useEffect(() => {
  
  }, [query, searchResults, searchLoading]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${IMAGE_BASE_URL}/${imageUrl}`;
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    // Créer un placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'card-img-placeholder';
    placeholder.textContent = '🖼️ Image non disponible';
    e.target.parentNode.appendChild(placeholder);
  };

  useEffect(() => {
    if (query) {
      dispatch(SearchProduct(query));
    }

    // ❌ NE PAS nettoyer les résultats quand le composant se démonte
    // Cela causait la disparition des cartes lors des clics
    // return () => {
    //   dispatch(clearSearch());
    // };
  }, [query, dispatch]);

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const currentProducts = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetails = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`, {
      state: { subId: product.type_id }
    });
  };

  const addToCartHandler = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const quantity = 1;
    const price = parseFloat(product.price) || 0;

    const discounted = [2, 3].includes(Number(product.type_id));
    const finalPrice = discounted ? (price * 0.9).toFixed(2) : price.toFixed(2);
    const total = (finalPrice * quantity).toFixed(2);

    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

    const newItem = {
      id: product.id,
      name: product.name,
      img: product.img,
      Initialprice: price.toFixed(2),
      price: finalPrice,
      total,
      quantity,
    };

    const existingItemIndex = cart.findIndex((el) => el.id === newItem.id);

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += newItem.quantity;
      cart[existingItemIndex].total = (
        parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)
      ).toFixed(2);
    } else {
      cart.push(newItem);
    }

    Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
    toast.success("Produit ajouté au panier !");
  };

  if (!query) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <p className="text-muted">Aucune recherche effectuée</p>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </Container>
    );
  }

  if (searchLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Recherche en cours...</p>
        </div>
      </Container>
    );
  }

  if (searchError) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
       
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Accueil
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Recherche: "{query}"
        </Breadcrumb.Item>
      </Breadcrumb>




<div style={{ 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
  gap: "16px", 
  marginBottom: "20px" 
}}>
  {currentProducts.map((product) => {
    const price = parseFloat(product.price) || 0;
    const imageUrl = getImageUrl(product.img);
    const type_id = Number(product.type_id);

    return (
      <div key={product.id} style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        position: "relative"
      }}>
        <div style={{ position: "relative", textAlign: "center" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              style={{ height: "150px", objectFit: "contain", width: "100%" }}
              onError={handleImageError}
            />
          ) : (
            <div style={{
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9f9f9",
              color: "#888",
              fontSize: "14px"
            }}>
              🖼️ Image non disponible
            </div>
          )}
          <button
            onClick={(e) => addToCartHandler(product, e)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "green",
              color: "white",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            🛒
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: "8px" }}>
          <div
            title={product.name}
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "8px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {product.name}
          </div>

          {type_id === 2 || type_id === 3 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "8px"
            }}>
              <div style={{
                textDecoration: "line-through",
                color: "#999",
                fontSize: "12px"
              }}>
                {price.toFixed(3)} DT
              </div>
              <div style={{
                backgroundColor: "green",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "12px",
                margin: "2px 0"
              }}>
                -10%
              </div>
              <div style={{
                color: "#d4a017",
                fontWeight: "bold",
                fontSize: "14px"
              }}>
                {(price * 0.9).toFixed(3)} DT
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              color: "#d4a017",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px"
            }}>
              {price.toFixed(3)} DT
            </div>
          )}

          <button
            onClick={(e) => handleDetails(product, e)}
            style={{
              marginTop: "auto",
              width: "100%",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "6px 0",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Voir détails
          </button>
        </div>
      </div>
    );
  })}
</div>





     
      {/* Résultats - Afficher uniquement s'il y a des résultats */}
      {searchResults.length > 0 && (
        <>
          {/* Grille de produits */}
         
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.Prev
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages).keys()].map((page) => (
                <Pagination.Item
                  key={page}
                  active={currentPage === page + 1}
                  onClick={() => handlePageClick(page + 1)}
                >
                  {page + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchResultsPage;