import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchProduct } from '../store/slices/search';
import SearchCard from './SearchCard';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query');
  const dispatch = useDispatch();

  const { searchResults, loading, error } = useSelector((state) => state.search);

  useEffect(() => {
    if (searchQuery?.trim()) {
      dispatch(SearchProduct(searchQuery));
    }
  }, [searchQuery, dispatch]);

  return (
    <div>
      {loading && <p>Loading..</p>}
      {error && <p style={{ color: 'red' }}>Error : {error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {searchResults.map((product) => (
          <SearchCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SearchResult;
