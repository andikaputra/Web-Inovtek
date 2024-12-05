"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [logSessions, setLogSessions] = useState([]);
  const [formData, setFormData] = useState({
    jumlah: "",
    produk: "",
    kota: "",
    sumber: "",
    sumber_link: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const apiUrl = process.env.apiUrl;

  // Fetch all data
  const fetchLogSessions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/logsessionkota`);
      setLogSessions(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchLogSessions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLog) {
        await axios.put(`${apiUrl}/logsessionkota/${selectedLog.id}`, formData);
        setSelectedLog(null);
      } else {
        await axios.post(`${apiUrl}/logsessionkota`, formData);
      }
      setFormData({ jumlah: "", produk: "", kota: "", sumber: "", sumber_link: "" });
      fetchLogSessions();
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  const handleEdit = (log) => {
    setSelectedLog(log);
    setFormData(log);
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
      if (!confirmDelete) {
        return; // If user cancels, do nothing
      }
      await axios.delete(`${apiUrl}/logsessionkota/${id}`);
      fetchLogSessions();
    } catch (error) {
      console.error("Error deleting data", error);
    }
  };

  // Handle search
  const filteredLogSessions = logSessions.filter((log) => {
    return (
      log.produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.kota.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogSessions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredLogSessions.length / itemsPerPage);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      {isMenuOpen && (
        <div className="w-1/6 bg-gray-800 text-white p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Menu</h2>
          <ul className="space-y-4">
            <li>
              <a href="/admin/quizzkode" className="block px-4 py-2 rounded hover:bg-gray-700">
                Quiz Kode
              </a>
            </li>
            <li>
              <a href="/sesivr" className="block px-4 py-2 rounded hover:bg-gray-700">
                Sesi VR
              </a>
            </li>
            <li>
              <a href="/sesiar" className="block px-4 py-2 rounded hover:bg-gray-700">
                Sesi AR
              </a>
            </li>
            <li>
              <a href="/admin/logsession" className="block px-4 py-2 rounded hover:bg-gray-700">
                Log Session
              </a>
            </li>
            <li>
              <a href="/admin/logsessionkota" className="block px-4 py-2 rounded hover:bg-gray-700">
                Log Session Kota
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Close Menu
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${isMenuOpen ? "ml-0" : "ml-0 md:ml-16"}`}>
        {!isMenuOpen && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded mb-4 hover:bg-gray-700"
          >
            Open Menu
          </button>
        )}
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Log Session Kota</h1>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Jumlah</label>
                <input
                  type="number"
                  name="jumlah"
                  value={formData.jumlah}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Produk
                </label> 
                <select
                  name="produk"
                  value={formData.produk}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                >
                  <option value="">Pilih Produk</option>
                  <option value="AR">AR</option>
                  <option value="Foto Virtual Tour 360">
                    Foto Virtual Tour 360
                  </option>
                  <option value="Video Virtual Tour 360">
                    Video Virtual Tour 360
                  </option>
                  <option value="VR">VR</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Kota
                </label> 
                <select 
                  name="kota"
                  value={formData.kota}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Pilih Kota</option>
                  <option value="Aceh">Aceh</option>
                  <option value="Ambon">Ambon</option>
                  <option value="Cilacap">Cilacap</option>
                  <option value="Jembrana">Jembrana</option>
                  <option value="Palu">Palu</option>
                  <option value="Pesisir Selatan">Pesisir Selatan</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Sumber</label>
                <input
                  type="text"
                  name="sumber"
                  value={formData.sumber}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">Sumber Link</label>
                <input
                  name="sumber_link"
                  value={formData.sumber_link}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {selectedLog ? "Update" : "Add"}
              </button>
              {selectedLog && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLog(null);
                    setFormData({
                      jumlah: "",
                      produk: "",
                      kota: "",
                      sumber: "",
                      sumber_link: "",
                    });
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search Produk or Kota"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table-auto w-full bg-white shadow-md rounded">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Jumlah</th>
                  <th className="px-4 py-2">Produk</th>
                  <th className="px-4 py-2">Kota</th>
                  <th className="px-4 py-2">Sumber</th>
                  <th className="px-4 py-2">Sumber Link</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((log) => (
                  <tr key={log.id} className="text-center">
                    <td className="border px-4 py-2">{log.id}</td>
                    <td className="border px-4 py-2">{log.jumlah}</td>
                    <td className="border px-4 py-2">{log.produk}</td>
                    <td className="border px-4 py-2">{log.kota}</td>
                    <td className="border px-4 py-2">{log.sumber || "-"}</td>
                    <td className="border px-4 py-2">{log.sumber_link || "-"}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleEdit(log)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 mx-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
