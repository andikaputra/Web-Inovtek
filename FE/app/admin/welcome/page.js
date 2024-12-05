"use client";

import React, { useState, useEffect } from "react";

function WelcomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(true); // State to toggle menu

  useEffect(() => {
    if(typeof window !== "undefined" && sessionStorage.getItem("islogin") != "true"){
      window.location.href = "/admin/login";
    } 
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      {isMenuOpen && (
        <div className="w-1/6 bg-gray-800 text-white p-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="bg-gray-700 px-4 py-2 text-sm rounded mb-4 hover:bg-gray-600"
          >
            Close Menu
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">Menu</h2>
          <ul className="space-y-4">
            <li>
              <a
                href="/admin/quizzkode"
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Quiz Kode
              </a>
            </li>
            <li>
              <a
                href="/sesivr"
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Sesi VR
              </a>
            </li>
            <li>
              <a
                href="/sesiar"
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Sesi AR
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 p-10 ${isMenuOpen ? "ml-0" : "ml-0 md:ml-16"}`}>
        {!isMenuOpen && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded mb-4 hover:bg-gray-700"
          >
            Open Menu
          </button>
        )}
        <h1 className="text-4xl font-bold mb-6">Selamat Datang</h1>
      </div>
    </div>
  );
}

export default WelcomePage;
