import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { SearchProduct as searchProduct, clearSearch } from "../store/slices/search";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Company_Logo from "../assets/images/logo_0.png";
import { Navbar, Nav, Container, Form, Button, Dropdown, Badge, Offcanvas, InputGroup } from 'react-bootstrap';
import debounce from 'lodash.debounce';
import Cookies from "js-cookie";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);

  const auth = useSelector((state) => state.auth);
  const { searchResults, loading: searchLoading, error: searchError } = useSelector((state) => state.search);

  // Fonction de déconnexion avec redirection
  const handleLogout = () => {
    dispatch(logout());
    setShowMobileMenu(false);
    navigate('/login'); // Redirection vers la page de connexion
  };

  // Update cart count from cookies
  useEffect(() => {
    const updateCartCount = () => {
      const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];
      const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(totalItems);
    };

    // Initial update
    updateCartCount();

    // Update every second to catch cart changes
    const interval = setInterval(updateCartCount, 1000);

    return () => clearInterval(interval);
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        dispatch(searchProduct(query));
      }
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (!value.trim()) {
      dispatch(clearSearch());
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
    }
  };

  const navLinks = [
    { path: "/", label: "Accueil", icon: "fa-home" },
    { path: "/categories", label: "Product", icon: "fa-th-large" },
    { path: "/MesDeals", label: "deals", icon: "fa-tag" },
    { path: "/Catalogue", label: "Catalogue", icon: "fa-book" },
    { path: "/cadeaux", label: "Cadeaux", icon: "fa-gift" },

    { path: "/contact", label: "Contact", icon: "fa-envelope" }
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

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

          <Nav className="d-none d-lg-flex me-auto">
            {navLinks.map((link) => (
              <Nav.Link key={link.path} as={Link} to={link.path} className="fw-medium px-3 text-dark">
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-none d-lg-block flex-grow-1 mx-4 position-relative" style={{ maxWidth: '500px' }} ref={searchRef}>
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup>
                <Form.Control
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Button variant="outline-secondary" type="submit" disabled={searchLoading}>
                  {searchLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-search"></i>}
                </Button>
              </InputGroup>
            </Form>

            {searchQuery && Array.isArray(searchResults) && searchResults.length > 0 && (
              <div className="position-absolute bg-white shadow-lg rounded mt-1 w-100" style={{ zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="d-flex align-items-center p-3 text-decoration-none text-dark border-bottom"
                    onClick={() => {
                      dispatch(clearSearch());
                      setSearchQuery('');
                    }}
                    style={{ transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {product.image && (
                      <img src={product.image} alt={product.name} className="me-3 rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <p className="mb-0 fw-medium">{product.name}</p>
                      {product.price && <p className="mb-0 text-success small">{product.price} DT</p>}
                    </div>
                  </Link>
                ))}
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
                  <Dropdown.Divider />
                  {/* Utiliser handleLogout au lieu de dispatch(logout()) directement */}
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
            {navLinks.map((link) => (
              <Nav.Link key={link.path} as={Link} to={link.path} className="py-3 d-flex align-items-center text-dark" onClick={() => setShowMobileMenu(false)}>
                <i className={`fas ${link.icon} me-3 text-primary`} style={{ width: '20px' }}></i>
                {link.label}
              </Nav.Link>
            ))}
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
                {/* Utiliser handleLogout au lieu de dispatch(logout()) directement */}
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