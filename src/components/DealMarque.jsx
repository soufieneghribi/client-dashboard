import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { fetchDealMarque } from "../store/slices/dealMarque.js";
import Timer from "./Timer";

const DealMarque = ({Time  }) => {

  const { marque = [], loading, error } = useSelector((state) => state.marque);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState("");
  const [gain, setGain] = useState("");
  console.log(marque)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealMarque())
  }, [dispatch]);

  // Filter deals only when Userprofile is available
  const filteredDeals = marque.filter(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client
  );
  useEffect(() => {
    if (filteredDeals.length > 0 ) {
      filteredDeals.map ((deals)=>{
      // Handle goal progression with >= for better range matching
      if (deals.compteur_objectif == 3.00) {
        setObjectif("100%");
        setGain(deals.gain_objectif_3);
      } else if (deals.compteur_objectif == 2.00 ) {
        setObjectif("50%");
        setGain(deals.gain_objectif_2);
      } else if (deals.compteur_objectif == 1.00 ) {
        setObjectif("25%");
        setGain(deals.gain_objectif_1);
      } else {
        // Handle case where no objectives are met yet
        setObjectif("0");
        setGain("0");
      }
    })
    }
  }, [filteredDeals]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      
      {filteredDeals.length >0 &&(
        filteredDeals.map((el) => (
          el.objectif_3 !== el.compteur_objectif?(
         <div key={el.ID_deal_marque} className="flex flex-col justify-between w-full bg-gray-50 shadow-md rounded-lg">
            <Timer flashSaleTimeLeft={Time} />
        
          <div
            key={el.ID_deal_marque} // Use unique ID instead of index
            className="flex flex-row justify-start m-2 items-center bg-gray-100"
          >
            <div className="w-full h-80 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
              {/* Button Section */}
              <div className="flex items-end justify-end">
                <button className="p-2 bg-purple-600 rounded-xl mx-4 my-1 text-white font-semibold sm:font-normal">
                  Marque
                </button>
              </div>

              {/* Image Section */}
              <div className="flex flex-row justify-between mt-1">
                <img
                  src={el.marque?.marqueLogo}
                  alt="Deal"
                  className="w-32 h-32 object-cover p-1"
                />
                <div className="md:font-bold sm:font-mono text-base p-2 text-center">
                  <p>Gagné jusqu'à</p>
                  <p className="font-bold text-orange-360">{el.gain_objectif_3} Dt</p>
                  <p>si vous atteignez l'objectif</p>
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="p-1">
                <div className="w-full rounded-full h-10 mt-2 relative border-2 border-black">
                  <div className="">
                      
                      {/* Gain Objective Markers */}
                      {el.compteur_objectif >= el.objectif_1?(
                        <>
                      <span
                        style={{
                          left: "25%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-lg font-semibold"
                      >
                        {el.gain_objectif_1}dt
                      </span>
                      <span
                        style={{
                         left: "25%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold">
                         {parseInt(el.objectif_1)}dt
                      </span>
                      </>):(
                        <>
                        <span
                        style={{
                          left: "25%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "gray",
                        }}
                        className="text-black rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-base font-semibold shaddow-lg"
                      >
                        {el.gain_objectif_1}dt
                      </span>
                      <span
                        style={{
                         left: "25%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base  font-semibold">
                         {parseInt(el.objectif_1)}dt
                      </span>
                      </>)}
                      {el.compteur_objectif >= el.objectif_2?(<>

                      <span
                        style={{
                          left: "50%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-base  font-semibold"
                      >
                        {el.gain_objectif_2}dt
                      </span>
                      <span
                        style={{
                         left: "50%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold">
                         {parseInt(el.objectif_2)}dt
                      </span>
                      </>):(<>
                        <span
                        style={{
                          left: "50%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "gray",
                        }}
                        className="text-black rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-base font-semibold shaddow-lg"
                      >
                        {el.gain_objectif_2}dt
                      </span>
                      <span
                        style={{
                         left: "50%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold">
                         {parseInt(el.objectif_2)}dt
                      </span>
                      </>)}
                      {el.compteur_objectif >= el.objectif_3?(<>

                      <span
                        style={{
                          left: "75%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "linear-gradient(to right, #d19e1d, #ffd86e, #e3a812)",
                        }}
                        className="text-white rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-base font-semibold"
                      >
                        {el.gain_objectif_3}dt
                      </span>
                     
                      <span
                        style={{
                         left: "75%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold">
                         {parseInt(el.objectif_3)}dt
                      </span>
                      </>):(<>
                        <span
                        style={{
                          left: "75%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "gray",
                        }}
                        className="text-black rounded-full w-10 h-10 absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-base font-semibold shaddow-lg"
                      >
                        {el.gain_objectif_3}dt
                      </span>
                     
                      <span
                        style={{
                         left: "75%", // Position it at 25% of the container's width
                         background: "blue", // Set background color to blue
                        }}
                         className="text-white rounded-full w-12 h-12 absolute top-full mt-2 transform -translate-x-1/2 flex items-center justify-center text-base font-semibold">
                         {parseInt(el.objectif_3)}dt
                      </span>
                      </>)}
                    </div>
                  

                  <div
                    className="bg-green-500 h-9 rounded-full"
                    style={{ width: objectif }}
                    
                  ></div>
                  <div className="mt-8">
                   <i className="fas fa-gift p-2 mt-4  font-meduim text-base"></i>Mes achats: {gain} DT
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          ):
        (
        <div>
        <DealEnded gain={gain}  />
          {Time = false }
          </div>
        )
        ))
       
       
      ) }
    </div>
  );
};

export default DealMarque;
