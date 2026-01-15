import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../store/slices/banners";
import { getImageUrl } from "../utils/imageHelper";

const Banners = () => {
  const { banners = [], loading, error } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(window.innerWidth >= 1024 ? 2 : 1);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(window.innerWidth >= 1024 ? 2 : 1);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create slides based on itemsPerSlide
  const slides = useMemo(() => {
    if (!banners || banners.length === 0) return [];
    const result = [];
    for (let i = 0; i < banners.length; i += itemsPerSlide) {
      result.push(banners.slice(i, i + itemsPerSlide));
    }
    return result;
  }, [banners, itemsPerSlide]);

  const getBannerImageUrl = (b) => getImageUrl(b, 'banner');

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  // Reset index if slides length changes due to resize
  useEffect(() => {
    setCurrentIndex(0);
  }, [slides.length]);

  if (loading) return (
    <div className="w-full h-48 sm:h-64 bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
      <p className="text-gray-400 font-medium tracking-wide">Chargement des bannières...</p>
    </div>
  );

  if (error || slides.length === 0) return null;

  return (
    <div className="relative w-full group">
      <div className="overflow-hidden rounded-2xl shadow-xl">
        <div
          className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, slideIdx) => (
            <div key={slideIdx} className="w-full flex-shrink-0 flex gap-4">
              {slide.map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  className={`relative flex-1 ${itemsPerSlide > 1 ? 'aspect-[16/9]' : 'aspect-auto'}`}
                  style={{ height: itemsPerSlide > 1 ? 'auto' : 'clamp(200px, 40vw, 400px)' }}
                >
                  <img
                    src={getBannerImageUrl(banner)}
                    alt={banner.title || banner.name || "Banner"}
                    fetchpriority={slideIdx === 0 ? "high" : "auto"}
                    loading={slideIdx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    width={itemsPerSlide > 1 ? "600" : "1200"}
                    height="400"
                    className="w-full h-full object-cover rounded-xl bg-gray-50"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x450?text=Image+Indisponible';
                    }}
                  />
                  {/* Subtle overlay for better depth */}
                  <div className="absolute inset-0 bg-black/5 pointer-events-none rounded-xl"></div>
                </div>
              ))}
              {/* Fill empty space if last slide has fewer items than itemsPerSlide */}
              {itemsPerSlide > 1 && slide.length < itemsPerSlide && (
                <div className="flex-1 invisible" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 transform opacity-0 group-hover:opacity-100 hover:scale-110 z-20 hidden md:block"
            aria-label="Précédent"
          >
            <span className="text-xl">❮</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 transform opacity-0 group-hover:opacity-100 hover:scale-110 z-20 hidden md:block"
            aria-label="Suivant"
          >
            <span className="text-xl">❯</span>
          </button>

          {/* Indicators */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === index ? "w-8 bg-indigo-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Banners;
