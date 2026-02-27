import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { SearchProduct as searchProduct, clearSearch } from "../../store/slices/search";
import { fetchWishlist, selectWishlistCount } from "../../store/slices/wishlist";
import '@fortawesome/fontawesome-free/css/all.min.css';
import MG_LOGO_OFFICIAL from "../../assets/images/mg_logo_official.png";
import { Navbar, Nav, Container, Button, Badge, NavDropdown } from 'react-bootstrap';
import debounce from 'lodash.debounce';
import Cookies from "js-cookie";
import { getImageUrl } from "../../utils/imageHelper";

// Sub-components
import SearchSection from './SearchSection';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';

const NAV_LINKS = [
    { path: "/", label: "Accueil", icon: "fa-home" },
    { path: "/categories", label: "Product", icon: "fa-th-large" },
    { path: "/MesDeals", label: "Deals", icon: "fa-tag" },
    { path: "/recipes", label: "Recettes", icon: "fa-utensils" },
    { path: "/promotions", label: "Catalogue", icon: "fa-book" },
    { path: "/cadeaux", label: "Cadeaux", icon: "fa-gift" },
    { path: "/recrutement", label: "Recrutement", icon: "fa-user-tie" },
    { path: "/magasins", label: "Nos Magasins", icon: "fa-map-marker-alt" },
    { path: "/espace-presse", label: "Presse", icon: "fa-newspaper" }
];

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);

    const auth = useSelector((state) => state.auth);
    const { searchResults, loading: searchLoading } = useSelector((state) => state.search);
    const wishlistCount = useSelector(selectWishlistCount);

    // Helper: Product Image
    const ProductImage = ({ product }) => {
        const [imageError, setImageError] = useState(false);
        const imageUrl = getImageUrl(product, 'product');

        if (!imageUrl || imageError) {
            return (
                <div className="d-flex align-items-center justify-content-center bg-light rounded me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                    <i className="fas fa-box text-muted"></i>
                </div>
            );
        }

        return (
            <img
                src={imageUrl}
                alt={product.name}
                className="me-3 rounded"
                style={{ width: '50px', height: '50px', minWidth: '50px', objectFit: 'cover', border: '1px solid #e0e0e0' }}
                onError={() => setImageError(true)}
            />
        );
    };

    const formatPrice = (price) => {
        if (!price) return null;
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? price : numPrice.toFixed(3);
    };

    const handleLogout = () => {
        dispatch(logout());
        setShowMobileMenu(false);
        navigate('/login');
    };

    useEffect(() => {
        const updateCartCount = () => {
            const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];
            setCartCount(cart.reduce((total, item) => total + (item.quantity || 1), 0));
        };
        updateCartCount();
        const interval = setInterval(updateCartCount, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (auth.isLoggedIn) dispatch(fetchWishlist());
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (token && user && user !== "undefined") {
            try {
                const parsedUser = JSON.parse(user);
                if (parsedUser && !auth.isLoggedIn) dispatch(loginSuccess({ token, user: parsedUser }));
            } catch (error) {
                localStorage.removeItem("user");
            }
        }
    }, [dispatch, auth.isLoggedIn]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm border-bottom py-1">
                <Container fluid className="px-3 px-lg-4">
                    <Button variant="link" className="d-lg-none text-secondary p-0 border-0 me-3" onClick={() => setShowMobileMenu(true)}>
                        <i className="fas fa-bars fs-4"></i>
                    </Button>

                    <Navbar.Brand as={Link} to="/" className="me-lg-5">
                        <img src={MG_LOGO_OFFICIAL} height="32" className="d-inline-block align-top" alt="MG Logo" />
                    </Navbar.Brand>

                    <Nav className="d-none d-lg-flex me-auto align-items-center gap-2">
                        {NAV_LINKS.map((link) => (
                            <Nav.Link
                                key={link.path}
                                as={Link}
                                to={link.path}
                                className="fw-bold px-3 text-dark hover:text-primary transition-all position-relative nav-link-custom"
                            >
                                {link.label}
                            </Nav.Link>
                        ))}
                    </Nav>

                    <SearchSection
                        searchQuery={searchQuery}
                        handleSearchChange={handleSearchChange}
                        handleSearchSubmit={handleSearchSubmit}
                        searchLoading={searchLoading}
                        showSearchResults={showSearchResults}
                        searchResults={searchResults}
                        handleProductClick={handleProductClick}
                        formatPrice={formatPrice}
                        ProductImage={ProductImage}
                        searchRef={searchRef}
                    />

                    <div className="d-flex align-items-center gap-2">
                        <UserMenu auth={auth} handleLogout={handleLogout} />

                        <Button variant="link" as={Link} to="/favoris" className="position-relative text-secondary p-2">
                            <i className="fas fa-heart fs-4"></i>
                            {wishlistCount > 0 && (
                                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                                    {wishlistCount}
                                </Badge>
                            )}
                        </Button>

                        <Button variant="link" as={Link} to="/cart-shopping" className="position-relative text-secondary p-2">
                            <i className="fas fa-shopping-cart fs-4"></i>
                            {cartCount > 0 && (
                                <Badge bg="primary" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </Container>
            </Navbar>

            <MobileMenu
                show={showMobileMenu}
                onHide={() => setShowMobileMenu(false)}
                COMPANY_LOGO={MG_LOGO_OFFICIAL}
                handleSearchSubmit={handleSearchSubmit}
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                NAV_LINKS={NAV_LINKS}
                auth={auth}
                handleLogout={handleLogout}
                cartCount={cartCount}
            />
            <style>{`
                .nav-link-custom {
                    font-size: 0.95rem;
                    letter-spacing: 0.01em;
                }
                .nav-link-custom::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: #0056b3;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }
                .nav-link-custom:hover::after {
                    width: 100%;
                }
            `}</style>
        </>
    );
};

export default Header;
