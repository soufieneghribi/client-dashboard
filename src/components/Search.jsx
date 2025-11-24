import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  SearchProduct, 
  clearSearch, 
  selectSearchResults,
  selectSearchLoading,
  selectSearchError,
  selectHasSearched 
} from "../store/slices/search";
import debounce from "lodash.debounce";

const Search = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ CORRECTION: Utilisation des sélecteurs individuels
  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);
  const searchError = useSelector(selectSearchError);
  const hasSearched = useSelector(selectHasSearched);

  // Debug: Affichez les résultats dans la console
  useEffect(() => {
    console.log("Search Component - Results:", searchResults);
    console.log("Search Component - Loading:", searchLoading);
    console.log("Search Component - Error:", searchError);
    console.log("Search Component - Has Searched:", hasSearched);
  }, [searchResults, searchLoading, searchError, hasSearched]);

  // Fermer les résultats quand on clique ailleurs - SEULEMENT si on est sur la page de recherche
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ✅ Vérifier si on est dans le composant de recherche avant de fermer
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        // ❌ NE PAS dispatcher clearSearch ici - cela affecte d'autres pages
      }
    };

    // ✅ Ajouter l'event listener seulement si le dropdown est ouvert
    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showResults]);

  // ✅ CORRECTION: Nettoyage du debounce lors du démontage
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
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
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery("");
      // ❌ NE PAS vider les résultats ici - la page SearchResult en a besoin !
      // dispatch(clearSearch());
    }
  };

  const handleResultClick = (product) => {
    navigate(`/product/${product.id}`, {
      state: { subId: product.type_id }
    });
    setShowResults(false);
    setQuery("");
    dispatch(clearSearch());
  };

  const handleSeeAllResults = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery("");
      // ❌ NE PAS vider les résultats - la page SearchResult en a besoin !
      // dispatch(clearSearch());
    }
  };

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    if (!price) return null;
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? price : numPrice.toFixed(3);
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
          TN360
        </div>

        {/* Liens */}
        <div className="hidden md:flex space-x-6 text-gray-700">
          <a href="/" className="hover:text-blue-600 transition-colors">
            Accueil
          </a>
          <a href="/categories" className="hover:text-blue-600 transition-colors">
            Catégories
          </a>
          <a href="/deals" className="hover:text-blue-600 transition-colors">
            Offres
          </a>
          <a href="/recipes" className="hover:text-blue-600 transition-colors">
            Recettes
          </a>
          <a href="/contact" className="hover:text-blue-600 transition-colors">
            Contact
          </a>
        </div>

        {/* Boutons */}
        <div className="flex space-x-4">
          <button 
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/login")}
          >
            Connexion
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
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
                focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm
                transition-all duration-200"
              placeholder="Rechercher un produit..."
              aria-label="Search products"
              value={query}
              onChange={handleChange}
              onFocus={() => query && setShowResults(true)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md
                hover:bg-gray-100 transition-colors disabled:opacity-50"
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
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                <span className="text-sm font-medium text-gray-600">
                  {searchLoading 
                    ? "Recherche en cours..." 
                    : hasSearched && searchResults.length === 0 && !searchError
                    ? "Aucun résultat"
                    : `${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''}`
                  }
                </span>
                {searchResults.length > 0 && (
                  <button
                    onClick={handleSeeAllResults}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Voir tout
                  </button>
                )}
              </div>

              {/* Liste des résultats */}
              {searchLoading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin mr-2 text-lg"></i>
                  <p className="mt-2">Recherche en cours...</p>
                </div>
              ) : searchError ? (
                <div className="px-4 py-6 text-center">
                  <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                  <p className="text-red-500 text-sm">{searchError}</p>
                  <button 
                    onClick={() => dispatch(SearchProduct(query))}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Réessayer
                  </button>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 
                        last:border-b-0 transition-colors"
                      onClick={() => handleResultClick(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 line-clamp-1">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.price && (
                          <div className="text-sm text-green-600 font-semibold ml-3 whitespace-nowrap">
                            {formatPrice(item.price)} DT
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div 
                      className="px-4 py-3 text-center text-blue-600 hover:bg-blue-50 
                        cursor-pointer text-sm font-medium transition-colors"
                      onClick={handleSeeAllResults}
                    >
                      Voir les {searchResults.length - 5} autres résultat{searchResults.length - 5 > 1 ? 's' : ''}
                    </div>
                  )}
                </>
              ) : hasSearched ? (
                <div className="px-4 py-8 text-center">
                  <i className="fas fa-search text-gray-300 text-3xl mb-3"></i>
                  <p className="text-gray-500 mb-1">Aucun produit trouvé</p>
                  <p className="text-xs text-gray-400">
                    pour "{query}"
                  </p>
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