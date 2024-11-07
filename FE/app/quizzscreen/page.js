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

function Quiz() {
  const [documentSoal, setDocumentSoal] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [soal, setSoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const apiUrl = process.env.apiUrl;
  const [startTime, setStartTime] = useState(null); // Waktu mulai soal

  const fetchSoal = async (link) => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl + link);
      if (response.status === 200) {
        setSoal(response.data);
        setCountdown(response.data.waktu.detik);
        setStartTime(response.data.waktu.detik); // Catat waktu mulai saat soal dimuat
      }
    } catch (error) {
      console.error("Error fetching quiz_kode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const kode = localStorage.getItem("id_game");
    const documentRef = doc(firestore, `soalUjian${kode}`, kode);
    
    const unsubscribe = onSnapshot(documentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = {
          id: snapshot.id,
          ...snapshot.data(),
        };
        setDocumentSoal(data);
        fetchSoal(data.link_sebelum);
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
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
      if (soal.id_soal_jenis === 1) {
        // Single choice, hanya bisa memilih satu jawaban
        return [answerId];
      } else if (soal.id_soal_jenis === 2) {
        // Multi choice, bisa memilih lebih dari satu jawaban
        if (prevSelected.includes(answerId)) {
          return prevSelected.filter((item) => item !== answerId);
        } else {
          return [...prevSelected, answerId];
        }
      }
      return prevSelected;
    });
  };

  const handleSubmit = async (status) => {   
      let docId = localStorage.getItem("id_game"); 
      try {
        // Referensi ke koleksi tertentu tanpa menggunakan ID khusus
        const collectionRef = collection(firestore, `pesertaJawab${docId}${documentSoal.nomor_soal}`);
        
        // Menggunakan addDoc untuk menambahkan dokumen baru tanpa memperbarui dokumen yang ada
        await addDoc(collectionRef, { 
          kode: localStorage.getItem("id_game"),
          kode_unik: localStorage.getItem("kode_unik"),
          id_peserta: localStorage.getItem("id_peserta")
        }); 
        console.log("Dokumen baru berhasil ditambahkan.");
      } catch (error) {
        console.log("Error menambahkan dokumen:", error);
      }
  };

  const submitAnswers = async () => {

    const endTime = new Date();
    const waktuJawab = countdown; // Waktu jawab dalam detik

    if (selectedAnswers.length === 0) {
        // alert("Pilih jawaban terlebih dahulu!");
        return;
    }

    const answers = selectedAnswers.map((answerId) => {
        const jawaban = soal.soal_jawaban.find((j) => j.id === answerId);
        return {
            id_soal: soal.id,
            jawaban: jawaban.text_jawaban,
            waktu_jawab: waktuJawab,
        };
    });

    const payload = {
        id_quiz_kode: localStorage.getItem("id_game"),
        id_peserta: localStorage.getItem("id_peserta"),
        answers: answers,
    };

    try {
        const response = await axios.post(`${apiUrl}/submit_answers`, payload);
        if (response.status === 200) {
            await handleSubmit();
            // Simpan score_for_question ke dalam localStorage
            const { score_for_question, total_score } = response.data.data;
            localStorage.setItem("score_for_question", score_for_question); // Simpan score_for_question
            // localStorage.setItem("total_score", total_score); // Simpan total_score jika diperlukan

            // Cek jawaban benar atau salah
            const correctAnswerIds = soal.soal_jawaban
                .filter((jawaban) => jawaban.correct)
                .map((jawaban) => jawaban.id);

            const isCorrect = correctAnswerIds.every((id) => selectedAnswers.includes(id)) &&
                              selectedAnswers.length === correctAnswerIds.length;

            if (isCorrect) {
                soalBenar();
            } else {
                soalSalah();
            }
        }
    } catch (error) {
        console.error("Error submitting answers:", error);
        alert("Terjadi kesalahan saat mengirim jawaban");
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

  if (!soal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white">
        <p>No question data available.</p>
      </div>
    );
  }

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
        backgroundImage: `url("/src/img/bg.jpg")`,
      }}
    >
      <div className="bg-gray-800 text-white py-2 px-4 rounded-md text-2xl font-bold mb-6">
        {soal.pertanyaan}
      </div>
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
        {soal.file && (
          <img
            src={soal.file}
            alt="Soal"
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
              {countdown}
            </div> 
          </div>

          {/* Pilihan Jawaban */}
          <div className="grid grid-cols-2 gap-4 mb-4">
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

          {/* Tombol Kirim Jawaban */}
          <button
            onClick={submitAnswers}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mt-4"
          >
            Kirim Jawaban
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
