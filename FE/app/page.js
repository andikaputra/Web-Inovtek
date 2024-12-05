"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; 
import SweetAlert2 from 'react-sweetalert2';

const KahootKodeScreen = () => {
  const [kode, setKode] = useState("");
  const [quizKodes, setQuizKodes] = useState([]);
  const [swalProps, setSwalProps] = useState({});
  const [isClient, setIsClient] = useState(false);


  const masukRoom = async () => {
    if (typeof window !== "undefined") {
      window.location.href = "/userscreen";
    } 
  };

    // Pastikan kode hanya dijalankan di client-side
  useEffect(() => {
    setIsClient(true); // Menandakan bahwa komponen ini sudah di-mount di client
  }, []);

  const apiUrl = process.env.apiUrl; // Pastikan environment variabel ini sudah diset

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchQuizKodes = async (kode) => {
    try {
      const response = await axios.get(apiUrl + "/quiz/kode?kode="+kode);
      if (response.status === 200) {
        setQuizKodes(response.data.data);
        localStorage.setItem("id_game", response.data.data.id);
        localStorage.setItem("kode_game", response.data.data.kode);
        masukRoom();
      }  
    } catch (error) {
      console.log("Error fetching quiz_kode:", error);
      setSwalProps({
          show: true,
          title: 'Informasi',
          text: 'Ujian belum mulai / Kode tidak ditemukan',
      });
    }
  };

  // Jangan render jika sedang di server-side
  if (!isClient) {
    return null; // Render kosong saat SSR
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-800 text-white">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">VRoot!</h1>
        
        <div className="bg-white p-6 rounded-lg w-72 mx-auto text-black">
          <input
            type="text"
            placeholder="Game PIN"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:border-purple-600"
          />
          <button className="w-full px-4 py-2 text-white bg-purple-800 rounded hover:bg-purple-900" onClick={() => fetchQuizKodes(kode)}>
            Enter
          </button>
        </div>
   
        
        <div className="flex justify-center space-x-4 text-xs">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Cookie notice</a>
        </div>
      </div>
      <SweetAlert2 {...swalProps} />

    </div>
  );
};

export default KahootKodeScreen;
