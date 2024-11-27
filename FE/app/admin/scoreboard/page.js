"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; // Pastikan menginstall axios atau gunakan fetch
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

function Scoreboard() {
  const [documentSoal, setDocumentSoal] = useState(null);
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State untuk indikator loading
  const apiUrl = process.env.apiUrl;

  const mulaiNext = async () => {
    window.location.href = "/admin/question";
  };

  const mulaiEnd = async () => {
    window.location.href = "/admin/winner";
  };

  // useEffect(() => {
  //   // Mengatur timeout untuk redirect setelah 5 detik
  //   const timer = setTimeout(() => {
  //     mulaiUjian();
  //   }, 5000);

  //   // Membersihkan timer jika komponen di-unmount sebelum waktu habis
  //   return () => clearTimeout(timer);
  // }, []);
 

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchSoal = async () => { 
    let nomor_soal = documentSoal['nomor_soal'];
    let nomor_next_soal = documentSoal['nomor_next_soal'];
    try {
      const response = await axios.get(apiUrl + documentSoal.link_setelah);
      if (response.status === 200) { 
        await handleAddSoal(nomor_soal, nomor_next_soal, (nomor_soal + 1) , (nomor_next_soal + 1),"question");
      }else{
        await handleAddSoal(nomor_soal, nomor_next_soal, (nomor_soal + 1) , (nomor_next_soal + 1),"end");
        mulaiEnd();
      }
    } catch (error) {
      await handleAddSoal(nomor_soal, nomor_next_soal, (nomor_soal + 1) , (nomor_next_soal + 1),"end");
      mulaiEnd();
      console.log("Error fetching quiz_kode:", error);
    }  
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
      console.log("Error fetching top scores:", error);
    } finally {
      setIsLoading(false); // Nonaktifkan loading setelah data di-fetch
    }
  };

  useEffect(() => {
    // Ambil `kode` dari localStorage
    const kode = localStorage.getItem("id_game");
    fetchTopScores(kode);
    
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
        console.log("Document data:", data); // Debug atau tampilkan data
      } else {
        console.log("No such document!");
      }
    });

    // Bersihkan listener ketika komponen tidak digunakan
    return () => unsubscribe();
  }, []);


  // Create new item
  const handleAddSoal = async (lsebelum,lsetelah,nsoal,nnext,next_page) => {  

    let docId = localStorage.getItem("id_game");

    try {
      // Referensi ke dokumen tertentu berdasarkan ID
      const docRef = doc(firestore, `soalUjian${localStorage.getItem("id_game")}`, docId);
      
      // Menggunakan setDoc untuk membuat atau memperbarui dokumen 
      await setDoc(docRef, { 
        kode: docId,
        link_sebelum:`/soal/ujian/${localStorage.getItem("id_game")}/${lsebelum}`,
        link_setelah:`/soal/ujian/${localStorage.getItem("id_game")}/${lsetelah}`,
        nomor_soal:nsoal,
        nomor_next_soal:nnext,
        next_page:next_page,
        start_ujian:false
      }, { merge: true });

      mulaiNext();
      console.log(`Document with ID ${docId} has been created/updated.`); 
    } catch (error) {
      console.log("Error creating/updating document:", error);
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
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url("/src/img/bg.jpg")`,
      }}
    >
      {/* Tombol Next di pojok kanan atas */}
      <button
        onClick={fetchSoal}
        className="absolute top-4 right-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-md shadow-md"
      >
        Next
      </button>

      <div className="bg-gray-800 text-white py-2 px-4 rounded-md text-2xl font-bold mb-6">
        Scoreboard
      </div>
      
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        {scores.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center px-4 py-3 ${
               "bg-gray-200 text-gray-900 font-semibold" 
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
