import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import dealAnniversaire from "../assets/images/dealAnniversaire.png"; // Fixed image import
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchAnniversaire } from "../store/slices/anniversaire";
const DealAnniversaire = () => {
 const {anniversaire = [] , loading , error}=useSelector((state) => state.anniversaire);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState(0);
  const [gain, setGain] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchAnniversaire())
  }, [dispatch]);

  // Filter deals only when Userprofile is available
  const filteredDeals = anniversaire.filter(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client
  );

  useEffect(() => {
    if (filteredDeals.length > 0) {
      const deal = filteredDeals[0];
      // Handle goal progression with >= for better range matching
      if (deal.compteur_objectif
        < deal.objectif_1) {
        setObjectif(0);
       const cagnotteAnniversaireValue = 0.0;
      } else if (deal.compteur_objectif
        >=deal.objectif_1 &&deal.compteur_objectif
        < deal.objectif_2) {
        setObjectif(25);
      } else if (deal.compteur_objectif
        >=deal.objectif_2 && deal.compteur_objectif
        < deal.objectif_3) {
        setObjectif(50);
      } else if (deal.compteur_objectif
        >= deal.objectif_3 && deal.compteur_objectif
        < deal.objectif_4) {
        setObjectif(75);
        }}
  }, [filteredDeals]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {filteredDeals.length > 0 ? (
        filteredDeals.map((el) => (
          <div
            key={el.ID_deal} // Use unique ID instead of index
            className="flex flex-row justify-start m-8 items-center bg-gray-100"
          >
            <div className="w-full rounded-lg overflow-hidden shadow-lg bg-white">
              {/* Button Section */}
              <div className="flex items-end justify-end">
                <button className="p-4 bg-purple-600 rounded-xl mx-4 my-2 text-white font-semibold">
                Anniversaire
                </button>
              </div>

              {/* Image Section */}
              <div className="flex flex-row justify-between mt-4">
                <img
                  src={dealAnniversaire}
                  alt="Deal"
                  className="w-48 h-48 object-cover p-2"
                />
                <div className="font-bold text-base p-4 text-center">
                  <p>Gagné</p>
                  <p className="text-orange-360">{el.amount_earned} Dt</p>
                  <p>si vous atteignez l'objectif</p>
                  <p className="text-orange-360">{el.objectif_3} Dt</p>

                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="p-4 mb-28">
                <div className="text-lg font-semibold text-gray-700">Anniversaire</div>
                <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black ">
                  
                    <div className="">
                      
                      {/* Gain Objective Markers */}
                      <span
                        style={{
                          left: "25%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
                      >
                        {el.gain_objectif_1}
                      </span>
                      <span
                        style={{
                          left: "50%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
                      >
                        {el.gain_objectif_2}
                      </span>
                      <span
                        style={{
                          left: "75%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
                      >
                        {el.gain_objectif_3}
                      </span>
                     
                      
                      {/* Objective Markers */}
                      <span
                        style={{
                         left: "25%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-14 h-14 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-medium">
                         {parseInt(el.objectif_1)}dt
                      </span>
                      <span
                        style={{
                         left: "50%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-14 h-14 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-medium">
                         {parseInt(el.objectif_2)}dt
                      </span>
                      <span
                        style={{
                         left: "75%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-14 h-14 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-medium">
                         {parseInt(el.objectif_3)}dt
                      </span>
                      
                    </div>
                  

                  <div
                    className="bg-green-600 h-9 rounded-full"
                    style={{ width: `${objectif}%` }}
                  ></div>
                  <div className="mt-16">
                   <i className="fas fa-gift p-2 mt-4"></i> Mes achats: {el.compteur_objectif}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : ""}
    </div>
  );
};

export default DealAnniversaire;
