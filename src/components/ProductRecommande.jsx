import React from 'react'

const ProductRecommande = () => {
  const products = [
    { id: 1, name: "Produit A", price: 29.99 },
    { id: 2, name: "Produit B", price: 49.99 },
    { id: 3, name: "Produit C", price: 19.99 },
  ];
  return (
    <div>
      <p>Recommandé</p>
      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-700">Prix: ${product.price}</p>
            <button
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => addToCart(product)}
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>

    
    
    
    
    
    
    
    
    </div>
  )
}

export default ProductRecommande