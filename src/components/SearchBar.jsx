import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SearchProduct } from "../store/slices/search";
import "../styles/SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { searchResults, loading } = useSelector((state) => state.search);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      dispatch(SearchProduct(debouncedQuery));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, dispatch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setShowSuggestions(false);
  };

  const handleProductClick = (product) => {
    setQuery("");
    setShowSuggestions(false);
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate("/categories", { state: { searchQuery: query } });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/50";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${imagePath}`;
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-bar-form">
        <div className="search-bar-wrapper">
          <div className="search-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher articles ..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && setShowSuggestions(true)}
          />
          
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && query.trim() && (
          <div className="search-suggestions">
            {loading ? (
              <div className="search-loading">
                <div className="spinner"></div>
                <span>Recherche en cours...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="suggestions-list">
                {searchResults.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    className="suggestion-item"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="suggestion-image">
                      <img
                        src={getImageUrl(product.img)}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                    </div>
                    <div className="suggestion-content">
                      <div className="suggestion-name">{product.name}</div>
                      {product.price && (
                        <div className="suggestion-price">
                          {product.price.toFixed(2)} DT
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>Aucun produit trouvé</p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
