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

const KahootLogin = () => {
  const [kode, setKode] = useState("");
   const mulaiUjian = async () => {
    window.location.href = "/waitingscreen";
  };


  const apiUrl = process.env.apiUrl; // Pastikan environment variabel ini sudah diset

  // Create data baru
  const createPeserta = async () => {
    try {
      const response = await axios.post(apiUrl + "/peserta", { 
        "id_quiz_kode":localStorage.getItem("id_game"),
        "kode_unik":kode
      });
      if(response.status == 200){
        console.log(response.data.data.id)
        localStorage.setItem("id_peserta",response.data.data.id);
        localStorage.setItem("kode_unik",kode);
        handleAdd();
      }
    } catch (error) {
      console.error("Error creating peserta:", error);
    }
  };

  const handleAdd = async () => {  
    try {
      // Menambahkan dokumen ke koleksi 'mulaiUjian'
      const docRef = await addDoc(collection(firestore, `dataPeserta${localStorage.getItem("id_game")}`), {
        kode_unik:kode,
      });

      // Mendapatkan ID dokumen setelah berhasil ditambahkan
      const docId = docRef.id;
      console.log("Document ID:", docId);
      
      mulaiUjian(); 
      // Kamu bisa menggunakan docId ini sesuai kebutuhan
      // Misalnya, simpan ke dalam state atau kirim ke fungsi lain
    } catch (error) {
      console.error("Error adding document:", error);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-purple-700 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="flex flex-wrap justify-center">
          <div className="text-9xl text-purple-500 font-bold rotate-45">?</div>
          <div className="text-9xl text-purple-500 font-bold -rotate-45 ml-10">!</div>
          <div className="text-9xl text-purple-500 font-bold rotate-12 mt-10">"</div>
          <div className="text-9xl text-purple-500 font-bold -rotate-12 mt-16 ml-16">'</div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        <h1 className="text-white text-4xl font-bold text-center mb-8">VRoot!</h1>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Kode Unik"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-purple-500"
          />
          <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800" onClick={() => createPeserta()}>
            OK, go!
          </button>
        </div>
      </div>
    </div>
  );
};

export default KahootLogin;
