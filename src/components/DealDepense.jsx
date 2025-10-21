import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchDealDepense } from "../store/slices/Dealdepense.js";
import DealEnded from "./DealEnded.jsx";
import Timer from "./Timer.jsx";

// SOLUTION 1: Utiliser l'image de fréquence temporairement
import frequencesImg from "../assets/images/frequencesImg.png";

// SOLUTION 2: Ou utiliser une URL externe (décommentez si vous préférez)
// const depenseImg = "https://cdn-icons-png.flaticon.com/512/2331/2331941.png";

const DealDepense = ({ Time }) => {
  const { depense = [], loading, error } = useSelector((state) => state.depense);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState("");
  const [gain, setGain] = useState("");
  
  const dispatch = useDispatch();

  // Utiliser l'image de fréquence temporairement
  const depenseImg = frequencesImg;

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealDepense());
  }, [dispatch]);

  // Filter deals only when Userprofile is available
  const filteredDeals = depense.filter(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client
  );

  useEffect(() => {
    if (filteredDeals.length > 0) {
      filteredDeals.forEach((deals) => {
        // Calculate progress based on spending objectives
        const compteur = parseFloat(deals.compteur_objectif);
        const obj1 = parseFloat(deals.objectif_1);
        const obj2 = parseFloat(deals.objectif_2);
        const obj3 = parseFloat(deals.objectif_3);
        const obj4 = parseFloat(deals.objectif_4);
        const obj5 = parseFloat(deals.objectif_5);

        if (compteur >= obj5) {
          setObjectif("100%");
          setGain(deals.gain_objectif_5);
        } else if (compteur >= obj4) {
          const progress = ((compteur - obj4) / (obj5 - obj4)) * 20 + 80;
          setObjectif(`${progress}%`);
          setGain(deals.gain_objectif_4);
        } else if (compteur >= obj3) {
          const progress = ((compteur - obj3) / (obj4 - obj3)) * 20 + 60;
          setObjectif(`${progress}%`);
          setGain(deals.gain_objectif_3);
        } else if (compteur >= obj2) {
          const progress = ((compteur - obj2) / (obj3 - obj2)) * 20 + 40;
          setObjectif(`${progress}%`);
          setGain(deals.gain_objectif_2);
        } else if (compteur >= obj1) {
          const progress = ((compteur - obj1) / (obj2 - obj1)) * 20 + 20;
          setObjectif(`${progress}%`);
          setGain(deals.gain_objectif_1);
        } else if (compteur > 0) {
          const progress = (compteur / obj1) * 20;
          setObjectif(`${progress}%`);
          setGain("0");
        } else {
          setObjectif("0%");
          setGain("0");
        }
      });
    }
  }, [filteredDeals]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg">
          Erreur lors du chargement des deals de dépense
        </p>
      </div>
    );
  }

  // Function to render objective markers
  const renderObjectiveMarkers = (el) => {
    const objectives = [
      { value: el.objectif_1, gain: el.gain_objectif_1, position: "20%" },
      { value: el.objectif_2, gain: el.gain_objectif_2, position: "40%" },
      { value: el.objectif_3, gain: el.gain_objectif_3, position: "60%" },
      { value: el.objectif_4, gain: el.gain_objectif_4, position: "80%" },
      { value: el.objectif_5, gain: el.gain_objectif_5, position: "100%" }
    ];

    return objectives.map((obj, index) => {
      const isAchieved = parseFloat(el.compteur_objectif) >= parseFloat(obj.value);
      const backgroundColor = isAchieved 
        ? "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)" 
        : "gray";
      const textColor = isAchieved ? "text-white" : "text-black";

      return (
        <div key={index}>
          <span
            style={{
              left: obj.position,
              transform: "translateX(-50%) translateY(-50%)",
              background: backgroundColor,
            }}
            className={`${textColor} rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-sm font-medium shadow-lg`}
          >
            {obj.gain}dt
          </span>
          <span
            style={{
              left: obj.position,
              background: "blue",
            }}
            className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-xs font-semibold"
          >
            {parseInt(obj.value)}dt
          </span>
        </div>
      );
    });
  };

  return (
    <div>
      {filteredDeals.length > 0 && (
        filteredDeals.map((el) => (
          parseFloat(el.compteur_objectif) < parseFloat(el.objectif_5) ? (
            <div key={el.ID_deal_depense} className="flex flex-col justify-between w-full bg-gray-50 shadow-md rounded-lg">
              <Timer flashSaleTimeLeft={Time} />
              
              <div className="flex flex-row justify-start m-2 items-center bg-gray-100">
                <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
                  {/* Button Section */}
                  <div className="flex items-end justify-end">
                    <button className="p-2 bg-purple-600 rounded-xl mx-4 my-1 text-white font-semibold sm:font-normal">
                      Dépense
                    </button>
                  </div>

                  {/* Image Section - OPTION 1: Utiliser une icône FontAwesome */}
                  <div className="flex flex-row justify-between mt-1">
                    <div className="w-32 h-32 p-1 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                      <i className="fas fa-coins text-6xl text-purple-600"></i>
                    </div>
                    
                    {/* OPTION 2: Utiliser l'image de fréquence temporairement (décommentez) */}
                    {/* <img
                      src={depenseImg}
                      alt="Deal Dépense"
                      className="w-32 h-32 object-cover p-1"
                    /> */}
                    
                    <div className="md:font-bold sm:font-mono text-base p-2 text-center">
                      <p>Gagnez jusqu'à</p>
                      <p className="font-bold text-orange-360">{el.gain_objectif_5} Dt</p>
                      <p>si vous atteignez l'objectif</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Dépensez {parseInt(el.objectif_5)}dt pour gagner le maximum
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="p-1">
                    <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black">
                      {/* Objective Markers */}
                      {renderObjectiveMarkers(el)}

                      {/* Progress Bar */}
                      <div
                        className="bg-green-500 h-9 rounded-full transition-all duration-500"
                        style={{ width: objectif }}
                      ></div>

                      {/* Current Spending Display */}
                      <div className="mt-8">
                        <i className="fas fa-coins p-2 mt-4 font-medium text-base"></i>
                        Mes dépenses: {parseFloat(el.compteur_objectif).toFixed(2)} DT
                        {gain !== "0" && (
                          <span className="ml-2 text-green-600 font-semibold">
                            (Gain actuel: {gain} DT)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={el.ID_deal_depense}>
              <DealEnded gain={el.gain_objectif_5} image={depenseImg} />
            </div>
          )
        ))
      )}
    </div>
  );
};

export default DealDepense;