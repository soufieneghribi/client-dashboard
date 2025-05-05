import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { SearchProduct, clearSearch } from "../store/slices/search";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Company_Logo from "../assets/images/logo_0.png";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Collapse from 'react-bootstrap/Collapse';
import debounce from 'lodash.debounce';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const offcanvasRef = useRef(null);
  
  // Redux state
  const auth = useSelector((state) => state.auth);
  const { searchResults, loading: searchLoading, error: searchError } = useSelector((state) => state.search);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        dispatch(SearchProduct(query));
      }
    }, 300),
    [dispatch]
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      dispatch(clearSearch());
    } else {
      debouncedSearch(query);
    }
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    debouncedSearch.flush();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Keyboard navigation support
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Authentication check
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
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, auth.isLoggedIn]);

  // Click outside handler
  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      dispatch(clearSearch());
    }
    if (offcanvasRef.current && !offcanvasRef.current.contains(e.target)) {
      setShowProfileMenu(false);
      setShowMobileMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search results component
  const SearchResultsDropdown = () => (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg mt-1 max-h-60 overflow-y-auto z-50 border border-gray-100">
      {searchResults.map((product) => (
        <Link
          key={product.id}
          to={`/products/${product.id}`}
          className="block px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
          onClick={() => dispatch(clearSearch())}
        >
          {product.name}
        </Link>
      ))}
      {searchResults.length === 0 && !searchLoading && (
        <div className="px-4 py-2 text-gray-500 text-sm">No products found</div>
      )}
    </div>
  );

  return (
    <header className="w-full h-16 bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Left Section - Mobile Menu & Logo */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden text-gray-600 hover:text-gray-800"
            aria-label="Toggle navigation"
          >
            <i className={`fas text-lg ${showMobileMenu ? 'fa-times' : 'fa-bars'}`} />
          </button>

          <Link to="/" className="flex-shrink-0" aria-label="Home">
            <img 
              src={Company_Logo} 
              className="h-10 w-auto"
              alt="Company Logo" 
            />
          </Link>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-2xl mx-6 relative" ref={searchRef}>
          <div className="relative">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Search products..."
              aria-label="Search products"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={handleSearchSubmit}
              disabled={searchLoading}
              aria-label="Search"
            >
              {searchLoading ? (
                <i className="fas fa-spinner fa-spin text-blue-600" />
              ) : (
                <i className="fas fa-search text-gray-500 hover:text-blue-600" />
              )}
            </button>
          </div>

          {/* Search Results & Error Display */}
          {searchQuery && searchResults.length > 0 && <SearchResultsDropdown />}
          {searchError && (
            <div className="absolute top-full left-0 text-red-500 text-xs mt-1">
              {searchError}
            </div>
          )}
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center space-x-4">
          {auth.isLoggedIn ? (
            <div className="hidden lg:flex items-center space-x-3 relative">
              <span className="text-sm text-gray-600">
                Hi, {auth.user?.nom_et_prenom.split(' ')[0] || "User"}
              </span>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="text-gray-600 hover:text-blue-600 relative"
                aria-label="Account menu"
              >
                <i className="fas fa-user-circle text-xl" />
              </button>

              <Collapse in={showProfileMenu}>
                <div 
                  ref={offcanvasRef}
                  className="absolute top-full right-0 mt-2 bg-white shadow-lg 
                    rounded-md w-48 py-2 z-50 border border-gray-100"
                >
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-user mr-2" /> Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-cog mr-2" /> Settings
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-shopping-bag mr-2" /> Orders
                  </Link>
                  <button
                    onClick={() => dispatch(logout())}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-sign-out-alt mr-2" /> Logout
                  </button>
                </div>
              </Collapse>
            </div>
          ) : (
            <div className="hidden lg:flex space-x-3">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md
                  hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-sign-in-alt mr-2" /> Login
              </Link>
              <Link
                to="/inscrire"
                className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md
                  hover:bg-orange-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Action Icons */}
          <div className="flex space-x-3">
            <Link 
              to="/wishlist" 
              className="text-gray-600 hover:text-blue-600 p-1.5"
              aria-label="Wishlist"
            >
              <i className="far fa-heart text-lg" />
            </Link>
            <Link 
              to="/cart-shopping" 
              className="text-gray-600 hover:text-blue-600 p-1.5 relative"
              aria-label="Shopping cart"
            >
              <i className="fas fa-shopping-cart text-lg" />
              {/* Cart Counter */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Offcanvas */}
        <Offcanvas 
          show={showMobileMenu} 
          onHide={() => setShowMobileMenu(false)} 
          placement="start"
          className="lg:hidden"
        >
          <Offcanvas.Header closeButton className="border-b">
            <Offcanvas.Title className="text-sm">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-3">
            <nav className="space-y-2">
              {auth.isLoggedIn ? (
                <>
                  <Link to="/profile" className="block py-2 text-sm">Profile</Link>
                  <Link to="/orders" className="block py-2 text-sm">Orders</Link>
                  <button 
                    onClick={() => dispatch(logout())}
                    className="block py-2 text-sm text-left w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-sm">Login</Link>
                  <Link to="/register" className="block py-2 text-sm">Register</Link>
                </>
              )}
            </nav>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </header>
  );
};

export default Header;