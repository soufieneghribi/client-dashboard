import React from 'react'
import { FaClock } from "react-icons/fa"; 

const Timer = ({flashSaleTimeLeft ,offre, statut , dateDebut, dateFin}) => {
  return (
    <div>
                      {flashSaleTimeLeft &&(
                  <div className="w-full text-center mt-8 p-6 bg-blue-360 rounded-xl shadow-2xl">
                    <p className="font-bold text-3xl text-white mb-4">
                      <FaClock className="inline-block mr-2" /> Offre: {offre}
                    </p>
                    <div className="flex flex-col text-white font-semibold text-xl">
                      <p> Statut: {statut}</p>
                      <p> Date de début: {dateDebut}</p>
                      <p> Date de fin: {dateFin}</p>
                    </div>
                    <br />
                    <div className="flex flex-row justify-evenly items-center text-3xl text-white">
                      <span className="grid font-semibold">
                        <i className="fa-solid fa-calendar-days"></i>
                        <div>{flashSaleTimeLeft.days}</div>
                        <div>Jours</div>
                      </span>
                      <span className="grid font-semibold">
                        <i className="fa-regular fa-clock"></i>
                        <div>{flashSaleTimeLeft.hours}</div>
                        <div>Heures</div>
                      </span>
                      <span className="grid font-semibold">
                        <i className="fa-solid fa-stopwatch"></i>
                        <div>{flashSaleTimeLeft.minutes}</div>
                        <div>Minutes</div>
                      </span>
                      <span className="grid font-semibold">
                        <i className="fa-solid fa-clock"></i>
                        <div>{flashSaleTimeLeft.seconds}</div>
                        <div>Secondes</div>
                      </span>
                    </div>
                  </div>
                )}

    </div>
  )
}

export default Timer