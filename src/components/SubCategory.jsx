import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../store/slices/categorie';

const SubCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categorie);

  const [subCategory, setSubCategory] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState("Sous-catégories");

  // Charger les catégories si elles ne sont pas disponibles
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  // Filtrer et afficher les sous-catégories
  useEffect(() => {
    if (categories && categories.length > 0 && id) {
      const categoryId = parseInt(id);
      
      // Filtrer les sous-catégories
      const filtered = categories.filter((cat) => cat.parent_id === categoryId);
      setSubCategory(filtered);

      // Trouver le titre de la catégorie parente
      const parentCategory = categories.find((cat) => cat.id === categoryId);
      if (parentCategory) {
        setCategoryTitle(parentCategory.title);
      }
    }
  }, [id, categories]);

  const handleSubCategoryClick = (subId, title) => {
    navigate('/products', {
      state: { subId, subTitle: title },
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-6 text-center">
        <p className="text-gray-600">Chargement des catégories...</p>
      </div>
    );
  }

  if (!id || isNaN(parseInt(id))) {
    return (
      <div className="container mx-auto mt-6 text-center">
        <p className="text-red-500">ID de catégorie invalide</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">{categoryTitle}</h2>
      {subCategory.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subCategory.map((subcategory) => (
            <div
              key={subcategory.id}
              className="bg-gray-100 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() => handleSubCategoryClick(subcategory.id, subcategory.title)}
            >
              <img
                src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${subcategory.picture}`}
                alt={subcategory.title}
                className="w-full h-32 object-cover rounded-t-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold">{subcategory.title}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucune sous-catégorie trouvée.</p>
      )}
    </div>
  );
};

export default SubCategory;