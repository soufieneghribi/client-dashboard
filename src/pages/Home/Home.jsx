import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/slices/categorie";
import { fetchRecommendedProduct } from "../../store/slices/recommended";
import { selectIsLoggedIn, selectUser } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import FeaturedRecipes from "../../components/FeaturedRecipes";
import Banners from "../../components/Banners";
import Popular from "../../components/Popular";
import { getImageUrl } from "../../utils/imageHelper";
import FeatureCarousel from "../../components/FeatureCarousel";

// Sub-components
import UniverseSelector from "./components/UniverseSelector";
import CategoryCarousel from "./components/CategoryCarousel";
import BrandCarousel from "./components/BrandCarousel";

// 🔹 Brands
import deliceImg from "../../assets/delice.jpg";
import lilasImg from "../../assets/lilas.jpg";
import nejmaImg from "../../assets/nejma.jpg";
import jadidaImg from "../../assets/jadida.jpg";
import natilaitImg from "../../assets/natilait.jpg";
import signalImg from "../../assets/signal.jpg";
import KolyoumImg from "../../assets/images/Kolyoum.png";
import MGJaimeImg from "../../assets/images/mgjaime.jpg";

const Home = () => {
    const { categories = [], loading: categoriesLoading, error: categoriesError } = useSelector((state) => state.categorie);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedUniverse, setSelectedUniverse] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());
    const [brandIndex, setBrandIndex] = useState(0);
    const [brandsPerSlide, setBrandsPerSlide] = useState(getBrandsPerSlide());
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchRecommendedProduct());
    }, [dispatch]);



    function getItemsPerSlide() {
        if (window.innerWidth < 640) return 2;
        if (window.innerWidth < 1024) return 3;
        return 5;
    }

    function getBrandsPerSlide() {
        if (window.innerWidth < 640) return 2;
        if (window.innerWidth < 768) return 3;
        if (window.innerWidth < 1024) return 4;
        return 5;
    }

    const getCategoryImageUrl = (cat) => getImageUrl(cat, 'category');

    const filteredCategories = categories.filter((category) => {
        if (selectedUniverse === 2) return category.parent_id === 144;
        // Si c'est Épicerie (null)
        return category.parent_id === 0 && category.id !== 1 && (category.universe_id === 1 || !category.universe_id);
    });

    const slides = filteredCategories.reduce((acc, cat, i) => {
        const slideIdx = Math.floor(i / itemsPerSlide);
        if (!acc[slideIdx]) acc[slideIdx] = [];
        acc[slideIdx].push(cat);
        return acc;
    }, []);

    const brands = [
        { id: 1, img: deliceImg, name: "Délice" },
        { id: 2, img: lilasImg, name: "Lilas" },
        { id: 3, img: nejmaImg, name: "Nejma" },
        { id: 4, img: jadidaImg, name: "Jadida" },
        { id: 5, img: natilaitImg, name: "Natilait" },
        { id: 7, img: signalImg, name: "Signal" },
        { id: 8, img: KolyoumImg, name: "Kolyoum" },
        { id: 9, img: MGJaimeImg, name: "MG Jaime" },
    ];

    const brandSlides = brands.reduce((acc, brand, i) => {
        const slideIdx = Math.floor(i / brandsPerSlide);
        if (!acc[slideIdx]) acc[slideIdx] = [];
        acc[slideIdx].push(brand);
        return acc;
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerSlide(getItemsPerSlide());
            setBrandsPerSlide(getBrandsPerSlide());
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => slides.length ? (prev + 1) % slides.length : 0);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length, isPaused]);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setBrandIndex((prev) => brandSlides.length ? (prev + 1) % brandSlides.length : 0);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, brandSlides.length]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedUniverse]);

    const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    const nextSlide = () => setCurrentIndex((prev) => prev === slides.length - 1 ? 0 : prev + 1);
    const prevBrandSlide = () => setBrandIndex((prev) => (prev === 0 ? brandSlides.length - 1 : prev - 1));
    const nextBrandSlide = () => setBrandIndex((prev) => (prev === brandSlides.length - 1 ? 0 : prev + 1));

    const handleCategoryClick = (id, title) => {
        navigate(`/categories?categoryId=${id}`, { state: { categoryTitle: title } });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-16">


                <Banners />

                <UniverseSelector selectedUniverse={selectedUniverse} setSelectedUniverse={setSelectedUniverse} />

                <CategoryCarousel
                    categoriesLoading={categoriesLoading}
                    categoriesError={categoriesError}
                    filteredCategories={filteredCategories}
                    slides={slides}
                    currentIndex={currentIndex}
                    setIsPaused={setIsPaused}
                    getCategoryImageUrl={getCategoryImageUrl}
                    handleCategoryClick={handleCategoryClick}
                    prevSlide={prevSlide}
                    nextSlide={nextSlide}
                />

                <section>
                    <Popular selectedUniverse={selectedUniverse} />
                </section>

                <section className="px-2">
                    <FeatureCarousel />
                </section>

                <section className="pt-8 border-t border-gray-200">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-3"> Recettes en Vedette </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto"> Découvrez nos délicieuses recettes et inspirations culinaires </p>
                    </div>
                    <FeaturedRecipes />
                </section>

                <BrandCarousel
                    brandSlides={brandSlides}
                    brandIndex={brandIndex}
                    setIsPaused={setIsPaused}
                    prevBrandSlide={prevBrandSlide}
                    nextBrandSlide={nextBrandSlide}
                    setBrandIndex={setBrandIndex}
                />
            </div>
        </div>
    );
};

export default Home;
