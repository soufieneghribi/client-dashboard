import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendedProduct } from '../store/slices/recommended';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';

const ProductRecommande = () => {
  const { recommended = [], loading, error } = useSelector((state) => state.recommended);
  const products = recommended.products || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const IMAGE_BASE_URL = "https://tn360-lqd25ixbvq-ew.a.run.app/uploads";

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${IMAGE_BASE_URL}/${imageUrl}`;
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  useEffect(() => {
    dispatch(fetchRecommendedProduct());
  }, [dispatch]);

  const productHandler = (id, type_id) => {
    navigate(`/product/${id}`, {
      state: { subId: type_id },
    });
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return (
    <Container className="py-5">
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    </Container>
  );
  
  if (error) return (
    <Container className="py-4">
      <Alert variant="danger" className="text-center">
        Erreur de chargement des produits recommandés
      </Alert>
    </Container>
  );

  return (
    <Container fluid="lg" className="py-4">
      {/* Header Section */}
      <div className="text-center mb-4 mb-md-5">
        <h2 className="h2 fw-bold text-dark mb-3">Produits Recommandés</h2>
        <div className="mx-auto bg-gradient-to-r from-primary to-warning rounded-pill" 
             style={{ width: '80px', height: '4px' }}></div>
      </div>

      {/* Products Grid */}
      <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4 mb-4">
        {currentProducts?.map((product) => {
          const discountedPrice = (product.price * 0.9).toFixed(2);
          const imageUrl = getImageUrl(product.img);

          return (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm product-card border-0">
                <div className="position-relative">
                  {/* Discount Badge */}
                  <Badge 
                    bg="danger" 
                    className="position-absolute top-0 end-0 m-2 rounded-pill"
                    style={{ zIndex: 10 }}
                  >
                    -10%
                  </Badge>
                  
                  {/* Product Image */}
                  {imageUrl && (
                    <Card.Img
                      variant="top"
                      src={imageUrl}
                      alt={product.name}
                      style={{ 
                        height: '180px', 
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      className="product-image"
                      onError={handleImageError}
                    />
                  )}
                </div>

                <Card.Body className="d-flex flex-column p-3">
                  {/* Product Name */}
                  <Card.Title 
                    className="fw-semibold mb-2 text-truncate-2"
                    style={{ 
                      fontSize: '0.95rem',
                      minHeight: '2.8rem',
                      lineHeight: '1.4'
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </Card.Title>
                  
                  {/* Price Section */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-column">
                      <small className="text-muted text-decoration-line-through">
                        {product.price} DT
                      </small>
                      <span className="text-success fw-bold fs-5">
                        {discountedPrice} DT
                      </span>
                    </div>
                    <Badge bg="light" text="dark" className="small">
                      Économisez 10%
                    </Badge>
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-100 mt-auto d-flex align-items-center justify-content-center gap-2"
                    onClick={() => productHandler(product.id, product.type_id)}
                  >
                    <i className="fa-solid fa-eye"></i>
                    <span className="d-none d-sm-inline">Voir détails</span>
                    <span className="d-inline d-sm-none">Détails</span>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt-4">
          <Button
            variant="outline-primary"
            onClick={prevPage}
            disabled={currentPage === 1}
            className="d-flex align-items-center gap-2"
          >
            <i className="fa-solid fa-chevron-left"></i>
            <span className="d-none d-sm-inline">Précédent</span>
          </Button>

          <div className="d-flex align-items-center">
            <span className="text-muted small">
              Page {currentPage} sur {totalPages}
            </span>
          </div>

          <Button
            variant="outline-primary"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="d-flex align-items-center gap-2"
          >
            <span className="d-none d-sm-inline">Suivant</span>
            <i className="fa-solid fa-chevron-right"></i>
          </Button>
        </div>
      )}

      <style jsx>{`
        .product-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .bg-gradient-to-r {
          background: linear-gradient(to right, var(--bs-primary), var(--bs-warning));
        }
      `}</style>
    </Container>
  );
};

export default ProductRecommande;