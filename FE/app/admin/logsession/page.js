"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    jumlah: "",
    produk: "",
    sumber: "",
    sumber_link: "",
  });
  const [editId, setEditId] = useState(null);

  // State untuk pagination dan search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Jumlah item per halaman
  const apiUrl = process.env.apiUrl;

  // Fetch data dari API
  const fetchLogs = async () => {
    const response = await axios.get(`${apiUrl}/log_session`);
    setLogs(response.data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle perubahan pada form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle submit untuk create dan update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      // Update log
      await axios.put(`${apiUrl}/log_session/${editId}`, form);
    } else {
      // Create new log
      await axios.post(`${apiUrl}/log_session`, form);
    }
    fetchLogs();
    setForm({ jumlah: "", produk: "", sumber: "", sumber_link: "" });
    setEditId(null);
  };

  // Handle edit
  const handleEdit = (log) => {
    setForm(log);
    setEditId(log.id);
  };

  // Handle delete
  const handleDelete = async (id) => {
     const confirmDelete = window.confirm(
        "Apakah Anda yakin ingin menghapus data ini?"
      );
      if (!confirmDelete) {
        return; // If user cancels, do nothing
      }
    await axios.delete(`${apiUrl}/log_session/${id}`);
    fetchLogs();
  };

  // Filter dan paginate data
  const filteredLogs = logs.filter((log) =>
    Object.values(log).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat search
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page > 0 && page <= Math.ceil(filteredLogs.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      {isMenuOpen && (
        <div className="w-1/6 bg-gray-800 text-white p-6">
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
            <li>
              <a
                href="/admin/logsession"
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Log Session
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
        <div className="container mx-auto p-5">
          <h1 className="text-2xl font-bold mb-5">Log Session Management</h1>


          {/* Form */}
          <form className="mb-5 p-5 bg-gray-100 rounded" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-3">
                <label className="block mb-1">Jumlah:</label>
                <input
                  type="number"
                  name="jumlah"
                  value={form.jumlah}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Produk:</label>
                <select
                  name="produk"
                  value={form.produk}
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
              <div className="mb-3">
                <label className="block mb-1">Sumber:</label>
                <input
                  type="text"
                  name="sumber"
                  value={form.sumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="mb-3">
                <label className="block mb-1">Sumber Link:</label>
                <input
                  type="text"
                  name="sumber_link"
                  value={form.sumber_link}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4"
            >
              {editId ? "Update Log" : "Create Log"}
            </button>
          </form>

          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          {/* Table */}
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">ID</th>
                <th className="border border-gray-300 p-2">Jumlah</th>
                <th className="border border-gray-300 p-2">Produk</th>
                <th className="border border-gray-300 p-2">Sumber</th>
                <th className="border border-gray-300 p-2">Sumber Link</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td className="border border-gray-300 p-2">{log.id}</td>
                  <td className="border border-gray-300 p-2">{log.jumlah}</td>
                  <td className="border border-gray-300 p-2">{log.produk}</td>
                  <td className="border border-gray-300 p-2">{log.sumber}</td>
                  <td className="border border-gray-300 p-2">
                    {log.sumber_link}
                  </td>
                  <td className="border border-gray-300 p-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(log)}
                      className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-300"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of{" "}
              {Math.ceil(filteredLogs.length / itemsPerPage)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 rounded ${
                currentPage ===
                Math.ceil(filteredLogs.length / itemsPerPage)
                  ? "bg-gray-300"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              disabled={
                currentPage === Math.ceil(filteredLogs.length / itemsPerPage)
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
