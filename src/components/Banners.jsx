import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../store/slices/banners";

const Banners = () => {
  const { banners = [], loading, error } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = 1; // Number of items per slide
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Group banners into slides
  const slides = banners.reduce((acc, banner, index) => {
    const slideIndex = Math.floor(index / itemsPerSlide);
    if (!acc[slideIndex]) {
      acc[slideIndex] = [];
    }
    acc[slideIndex].push(banner);
    return acc;
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <p>Loading banners...</p>;
  if (error) return <p>Failed to load banners. Please try again.</p>;

  return (
    <div className="w-full mx-auto">
      <div id="default-carousel" className="relative rounded-lg overflow-hidden shadow-lg">
        {/* Carousel wrapper */}
        <div className="relative h-auto md:h-auto">
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              className={`duration-700 ease-in-out ${currentIndex === slideIndex ? "block" : "hidden"}`}
            >
              {slide.map((banner) => (
                <img
                src={banner.image_path ? `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${banner.image_path}` : 'https://via.placeholder.com/150'}
                alt={banner.title || "Banner Image"}
                className="w-full h-auto object-cover"
              />
              ))}
            </div>
          ))}
        </div>

        {/* Slider indicators */}
        <div className="flex absolute bottom-5 left-1/2 z-30 -translate-x-1/2 space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`w-3 h-3 rounded-full ${currentIndex === idx ? "bg-blue-500" : "bg-gray-300"}`}
              onClick={() => setCurrentIndex(idx)}
            ></button>
          ))}
        </div>

        {/* Slider controls */}
        <button
          type="button"
          className="flex absolute top-1/2 left-3 z-40 items-center justify-center w-10 h-10 bg-gray-200/50 rounded-full hover:bg-gray-300 focus:outline-none transition"
          onClick={prevSlide}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          type="button"
          className="flex absolute top-1/2 right-3 z-40 items-center justify-center w-10 h-10 bg-gray-200/50 rounded-full hover:bg-gray-300 focus:outline-none transition"
          onClick={nextSlide}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Banners;
