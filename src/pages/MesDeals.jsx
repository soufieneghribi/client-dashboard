import React, { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchOffre } from "../store/slices/offre.js";
import Depense from "../components/Depense";
import DealFrequence from "../components/DealFrequence.jsx";
import DealAnniversaire from "../components/DealAnniversaire.jsx";
import DealMarque from "../components/DealMarque.jsx";
import Cagnotte from "../components/Cagnotte.jsx";
import DealEnded from "../components/DealEnded.jsx";
import { fetchUserProfile } from "../store/slices/user";

const MesDeals = () => {
  const images = [
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
  ];

  // Get data from Redux store
  const { offre = [], loading, error } = useSelector((state) => state.offre);
  const { Userprofile } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetching offers
  useEffect(() => {
    dispatch(fetchOffre());
    dispatch(fetchUserProfile());
  }, [dispatch]);

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

  // Get Current Date in YYYY-MM-DD format
  const dateNow = new Date();
  const formattedDate = dateNow.toISOString().split("T")[0];

  // Function to calculate the time difference between the current date and the deal end date
  const calculateTimeLeft = (dealEndDate) => {
    const endDate = new Date(dealEndDate); // Convert dealEndDate to Date object
    const timeDifference = endDate - new Date(); // Calculate difference in milliseconds

    if (timeDifference <= 0) return null; // If the deal is already expired, return null

    // Calculate days, hours, minutes, seconds
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  return (
    <>
      <nav className="bg-orange-360 flex flex-row justify-end">
        <div className="border bg-white px-2 py-2 m-2 rounded-2xl shadow-xl text-center font-bold text-sm font-limon-milk">
          <p>Cagnotte </p>
          <p>{Userprofile ? Userprofile.cagnotte_balance : "Chargement..." } DT</p>
        </div>
      </nav>

      {/* Carousel Section */}
      <div className="relative w-full h-auto m-8 p-3">
        <div className="overflow-hidden rounded-lg">
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-auto"
          />
        </div>

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
      {deal.length > 0 ? (
        deal.map((el) => {
          const dealEndDate = new Date(el.date_fin); // Convert date_fin to Date object
          const timeLeft = calculateTimeLeft(el.date_fin); // Get the time left for the deal
          
          // Check if deal is still active based on current date
          if (formattedDate <= dealEndDate.toISOString().split("T")[0]) {
            return (
              <div key={el.id} className="flex flex-row justify-evenly w-auto p-4 bg-white shadow-lg rounded-lg mt-6">
                {el.type_offre === "deal_depense" ? (
                  <Depense Time={timeLeft} flashSaleTimeLeft={timeLeft} offre={el.type_offre} statut={el.statut} dateDebut={el.date_debut} dateFin={el.date_fin} className="w-1/3"/>
                ) : el.type_offre === "deal_frequence" ? (
                  <DealFrequence Time={timeLeft} flashSaleTimeLeft={timeLeft} offre={el.type_offre} statut={el.statut} dateDebut={el.date_debut} dateFin={el.date_fin} className="w-1/3"/>
                ) : el.type_offre === "deal_anniversaire" ? (
                  <DealAnniversaire Time={timeLeft} flashSaleTimeLeft={timeLeft} offre={el.type_offre} statut={el.statut} dateDebut={el.date_debut} dateFin={el.date_fin} className="w-1/3"/>
                ) : el.type_offre === "deal_marque" ? (
                  <DealMarque Time={timeLeft} flashSaleTimeLeft={timeLeft} offre={el.type_offre} statut={el.statut} dateDebut={el.date_debut} dateFin={el.date_fin} className="w-1/3"/>
                ) : (
                  <></> // Added empty fragment for unsupported offer types
                )}
              </div>
            );
          }
          return null;
        })
      ) : (
        <div className="grid items-center text-center">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p className="text-blue-950 font-semibold">Aucune offre active</p>
          <p className="text-orange-360 font-medium">Venez vérifier plus tard!</p>
        </div>
      )}
    </>
  );
};

export default MesDeals;
