"use client";

import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const apiUrl = process.env.apiUrl;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/login`, {
        username,
        password,
      });

      if (response.status === 200) {
        setMessage(response.data.message);
        console.log("Login successful");
        sessionStorage.setItem("islogin", "true");
        if (typeof window !== "undefined") {
          window.location.href = "/admin/quizzkode";
        } 
        // Lakukan sesuatu setelah login berhasil (redirect, simpan token, dll)
      }
    } catch (error) {
      setMessage(error.response?.data.message || "Login failed");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/src/img/bg.jpg')`, }} // Ganti dengan URL gambar Anda
    >
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>
        
        {message && <p className="text-center text-red-500">{message}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium  text-black">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400  text-black"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
