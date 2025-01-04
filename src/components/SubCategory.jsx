import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useNavigate, useParams } from 'react-router-dom';

const SubCategory = ({ data, categorie }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const itemPerSlide = 4;

  // Ensure data is passed as an array of subcategories
  if (!data || data.length === 0) {
    return <p>No subcategories available</p>;
  }

  // Group subcategories into slides
  const slides = data.reduce((acc, subcategory, index) => {
    const slideIndex = Math.floor(index / itemPerSlide);
    if (!acc[slideIndex]) {
      acc[slideIndex] = [];
    }
    acc[slideIndex].push(subcategory);
    return acc;
  }, []);

  // Handle filtering products based on the subcategory ID
  const handleSubCategoryClick = (id, title) => {
    setSelectedSubCategory({ id, title });
  };

  // Navigate to /products when a subcategory is selected
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
    <div className="mx-auto py-12 w-full">
      <div className="relative w-full mx-auto rounded-lg overflow-hidden">
       <div className="relative h-80 md:h-96 mx-8"> 
        {slides.map((subcategoryGroup, slideIndex) => (
            <div key={slideIndex} className={`duration-700 ease-in-out justify-around ${currentIndex === slideIndex ? "flex" : "hidden"}`}>
              {subcategoryGroup.map((subcategory, index) => (
                <div key={subcategory.id} className="grid m-4 w-1/4 ">
                  <img
                    className="d-block w-100"
                    src={subcategory.picture || 'https://via.placeholder.com/800x400'}
                    alt={subcategory.title || `Subcategory ${index + 1}`}
                  />
                  <button
                      onClick={() => handleSubCategoryClick(subcategory.id, subcategory.title)}
                      className=" flex flex-row justify-center items-center mt-2 bg-blue-360 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                  >{subcategory.title }</button>
                </div>
              ))}
            </div>
          ))}
      </div>
     {/* Slider indicators */}
     <div className="flex absolute bottom-5 left-1/2 z-30 -translate-x-1/2 space-x-2">
       {slides.map((_, idx) => (
       <button
       key={idx}
       className={`w-3 h-3 rounded-full ${currentIndex === idx ? "bg-blue-500" : "bg-gray-300"}`}
       onClick={() => setCurrentIndex(idx)}
       ></button>
       ))}
     </div>

    {/* Slider controls */}
     <button
       type="button"
       className="flex absolute top-0 -left-2 z-40 items-center justify-center w-10 h-10 bg-blue-360 rounded-full hover:bg-gray-300 focus:outline-none transition"
       onClick={prevSlide}
      >
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
      </svg>
     </button>
    <button
    type="button"
    className="flex absolute top-0 -right-2 items-center justify-center w-10 h-10 bg-blue-360 rounded-full hover:bg-gray-300 focus:outline-none transition"
    onClick={nextSlide}
    >
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
    </button>
  </div>
</div>
  );
};

export default SubCategory;
