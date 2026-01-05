import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import {
  SearchProduct,
  clearSearch,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError
} from "../store/slices/search";

import Cookies from "js-cookie";
import { Container, Row, Col, Card, Button, Breadcrumb, Badge, Pagination, Spinner } from 'react-bootstrap';

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

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  useEffect(() => {
    if (query) {
      dispatch(SearchProduct(query));
    }
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

  const handleDetails = (id, subId) => {
    navigate(`/product/${id}`, {
      state: { subId }
    });
  };

  const addToCartHandler = (product) => {
    const quantity = 1;
    const price = parseFloat(product.price) || 0;

    const discounted = [2, 3].includes(Number(product.type_id));
    const finalPrice = discounted ? (price * 0.9).toFixed(3) : price.toFixed(3);
    const total = (finalPrice * quantity).toFixed(3);

    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

    const newItem = {
      id: product.id,
      name: product.name,
      img: product.img,
      Initialprice: price.toFixed(3),
      price: finalPrice,
      total,
      quantity,
    };

    const existingItemIndex = cart.findIndex((el) => el.id === newItem.id);

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += newItem.quantity;
      cart[existingItemIndex].total = (
        parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)
      ).toFixed(3);
    } else {
      cart.push(newItem);
    }

    Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
    // 
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
      <Container className="py-5">
        <div className="alert alert-danger">Erreur : {searchError}</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Accueil
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Recherche: "{query}"
        </Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="text-primary fw-bold mb-4 display-6">Résultats pour "{query}"</h1>

      {searchResults.length === 0 ? (
        <div className="text-center py-5">
          <h3 className="text-muted">Aucun produit trouvé</h3>
          <p>Essayez avec d'autres mots-clés</p>
        </div>
      ) : (
        <>
          <Row xs={2} sm={3} md={4} lg={5} xl={6} className="g-3 g-md-4 mb-4">
            {currentProducts.map((product) => {
              const price = parseFloat(product.price) || 0;
              const type_id = Number(product.type_id);

              return (
                <Col key={product.id}>
                  <Card className="h-100 shadow-sm hover-card">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        style={{ height: '150px', objectFit: 'contain', padding: '10px' }}
                        onError={handleImageError}
                      />
                      <Button
                        variant="success"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2 rounded-circle"
                        onClick={() => addToCartHandler(product)}
                        style={{ width: '35px', height: '35px', padding: 0 }}
                      >
                        <i className="fa fa-cart-plus"></i>
                      </Button>
                    </div>

                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="small text-truncate mb-2" title={product.name} style={{ fontSize: '0.9rem' }}>
                        {product.name}
                      </Card.Title>

                      {type_id === 2 || type_id === 3 ? (
                        <div className="d-flex flex-column align-items-center gap-1 mb-2">
                          <div className="text-decoration-line-through text-muted small">
                            {price.toFixed(3)} DT
                          </div>
                          <Badge bg="success">-10%</Badge>
                          <div className="text-warning fw-bold">
                            {(price * 0.9).toFixed(3)} DT
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-warning fw-semibold mb-2" style={{ fontSize: '1rem' }}>
                          {price.toFixed(3)} DT
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-auto w-100"
                        onClick={() => handleDetails(product.id, product.type_id)}
                      >
                        Voir détails
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
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

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Container>
  );
};

export default SearchResultsPage;


