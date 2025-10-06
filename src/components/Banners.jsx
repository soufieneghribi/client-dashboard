import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../store/slices/banners";

const Banners = () => {
  const { banners = [], loading, error } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Aller à la slide précédente
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  // Aller à la slide suivante
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide toutes les 3 secondes
  useEffect(() => {
    const timer = setTimeout(nextSlide, 3000);
    return () => clearTimeout(timer);
  }, [currentIndex, banners.length]);

  if (loading) return <p>Loading banners...</p>;
  if (error) return <p>Failed to load banners. Please try again.</p>;
  if (banners.length === 0) return <p>No banners found.</p>;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <img
              src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${banner.image_path}`}
              alt={banner.title || "Banner Image"}
              className="w-full h-[400px] object-cover" 
              // 👉 tu peux changer h-[400px] en ce que tu veux (ex: h-[250px], h-[600px], h-screen...)
            />
          </div>
        ))}
      </div>

      {/* Bouton précédent */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
      >
        ❮
      </button>

      {/* Bouton suivant */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
      >
        ❯
      </button>

      {/* Indicateurs */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition ${
              currentIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banners;
