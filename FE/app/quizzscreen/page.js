"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

function Quiz() {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [soal, setSoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(0); // State untuk countdown
  const apiUrl = process.env.apiUrl;

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchSoal = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl + `/soal/ujian/${localStorage.getItem("kode")}/0`);
      if (response.status === 200) {
        setSoal(response.data);
        setCountdown(response.data.waktu.detik); // Inisialisasi countdown dari waktu.detik
      }
    } catch (error) {
      console.error("Error fetching quiz_kode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSoal();
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          // Logika saat waktu habis
          soalSalah();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const soalBenar = () => {
    window.location.href = "/resultcorrectscreen";
  };

  const soalSalah = () => {
    window.location.href = "/resultincorrectscreen";
  };

  // Fungsi untuk memilih atau membatalkan pilihan jawaban
  const handleSelectAnswer = (answerId) => {
    setSelectedAnswers((prevSelected) => {
      if (prevSelected.includes(answerId)) {
        return prevSelected.filter((item) => item !== answerId);
      } else {
        return [...prevSelected, answerId];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white">
        <div className="loader mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!soal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white">
        <p>No question data available.</p>
      </div>
    );
  }

  // Mapping warna berdasarkan index
  const backgroundColors = [
    "bg-red-500 hover:bg-red-700",
    "bg-blue-500 hover:bg-blue-700",
    "bg-yellow-500 hover:bg-yellow-700",
    "bg-green-500 hover:bg-green-700",
  ];

  return (
    <div
      className="flex flex-col w-full h-full items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url("/src/img/bg.jpg")`, // Ganti dengan URL gambar background yang diinginkan
      }}
    >
      <div className="bg-gray-800 text-white py-2 px-4 rounded-md text-2xl font-bold mb-6">
        {soal.pertanyaan}
      </div>
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
        {soal.file && (
          <img
            src={soal.file}
            alt="Suara Ayam"
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex justify-between mb-4">
            {/* Countdown Timer */}
            <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
              {countdown}
            </div>
            <div className="bg-blue-600 text-white rounded-full px-4 py-2 font-semibold text-lg">
              30 Answers
            </div>
          </div>

          {/* Pilihan Jawaban */}
          <div className="grid grid-cols-2 gap-4">
            {soal.soal_jawaban.map((jawaban, index) => (
              <button
                key={jawaban.id}
                onClick={() => handleSelectAnswer(jawaban.id)}
                className={`flex items-center justify-center font-semibold py-3 rounded-lg ${
                  selectedAnswers.includes(jawaban.id)
                    ? "ring-4 ring-green-400"
                    : backgroundColors[index % backgroundColors.length]
                }`}
              >
                {jawaban.text_jawaban}
                {selectedAnswers.includes(jawaban.id) && <span className="ml-2">✔️</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
