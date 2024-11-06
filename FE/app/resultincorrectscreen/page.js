"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

function QuizIncorrect() {
  const [peserta, setPeserta] = useState([]);
  const [kodeUnik, setKodeUnik] = useState("");
  const [isLoading, setIsLoading] = useState(true); // State untuk loading
  const apiUrl = process.env.apiUrl;

  const mulaiUjian = async () => {
    window.location.href = "/scoreboard";
  };

  useEffect(() => {
    fetchNilai();
  }, []);

  const fetchNilai = async () => {
    try {
      const response = await axios.get(apiUrl + `/peserta_nilai/${localStorage.getItem("id_peserta")}/${localStorage.getItem("kode")}`);
      if (response.status === 200) {
        setPeserta(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching quiz_kode:", error);
    } finally {
      setKodeUnik(localStorage.getItem("kode_unik"));
      setIsLoading(false); // Matikan loading setelah data diambil
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white">
        <div className="loader mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white relative">
      <div className="absolute top-4 left-4 bg-purple-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
        11
      </div>

      <div className="absolute top-4 flex justify-center items-center">
        <div className="bg-white text-gray-800 rounded-full px-4 py-1 text-sm font-semibold shadow-md">
          Quiz
        </div>
      </div>

      <div className="text-center">
        <p className="text-3xl font-bold mb-4">Salah</p>

        <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="white"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div> 

        <div className="bg-purple-900 text-white py-2 px-6 rounded-md text-lg font-semibold mb-6">
          Jawaban anda salah
        </div>

        <p className="text-sm">
          Anda ada diperingkat <span className="font-semibold">13</span>
        </p>
      </div>

      <div className=" px-3 py-1 absolute bottom-4 left-4 text-gray-300 bg-gray-800 rounded-full">
        {kodeUnik}
      </div>

      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 rounded-full px-3 py-1 text-sm font-semibold">
        {peserta.length >= 0 ? 0 : peserta.nilai}
      </div>
    </div>
  );
}

export default QuizIncorrect;
