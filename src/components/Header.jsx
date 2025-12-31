import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { SearchProduct as searchProduct, clearSearch } from "../store/slices/search";
import { fetchWishlist, selectWishlistCount } from "../store/slices/wishlist";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Company_Logo from "../assets/images/logo_0.png";
import { Navbar, Nav, Container, Form, Button, Dropdown, Badge, Offcanvas, InputGroup, NavDropdown } from 'react-bootstrap';
import debounce from 'lodash.debounce';
import Cookies from "js-cookie";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const auth = useSelector((state) => state.auth);
  const { searchResults, loading: searchLoading, error: searchError } = useSelector((state) => state.search);
  const wishlistCount = useSelector(selectWishlistCount);

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  // Composant pour l'image du produit avec fallback
  const ProductImage = ({ product }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = getProductImageUrl(product);

    if (!imageUrl || imageError) {
      return (
        <div
          className="d-flex align-items-center justify-content-center bg-light rounded me-3"
          style={{
            width: '50px',
            height: '50px',
            minWidth: '50px',
            backgroundColor: '#f0f0f0'
          }}
        >
          <i className="fas fa-box text-muted"></i>
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={product.name}
        className="me-3 rounded"
        style={{
          width: '50px',
          height: '50px',
          minWidth: '50px',
          objectFit: 'cover',
          border: '1px solid #e0e0e0'
        }}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  };

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    if (!price) return null;
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? price : numPrice.toFixed(3);
  };

  // Fonction de déconnexion avec redirection
  const handleLogout = () => {
    dispatch(logout());
    setShowMobileMenu(false);
    navigate('/login');
  };

  // Update cart count from cookies
  useEffect(() => {
    const updateCartCount = () => {
      const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];
      const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    const interval = setInterval(updateCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch wishlist count when user is logged in
  useEffect(() => {
    if (auth.isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [auth.isLoggedIn, dispatch]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        dispatch(searchProduct(query));
        setShowSearchResults(true);
      }
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      dispatch(clearSearch());
      setShowSearchResults(false);
    } else {
      debouncedSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    debouncedSearch.flush();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      dispatch(clearSearch());
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleProductClick = (productId, typeId) => {
    navigate(`/product/${productId}`, { state: { subId: typeId } });
    dispatch(clearSearch());
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const navLinks = [
    { path: "/", label: "Accueil", icon: "fa-home" },
    { path: "/categories", label: "Product", icon: "fa-th-large" },
    { path: "/MesDeals", label: "Deals", icon: "fa-tag" },
    { path: "/recipes", label: "Recettes", icon: "fa-utensils" },
    { path: "/Catalogue", label: "Catalogue", icon: "fa-book" },
    { path: "/cadeaux", label: "Cadeaux", icon: "fa-gift" },
    { path: "/credit/simulation", label: "Crédit", icon: "fa-credit-card" },
    { path: "/contact", label: "Contact", icon: "fa-envelope" },
    { path: "/reclamations", label: "Réclamations", icon: "fa-exclamation-circle" }

  ];

  const protectedNavLinks = [
    { path: "/reclamations", label: "Réclamations", icon: "fa-exclamation-circle" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = user !== "undefined" ? JSON.parse(user) : null;
        if (parsedUser && !auth.isLoggedIn) {
          dispatch(loginSuccess({ token, user: parsedUser }));
        }
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, auth.isLoggedIn]);

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm border-bottom py-2">
        <Container fluid className="px-3 px-lg-4">
          <Button
            variant="link"
            className="d-lg-none text-secondary p-0 border-0 me-3"
            onClick={() => setShowMobileMenu(true)}
          >
            <i className="fas fa-bars fs-4"></i>
          </Button>

          <Navbar.Brand as={Link} to="/" className="me-lg-4">
            <img src={Company_Logo} height="24" width="70" alt="Logo" />
          </Navbar.Brand>

          <Nav className="d-none d-lg-flex me-auto align-items-center">
            {navLinks.map((link) => {
              if (link.label === "Crédit") {
                return (
                  <NavDropdown
                    title="Crédit"
                    id="credit-dropdown"
                    key="credit-dropdown"
                    className="fw-medium px-2"
                  >
                    <NavDropdown.Item as={Link} to="/credit/simulation">
                      Simulation
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/credit">
                      Voir mes crédits
                    </NavDropdown.Item>
                  </NavDropdown>
                );
              }
              return (
                <Nav.Link key={link.path} as={Link} to={link.path} className="fw-medium px-3 text-dark">
                  {link.label}
                </Nav.Link>
              );
            })}
          </Nav>

          <div className="d-none d-lg-block flex-grow-1 mx-4 position-relative" style={{ maxWidth: '500px' }} ref={searchRef}>
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup>
                <Form.Control
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && searchResults.length > 0 && setShowSearchResults(true)}
                />
                <Button variant="outline-secondary" type="submit" disabled={searchLoading}>
                  {searchLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-search"></i>}
                </Button>
              </InputGroup>
            </Form>

            {/* Dropdown des résultats de recherche */}
            {showSearchResults && searchQuery && Array.isArray(searchResults) && searchResults.length > 0 && (
              <div
                className="position-absolute bg-white shadow-lg rounded mt-1 w-100 border"
                style={{ zIndex: 1000, maxHeight: '450px', overflowY: 'auto' }}
              >
                {/* En-tête du dropdown */}
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
                  <span className="text-muted small">
                    {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                  </span>
                  {searchResults.length > 5 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-decoration-none p-0"
                      onClick={handleSearchSubmit}
                    >
                      Voir tout
                    </Button>
                  )}
                </div>

                {/* Liste des produits */}
                {searchResults.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="d-flex align-items-center p-3 border-bottom cursor-pointer"
                    onClick={() => handleProductClick(product.id, product.type_id)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {/* Image du produit */}
                    <ProductImage product={product} />

                    {/* Informations du produit */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="mb-0 fw-medium text-dark text-truncate">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                          {product.description}
                        </p>
                      )}
                      {/* Badges catégorie/marque */}
                      {(product.category || product.brand) && (
                        <div className="d-flex gap-1 mt-1">
                          {product.category && (
                            <Badge bg="secondary" className="text-white" style={{ fontSize: '0.7rem' }}>
                              {product.category}
                            </Badge>
                          )}
                          {product.brand && (
                            <Badge bg="info" className="text-white" style={{ fontSize: '0.7rem' }}>
                              {product.brand}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Prix */}
                    {product.price && (
                      <div className="text-success fw-bold ms-2" style={{ whiteSpace: 'nowrap' }}>
                        {formatPrice(product.price)} DT
                      </div>
                    )}
                  </div>
                ))}

                {/* Afficher plus de résultats */}
                {searchResults.length > 5 && (
                  <div
                    className="text-center py-3 text-primary fw-medium cursor-pointer"
                    onClick={handleSearchSubmit}
                    style={{
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    Voir les {searchResults.length - 5} autres résultats
                  </div>
                )}
              </div>
            )}

            {/* Message "Aucun résultat" */}
            {showSearchResults && searchQuery && Array.isArray(searchResults) && searchResults.length === 0 && !searchLoading && (
              <div
                className="position-absolute bg-white shadow-lg rounded mt-1 w-100 border text-center py-4"
                style={{ zIndex: 1000 }}
              >
                <i className="fas fa-search text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                <p className="text-muted mb-0">Aucun produit trouvé</p>
                <p className="text-muted small">pour "{searchQuery}"</p>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {auth.isLoggedIn ? (
              <Dropdown align="end" className="d-none d-lg-block">
                <Dropdown.Toggle variant="link" className="text-secondary text-decoration-none p-2 border-0">
                  <i className="fas fa-user-circle fs-4 me-1"></i>
                  <i className="fas fa-chevron-down small"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow border-0">
                  <Dropdown.Header className="small">
                    <strong>{auth.user?.nom_et_prenom?.split(' ')[0] || "Utilisateur"}</strong>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile"><i className="fas fa-user me-2"></i> Mon Profil</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings"><i className="fas fa-cog me-2"></i> Paramètres</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Mes-Commandes"><i className="fas fa-shopping-bag me-2"></i> Mes Commandes</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/credit"><i className="fas fa-credit-card me-2"></i> Voir mes crédits</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/reclamations"><i className="fas fa-exclamation-circle me-2"></i> Réclamations</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="fas fa-sign-out-alt me-2"></i> Déconnexion
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-none d-lg-flex gap-2">
                <Button variant="outline-primary" size="sm" as={Link} to="/login">
                  <i className="fas fa-right-to-bracket me-1"></i> Connexion
                </Button>
                <Button size="sm" as={Link} to="/inscrire" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }} className="text-white">
                  <i className="fas fa-user-plus me-1"></i> S'inscrire
                </Button>
              </div>
            )}

            {/* Wishlist Icon with Counter */}
            <Button variant="link" as={Link} to="/favoris" className="position-relative text-secondary p-2">
              <i className="fas fa-heart fs-4"></i>
              {wishlistCount > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Dynamic Cart Counter */}
            <Button variant="link" as={Link} to="/cart-shopping" className="position-relative text-secondary p-2">
              <i className="fas fa-shopping-cart fs-4"></i>
              {cartCount > 0 && (
                <Badge bg="primary" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                  {cartCount}
                </Badge>
              )}
            </Button>

            <div className="d-lg-none">
              {!auth.isLoggedIn && (
                <>
                  <Button variant="link" as={Link} to="/login" className="text-secondary p-2">
                    <i className="fas fa-right-to-bracket fs-5"></i>
                  </Button>
                  <Button size="sm" as={Link} to="/inscrire" className="rounded-pill text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                    <i className="fas fa-user-plus"></i>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </Navbar>

      <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)} placement="start">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>
            <img src={Company_Logo} height="22" alt="Logo" className="me-2" />
            Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSearchSubmit} className="mb-4">
            <InputGroup>
              <Form.Control placeholder="Rechercher..." value={searchQuery} onChange={handleSearchChange} />
              <Button variant="primary" type="submit"><i className="fas fa-search"></i></Button>
            </InputGroup>
          </Form>

          <Nav className="flex-column mb-4">
            {navLinks.map((link) => {
              if (link.label === "Crédit") {
                return (
                  <div key="credit-mobile-group">
                    <div className="py-3 d-flex align-items-center text-dark fw-bold px-3">
                      <i className={`fas ${link.icon} me-3 text-primary`} style={{ width: '20px' }}></i>
                      {link.label}
                    </div>
                    <div className="ps-5">
                      <Nav.Link as={Link} to="/credit/simulation" className="py-2 text-dark" onClick={() => setShowMobileMenu(false)}>
                        Simulation
                      </Nav.Link>
                      <Nav.Link as={Link} to="/credit" className="py-2 text-dark" onClick={() => setShowMobileMenu(false)}>
                        Voir mes crédits
                      </Nav.Link>
                    </div>
                  </div>
                );
              }
              return (
                <Nav.Link key={link.path} as={Link} to={link.path} className="py-3 d-flex align-items-center text-dark" onClick={() => setShowMobileMenu(false)}>
                  <i className={`fas ${link.icon} me-3 text-primary`} style={{ width: '20px' }}></i>
                  {link.label}
                </Nav.Link>
              );
            })}
          </Nav>

          <hr />
          {auth.isLoggedIn ? (
            <div>
              <p className="text-muted small mb-3">
                <i className="fas fa-user-circle me-2"></i>
                Connecté: <strong>{auth.user?.nom_et_prenom}</strong>
              </p>
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/profile" className="py-2 text-dark" onClick={() => setShowMobileMenu(false)}>
                  <i className="fas fa-user me-3 text-primary" style={{ width: '20px' }}></i> Mon Profil
                </Nav.Link>
                <Nav.Link as={Link} to="/Mes-Commandes" className="py-2 text-dark" onClick={() => setShowMobileMenu(false)}>
                  <i className="fas fa-shopping-bag me-3 text-primary" style={{ width: '20px' }}></i> Mes Commandes
                </Nav.Link>
                <Nav.Link as={Link} to="/credit" className="py-2 text-dark" onClick={() => setShowMobileMenu(false)}>
                  <i className="fas fa-credit-card me-3 text-primary" style={{ width: '20px' }}></i> Voir mes crédits
                </Nav.Link>
                <Nav.Link as={Link} to="/reclamations" className="py-2 text-dark" onClick={() => setShowMobileMenu(false)}>
                  <i className="fas fa-exclamation-circle me-3 text-primary" style={{ width: '20px' }}></i> Réclamations
                </Nav.Link>
                <Nav.Link onClick={handleLogout} className="py-2 text-danger">
                  <i className="fas fa-sign-out-alt me-3" style={{ width: '20px' }}></i> Déconnexion
                </Nav.Link>
              </Nav>
            </div>
          ) : (
            <div className="d-grid gap-2">
              <Button variant="outline-primary" as={Link} to="/login" onClick={() => setShowMobileMenu(false)}>
                <i className="fas fa-right-to-bracket me-2"></i> Connexion
              </Button>
              <Button as={Link} to="/inscrire" onClick={() => setShowMobileMenu(false)} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }} className="text-white">
                <i className="fas fa-user-plus me-2"></i> S'inscrire
              </Button>
            </div>
          )}

          <hr />
          <div className="d-flex gap-2">
            <Button variant="outline-danger" as={Link} to="/wishlist" className="flex-fill" onClick={() => setShowMobileMenu(false)}>
              <i className="far fa-heart me-2"></i> Favoris
            </Button>
            <Button variant="outline-primary" as={Link} to="/cart-shopping" className="flex-fill position-relative" onClick={() => setShowMobileMenu(false)}>
              <i className="fas fa-shopping-cart me-2"></i> Panier
              {cartCount > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Header;