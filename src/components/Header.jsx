import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { SearchProduct as searchProduct, clearSearch } from "../store/slices/search";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Company_Logo from "../assets/images/logo_0.png";
import Offcanvas from 'react-bootstrap/Offcanvas';
import debounce from 'lodash.debounce';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const profileMenuRef = useRef(null);

  const auth = useSelector((state) => state.auth);
  const { searchResults, loading: searchLoading, error: searchError } = useSelector((state) => state.search);

  // Fonction de recherche avec debounce
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/categories", label: "Catégories" },
    { path: "/MesDeals", label: "Offres" },
    { path: "/contact", label: "Contact" }
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
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, auth.isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        dispatch(clearSearch());
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  const SearchResultsDropdown = () => (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg mt-1 max-h-60 overflow-y-auto z-50 border border-gray-100 rounded-lg">
      {searchResults.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.id}`}
          className="block px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0"
          onClick={() => {
            dispatch(clearSearch());
            setSearchQuery('');
          }}
        >
          <div className="flex items-center">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-8 h-8 object-cover rounded mr-3"
              />
            )}
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              {product.price && (
                <p className="text-green-600 text-xs font-semibold">{product.price} €</p>
              )}
            </div>
          </div>
        </Link>
      ))}
      {searchResults.length === 0 && !searchLoading && searchQuery && (
        <div className="px-4 py-3 text-gray-500 text-sm text-center">
          Aucun produit trouvé
        </div>
      )}
    </div>
  );

  return (
    <header className="w-full h-16 bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">

        {/* Left - Logo & Navigation */}
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Toggle navigation"
          >
            <i className={`fas text-lg ${showMobileMenu ? 'fa-times' : 'fa-bars'}`} />
          </button>

          <Link to="/" className="flex-shrink-0" aria-label="Home">
            <img src={Company_Logo} className="h-10 w-auto" alt="Company Logo" />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              aria-label="Rechercher un produit"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              disabled={searchLoading}
              aria-label="Lancer la recherche"
            >
              {searchLoading ? (
                <i className="fas fa-spinner fa-spin text-blue-600" />
              ) : (
                <i className="fas fa-search" />
              )}
            </button>
          </form>
          
          {searchQuery && Array.isArray(searchResults) && searchResults.length > 0 && (
            <SearchResultsDropdown />
          )}
          
          {searchError && (
            <div className="absolute top-full left-0 text-red-500 text-xs mt-1 bg-red-50 px-2 py-1 rounded">
              {searchError}
            </div>
          )}
        </div>

        {/* Right - User Actions */}
        <div className="flex items-center space-x-4">
          {/* User Profile (Desktop) */}
          {auth.isLoggedIn ? (
            <div className="hidden lg:flex items-center space-x-3 relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                aria-label="Menu profil"
              >
                <i className="fas fa-user-circle text-xl" />
                <i className="fas fa-chevron-down text-xs" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg w-48 py-2 z-50 border border-gray-100">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 mb-1">
                    Connecté en tant que <strong>{auth.user?.nom_et_prenom?.split(' ')[0] || "Utilisateur"}</strong>
                  </div>
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <i className="fas fa-user mr-3 w-4 text-center" /> 
                    Mon Profil
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <i className="fas fa-cog mr-3 w-4 text-center" /> 
                    Paramètres
                  </Link>
                  <Link 
                    to="/Mes-Commandes" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <i className="fas fa-shopping-bag mr-3 w-4 text-center" /> 
                    Mes Commandes
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-3 w-4 text-center" /> 
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex space-x-2">
              {/* Login Button avec meilleure icône */}
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                aria-label="Connexion"
                title="Connexion"
              >
                <i className="fas fa-right-to-bracket text-lg" />
                <span className="text-sm">Connexion</span>
              </Link>
              {/* Register Button avec meilleure icône */}
              <Link 
                to="/inscrire" 
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                aria-label="S'inscrire"
                title="S'inscrire"
              >
                <i className="fas fa-user-plus text-lg" />
                <span className="text-sm">S'inscrire</span>
              </Link>
            </div>
          )}

          {/* Wishlist & Cart */}
          <div className="flex items-center space-x-2">
            <Link 
              to="/wishlist" 
              className="text-gray-600 hover:text-red-500 p-2.5 rounded-lg hover:bg-gray-50 transition-colors relative"
              aria-label="Liste de souhaits"
            >
              <i className="far fa-heart text-lg" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            <Link 
              to="/cart-shopping" 
              className="text-gray-600 hover:text-blue-600 p-2.5 rounded-lg hover:bg-gray-50 transition-colors relative"
              aria-label="Panier"
            >
              <i className="fas fa-shopping-cart text-lg" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </Link>
          </div>

          {/* Mobile Auth Icons */}
          <div className="lg:hidden flex items-center space-x-2">
            {auth.isLoggedIn ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="text-gray-600 hover:text-blue-600 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Menu profil"
              >
                <i className="fas fa-user-circle text-lg" />
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Connexion"
                >
                  <i className="fas fa-right-to-bracket text-lg" />
                </Link>
                <Link 
                  to="/inscrire" 
                  className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-2.5 rounded-lg transition-all duration-200 shadow-sm"
                  aria-label="S'inscrire"
                >
                  <i className="fas fa-user-plus text-lg" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <Offcanvas 
          show={showMobileMenu} 
          onHide={() => setShowMobileMenu(false)} 
          placement="start" 
          className="lg:hidden"
        >
          <Offcanvas.Header closeButton className="border-b border-gray-200">
            <Offcanvas.Title className="flex items-center">
              <img src={Company_Logo} className="h-8 w-auto mr-3" alt="Logo" />
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {/* Navigation Mobile */}
            <nav className="space-y-1 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className={`fas fa-${link.path === '/' ? 'home' : link.path === '/categories' ? 'th-large' : link.path === '/MesDeals' ? 'tag' : 'envelope'} mr-3 w-5 text-center`} />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Section Mobile */}
            <div className="border-t border-gray-200 pt-4">
              {auth.isLoggedIn ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 text-sm text-gray-500">
                    <i className="fas fa-user-circle mr-2" />
                    Connecté en tant que <strong>{auth.user?.nom_et_prenom}</strong>
                  </div>
                  <Link 
                    to="/profile" 
                    className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <i className="fas fa-user mr-3 w-5 text-center" />
                    Mon Profil
                  </Link>
                  <Link 
                    to="/Mes-Commandes" 
                    className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <i className="fas fa-shopping-bag mr-3 w-5 text-center" />
                    Mes Commandes
                  </Link>
                  <button 
                    onClick={() => {
                      dispatch(logout());
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-3 w-5 text-center" />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4">
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <i className="fas fa-right-to-bracket mr-2" />
                    Connexion
                  </Link>
                  <Link 
                    to="/inscrire" 
                    className="flex items-center justify-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <i className="fas fa-user-plus mr-2" />
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions Mobile */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-2 px-4">
                <Link 
                  to="/wishlist" 
                  className="flex items-center justify-center py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="far fa-heart mr-2" />
                  Favoris
                </Link>
                <Link 
                  to="/cart-shopping" 
                  className="flex items-center justify-center py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-shopping-cart mr-2" />
                  Panier
                </Link>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Mobile Profile Dropdown */}
        {auth.isLoggedIn && showProfileMenu && (
          <div className="lg:hidden absolute top-16 right-4 bg-white shadow-xl rounded-lg w-48 py-2 z-50 border border-gray-100">
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 mb-1">
              <i className="fas fa-user-circle mr-2" />
              {auth.user?.nom_et_prenom?.split(' ')[0] || "Utilisateur"}
            </div>
            <Link 
              to="/profile" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              <i className="fas fa-user mr-3 w-4 text-center" /> 
              Mon Profil
            </Link>
            <Link 
              to="/Mes-Commandes" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setShowProfileMenu(false)}
            >
              <i className="fas fa-shopping-bag mr-3 w-4 text-center" /> 
              Mes Commandes
            </Link>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={() => {
                dispatch(logout());
                setShowProfileMenu(false);
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-3 w-4 text-center" /> 
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;