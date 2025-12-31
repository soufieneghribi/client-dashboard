import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../store/slices/banners";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

const Banners = () => {
  const { banners = [], loading, error } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Filter out type 4 banners which are low quality/mobile only
  const visibleBanners = banners.filter(b => b.type !== 4 && b.type_id !== 4);

  // Image URL Helper is now centralized
  const getBannerImageUrl = (b) => getImageUrl(b, 'banner');

  // Aller à la slide précédente
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? visibleBanners.length - 1 : prev - 1));
  };

  // Aller à la slide suivante
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === visibleBanners.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide toutes les 3 secondes
  useEffect(() => {
    if (visibleBanners.length === 0) return;
    const timer = setTimeout(nextSlide, 3000);
    return () => clearTimeout(timer);
  }, [currentIndex, visibleBanners.length]);

  if (loading) return <p>Loading banners...</p>;
  if (error) return <p>Failed to load banners. Please try again.</p>;
  if (visibleBanners.length === 0) return <p>No banners found.</p>;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {visibleBanners.map((banner, index) => (
          <div key={banner.id || index} className="w-full flex-shrink-0">
            <img
              src={getBannerImageUrl(banner)}
              alt={banner.title || banner.name || "Banner Image"}
              className="w-full object-cover h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]"
              onError={(e) => {
                console.error(`❌ Failed to load banner image: ${banner.title || banner.name}`, banner);
                e.target.src = 'https://via.placeholder.com/1200x400?text=Image+Non+Disponible';
              }}
            // Responsive heights:
            // Mobile (< 640px): 200px
            // Small tablet (640px - 768px): 250px
            // Tablet (768px - 1024px): 300px
            // Desktop (> 1024px): 400px
            />
          </div>
        ))}
      </div>

      {/* Bouton précédent */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all duration-200 z-10"
        aria-label="Slide précédent"
      >
        <span className="text-lg sm:text-xl">❮</span>
      </button>

      {/* Bouton suivant */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all duration-200 z-10"
        aria-label="Slide suivant"
      >
        <span className="text-lg sm:text-xl">❯</span>
      </button>

      {/* Indicateurs */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {visibleBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition ${currentIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banners;