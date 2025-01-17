"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { firestore } from '../../firebase';
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

function QuizQuestion() {
  const [documentSoal, setDocumentSoal] = useState(null);
  const [progress, setProgress] = useState(0);
  const [soal, setSoal] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.apiUrl;

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchSoal = async (link) => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl + link);
      if(response.status === 200){
        setSoal(response.data); 
      }
    } catch (error) {
      console.log("Error fetching quiz_kode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const mulaiUjian = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/quizz";
    } 
  };

  useEffect(() => { 
    if(typeof window !== "undefined" && sessionStorage.getItem("islogin") != "true"){
      window.location.href = "/admin/login";
    }
    // Ambil `kode` dari localStorage
    const kode = localStorage.getItem("id_game");
    
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
        fetchSoal(data.link_sebelum); 
        console.log("Document data:", data); // Debug atau tampilkan data
      } else {
        console.log("No such document!");
      }
    });

    // Bersihkan listener ketika komponen tidak digunakan
    return () => unsubscribe();
  }, []);

  // Create new item
  const handleAddSoal = async () => {  

    let docId = localStorage.getItem("id_game");

    try {
      // Referensi ke dokumen tertentu berdasarkan ID
      const docRef = doc(firestore, `soalUjian${localStorage.getItem("id_game")}`, docId);
      
      // Menggunakan setDoc untuk membuat atau memperbarui dokumen
      await setDoc(docRef, { 
        kode: docId,
        link_sebelum:documentSoal['link_sebelum'],
        link_setelah:documentSoal['link_setelah'],
        nomor_soal:documentSoal['nomor_soal'],
        nomor_next_soal:documentSoal['nomor_next_soal'],
        next_page:"quiz",
        start_ujian:true
      }, { merge: true });
      
      mulaiUjian(); 
      console.log(`Document with ID ${docId} has been created/updated.`); 
    } catch (error) {
      console.log("Error creating/updating document:", error);
    }
  };

 

  // Handle progress bar loading effect
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            handleAddSoal();
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
        {documentSoal.nomor_soal}
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
        Admin
      </div>

      {/* Bottom right score */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 rounded-full px-3 py-1 text-sm font-semibold">
        
      </div>
    </div>
  );
}

export default QuizQuestion;
