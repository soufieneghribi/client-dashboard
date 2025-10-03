import React, { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SearchProduct } from "../store/slices/search";
import debounce from "lodash.debounce";

const Search = () => {
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const dispatch = useDispatch();

  const { results: searchResults = [], loading: searchLoading, error: searchError } =
    useSelector((state) => state.search);

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.trim()) {
        dispatch(SearchProduct(searchTerm));
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
      dispatch(SearchProduct(query));
    }
  };

  return (
    <div className="w-full shadow-md">
      {/* 🔹 Navbar intégrée */}
      <nav className="bg-white px-6 py-3 flex items-center justify-between border-b">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 cursor-pointer">
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
          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connexion
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-lg hover:bg-gray-300">
            S'inscrire
          </button>
        </div>
      </nav>

      {/* 🔹 Barre de recherche */}
      <div className="flex justify-center mt-6 mb-4 px-4">
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSubmit} className="relative">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Rechercher un produit..."
              aria-label="Search products"
              value={query}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
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

          {/* Résultats */}
          {query && searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {searchResults.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}

          {/* Erreur */}
          {searchError && (
            <div className="absolute top-full left-0 text-red-500 text-xs mt-1">
              {searchError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
