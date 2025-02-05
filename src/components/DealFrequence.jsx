import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import frequencesImg from "../assets/images/frequencesImg.png"; // Fixed image import
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchDealFrequence } from "../store/slices/frequence.js";

const DealFrequence = () => {
 const { frequence = [], loading, error } = useSelector((state) => state.frequence);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState(0);
  const [gain, setGain] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealFrequence())

  }, [dispatch]);

  // Filter deals only when Userprofile is available
  const filteredDeals = frequence.filter(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client
  );
  useEffect(() => {
    if (filteredDeals.length > 0) {
      const deals = filteredDeals[0];
      // Handle goal progression with >= for better range matching
      if (deals.compteur_frequence >= 1) {
        setObjectif(100);
      } else if (deals.compteur_frequence >= 2) {
        setObjectif(50);
      } else if (deals.compteur_frequence >= 3) {
        setObjectif(25);
      } else {
        // Handle case where no objectives are met yet
        setObjectif(0);
      }
    }

  }, [filteredDeals]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div>
     {filteredDeals.length > 0 ? (
        filteredDeals.map((el) => (
          <div
            key={el.ID_deal} // Use unique ID instead of index
            className="flex justify-start m-8 items-center bg-gray-100"
          >
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
                  <p className="text-orange-360">{parseInt(el.objectifFrequence)} visites avec un montant minimum par commande {parseInt(el.panierMoyen)} Dt
                  </p>
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="p-4 mb-28">
                <div className="text-lg font-semibold text-gray-700">Fréquence</div>
                <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black ">
                  
                    <div>
                      
                      {/* Gain Objective Markers */}
                      <span
                        style={{
                          left: "25%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
                      >
                        1
                      </span>
                      <span
                        style={{
                          left: "50%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
                      >
                        2
                      </span>
                      <span
                        style={{
                          left: "75%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
                      >
                        3
                      </span>
                      {/* Objective Markers */}
                      <span
                        style={{
                         left: "25%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-14 h-14 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-medium">
                         {parseInt(el.panierMoyen)} Dt
                      </span>
                      <span
                        style={{
                         left: "50%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-14 h-14 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-medium">
                        {parseInt(el.panierMoyen)} Dt
                      </span>
                      <span
                        style={{
                         left: "75%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-14 h-14 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-medium">
                         {parseInt(el.panierMoyen)} Dt
                      </span>
                    </div>
                  

                  <div
                    className="bg-green-600 h-9 rounded-full"
                    style={{ width: `${objectif}%` }}
                  ></div>
                   <div className="mt-16">
                   <i className="fas fa-gift p-2 mt-4"></i> Mes visites :{el.compteur_frequence}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) :""}
    </div>
  );
};

export default DealFrequence;
