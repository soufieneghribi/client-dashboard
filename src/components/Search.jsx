import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SearchProduct } from '../store/slices/search'; 
import debounce from 'lodash.debounce';

const Search = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();

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

  return (
    <div>
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
    </div>
  );
};

export default Search;
