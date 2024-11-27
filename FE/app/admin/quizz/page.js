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

function Quiz() {
  const [documentSoal, setDocumentSoal] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [soal, setSoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(0); // State untuk countdown
  const [tampilJawaban, setTampilJawaban] = useState(false); // State untuk menampilkan ceklis jawaban benar
  const apiUrl = process.env.apiUrl;

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchSoal = async (link) => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl + link);
      if (response.status === 200) {
        setSoal(response.data);
        setCountdown(response.data.waktu.detik); // Inisialisasi countdown dari waktu.detik
      }
    } catch (error) {
      console.log("Error fetching quiz_kode:", error);
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
    const unsubscribeDoc = onSnapshot(documentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = {
          id: snapshot.id,
          ...snapshot.data(),
        };
        setDocumentSoal(data); // Simpan data ke state
        fetchSoal(data.link_sebelum);
        console.log("Document data:", data); // Debug atau tampilkan data

        // Membuat listener untuk jumlah data di koleksi terkait
        const collectionRef = collection(firestore, `pesertaJawab${kode}${data.nomor_soal}`);
        const unsubscribeCollection = onSnapshot(collectionRef, (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDataCount(items.length); // Mengupdate jumlah data
        });

        // Bersihkan listener koleksi jika tidak diperlukan lagi
        return () => unsubscribeCollection();
      } else {
        console.log("No such document!");
      }
    });

    // Bersihkan listener ketika komponen tidak digunakan
    return () => unsubscribeDoc();
  }, []);


  // Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          handleAddSoal();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);
 

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
        next_page:"quizdisplay",
        start_ujian:false
      }, { merge: true });
      
       window.location.href = "/admin/quizzdisplay";
      setTampilJawaban(true); // Set tampilJawaban ke true saat waktu habis
      console.log(`Document with ID ${docId} has been created/updated.`); 
    } catch (error) {
      console.log("Error creating/updating document:", error);
    }
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

  // Fungsi untuk menavigasi ke soal berikutnya
  const handleNext = () => {
    alert("Navigasi ke soal berikutnya");
  };

  // const getListener = (callback) => {
  //   let docId = localStorage.getItem("id_game");
  //   let nomor_soal = documentSoal['nomor_soal'];
  //   const collectionRef = collection(firestore, `pesertaJawab${docId}${nomor_soal}`);
    
  //   const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
  //     const items = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
      
  //     callback(items);
  //   }, (error) => {
  //     console.log("Error fetching data:", error);
  //   });

  //   return unsubscribe;
  // };

  const [dataCount, setDataCount] = useState(0);


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
      className="flex flex-col w-full h-full items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url("/src/img/bg.jpg")`,
      }}
    >
      {/* Tombol Next di sudut kanan atas */}
      {/* <button
        onClick={handleNext}
        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg"
      >
        Next
      </button>  */}

      <div className="bg-gray-800 text-white py-2 px-4 rounded-md text-2xl font-bold mb-6">
        {soal.pertanyaan}
      </div>
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
        {soal.file && (
          <img
            src={`${apiUrl}/view/${soal.file.split('\\').pop()}`}
            alt="Soal"
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
              {dataCount <= 0 ? 0 : dataCount} Answers
            </div>
          </div>

          {/* Pilihan Jawaban */}
          <div className="grid grid-cols-2 gap-4">
            {soal.soal_jawaban.map((jawaban, index) => {
              // Cek apakah `text_jawaban` adalah path file atau teks biasa
              const isFile = jawaban.text_jawaban && (jawaban.text_jawaban.includes('/') || jawaban.text_jawaban.match(/\.(pdf|jpg|jpeg|png|docx|txt)$/i));
              const fileName = isFile ? jawaban.text_jawaban.split('\\').pop() : jawaban.text_jawaban;
              return (
                <button
                  key={jawaban.id}
                  onClick={() => handleSelectAnswer(jawaban.id)}
                  className={`flex items-center justify-center font-semibold py-3 rounded-lg ${
                    selectedAnswers.includes(jawaban.id)
                      ? "ring-4 ring-green-400"
                      : backgroundColors[index % backgroundColors.length]
                  }`}
                > 
                  {isFile ? (
                     <img
                        src={`${apiUrl}/view/${fileName}`}
                        alt="Soal" 
                        className="w-3/2 h-20 object-cover"
                      /> 
                  ) : (
                    jawaban.text_jawaban
                  )} 
                  {selectedAnswers.includes(jawaban.id) && <span className="ml-2">✔️</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
