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
    <div>
      <div id="default-carousel" className="overflow-hidden shadow-lg ">
        {/* Carousel wrapper */}
        <div className="">
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              className={`duration-700 ease-in-out ${currentIndex === slideIndex ? "block" : "hidden"} `}
            >
              {slide.map((banner) => (
                <img
                  key={banner.id} // Assuming banners have a unique id
                  src={banner.image_path ? `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${banner.image_path}` : 'https://via.placeholder.com/150'}
                  alt={banner.title || "Banner Image"}
                  className="h-[150px] sm:h-[180px] md:h-[250px] lg:h-[350px] xl:h-[400px] w-full object-cover"/>
              ))}
            </div>
          ))}
        </div>

        

      </div>
    </div>
  );
};

export default Banners;
