import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SearchProduct, clearSearch } from "../store/slices/search";
import debounce from "lodash.debounce";

const Search = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { searchResults = [], loading: searchLoading, error: searchError } = useSelector((state) => state.search);

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.trim()) {
        dispatch(SearchProduct(searchTerm));
        setShowResults(true);
      } else {
        dispatch(clearSearch());
        setShowResults(false);
      }
    }, 300),
    [dispatch]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // ✅ CORRECTION: Utiliser 'q' au lieu de 'query'
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery("");
    }
  };

  const handleResultClick = (product) => {
    navigate(`/product/${product.id}`);
    setShowResults(false);
    setQuery("");
    dispatch(clearSearch());
  };

  const handleSeeAllResults = () => {
    if (query.trim()) {
      // ✅ CORRECTION: Utiliser 'q' au lieu de 'query'
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery("");
    }
  };

  return (
    <div className="w-full shadow-md">
      {/* 🔹 Navbar intégrée */}
      <nav className="bg-white px-6 py-3 flex items-center justify-between border-b">
        {/* Logo */}
        <div 
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          MyShop
        </div>

        {/* Liens */}
        <div className="hidden md:flex space-x-6 text-gray-700">
          <a href="/" className="hover:text-blue-600">
            Accueil
          </a>
          <a href="/categories" className="hover:text-blue-600">
            Catégories
          </a>
          <a href="/deals" className="hover:text-blue-600">
            Offres
          </a>
          <a href="/contact" className="hover:text-blue-600">
            Contact
          </a>
        </div>

        {/* Boutons */}
        <div className="flex space-x-4">
          <button 
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => navigate("/login")}
          >
            Connexion
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={() => navigate("/register")}
          >
            S'inscrire
          </button>
        </div>
      </nav>

      {/* 🔹 Barre de recherche */}
      <div className="flex justify-center mt-6 mb-4 px-4">
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSubmit} className="relative">
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Rechercher un produit..."
              aria-label="Search products"
              value={query}
              onChange={handleChange}
              onFocus={() => query && setShowResults(true)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              disabled={searchLoading}
              aria-label="Search"
            >
              {searchLoading ? (
                <i className="fas fa-spinner fa-spin text-blue-600" />
              ) : (
                <i className="fas fa-search text-gray-500 hover:text-blue-600" />
              )}
            </button>
          </form>

          {/* Résultats en dropdown */}
          {showResults && query && (
            <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              {/* En-tête */}
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Résultats de recherche
                </span>
                {searchResults.length > 0 && (
                  <button
                    onClick={handleSeeAllResults}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Voir tout
                  </button>
                )}
              </div>

              {/* Liste des résultats */}
              {searchLoading ? (
                <div className="px-4 py-3 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Recherche en cours...
                </div>
              ) : searchError ? (
                <div className="px-4 py-3 text-center text-red-500 text-sm">
                  {searchError}
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleResultClick(item)}
                    >
                      <div className="font-medium text-gray-800">{item.name}</div>
                      {item.price && (
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          {item.price} DT
                        </div>
                      )}
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.description.slice(0, 60)}...
                        </div>
                      )}
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div 
                      className="px-4 py-2 text-center text-blue-600 hover:bg-blue-50 cursor-pointer text-sm font-medium"
                      onClick={handleSeeAllResults}
                    >
                      Voir les {searchResults.length - 5} autres résultats
                    </div>
                  )}
                </>
              ) : query ? (
                <div className="px-4 py-3 text-center text-gray-500">
                  Aucun produit trouvé pour "{query}"
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;