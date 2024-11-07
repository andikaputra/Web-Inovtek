"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { firestore } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [kodeUnik, setKodeUnik] = useState(""); // Simpan kode_unik
  const [documentSoal, setDocumentSoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // State untuk indikator loading
  const apiUrl = process.env.apiUrl;
  
  const mulaiNext = async () => {
    window.location.href = "/question";
  };

  const mulaiEnd = async () => {
    window.location.href = "/ranking";
  };
 
  // Fungsi untuk mengambil skor berdasarkan `id_quiz_code`
  const fetchTopScores = async (idQuizCode) => {
    setIsLoading(true); // Aktifkan loading saat mulai fetch data
    try {
      const response = await axios.get(`${apiUrl}/top_scores/${idQuizCode}`);
      if (response.status === 200) {
        setScores(response.data);
      }
    } catch (error) {
      console.error("Error fetching top scores:", error);
    } finally {
      setIsLoading(false); // Nonaktifkan loading setelah data di-fetch
    }
  };

  useEffect(() => {
    const kode = localStorage.getItem("id_game");
    fetchTopScores(kode);
    setKodeUnik(localStorage.getItem("kode_unik"));
    
    // Buat referensi ke dokumen spesifik menggunakan `doc` dan `kode`
    const documentRef = doc(firestore, `soalUjian${kode}`, kode);
    
    // Listener untuk memantau perubahan data secara real-time pada dokumen tertentu
    const unsubscribe = onSnapshot(documentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = {
          id: snapshot.id,
          ...snapshot.data(),
        }; 
        setDocumentSoal(data); // Simpan data ke state 
        if(data.next_page == "question"){
          mulaiNext()
        }else if(data.next_page == "end"){
          mulaiEnd();
        }
        console.log("Document data:", data); // Debug atau tampilkan data
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white">
        <div className="loader mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }
 
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url("/src/img/bg.jpg")`,
      }}
    >
      {/* Tombol Next di pojok kanan atas */}
      <div className="bg-gray-800 text-white py-2 px-4 rounded-md text-2xl font-bold mb-6">
        Scoreboard
      </div>
      
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        {scores.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center px-4 py-3 ${
              item.name === kodeUnik
                ? "bg-purple-700 text-white"
                : index === 0
                ? "bg-gray-200 text-gray-900 font-semibold"
                : "text-gray-900"
            } ${index !== scores.length - 1 && "border-b border-gray-300"}`}
          >
            <span>{item.name}</span>
            <span>{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scoreboard;
