import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import frequencesImg from "../assets/images/frequencesImg.png"; // Fixed image import
import { fetchDealFrequence } from "../store/slices/frequence.js";
import '@fortawesome/fontawesome-free/css/all.min.css';
import DealEnded from "./DealEnded.jsx";
import Timer from "./Timer.jsx";
const DealFrequence = ({Time ,flashSaleTimeLeft ,offre, statut , dateDebut, dateFin}) => {
  const { frequence = [], loading, error } = useSelector((state) => state.frequence);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealFrequence());
  }, [dispatch]);

  // Filter deals only when Userprofile is available
  const filteredDeals = frequence.filter(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client
  );

  useEffect(() => {
    if (filteredDeals.length > 0) {
      const deals = filteredDeals[0];
      const progress = (deals.compteur_frequence / deals.objectif_frequence) * 100;
      setObjectif(progress);
      
    }
  }, [filteredDeals]);

  if (loading) return <div className="spinner">Loading...</div>; // Replace with a spinner
  if (error) return <div className="error-message">{error}</div>;

  // Function to generate the markers dynamically
  const renderMarkers = (deals) => {
    const markers = [];
    for (let i = 1; i <= deals.objectif_frequence; i++) {
      markers.push(
        <div>
        <span
          key={i}
          style={{
            left: `${(((i / deals.objectif_frequence) * 100)-i)}%`,
            transform: "translateX(-50%) translateY(-50%)",
            background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
          }}
          className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
        >
          {i}
        </span>
         <span
         style={{
          left: `${((i / deals.objectif_frequence) * 100)-i}%`, // Position it at 25% of the container's width
          background: "blue", // Set background color to blue
         }}
          className="text-white rounded-full w-14 h-14 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-medium">
         {parseInt(deals.panier_moyen)} Dt
       </span>
       </div>
      );
    }
    return markers;
  };
  

  return (
    <div>
      {filteredDeals.length > 0 &&(
        filteredDeals.map((el) => (
          el.objectif_frequence !== el.compteur_frequence?(
          <div key={el.ID_deal}  className="flex flex-col justify-between w-full h-full p-4 bg-gray-50 shadow-md rounded-lg">
          <Timer flashSaleTimeLeft={flashSaleTimeLeft} offre = {offre} statut ={statut} dateDebut={dateDebut} dateFin={dateFin}/>

          <div key={el.ID_deal} className="flex justify-start m-8 items-center bg-gray-100">
            <div className="w-full rounded-lg overflow-hidden shadow-lg bg-white">
              {/* Button Section */}
              <div className="flex items-end justify-end">
                <button className="p-4 bg-purple-600 rounded-xl mx-4 my-2 text-white font-semibold">
                  Fréquence
                </button>
              </div>

              {/* Image Section */}
              <div className="flex flex-row justify-between mt-4">
                <img
                  src={frequencesImg}
                  alt="Deal"
                  className="w-48 h-48 object-cover p-2"
                />
                <div className="font-bold text-base p-4 text-center">
                  <p>Gagné </p>
                  <p className="text-orange-360">{el.gain} Dt</p>
                  <p>si vous atteignez l'objectif</p>
                  <p className="text-orange-360">
                    {parseInt(el.objectif_frequence)} visites avec un montant minimum par commande {parseInt(el.panier_moyen)} Dt
                  </p>
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="p-4 mb-28">
                <div className="text-lg font-semibold text-gray-700">Fréquence</div>
                <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black">
                  {/* Dynamic Markers */}
                  {renderMarkers(el)}

                  {/* Progress Bar */}
                  <div
                    className="bg-green-600 h-9 rounded-full"
                    style={{ width: `${objectif}%` }}
                  ></div>

                  {/* Visits Count */}
                  <div className="mt-16">
                    <i className="fas fa-gift p-2 mt-4"></i> Mes visites : {el.compteur_frequence}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        ):
        (
        <div>
        <DealEnded gain={el.gain} image ={frequencesImg } />
          {Time = false }
          </div>
        )
        ))
      )}
    </div>
  );
};

export default DealFrequence;
