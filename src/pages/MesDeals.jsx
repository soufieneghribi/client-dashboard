import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOffreById } from "../store/slices/offre.js";
import Depense from "../components/Depense";
import DealFrequence from "../components/DealFrequence.jsx";
import DealAnniversaire from "../components/DealAnniversaire.jsx";
import DealMarque from "../components/DealMarque.jsx";
import { fetchUserProfile } from "../store/slices/user";

const MesDeals = () => {
  const images = [
    "./src/assets/allmarque.jpg", // Adjust paths if necessary (use public folder)
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
  ];

  // Get data from Redux store
  const { offre = [], loading, error } = useSelector((state) => state.offre);
  const { Userprofile } = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetching user profile and offers
  useEffect(() => {
    dispatch(fetchUserProfile());

  }, [dispatch]);

  // Fetch offers when user profile is available
  useEffect(() => {
    if (Userprofile && Userprofile.ID_client) {
      dispatch(fetchOffreById(Userprofile.ID_client));
    }
  }, [dispatch, Userprofile]);

  const deal = offre.data || [];
  
  // Handle Next Image in Carousel
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Handle Previous Image in Carousel
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Function to calculate the time difference between the current date and the deal end date
  const calculateTimeLeft = (dealEndDate) => {
    const endDate = new Date(dealEndDate); 
    const timeDifference = endDate - new Date(); 

    if (timeDifference <= 0) return null; // If the deal is already expired, return null

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  return (
    <>
    <div>
     {auth.isLoggedIn ? (
      <nav className="bg-orange-360 flex flex-row justify-end h-16">
        <div className="border bg-white p-2 m-1 rounded-xl shadow-xl text-center font-medium text-sm font-limon-milk">
          <p>Cagnotte</p>
          <p>{Userprofile ? Userprofile.cagnotte_balance : "Chargement..." } DT</p>
        </div>
      </nav>
    ):""}

      {/* Carousel Section */}
      <div className="relative  overflow-hidden shadow-lg ">
        <div className=" rounded-lg">
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className=" h-[150px] sm:h-[180px] md:h-[250px] lg:h-[350px] xl:h-[400px] w-full object-cover"
          />
        </div>

        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          aria-label="Previous Image"
        >
          &#10094;
        </button>
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          aria-label="Next Image"
        >
          &#10095;
        </button>

        <div className="flex justify-center mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 mx-1 rounded-full ${currentIndex === index ? "bg-blue-500" : "bg-gray-400"}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Flash Sale Timer & Deals */}
      {auth.isLoggedIn && (

      deal.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2  bg-white w-full sm:h-20 md:h-full ">
          {deal.map((el) => {
            const timeLeft = calculateTimeLeft(el.date_fin); 
            if (el.type_offre === "deal_depense") {
              return <Depense key={el.id} Time={timeLeft} />;
            } else if (el.type_offre === "deal_frequence") {
              return <DealFrequence key={el.id} Time={timeLeft} />;
            } else if (el.type_offre === "deal_anniversaire") {
              return <DealAnniversaire key={el.id} Time={timeLeft} />;
            } else if (el.type_offre === "deal_marque") {
              return <DealMarque key={el.id} Time={timeLeft} />;
            }
            return null; // Fallback case if none of the conditions match
          })}
        </div>
      ) : (
        <div className="grid items-center text-center">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p className="text-blue-950 font-semibold">Aucune offre active</p>
          <p className="text-orange-360 font-medium">Venez vérifier plus tard!</p>
        </div>
      )
    )}
    </div>
    </>
  );
};

export default MesDeals;
