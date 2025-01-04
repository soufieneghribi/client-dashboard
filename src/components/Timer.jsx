import React, { useState, useEffect } from "react";

const Timer = ({ initialSeconds }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval); // Cleanup on unmount or update
    }
  }, [seconds]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Timer</h2>
      <div className="text-4xl font-mono bg-gray-200 p-4 rounded-lg shadow-lg">
        {formatTime()}
      </div>
      {seconds === 0 && (
        <p className="mt-4 text-red-500 font-bold">Time's up!</p>
      )}
    </div>
  );
};

export default Timer;
