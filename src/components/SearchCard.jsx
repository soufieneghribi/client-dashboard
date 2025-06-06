import React from 'react';

const SearchCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all w-full max-w-sm">
      <img
        src={product.image || 'https://via.placeholder.com/150'}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
      <p className="text-gray-600 mt-1">{product.description?.slice(0, 100) || 'No description'}</p>
      <p className="text-blue-600 font-bold mt-2">{product.price ? `${product.price} د.ت` : 'غير متوفر'}</p>
    </div>
  );
};

export default SearchCard;
