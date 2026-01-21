import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBanners } from "../store/slices/banners";
import { getImageUrl } from "../utils/imageHelper";

import lloydBanner from "../assets/images/lloyd_banner.jpg";
import visionBanner from "../assets/images/vision_banner.png";

const Banners = () => {
  const { banners = [], loading, error } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(window.innerWidth >= 1024 ? 2 : 1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Bannières manuelles (Statiques)
  const staticBanners = [
    {
      id: "manual-lloyd",
      title: "Lloyd Assurance",
      image_final: lloydBanner,
      link: "/code-promo/6",
      isStatic: true
    },
    {
      id: "manual-vision",
      title: "Vision Voyages",
      image_final: visionBanner,
      link: "/code-promo/7",
      isStatic: true
    }
  ];

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

  // Fusionner les bannières statiques et dynamiques
  const allBanners = useMemo(() => {
    return [...staticBanners, ...banners];
  }, [banners]);

  const slides = useMemo(() => {
    if (!allBanners || allBanners.length === 0) return [];
    const result = [];
    for (let i = 0; i < allBanners.length; i += itemsPerSlide) {
      result.push(allBanners.slice(i, i + itemsPerSlide));
    }
    return result;
  }, [allBanners, itemsPerSlide]);

  const handleBannerClick = (banner) => {
    if (banner.isStatic) {
      navigate(banner.link);
      return;
    }

    // Logique pour les bannières dynamiques
    const promoId = banner.code_promo_id || banner.link_id || banner.id;

  };

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

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides.length]);

  if (loading && allBanners.length === 0) return (
    <div className="w-full h-48 sm:h-64 bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
      <p className="text-gray-400 font-medium tracking-wide">Chargement des bannières...</p>
    </div>
  );

  if (allBanners.length === 0) return null;

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
                  className={`relative flex-1 ${itemsPerSlide > 1 ? 'aspect-[16/9]' : 'aspect-auto'} cursor-pointer group/banner overflow-hidden`}
                  style={{ height: itemsPerSlide > 1 ? 'auto' : 'clamp(200px, 40vw, 400px)' }}
                  onClick={() => handleBannerClick(banner)}
                >
                  <img
                    src={banner.image_final || getBannerImageUrl(banner)}
                    alt={banner.title || banner.name || "Banner"}
                    fetchpriority={slideIdx === 0 ? "high" : "auto"}
                    loading={slideIdx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    width={itemsPerSlide > 1 ? "600" : "1200"}
                    height="400"
                    className="w-full h-full object-cover rounded-xl bg-gray-50 transition-transform duration-700 group-hover/banner:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x450?text=Image+Indisponible';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover/banner:bg-black/0 transition-colors pointer-events-none rounded-xl"></div>
                </div>
              ))}
              {itemsPerSlide > 1 && slide.length < itemsPerSlide && (
                <div className="flex-1 invisible" />
              )}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-20"
            aria-label="Précédent"
          >
            <span className="text-lg sm:text-xl">❮</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-20"
            aria-label="Suivant"
          >
            <span className="text-lg sm:text-xl">❯</span>
          </button>
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
