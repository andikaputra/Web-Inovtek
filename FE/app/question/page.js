"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

function QuizQuestion() {
  const [progress, setProgress] = useState(0);
  const [soal, setSoal] = useState([]);
  const [peserta, setPeserta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.apiUrl;
  const [kodeUnik, setKodeUnik] = useState("");

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchSoal = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl + `/soal/ujian/${localStorage.getItem("kode")}/0`);
      if(response.status === 200){
        setSoal(response.data); 
        setKodeUnik(localStorage.getItem("kode_unik"));
        fetchNilai();
      }
    } catch (error) {
      console.error("Error fetching quiz_kode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNilai = async () => { 
    try {
      const response = await axios.get(apiUrl + `/peserta_nilai/${localStorage.getItem("id_peserta")}/${localStorage.getItem("kode")}`);
      if(response.status === 200){
        setPeserta(response.data.data); 
      }
    } catch (error) {
      console.log("Error fetching quiz_kode:", error);
    } finally { 
    }
  };


  const mulaiUjian = async () => {
    window.location.href = "/quizzscreen";
  };

  useEffect(() => { 
    fetchSoal(); 
  }, []);

  // Handle progress bar loading effect
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            mulaiUjian();
            return 100;
          }
          return prev + 2;
        });
      }, 100); // Mengupdate setiap 100ms

      // Bersihkan interval ketika komponen tidak lagi digunakan
      return () => clearInterval(interval);
    }
  }, [isLoading]);

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
      {/* Top left corner indicator */}
      <div className="absolute top-4 left-4 bg-purple-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
        11
      </div>

      {/* Top center quiz label */}
      <div className="absolute top-4 flex justify-center items-center">
        <div className="bg-white text-gray-800 rounded-full px-4 py-1 text-sm font-semibold shadow-md">
          Quiz
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-white text-gray-800 py-4 px-8 rounded-md text-2xl font-semibold">
        {soal.pertanyaan}
      </div>

      {/* Bottom loading bar */}
      <div className="absolute bottom-16 w-11/12 bg-gray-300 rounded-full h-2 overflow-hidden">
        <div
          className="bg-black h-full rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Bottom left name */}
      <div className="absolute bottom-4 left-4 text-gray-300">
        {kodeUnik}
      </div>

      {/* Bottom right score */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 rounded-full px-3 py-1 text-sm font-semibold">
        {peserta.length >= 0 ? 0 : peserta.nilai}
      </div>
    </div>
  );
}

export default QuizQuestion;
