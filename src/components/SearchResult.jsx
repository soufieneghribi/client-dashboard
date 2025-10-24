import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchProduct, clearSearch } from '../store/slices/search';
import SearchCard from './SearchCard';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q'); // ✅ CORRECTION: 'q' au lieu de 'query'
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { searchResults, loading, error } = useSelector((state) => state.search);

  useEffect(() => {
    // Nettoyer les résultats précédents
    dispatch(clearSearch());
    
    if (searchQuery?.trim()) {
      dispatch(SearchProduct(searchQuery));
    } else {
      navigate('/');
    }
  }, [searchQuery, dispatch, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-lg text-gray-600">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p className="text-lg">Erreur : {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête des résultats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Résultats de recherche
        </h1>
        {searchQuery && (
          <p className="text-gray-600">
            {searchResults.length > 0 
              ? `${searchResults.length} produit(s) trouvé(s) pour "${searchQuery}"`
              : `Aucun produit trouvé pour "${searchQuery}"`
            }
          </p>
        )}
      </div>

      {/* Grille des produits */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {searchResults.map((product) => (
            <SearchCard key={product.id} product={product} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun résultat trouvé
          </h3>
          <p className="text-gray-500 mb-6">
            Essayez d'autres termes de recherche ou parcourez nos catégories
          </p>
          <button 
            onClick={() => navigate('/categories')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Parcourir les catégories
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SearchResult;