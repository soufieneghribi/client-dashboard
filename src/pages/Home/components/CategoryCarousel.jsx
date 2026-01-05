import React from "react";

const CategoryCarousel = ({
    categoriesLoading,
    categoriesError,
    filteredCategories,
    slides,
    currentIndex,
    setIsPaused,
    getCategoryImageUrl,
    handleCategoryClick,
    prevSlide,
    nextSlide
}) => {
    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Nos Catégories
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Découvrez notre large sélection de produits organisés par catégories
                </p>
            </div>

            {categoriesLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : categoriesError ? (
                <div className="text-center py-8">
                    <p className="text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg">
                        Erreur lors du chargement des catégories
                    </p>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        Aucune catégorie disponible pour le moment
                    </p>
                </div>
            ) : (
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="overflow-hidden rounded-2xl">
                        {slides.map((slide, slideIdx) => (
                            <div
                                key={slideIdx}
                                className={`flex justify-center gap-4 transition-all duration-500 ease-in-out ${slideIdx === currentIndex ? "opacity-100 block" : "opacity-0 hidden"
                                    }`}
                            >
                                {slide.map((category) => (
                                    <div
                                        key={category.id}
                                        className="relative h-36 sm:h-40 lg:h-44 flex-1 min-w-0 rounded-xl shadow-md overflow-hidden cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                        style={{
                                            backgroundImage: `url(${getCategoryImageUrl(category)})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                        onClick={() => handleCategoryClick(category.id, category.title)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                                        <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-sm py-3 text-center group-hover:bg-white/95 transition-all duration-300">
                                            <span className="text-sm md:text-base font-semibold text-gray-800 px-2">
                                                {category.title.length > 14
                                                    ? category.title.slice(0, 14) + "..."
                                                    : category.title}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                Voir les produits
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {slides.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

export default CategoryCarousel;
