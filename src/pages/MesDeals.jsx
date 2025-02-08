import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOffre } from "../store/slices/offre.js";
import Depense from "../components/Depense";
import DealFrequence from "../components/DealFrequence.jsx";
import DealAnniversaire from "../components/DealAnniversaire.jsx";
import DealMarque from "../components/DealMarque.jsx";
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
          <p>Cagnotte</p>
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
        <div className="flex flex-wrap justify-between gap-4">
          {deal.map((el) => {
            const dealEndDate = new Date(el.date_fin); // Convert date_fin to Date object
            const time = formattedDate <= dealEndDate.toISOString().split("T")[0];

            return (
              <div key={el.id} className="flex flex-col justify-items-center w-full sm:w-1/2 lg:w-1/2 xl:w-1/2 p-2">
                <div className="flex flex-col w-full justify-around  p-4 bg-white shadow-lg rounded-lg mt-6">
                  {/* Deal Type Depense */}
                  {el.type_offre === "deal_depense" && (
                    <Depense
                      Time={time}
                      offre={el.type_offre}
                      statut={el.statut}
                      dateDebut={el.date_debut}
                      dateFin={el.date_fin}
                    />
                  )}

                  {/* Deal Type Frequence */}
                  {el.type_offre === "deal_frequence" && (
                    <DealFrequence
                      Time={time}
                      offre={el.type_offre}
                      statut={el.statut}
                      dateDebut={el.date_debut}
                      dateFin={el.date_fin}
                    />
                  )}

                  {/* Deal Type Anniversaire */}
                  {el.type_offre === "deal_anniversaire" && (
                    <DealAnniversaire
                      Time={time}
                      offre={el.type_offre}
                      statut={el.statut}
                      dateDebut={el.date_debut}
                      dateFin={el.date_fin}
                    />
                  )}

                  {/* Deal Type Marque */}
                  {el.type_offre === "deal_marque" && (
                    <DealMarque
                      Time={time}
                      offre={el.type_offre}
                      statut={el.statut}
                      dateDebut={el.date_debut}
                      dateFin={el.date_fin}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
