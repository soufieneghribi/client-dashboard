import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Depense from "../components/Depense";
import DealFrequence from "../components/DealFrequence.jsx";
import { fetchUserProfile } from "../store/slices/user";
import axios from "axios";
import toast from "react-hot-toast";
import DealAnniversaire from "../components/DealAnniversaire.jsx";
import { FaClock } from "react-icons/fa"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchOffre } from "../store/slices/offre.js";
import DealMarque from "../components/DealMarque.jsx";

const MesDeals = () => {
  const images = [
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
  ];

  // Get data from Redux store
  const { offre = [], loading, error } = useSelector((state) => state.offre);
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState(3600);

  // Fetching offers
  useEffect(() => {
    dispatch(fetchOffre());
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
    const endDate = new Date(dealEndDate); // Convert dealEndDate to a Date object
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
          <p>Cagnotte</p>
          <p>0 DT</p>
        </div>
      </nav>

      {/* Carousel Section */}
      <div className="relative w-100 h-auto m-8 p-3">
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
      {deal.map((el) => {
        const dealEndDate = new Date(el.date_fin); // Convert date_fin to Date object

        // Check if the current date is greater than or equal to the deal end date
        if (formattedDate <= dealEndDate.toISOString().split("T")[0]) {
          const flashSaleTimeLeft = calculateTimeLeft(el.date_fin); // Get the time left for the deal

          return (
           <>
            {flashSaleTimeLeft && (
        <div className="w-full text-center mt-8 p-6 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl shadow-2xl animate-pulse">
          <p className="font-bold text-3xl text-white mb-4">
            <FaClock className="inline-block mr-2" /> Flash Sale Ends In:
          </p>
          <div className="text-3xl text-white">
            <span className="font-semibold">{flashSaleTimeLeft.days}d </span>
            <span className="font-semibold">{flashSaleTimeLeft.hours}h </span>
            <span className="font-semibold">{flashSaleTimeLeft.minutes}m </span>
            <span className="font-semibold">{flashSaleTimeLeft.seconds}s</span>
          </div>
        </div>
      )}
            <div className="flex flex-row justify-evenly w-auto p-4 bg-white shadow-lg rounded-lg mt-6" key={el.id}>
              <div className="w-auto p-4">
                <Depense />
              </div>
              <div className="w-auto p-4">
                <DealFrequence />
              </div>
              <div className="w-auto p-4">
                <DealAnniversaire />
              </div>
              <div className="w-auto p-4">
                <DealMarque />
              </div>
              

              
            </div>
            </>
          );
        } else {
          return null; // Return nothing if the deal is not available yet
        }
      })}
    </>
  );
};

export default MesDeals;
