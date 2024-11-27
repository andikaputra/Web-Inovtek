"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from 'qrcode.react';
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
 

const WaitingRoom = () => {
  const [documentSoal, setDocumentSoal] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gamePin, setGamePin] = useState([]);
  const baseUrl = process.env.baseUrl; // Pastikan environment variabel ini sudah diset
  const [text, setText] = useState(baseUrl); 

  const mulaiUjian = async () => {
    window.location.href = "/admin/question";
  };

  const apiUrl = process.env.apiUrl; // Pastikan environment variabel ini sudah diset

  // Fetch data quiz_kode dari API saat halaman di-load
  const fetchPeserta = async () => {
    try {
      setPlayers([]);
      let id_game = localStorage.getItem("id_game");
      const response = await axios.get(`${apiUrl }/peserta/${id_game}`);
      setPlayers(response.data);
    } catch (error) {
      console.log("Error fetching pesertas:", error);
    }
  };

    // Create new item
  const handleAdd = async (status) => {  

    let docId = localStorage.getItem("id_game");

    try {
      // Referensi ke dokumen tertentu berdasarkan ID
      const docRef = doc(firestore, 'mulaiUjian', docId);
      
      // Menggunakan setDoc untuk membuat atau memperbarui dokumen
      await setDoc(docRef, { 
        kode: localStorage.getItem("id_game"),
        status:status 
      }, { merge: true });

      await handleAddSoal();
      console.log(`Document with ID ${docId} has been created/updated.`); 
    } catch (error) {
      console.log("Error creating/updating document:", error);
    }
  };

  // Create new item
  const handleAddSoal = async (status) => {  

    let docId = localStorage.getItem("id_game");

    try {
      // Referensi ke dokumen tertentu berdasarkan ID
      const docRef = doc(firestore, `soalUjian${localStorage.getItem("id_game")}`, docId);
      
      // Menggunakan setDoc untuk membuat atau memperbarui dokumen
      await setDoc(docRef, { 
        kode: docId,
        link_sebelum:`/soal/ujian/${localStorage.getItem("id_game")}/0`,
        link_setelah:`/soal/ujian/${localStorage.getItem("id_game")}/1`,
        nomor_soal:1,
        nomor_next_soal:2,
        next_page:"question",
        start_ujian:false
      }, { merge: true });
      
      mulaiUjian(); 
      console.log(`Document with ID ${docId} has been created/updated.`); 
    } catch (error) {
      console.log("Error creating/updating document:", error);
    }
  };

  useEffect(() => { 
      // Buat referensi ke dokumen menggunakan `doc` dan `kode` dari localStorage
    const itemsCollection = collection(firestore, `dataPeserta${localStorage.getItem("id_game")}`);
    
    // Listener untuk memantau perubahan data secara real-time
    const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      fetchPeserta();
    });

    // Bersihkan listener ketika komponen tidak digunakan
    return () => unsubscribe();
  }, []);

  useEffect(() => { 
    if(sessionStorage.getItem("islogin") != "true"){
      window.location.href = "/admin/login";
    }
    setGamePin(localStorage.getItem("kode_game"));
    fetchPeserta();
  }, []);

  return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100">
      {/* Header */}
      <div className="fixed top-0 inset-x-0 max-w-3xl mx-auto flex justify-between items-center bg-white p-4 rounded-b-lg shadow-md">
        <div className="flex flex-col items-center">
          <p className="text-sm font-light">Join at <span className="font-bold">www.vroot.com</span><br />or with the VRoot! app</p>
        </div>
        <div className="px-4 text-4xl font-bold text-gray-800">{gamePin}</div>
        <div> 
          <QRCodeCanvas
            value={text}
            size={100}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
          />
        </div>
      </div>

      {/* Player List in Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-40 mb-8">
        {players.map((player, index) => (
          <div key={index} className="flex flex-col items-center bg-white text-purple-700 p-4 rounded-lg shadow-lg">
            <span className="text-4xl mb-2">{player.avatar}</span>
            <span className="text-xl font-semibold">{player.kode_unik}</span>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <button className="bg-purple-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-purple-800" onClick={() => handleAdd("mulai")}>
        Start
      </button>
    </div>
  );
};

export default WaitingRoom;
