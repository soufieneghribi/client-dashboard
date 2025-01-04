import React, { useState } from "react";
import Timer from "../components/Timer";

const MesDeals = () => {
  const images = [
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
    <nav className="bg-orange-360 flex flex-row justify-end ">
      <div className="border bg-white px-4 py-2 m-2 rounded-2xl shadow-xl text-center font-bold text-xl font-limon-milk">
        <p>Cagnotte</p>
        <p>0 DT</p>
      </div>
    </nav>
    <div className="relative w-full h-fit m-auto">
      {/* Carousel Image */}
      <div className="overflow-hidden rounded-lg">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-auto"
        />
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
      >
        &#10094;
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
      >
        &#10095;
      </button>

      {/* Indicators */}
      <div className="flex justify-center mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 mx-1 rounded-full ${
              currentIndex === index ? "bg-blue-500" : "bg-gray-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Timer initialSeconds={300} /> {/* 5-minute timer */}
    </div>
    </>
  );
};

export default MesDeals;
