import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SubCategory = ({ data }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [itemsPerRow, setItemsPerRow] = useState(getItemsPerRow());

  // Update number of items per row based on window size
  useEffect(() => {
    const handleResize = () => {
      setItemsPerRow(getItemsPerRow());
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determine how many items to display per row based on window width
  function getItemsPerRow() {
    if (window.innerWidth < 720) return 1;
    if (window.innerWidth >= 720 && window.innerWidth < 1024) return 3;
    return 4;
  }

  // Organize data into slides based on items per row
  const slides = data.reduce((acc, subcategory, index) => {
    const slideIndex = Math.floor(index / itemsPerRow);
    if (!acc[slideIndex]) {
      acc[slideIndex] = [];
    }
    acc[slideIndex].push(subcategory);
    return acc;
  }, []);

  // Handle click on a subcategory to navigate
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

  // Slide transition logic
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Automatically move to the next slide after a timeout
  useEffect(() => {
    const slideTimeout = setTimeout(() => {
      nextSlide(); // Move to the next slide after the timeout
    }, 3000); // Set a delay of 3 seconds (3000ms)

    return () => clearTimeout(slideTimeout); // Cleanup the timeout when the component unmounts or when the currentIndex changes
  }, [currentIndex]);

  return (
    <div className="container mx-auto ">
      {/* Slides */}
      <div className="relative">
        <div className="relative h-[200px] sm:h-[500px] lg:h-[200px] xl:h-[200px]">
          {slides.map((subcategoryGroup, slideIndex) => (
            <div
              key={slideIndex}
              className={`absolute inset-0 duration-700 ease-in-out transform ${
                currentIndex === slideIndex ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              } flex justify-center items-start`}
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
                        className="w-32 h-32 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                        src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${subcategory.picture}`}
                        alt={subcategory.title || 'Subcategory'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                        <h3 className="text-white font-semibold text-base">{subcategory.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <button
                        aria-label={`Explore ${subcategory.title}`}
                        onClick={() => handleSubCategoryClick(subcategory.id, subcategory.title)}
                        className="bg-gradient-to-r from-blue-360 to-orange-360 text-white px-2 py-1 rounded-md w-full font-semibold hover:opacity-90 focus:ring focus:ring-purple-300 transition"
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
</div>
    </div>
  );
};

export default SubCategory;
