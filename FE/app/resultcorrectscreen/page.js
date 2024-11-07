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

function QuizResult() {
  const [documentSoal, setDocumentSoal] = useState(null);
  const [rank, setRank] = useState(null);
  const [points, setPoints] = useState(null);
  const [addPoin, setAddPoin] = useState(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true); // State untuk loading
  const apiUrl = process.env.apiUrl;

  const nextPage = async () => {
    window.location.href = "/scoreboard";
  };
 

  const fetchNilai = async () => {
    try {
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
      console.log("Error fetching quiz_kode:", error);
    } finally { 
      setIsLoading(false); // Matikan loading setelah data diambil
    }
  };


  useEffect(() => {
    // Ambil `kode` dari localStorage
    const kode = localStorage.getItem("id_game");
    setAddPoin(localStorage.getItem("score_for_question"));
    
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
        fetchNilai(); 
        if(data.next_page == "scoreboard"){
          nextPage()
        }
        console.log("Document data:", data); // Debug atau tampilkan data
      } else {
        console.log("No such document!");
      }
    });

    // Bersihkan listener ketika komponen tidak digunakan
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white">
      <div className="absolute top-4 left-4 bg-purple-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
        {documentSoal.nomor_soal}
      </div>

      <div className="absolute top-4 flex justify-center items-center">
        <div className="bg-white text-gray-800 rounded-full px-4 py-1 text-sm font-semibold shadow-md">
          Quiz
        </div>
      </div>

      <div className="text-center">
        <p className="text-3xl font-bold mb-4">Benar</p>

        <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="text-sm text-yellow-300 font-semibold mb-6">
          Jawaban anda benar 🔥
        </div>

        <div className="bg-purple-900 text-white py-2 px-6 rounded-md text-2xl font-bold mb-4">
          + {addPoin <= 0 ? 0 : Math.round(addPoin)}
        </div>

        <p className="text-sm">
          Anda ada diperingkat <span className="font-semibold">{rank}</span>
          <br />
          Poin anda sekarang {points <= 0 ? 0 : points} poin
        </p> 
      </div>

      <div className=" px-3 py-1 absolute bottom-4 left-4 text-gray-300 bg-gray-800 rounded-full">
        {name}
      </div>

      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 rounded-full px-3 py-1 text-sm font-semibold">
        {points <= 0 ? 0 : points}
      </div>
    </div>
  );
}

export default QuizResult;
