import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendedProduct } from "../store/slices/recommended";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Pagination } from 'react-bootstrap';
import WishlistButton from '../components/WishlistButton';

const ProductRecommande = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.recommended);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  useEffect(() => {
    dispatch(fetchRecommendedProduct());
  }, [dispatch]);

  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const currentProducts = products?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Chargement des recommandations...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Une erreur est survenue lors du chargement : {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Recommandés pour vous</h2>
          <p className="text-muted">Des produits sélectionnés selon vos préférences</p>
        </div>
      </div>

      <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4 mb-4">
        {currentProducts?.map((product) => {
          const price = parseFloat(product.price) || 0;
          return (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm border-0 product-card hover-lift">
                <div className="position-relative overflow-hidden">
                  <Badge
                    bg="primary"
                    className="position-absolute top-0 start-0 m-2"
                    style={{ zIndex: 1 }}
                  >
                    Recommandé
                  </Badge>

                  <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 1 }}>
                    <WishlistButton productId={product.id} size="small" />
                  </div>

                  {/* Product Image */}
                  <div
                    className="p-3 bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '200px', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <Card.Img
                      variant="top"
                      src={getProductImageUrl(product)}
                      alt={product.name}
                      style={{
                        maxHeight: '100%',
                        width: 'auto',
                        objectFit: 'contain'
                      }}
                      onError={handleImageError}
                    />
                  </div>
                </div>

                <Card.Body className="d-flex flex-column p-3">
                  <Card.Title
                    className="fs-6 text-truncate-2 mb-2"
                    title={product.name}
                    style={{ height: '40px', overflow: 'hidden' }}
                  >
                    {product.name}
                  </Card.Title>

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-primary">{price.toFixed(3)} DT</span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        Voir details
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(totalPages).keys()].map((i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}

      <style jsx>{`
        .product-card {
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Container>
  );
};

export default ProductRecommande;
