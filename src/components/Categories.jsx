import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Categories = () => {
  const { categories = [], loading, error } = useSelector(
    (state) => state.categorie
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Adapter le nombre d'éléments par slide selon la taille écran
  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function getItemsPerSlide() {
    if (window.innerWidth < 640) return 2; // mobile
    if (window.innerWidth < 1024) return 3; // tablette
    return 5; // desktop
  }

  const filteredCategories = categories.filter(
    (category) => category.parent_id === 0 && category.id !== 1
  );

  // Découpe les catégories en slides
  const slides = filteredCategories.reduce((acc, cat, i) => {
    const slideIndex = Math.floor(i / itemsPerSlide);
    if (!acc[slideIndex]) acc[slideIndex] = [];
    acc[slideIndex].push(cat);
    return acc;
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleCategoryClick = (id, title) => {
    navigate(`/subcategory/${id}`, { state: { categoryTitle: title } });
  };

  return (
    <div className="relative w-full px-4 mt-6">
      {loading ? (
        <p className="text-center text-gray-500">Chargement des catégories...</p>
      ) : error ? (
        <p className="text-center text-red-500">Erreur lors du chargement.</p>
      ) : (
        <>
          {/* Slides */}
          <div className="overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`flex justify-center gap-4 transition-all duration-500 ${
                  index === currentIndex ? "opacity-100" : "hidden opacity-0"
                }`}
              >
                {slide.map((category) => (
                  <div
                    key={category.id}
                    className="relative h-32 sm:h-36 lg:h-40 flex-1 rounded-xl shadow-md overflow-hidden cursor-pointer group"
                    style={{
                      backgroundImage: `url(https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${category.picture})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    onClick={() =>
                      handleCategoryClick(category.id, category.title)
                    }
                  >
                    <div className="absolute bottom-0 w-full bg-white/80 backdrop-blur-sm py-2 text-center group-hover:bg-white/95 transition">
                      <span className="text-sm md:text-base font-semibold text-gray-800">
                        {category.title.length > 14
                          ? category.title.slice(0, 14) + "..."
                          : category.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Boutons navigation */}
          {slides.length > 1 && (
            <>
              <button
                className="absolute top-1/3 -left-2 flex items-center justify-center w-10 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                onClick={prevSlide}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                className="absolute top-1/3 -right-2 flex items-center justify-center w-10 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                onClick={nextSlide}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </>
          )}

          {/* Indicateurs (petits points) */}
          <div className="flex justify-center mt-3 space-x-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  currentIndex === idx ? "bg-blue-600" : "bg-gray-300"
                }`}
                onClick={() => setCurrentIndex(idx)}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;
