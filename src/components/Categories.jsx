import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { Link, useNavigate } from "react-router-dom";
import SubCategory from "./SubCategory";

const Categories = () => {
  const { categories = [], loading, error } = useSelector(
    (state) => state.categorie
  );
  const [subCategory, setSubCategory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerRow, setItemsPerRow] = useState(getItemsPerRow());

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");

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
    (category) => (category.parent_id === 0 && category.id !=1)
  );

  // Grouper les catégories par diapositives
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

  const subHandler = (id, title) => {
    setShow(true);
    setSubCategory(categories.filter((category) => category.parent_id === id));
    setCategoryTitle(title);
  };
console.log({categories})
  return (
    <div className="mx-auto py-12 w-full">
      <h1 className="mx-10 text-blue-360 font-bold text-3xl mb-8">Categories</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading categories...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error fetching categories.</p>
      ) : categories.length > 0 ?  (
        <div className="relative w-full mx-auto rounded-lg overflow-hidden">
          {/* Carrousel */}
          <div className="relative h-80 md:h-96 mx-8">
            {slides.map((slide, slideIndex) => (
              <div
                key={slideIndex}
                className={`duration-700 ease-in-out ${
                  currentIndex === slideIndex ? "flex" : "hidden"
                } justify-center md:justify-start`}
              >
                {slide.map((category) => {
                  const imageUrl = `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${category.picture}`
                  console.log(imageUrl)
                  return (
                    <div
                      key={category.id}
                      className="bg-white p-4 rounded-lg shadow-xl w-full sm:w-1/2 lg:w-1/4 xl:w-1/6 mx-2 mb-4"
                      onClick={() => subHandler(category.id, category.title)}
                    >
                      <img
                        src= {imageUrl} // Assurez-vous que cette URL est correcte
                        alt={category.name || `Image of ${category.title}`}
                        className="object-cover w-full h-40 rounded-md"
                      />
                      <button className="text-lg font-semibold text-gray-800 mt-2 block text-center">
                        {category.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Indicateurs du carrousel */}
          

          {/* Contrôles du carrousel */}
          <button
            type="button"
            className="flex absolute top-0 -left-2 z-40 items-center justify-center w-10 h-72 bg-blue-360 rounded-full hover:bg-gray-300 focus:outline-none transition"
            onClick={prevSlide}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            className="flex absolute top-0 -right-2 items-center justify-center w-10 h-72 bg-blue-360 rounded-full hover:bg-gray-300 focus:outline-none transition"
            onClick={nextSlide}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
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
    </div>
  );
};

export default Categories;
