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

function QuizDisplay() {
  const [documentSoal, setDocumentSoal] = useState(null);
  const [answerCounts, setAnswerCounts] = useState({}); // Menyimpan jumlah jawaban untuk setiap opsi
  const [soal, setSoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.apiUrl;

  const fetchAnswerCounts = async (id_soal) => {
    try {
      const id_quiz_kode = localStorage.getItem("id_game");
      const response = await axios.get(`${apiUrl}/answer_count/${id_quiz_kode}/${id_soal}`);
      if (response.status === 200) {
        setAnswerCounts(response.data);
      }
    } catch (error) {
      console.error("Error fetching answer counts:", error);
    }
  };

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchSoal = async (link) => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl + link);
      if (response.status === 200) {
        setSoal(response.data);
        fetchAnswerCounts(response.data.id)
      }
    } catch (error) {
      console.error("Error fetching quiz_kode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  const scoreboardPage = () => {
    window.location.href = "/admin/scoreboard";
  };

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
        next_page:"scoreboard"
      }, { merge: true });
      
      scoreboardPage()
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

  // Fungsi untuk simulasi peningkatan skor secara dinamis
  // const increaseScore = (index) => {
  //   setScores((prevScores) => {
  //     const newScores = [...prevScores];
  //     newScores[index] += 1;
  //     return newScores;
  //   });
  // };

  // const totalScore = scores.reduce((acc, score) => acc + score, 0);


  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-6 relative"
      style={{
        backgroundImage: `url('/src/img/bg.jpg')`, // Ganti URL ini dengan URL gambar background yang diinginkan
      }}
    >
      {/* Tombol Next di sudut kanan atas */}
      <button
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        onClick={() => handleAddSoal()}
      >
        Next
      </button>

      {/* Top Section - Answer Count Display with Checklist */}
      <div className="flex justify-center w-full max-w-3xl mb-6 space-x-6">
        {soal.soal_jawaban.map((jawaban, index) => (
          <div key={jawaban.id} className="flex flex-col items-center relative">
            {/* Tampilkan ceklis di atas diagram jika jawaban benar */}
            {jawaban.correct && (
              <div className={`absolute -top-8 ${
                  index === 0
                    ? "text-red-500"
                    : index === 1
                    ? "text-blue-500"
                    : index === 2
                    ? "text-yellow-500"
                    : "text-green-500"
                } text-3xl font-bold`}>✔</div>
            )}

            {/* Diagram batang vertikal dengan background abu-abu */}
            <div className="w-16 h-40 bg-gray-300 rounded-lg overflow-hidden relative mb-2">
              <div
                className={`absolute bottom-0 w-full flex items-center justify-center text-white ${
                  index === 0
                    ? "bg-red-500"
                    : index === 1
                    ? "bg-blue-500"
                    : index === 2
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  height: `${Math.min((answerCounts[jawaban.text_jawaban] || 0) * 10, 100)}%`, // Mengatur tinggi berdasarkan jumlah peserta yang memilih
                  transition: "height 0.5s ease",
                }}
              />
            </div>

            {/* Answer Count Display */}
            <div className={`text-3xl font-bold ${
                  index === 0
                    ? "text-red-500"
                    : index === 1
                    ? "text-blue-500"
                    : index === 2
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}>
              {answerCounts[jawaban.text_jawaban] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4 max-w-3xl w-full">
        {soal.soal_jawaban.map((jawaban, index) => {
          // Cek apakah `text_jawaban` adalah path file atau teks biasa
              const isFile = jawaban.text_jawaban && (jawaban.text_jawaban.includes('/') || jawaban.text_jawaban.match(/\.(pdf|jpg|jpeg|png|docx|txt)$/i));
              const fileName = isFile ? jawaban.text_jawaban.split('\\').pop() : jawaban.text_jawaban;
          return (
            <button
              key={jawaban.id}
              onClick={() => increaseScore(index)}
              className={`flex items-center justify-between w-full text-white text-lg font-semibold py-4 px-6 rounded-lg ${
                index === 0
                  ? "bg-red-400"
                  : index === 1
                  ? "bg-blue-400"
                  : index === 2
                  ? "bg-yellow-400"
                  : "bg-green-400"
              }`}
            >
              {isFile ? (
                   <img
                      src={`${apiUrl}/view/${fileName}`}
                      alt="Soal" 
                      className="w-3/2 h-20 object-cover"
                    /> 
                ) : (
                  answer.text_jawaban
                )} 
              {jawaban.correct && <span className="text-2xl">✔</span>}
            </button>
          )
        })}
      </div>
    </div>
  );
}

export default QuizDisplay;
