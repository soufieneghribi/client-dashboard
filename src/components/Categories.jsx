<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { Link, useNavigate } from "react-router-dom";
import SubCategory from "./SubCategory";

const Categories = () => {
  const { categories = [], loading, error } = useSelector((state) => state.categorie);
  const [subCategory, setSubCategory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  function getItemsPerRow() {
    if (window.innerWidth < 720) return 1;
    if (window.innerWidth > 720) return 6;
 
  }
// Nombre d'éléments par diapositive
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCategories = categories.filter((category) => category.parent_id === 0);

  // Grouper les catégories par diapositives
  const slides = filteredCategories.reduce((acc, category, index) => {
    const slideIndex = Math.floor(index / getItemsPerRow());
    if (!acc[slideIndex]) {
      acc[slideIndex] = [];
    }
    acc[slideIndex].push(category);
    return acc;
  }, []);
=======
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
>>>>>>> 06d2071aedc2d640779f181a96887cf7422a4cc9

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

<<<<<<< HEAD
  const subHandler = (id, title) => {
    setShow(!show);
    setSubCategory(categories.filter((category) => category.parent_id === id));
    setCategoryTitle(title);
  };

  return (
    <div className="mx-auto py-12 w-full">
      <h1 className="mx-10 text-blue-360 font-bold text-3xl mb-8">Categories</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading categories...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error fetching categories.</p>
      ) : categories.length > 0 ? (
        <div className="relative w-full mx-auto rounded-lg overflow-hidden">
          {/* Carrousel */}
          <div className="relative h-80 md:h-96 mx-8">
            {slides.map((slide, slideIndex) => (
              <div
                key={slideIndex}
                className={`duration-700 ease-in-out ${currentIndex === slideIndex ? "flex" : "hidden"} justify-center md:justify-start`}
              >
                {slide.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white p-4 rounded-lg shadow-xl w-full sm:w-1/2 lg:w-1/4 xl:w-1/6 mx-2 mb-4"
                    onClick={() => subHandler(category.id, category.title)}
                  >
                    <img
                      src={category.picture}
                      alt={category.name || `Image of ${category.title}`}
                      className="object-cover w-full h-40 rounded-md"
                    />
                    <button className="text-lg font-semibold text-gray-800 mt-2 block text-center">
                      {category.title}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Indicateurs du carrousel */}
          <div className="flex absolute bottom-5 left-1/2 z-30 -translate-x-1/2 space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${currentIndex === idx ? "bg-blue-500" : "bg-gray-300"}`}
                onClick={() => setCurrentIndex(idx)}
              ></button>
            ))}
          </div>

          {/* Contrôles du carrousel */}
          <button
            type="button"
            className="flex absolute top-0 -left-2 z-40 items-center justify-center w-10 h-72 bg-blue-360 rounded-full hover:bg-gray-300 focus:outline-none transition"
            onClick={prevSlide}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button
            type="button"
            className="flex absolute top-0 -right-2 items-center justify-center w-10 h-72 bg-blue-360 rounded-full hover:bg-gray-300 focus:outline-none transition"
            onClick={nextSlide}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500">No categories found.</p>
      )}

      {/* Affichage des sous-catégories */}
      {show && (
        <div>
          <SubCategory data={subCategory} categorie={categoryTitle} />
        </div>
      )}
=======
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
>>>>>>> 06d2071aedc2d640779f181a96887cf7422a4cc9
    </div>
  );
};

export default Categories;
