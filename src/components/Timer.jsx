import React from 'react';
import { FaClock } from 'react-icons/fa';

const Timer = ({ flashSaleTimeLeft }) => {
  // Destructure time left, with fallback default values in case it's undefined or missing
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = flashSaleTimeLeft || {};

  // Check if the sale is ending soon (less than 24 hours left)
  const isSaleEndingSoon = days === 0 && hours <= 24;

  return (
    <div className="w-full text-center mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-xl shadow-2xl">
      {flashSaleTimeLeft ? (
        <>
          {/* Title */}
          <p className="md:text-xl sm:text-base text-white font-semibold mb-1 sm:mb-2 md:mb-4 ">Temps restant pour la vente flash</p>

          {/* Countdown Timer */}
          <div className="flex flex-row justify-center items-center text-white sm:text-base md:text-xl font-semibold sm:font-normal">
            <span className="flex flex-col items-center px-2 py-1 sm:p-1 bg-blue-600 text-white rounded-lg shadow-lg">
              <p>{days}</p>
            </span>
            <p className="text-orange-300 mx-2">:</p>
            <span className="flex flex-col items-center px-2 py-1 bg-blue-600 text-white rounded-lg shadow-lg">
              <p>{hours}</p>
            </span>
            <p className="text-orange-300 mx-2">:</p>
            <span className="flex flex-col items-center px-2 py-1 bg-blue-600 text-white rounded-lg shadow-lg">
              <p>{minutes}</p>
            </span>
            <p className="text-orange-300 mx-2">:</p>
            <span className="flex flex-col items-center px-2 py-1 bg-blue-600 text-white rounded-lg shadow-lg">
              <p>{seconds}</p>
            </span>
          </div>

          {/* Label for time units */}
          <div className="flex flex-row justify-center items-center text-white text-base font-meduim">
            <p className="m-2">Jours</p>
            <p className="m-2">Heures</p>
            <p className="m-2">Minutes</p>
            <p className="m-2">Secondes</p>
          </div>

          {/* Sale Ending Soon Notice */}
          {isSaleEndingSoon && (
            <p className="mt-6 sm:mt-2 text-red-600 font-semibold text-xl sm:text-base">
              🚨 <span className="font-bold">Attention:</span> Il ne reste que {hours} heures !
            </p>
          )}
        </>
      ) : (
        <p className="text-white font-semibold">Vente flash terminée ou en attente...</p>
      )}
    </div>
  );
};

export default Timer;
