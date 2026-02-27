import React from "react";

const BrandCarousel = ({
    brandSlides,
    brandIndex,
    setIsPaused,
    prevBrandSlide,
    nextBrandSlide,
    setBrandIndex
}) => {
    return (
        <section className="pt-14 border-t border-gray-200">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Nos Marques Partenaires
                </h2>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                    Retrouvez vos marques préférées et découvrez des produits de qualité
                </p>
            </div>

            <div
                className="relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="overflow-hidden">
                    {brandSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`flex justify-center gap-4 md:gap-6 transition-all duration-500 ease-in-out ${index === brandIndex ? "opacity-100 block" : "opacity-0 hidden"
                                }`}
                        >
                            {slide.map((brand) => (
                                <div
                                    key={brand.id}
                                    className="relative h-32 flex-1 min-w-0 rounded-xl shadow-md overflow-hidden cursor-pointer group transform transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 flex items-center justify-center p-3 bg-transparent">
                                        <img
                                            src={brand.img}
                                            alt={brand.name}
                                            className="w-full h-full object-contain max-h-24 transition-transform duration-300 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/150x100?text=" + brand.name;
                                            }}
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="absolute bottom-0 w-full py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2">
                                            <span className="text-sm font-semibold text-white px-2">
                                                {brand.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {brandSlides.length > 1 && (
                    <>
                        <button
                            onClick={prevBrandSlide}
                            className="absolute left-0 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                            aria-label="Marques précédentes"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextBrandSlide}
                            className="absolute right-0 md:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                            aria-label="Marques suivantes"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {brandSlides.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {brandSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setBrandIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${brandIndex === idx ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
                                    }`}
                                aria-label={`Aller au slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-600 italic">
                    Partenaires de confiance pour des produits de qualité exceptionnelle
                </p>
            </div>
        </section>
    );
};

export default BrandCarousel;
