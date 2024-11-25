"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
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

function QuizKodeCRUD() {
  const [kode, setKode] = useState("");
  const [quizKodes, setQuizKodes] = useState([]);
  const [editingId, setEditingId] = useState(null); // Untuk ID yang sedang diedit

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah item per halaman

  const apiUrl = process.env.apiUrl; // Pastikan environment variabel ini sudah diset

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchQuizKodes = async () => {
    try {
      const response = await axios.get(apiUrl + "/quiz_kode");
      setQuizKodes(response.data.data);
    } catch (error) {
      console.error("Error fetching quiz_kode:", error);
    }
  };

  // Create data baru
  const createQuizKode = async () => {
    try {
      const response = await axios.post(apiUrl + "/quiz_kode", { kode });
      fetchQuizKodes();
      setKode("");
    } catch (error) {
      console.error("Error creating quiz_kode:", error);
    }
  };

  // Update data quiz_kode
  const updateQuizKode = async (id) => {
    try {
      const response = await axios.put(apiUrl + `/quiz_kode/${id}`, { kode });
      fetchQuizKodes();
      setEditingId(null);
      setKode("");
    } catch (error) {
      console.error("Error updating quiz_kode:", error);
    }
  };

  // Delete data quiz_kode
  const deleteQuizKode = async (id) => {
    try {
      await axios.delete(apiUrl + `/quiz_kode/${id}`);
      fetchQuizKodes();
    } catch (error) {
      console.error("Error deleting quiz_kode:", error);
    }
  };

  // Handle submit untuk create/update
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateQuizKode(editingId);
    } else {
      createQuizKode();
    }
  };

  // Mengisi nilai kode untuk diedit
  const handleEdit = (quiz) => {
    setEditingId(quiz.id);
    setKode(quiz.kode);
  };

  const deletePesertaByQuizId = async (idQuizKode) => {
    try {
      const response = await axios.delete(`${apiUrl}/delete_peserta`, {
        params: {
          id_quiz_kode: idQuizKode,
        },
      });
      console.log(response.data.message);
      return response.data;
    } catch (error) {
      console.error("Error deleting peserta:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  useEffect(() => {
    if(sessionStorage.getItem("islogin") != "true"){
      window.location.href = "/admin/login";
    }
    fetchQuizKodes();
  }, []);

  // Logic for pagination
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = quizKodes.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(quizKodes.length / itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

    // Create new item
  const handleAdd = async (status,data) => {  
    try {
      let idCustom = String(data.id); // Konversi ke string jika perlu
      let kode = String(data.kode); // Konversi ke string jika perlu
       // Referensi dokumen dengan custom ID

      await deletePesertaByQuizId(idCustom);
      const docRef = doc(firestore, 'mulaiUjian', idCustom);

      // Menambahkan atau memperbarui dokumen dengan ID spesifik
      await setDoc(docRef, {
        kode: idCustom,
        status: status,
      });

      // Mendapatkan ID dokumen setelah berhasil ditambahkan
      const docId = docRef.id;
      console.log("Document ID:", docId);
      localStorage.setItem("id_game", docId);
      localStorage.setItem("kode_game", kode);
      window.location.href = "/admin/waitingroom";
      // Kamu bisa menggunakan docId ini sesuai kebutuhan
      // Misalnya, simpan ke dalam state atau kirim ke fungsi lain
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:  `url('/src/img/bg.jpg')`,
      }}
    >
      <div className="container mx-auto p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">CRUD Quiz Kode</h2>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="mb-4">
          <label className="block font-semibold mb-2">Kode</label>
          <input
            type="text"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full mb-2"
            placeholder="Masukkan kode"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600"
          >
            {editingId ? "Update" : "Tambah"}
          </button>
        </form>

        {/* Tabel Data Quiz Kode */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr> 
              <th className="border border-gray-300 p-2">Kode</th>
              <th className="border border-gray-300 p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((quiz) => (
              <tr key={quiz.id}> 
                <td className="border border-gray-300 p-2">{quiz.kode}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleEdit(quiz)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteQuizKode(quiz.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded mr-2  hover:bg-red-600"
                  >
                    Hapus
                  </button>
                  <a href={`/admin/quizzsoal?kode=${quiz.id}`}>
                    <button 
                      className="px-2 py-1 bg-green-500 text-white  mr-2 rounded  hover:bg-green-600"
                    >
                      Tambah Soal
                    </button>
                  </a>
                  <button
                    onClick={() => handleAdd("belum",quiz)}
                    className="px-2 py-1 bg-blue-500 text-white rounded mr-2  hover:bg-red-600"
                  >
                    Mulai
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-1">Page {currentPage} of {totalPages}</span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizKodeCRUD;
