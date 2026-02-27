import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBanners } from "../store/slices/banners";

import lloydBanner from "../assets/images/lloyd_banner.jpg";
import visionBanner from "../assets/images/vision_banner.png";

const AUTOPLAY_INTERVAL = 5000;
const BANNER_IMG_BASE_URL = "https://storage.googleapis.com/tn360-asset/banners/";

const resolveBannerImageUrl = (banner) => {
  if (banner.image_final) return banner.image_final;
  if (banner.image_url && banner.image_url.startsWith("http")) return banner.image_url;
  const imagePath = banner.image_path || "";
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return BANNER_IMG_BASE_URL + (imagePath.startsWith("/") ? imagePath.substring(1) : imagePath);
};

const staticBanners = [
  { id: "manual-lloyd", title: "Lloyd Assurance", image_final: lloydBanner, link: "/code-promo/6", isStatic: true },
  { id: "manual-vision", title: "Vision Voyages", image_final: visionBanner, link: "/code-promo/7", isStatic: true },
];

function getItemsPerSlide() {
  if (typeof window === "undefined") return 2;
  return window.innerWidth < 768 ? 1 : 2;
}

const Banners = () => {
  const { banners = [], loading } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const allBanners = useMemo(() => [...staticBanners, ...banners], [banners]);

  const slides = useMemo(() => {
    const result = [];
    for (let i = 0; i < allBanners.length; i += itemsPerSlide) {
      result.push(allBanners.slice(i, i + itemsPerSlide));
    }
    return result;
  }, [allBanners, itemsPerSlide]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides.length]);

  const handleBannerClick = useCallback(
    (banner) => {
      if (banner.isStatic && banner.link) navigate(banner.link);
    },
    [navigate]
  );

  if (loading && allBanners.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center" style={{ height: "300px" }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (allBanners.length === 0) return null;

  return (
    <div className="w-full">
      {/* Carousel */}
      <div className="relative overflow-hidden rounded-2xl group">
        <div
          className="flex"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {slides.map((slide, slideIdx) => (
            <div
              key={slideIdx}
              className="w-full flex-shrink-0 flex gap-4"
            >
              {slide.map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  className="flex-1 min-w-0 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                  style={{ height: "300px" }}
                  onClick={() => handleBannerClick(banner)}
                >
                  <img
                    src={resolveBannerImageUrl(banner)}
                    alt={banner.title || "Banner"}
                    fetchpriority={slideIdx === 0 && idx === 0 ? "high" : "auto"}
                    loading={slideIdx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x220?text=Image+Indisponible";
                    }}
                  />
                </div>
              ))}
              {/* Placeholder si le dernier slide a moins d'items */}
              {slide.length < itemsPerSlide && <div className="flex-1 min-w-0" />}
            </div>
          ))}
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
              }}
              className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "w-6 h-2 bg-red-600"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banners;
