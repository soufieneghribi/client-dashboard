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

  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);
  const searchError = useSelector(selectSearchError);
  const hasSearched = useSelector(selectHasSearched);

  const IMAGE_BASE_URL = "https://tn360-lqd25ixbvq-ew.a.run.app/uploads";

  // ------------------------------
  // 🔍 Correction universelle du chemin image
  // ------------------------------
  const getImageUrl = (product) => {
    let imageUrl =
      product?.img ||
      product?.image_url ||
      product?.image ||
      product?.thumbnail ||
      (product?.images?.length ? product.images[0] : null);

    if (!imageUrl) return null;

    // Nettoyage de la string
    imageUrl = imageUrl.replace(/^\/+/, ""); // retire "/" au début
    imageUrl = imageUrl.replace(/uploads\//g, ""); // évite doublons

    // Si déjà URL complète
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    return `${IMAGE_BASE_URL}/${imageUrl}`;
  };

  // ------------------------------
  // 📦 Composant image avec fallback
  // ------------------------------
  const ProductImage = ({ product, alt }) => {
    const [error, setError] = useState(false);
    const src = getImageUrl(product);

    if (!src || error) {
      return (
        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-box text-gray-400 text-xl"></i>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
        onError={() => setError(true)}
      />
    );
  };

  // -----------------------------------------
  // 🔎 Debounced search
  // -----------------------------------------
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value.trim() !== "") {
        dispatch(SearchProduct(value));
        setShowResults(true);
      } else {
        dispatch(clearSearch());
        setShowResults(false);
      }
    }, 300),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowResults(false);
    dispatch(clearSearch());
  };

  const handleResultClick = (product) => {
    navigate(`/product/${product.id}`, {
      state: { subId: product.type_id }
    });
    setShowResults(false);
    dispatch(clearSearch());
    setQuery("");
  };

  // ------------------------------
  // Fermer dropdown en cliquant dehors
  // ------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [showResults]);

  return (
    <div className="w-full shadow-md">
      {/* Barre de recherche */}
      <div className="flex justify-center mt-6 mb-4 px-4">
        <div ref={searchRef} className="relative w-full max-w-2xl">
          
          <form onSubmit={handleSubmit} className="relative">
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Rechercher un produit..."
              value={query}
              onChange={handleChange}
              onFocus={() => query && setShowResults(true)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <i className="fas fa-search"></i>
            </button>
          </form>

          {/* ------------------------------ */}
          {/*        DROPDOWN RESULTATS        */}
          {/* ------------------------------ */}
          {showResults && query && (
            <div className="absolute w-full mt-1 bg-white border shadow-lg rounded-lg max-h-96 overflow-y-auto z-40">

              <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-600 sticky top-0">
                {searchLoading
                  ? "Recherche en cours..."
                  : `${searchResults.length} résultat(s)`}
              </div>

              {searchLoading && (
                <div className="text-center py-4 text-gray-500">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <>
                  {searchResults.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b"
                      onClick={() => handleResultClick(item)}
                    >
                      <ProductImage product={item} alt={item.name} />

                      <div className="flex-1">
                        <div className="font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </div>
                        {item.price && (
                          <div className="text-green-600 font-semibold text-sm">
                            {Number(item.price).toFixed(3)} DT
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!searchLoading &&
                hasSearched &&
                searchResults.length === 0 && (
                  <div className="py-6 text-center text-gray-500">
                    Aucun produit trouvé
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;