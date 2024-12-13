import React, { useState } from "react";

const Categories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slides contenant des cartes
  const slides = [
    [
      { id: 1, image: "https://via.placeholder.com/300x200", title: "Card 1" },
      { id: 2, image: "https://via.placeholder.com/300x200", title: "Card 2" },
      { id: 3, image: "https://via.placeholder.com/300x200", title: "Card 3" },
    ],
    [
      { id: 4, image: "https://via.placeholder.com/300x200", title: "Card 4" },
      { id: 5, image: "https://via.placeholder.com/300x200", title: "Card 5" },
      { id: 6, image: "https://via.placeholder.com/300x200", title: "Card 6" },
    ],
    [
      { id: 7, image: "https://via.placeholder.com/300x200", title: "Card 7" },
      { id: 8, image: "https://via.placeholder.com/300x200", title: "Card 8" },
      { id: 9, image: "https://via.placeholder.com/300x200", title: "Card 9" },
    ],
  ];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative  mx-auto mt-10 w-full">
      {/* Carousel Container */}
      <h1 className="text-blue-360 mx-auto font-limon-milk text-3xl">Categories</h1>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            
            <div
              key={slideIndex}
              className="flex-shrink-0 flex w-full justify-around"
            >
              {slide.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg shadow-md w-1/3 mx-2 overflow-hidden"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {card.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Previous Button */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-orange-360 text-white  w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-800"
        onClick={prevSlide}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Next Button */}
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-orange-360 text-white  w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-800"
        onClick={nextSlide}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots (Indicators) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${
              currentIndex === idx ? "bg-gray-800" : "bg-gray-400"
            }`}
            onClick={() => setCurrentIndex(idx)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
