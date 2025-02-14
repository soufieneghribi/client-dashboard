import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SubCategory = ({ data }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const itemsPerRow = useWindowWidth(); // Use custom hook for window resize logic

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No subcategories available</p>;
  }

  const slides = data.reduce((acc, subcategory, index) => {
    const slideIndex = Math.floor(index / itemsPerRow);
    if (!acc[slideIndex]) {
      acc[slideIndex] = [];
    }
    acc[slideIndex].push(subcategory);
    return acc;
  }, []);

  const handleSubCategoryClick = (id, title) => {
    setSelectedSubCategory({ id, title });
  };

  useEffect(() => {
    if (selectedSubCategory) {
      navigate('/products', {
        state: { subId: selectedSubCategory.id, subTitle: selectedSubCategory.title },
      });
    }
  }, [selectedSubCategory, navigate]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="container m-auto p-auto ">
      <div className="relative">
        {/* Slides */}
        <div className="relative h-auto md:h-[500px]">
          {slides.map((subcategoryGroup, slideIndex) => (
            <div
              key={slideIndex}
              className={`absolute inset-0 duration-700 ease-in-out transform ${
                currentIndex === slideIndex ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              } flex justify-center items-center`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {subcategoryGroup.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="group relative bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        loading="lazy"
                        className="w-full h-56 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                        src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${subcategory.picture}`}
                        alt={subcategory.title || 'Subcategory'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                        <h3 className="text-white font-bold text-lg">{subcategory.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <button
                        aria-label={`Explore ${subcategory.title}`}
                        onClick={() => handleSubCategoryClick(subcategory.id, subcategory.title)}
                        className="bg-gradient-to-r from-blue-360 to-orange-360 text-white px-4 py-2 rounded-md w-full font-semibold hover:opacity-90 focus:ring focus:ring-purple-300 transition"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        

        {/* Controls */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 -left-10 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4 rounded-full hover:opacity-90 shadow-lg focus:ring focus:ring-purple-300 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 -right-10 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4 rounded-full hover:opacity-90 shadow-lg focus:ring focus:ring-purple-300 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Custom hook for handling window resize logic
const useWindowWidth = () => {
  const [itemsPerRow, setItemsPerRow] = useState(getItemsPerRow());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerRow(getItemsPerRow());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function getItemsPerRow() {
    if (window.innerWidth < 720) return 1;
    if (window.innerWidth >= 720 && window.innerWidth < 1024) return 2;
    return 4;
  }

  return itemsPerRow;
};

export default SubCategory;
