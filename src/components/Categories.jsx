import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { Link, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

import SubCategory from "./SubCategory";

const Categories = () => {
  const { categories = [], loading, error } = useSelector(
    (state) => state.categorie
  );
  const [subCategory, setSubCategory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerRow, setItemsPerRow] = useState(getItemsPerRow());
  const [show, setShow] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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
    if (window.innerWidth >= 720 && window.innerWidth < 1024) return 3;
    return 6;
  }

  const filteredCategories = categories.filter(
    (category) => category.parent_id === 0 && category.id !== 1
  );

  const slides = filteredCategories.reduce((acc, category, index) => {
    const slideIndex = Math.floor(index / itemsPerRow);
    if (!acc[slideIndex]) {
      acc[slideIndex] = [];
    }
    acc[slideIndex].push(category);
    return acc;
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleMouseEnter = (id, title) => {
    if (hoverTimeout) clearTimeout(hoverTimeout); // Clear timeout to prevent flickering
    setSubCategory(categories.filter((category) => category.parent_id === id));
    setCategoryTitle(title);
    setShow(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, 300); // Delay hiding to prevent flickering
    setHoverTimeout(timeout);
  };

  return (
    <div className="w-full overflow-hidden">
    {loading ? (
      <p className="text-center text-gray-500">Loading categories...</p>
    ) : error ? (
      <p className="text-center text-red-500">Error fetching categories.</p>
    ) : categories.length > 0 && (
      <div className="relative mx-auto rounded-lg">
        <div className="relative h-64 md:h-80 mx-4">
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              className={`duration-700 ease-in-out ${
                currentIndex === slideIndex ? "flex" : "hidden"
              } justify-center`}
            >
              {slide.map((category) => {
                const imageUrl = `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${category.picture}`;
                return (
                  <div
                    key={category.id}
                    className="bg-white p-3 rounded-lg shadow-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 m-2"
                    onMouseEnter={() => handleMouseEnter(category.id, category.title)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      src={imageUrl}
                      alt={category.name || `Image of ${category.title}`}
                      className="object-contain w-full h-32 md:h-40 lg:h-48 rounded-md"
                    />
                    <button className="text-sm md:text-base lg:text-lg font-semibold text-gray-800 mt-2 block text-center">
                      {category.title.length > 12 ?category.title.slice(0, 12) + "..." : category.title}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
  
        {/* Boutons de navigation affichés uniquement si plusieurs slides */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="flex absolute top-1/3 sm:top-1/3 lg:top-0 -left-2  items-center justify-center w-10  h-12 sm:h-16 lg:h-72  bg-blue-360  text-white rounded-full hover:bg-gray-300 focus:outline-none transition z-10"
              onClick={prevSlide}
            >
              <i class="fa-solid fa-caret-left"></i>
            </button>
            <button
              type="button"
              className="flex absolute top-1/3 sm:top-1/3 lg:top-0  -right-2 items-center justify-center w-10 h-12 sm:h-16 lg:h-72 bg-blue-360  text-white rounded-full hover:bg-gray-300 focus:outline-none transition z-10"
              onClick={nextSlide}
            >
             <i class="fa-solid fa-caret-right"></i>          
            </button>
          </>
        )}
      </div>
    )}
  
    {/* Sous-catégories avec animation */}
    {show && subCategory.length > 0 && (
      <div
        id="example-collapse-text"
        className="transition-opacity duration-500 ease-in-out opacity-100"
        onMouseEnter={() => clearTimeout(hoverTimeout)}
        onMouseLeave={handleMouseLeave}
      >
        <SubCategory data={subCategory} categorie={categoryTitle} />
      </div>
    )}
  </div>
  );
};

export default Categories;
