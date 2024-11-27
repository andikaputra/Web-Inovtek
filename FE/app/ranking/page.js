"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

function RankingScreen() {
  const [rank, setRank] = useState(null);
  const [points, setPoints] = useState(null);
  const [name, setName] = useState("");
  const apiUrl = process.env.apiUrl; // Ganti dengan base URL dari API Anda

  // Menentukan gambar avatar berdasarkan peringkat
  const getAvatarImage = (rank) => {
    switch (rank) {
      case 1:
        return "/src/img/mendali_1.png";
      case 2:
        return "/src/img/mendali_2.png";
      case 3:
        return "/src/img/mendali_3.png";
      default:
        return "/src/img/mendali_4.png";
    }
  };

  // Fungsi untuk memanggil API ranking
  const fetchRankingData = async () => {
    try {
      // Ambil id_quiz_kode dan id_peserta dari localStorage atau source lain
      const idQuizCode = localStorage.getItem("id_game");
      const idPeserta = localStorage.getItem("id_peserta");

      const response = await axios.get(`${apiUrl}/ranking/${idQuizCode}/${idPeserta}`);
      if (response.status === 200) {
        const data = response.data;
        setRank(data.rank);
        setPoints(data.points);
        setName(data.name);
      }
    } catch (error) {
      console.log("Error fetching ranking data:", error);
    }
  };

  useEffect(() => {
    fetchRankingData();
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url("/src/img/bg.jpg")`, // Ganti URL ini sesuai dengan background yang diinginkan
      }}
    >
      {/* Logo dan Judul */}
      <div className="absolute top-8 left-8 text-white font-bold text-3xl">Quis</div>

      {/* Card untuk menampilkan peringkat dan avatar */}
      <div className="flex flex-col items-center bg-opacity-70 bg-gray-800 text-white p-8 rounded-lg shadow-lg text-center w-80">
        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-4">
          <img
            src={getAvatarImage(rank)} // Mengambil gambar sesuai peringkat
            alt={`${name} Avatar`}
            className="w-28 h-28 rounded-full"
          />
        </div>
        <div className="text-3xl font-semibold mb-2">{name || "Loading..."}</div>
        <div className="bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-lg">
          {rank ? `Selamat anda peringkat ${rank}` : "Loading rank..."}
        </div>
        <div className="text-xl mt-2">- {points !== null ? `${points} points` : "Loading points..."} -</div> 
      </div>
    </div>
  );
}

export default RankingScreen;
