import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../store/slices/categorie';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { getImageUrl, handleImageError } from '../utils/imageHelper';

const AllCategories = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { categories = [], loading, error } = useSelector((state) => state.categorie);
    const [searchTerm, setSearchTerm] = useState('');

    // Récupérer l'universeId depuis location.state (1=Épicerie, 2=Électronique)
    const universeId = location.state?.universeId;

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const getCategoryImageUrl = (cat) => getImageUrl(cat, 'category');

    // Titre selon l'univers
    const getUniverseTitle = () => {
        if (universeId === 1) return '🛒 Catégories Épicerie';
        if (universeId === 2) return '📱 Catégories Électronique';
        return '📦 Toutes les Catégories';
    };

    // Filter categories: only parent categories (parent_id === 0) and exclude ID 1
    // Si universeId est fourni, filtrer par universe_id
    const parentCategories = categories.filter((category) => {
        const isParent = category.parent_id === 0 && category.id !== 1;
        if (universeId) {
            return isParent && category.universe_id === universeId;
        }
        return isParent;
    });

    // Filter by search term
    const filteredCategories = searchTerm
        ? parentCategories.filter((cat) =>
            cat.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : parentCategories;

    const handleCategoryClick = (id, title) => {
        navigate(`/categories?categoryId=${id}`, {
            state: { categoryTitle: title },
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement des catégories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 mb-4">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        Retour à l'accueil
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                                {getUniverseTitle()}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {filteredCategories.length} {filteredCategories.length === 1 ? 'catégorie disponible' : 'catégories disponibles'}
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher une catégorie..."
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <p className="text-red-800 font-medium">
                            Erreur lors du chargement des catégories
                        </p>
                    </div>
                )}

                {/* Categories Grid */}
                {filteredCategories.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-gray-300 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                            Aucune catégorie trouvée
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? `Aucune catégorie ne correspond à "${searchTerm}"`
                                : "Aucune catégorie disponible pour le moment"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {filteredCategories.map((category, index) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id, category.title)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group transform hover:scale-105"
                            >
                                {/* Image Section */}
                                <div className="relative h-32 bg-gray-100">
                                    <img
                                        src={getCategoryImageUrl(category)}
                                        alt={category.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => handleImageError(e, 'category')}
                                    />
                                    {/* Number Badge */}
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                    </div>
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Content Section */}
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-2 min-h-[2rem]">
                                        {category.title}
                                    </h3>

                                    {/* Explorer indicator */}
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <div className="w-4 h-1 bg-blue-600 rounded-full"></div>
                                        <span className="text-xs font-medium">Explorer</span>
                                        <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom Info */}
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-700">
                        💡 <strong>Astuce:</strong> Cliquez sur une catégorie pour découvrir ses sous-catégories et produits
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AllCategories;
