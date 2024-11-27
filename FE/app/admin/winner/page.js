"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; 

function Scoreboard() {
  const [winners, setWinners] = useState([]);
  const apiUrl = process.env.apiUrl; 

  const fetchWinners = async () => {
    const idQuizCode = localStorage.getItem("id_game");
    try {
      const response = await axios.get(`${apiUrl}/top_winners/${idQuizCode}`);
      // Susun urutan agar juara 1 berada di tengah
      const sortedWinners = [
        response.data[1], // Juara 2 di kiri
        response.data[0], // Juara 1 di tengah
        response.data[2], // Juara 3 di kanan
      ];
      setWinners(sortedWinners);
    } catch (error) {
      console.log("Error fetching winners:", error);
    }
  };

  const handleBack = () => {
    window.location.href = "/admin/quizzkode";
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-700 relative">
      {/* Header */}
      <div className="text-center absolute top-10 text-white font-bold text-3xl">
        Quis
      </div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-5 right-5 bg-white text-purple-700 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-purple-100"
      >
        Kembali
      </button>

      {/* Winners */}
      <div className="flex items-end space-x-6">
        {winners.map((winner, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
            style={{
              marginTop: winner?.position === 1 ? "0" : winner?.position === 2 ? "2rem" : "4rem", // Juara 1 lebih tinggi
            }}
          >
            {/* Avatar */}
            <div
              className={`w-24 h-24 ${winner?.color} rounded-full flex items-center justify-center mb-2`}
            >
              {winner != null ? (
                <img
                  src={winner?.avatar}
                  alt={`${winner?.name} Avatar`}
                  className="w-20 h-20 rounded-full"
                />
              ) : null}
            </div>

            {/* Position Badge */}
            <div
              className={`${
                winner?.bgColor
              } text-white px-4 py-2 rounded-md mb-1 text-lg font-bold`}
            >
              {winner?.position}
            </div>

            {/* Podium - Name and Score */}
            <div
              className={`${winner?.bgColor} text-white w-28 text-center py-3 ${winner?.height} rounded-t-md flex flex-col justify-end`}
            >
              <span className="text-lg font-semibold">{winner?.name}</span>
              <span className="text-sm">{winner?.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scoreboard;
