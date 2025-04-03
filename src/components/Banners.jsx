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

  // Handle the previous slide
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Handle the next slide
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Auto-transition the slides every 3 seconds
  useEffect(() => {
    const slideTimeout = setTimeout(() => {
      nextSlide(); // Move to the next slide after 3 seconds
    }, 3000); // Change slide every 3 seconds (3000 ms)

    return () => clearTimeout(slideTimeout); // Cleanup the timeout when component unmounts or when the currentIndex changes
  }, [currentIndex]); // Depend on currentIndex so the slide changes after each transition

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
                  key={banner.id} // Assuming banners have a unique id
                  src={banner.image_path ? `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${banner.image_path}` : 'https://via.placeholder.com/150'}
                  alt={banner.title || "Banner Image"}
                  className="w-full object-cover sm:h-50 md:h-50 lg:h-50 xl:h-96"
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

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-lg"
        >
          &lt;
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-lg"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Banners;
