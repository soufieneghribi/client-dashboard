import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../store/slices/product';
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Container, Row, Col, Card, Button, Breadcrumb, Badge, Pagination } from 'react-bootstrap';

const ProductsBySubCategory = () => {
  const location = useLocation();
  const { product = {}, loading, error } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.categorie);
  const allProducts = product.products || [];
  const dispatch = useDispatch();
  
  const subId = location.state?.subId;
  const [subTitle, setSubTitle] = useState(location.state?.subTitle || "Produits");
  
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
    if (subId) {
      dispatch(fetchProduct(subId));
      
      if (!location.state?.subTitle && categories && categories.length > 0) {
        const category = categories.find((cat) => cat.id === parseInt(subId));
        if (category) {
          setSubTitle(category.title);
        }
      }
    }
  }, [dispatch, subId, categories, location.state]);

  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const currentProducts = allProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleDetails = (id, subId) => {
    navigate(`/product/${id}`, { state: { subId } });
  };

  const addToCartHandler = (product) => {
    const quantity = 1;
    const price = parseFloat(product.price) || 0;

    const discounted = [2, 3].includes(Number(subId));
    const finalPrice = discounted ? (price * 0.9).toFixed(2) : price.toFixed(2);
    const total = (finalPrice * quantity).toFixed(2);

    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

    const newItem = {
      id: product.id,
      name: product.name,
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
    navigate("/cart-shopping");
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </Container>
  );
  
  if (error) return (
    <Container className="py-5">
      <div className="alert alert-danger">Erreur : {error}</div>
    </Container>
  );
  
  if (!subId) return (
    <Container className="py-5">
      <p className="text-center text-muted">Aucune catégorie sélectionnée</p>
    </Container>
  );

  return (
    <Container fluid className="py-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Accueil
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/categories" }}>
          Catégories
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{subTitle}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="text-primary fw-bold mb-4 display-6">{subTitle}</h1>

      <Row xs={2} sm={3} md={4} lg={5} xl={6} className="g-3 g-md-4 mb-4">
        {currentProducts.map((product) => {
          const price = parseFloat(product.price) || 0;
          const imageUrl = getImageUrl(product.img);

          return (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm hover-card">
                <div className="position-relative">
                  {imageUrl && (
                    <Card.Img
                      variant="top"
                      src={imageUrl}
                      alt={product.name}
                      style={{ height: '150px', objectFit: 'contain' }}
                      onError={handleImageError}
                    />
                  )}
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
                  <Card.Title className="small text-truncate mb-2" title={product.name}>
                    {product.name}
                  </Card.Title>

                  {Number(subId) === 2 || Number(subId) === 3 ? (
                    <div className="d-flex flex-column align-items-center gap-1 mb-2">
                      <div className="text-decoration-line-through text-muted small">
                        {price.toFixed(2)} dt
                      </div>
                      <Badge bg="success">-10%</Badge>
                      <div className="text-warning fw-bold">
                        {(price * 0.9).toFixed(2)} dt
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-warning fw-semibold mb-2">
                      Prix : {price.toFixed(2)} dt
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-auto w-100"
                    onClick={() => handleDetails(product.id, subId)}
                  >
                    Voir détails
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {allProducts.length > 0 && totalPages > 1 && (
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

export default ProductsBySubCategory;