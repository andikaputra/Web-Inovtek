"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function SesiCRUD() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [sesiList, setSesiList] = useState([]);
  const [filteredSesiList, setFilteredSesiList] = useState([]); // For filtered data
  const [searchTerm, setSearchTerm] = useState(""); // Search filter
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const itemsPerPage = 5; // Number of rows per page
  const [formData, setFormData] = useState({
    no_sesi: "",
    nama: "",
    waktu_mulai: "",
    waktu_selesai: "",
    kota: "",
    lokasi: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const apiUrl = `${process.env.apiUrl}/sesi/ar`;

  // Fetch data sesi
  const fetchSesi = async () => {
    try {
      const response = await axios.get(apiUrl);
      setSesiList(response.data);
      setFilteredSesiList(response.data); // Initialize filtered data
    } catch (error) {
      console.error("Error fetching sesi data:", error);
    }
  };

  // Pagination: Calculate visible rows
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredSesiList.slice(firstItemIndex, lastItemIndex);

  // Handle filtering
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = sesiList.filter(
      (sesi) =>
        sesi.no_sesi.toLowerCase().includes(term) ||
        sesi.nama.toLowerCase().includes(term) ||
        sesi.kota.toLowerCase().includes(term) ||
        sesi.lokasi.toLowerCase().includes(term)
    );
    setFilteredSesiList(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  // Export to Excel
  const handleExport = () => {
    const formattedData = filteredSesiList.map((sesi) => ({
      Id: sesi.id,
      "No Sesi": sesi.no_sesi,
      Nama: sesi.nama, 
      Kota: sesi.kota,
      Lokasi: sesi.lokasi,
      "Waktu Mulai": sesi.waktu_mulai
        ? new Date(sesi.waktu_mulai).toLocaleString()
        : "-",
      "Waktu Selesai": sesi.waktu_selesai
        ? new Date(sesi.waktu_selesai).toLocaleString()
        : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sesi");
    XLSX.writeFile(workbook, "data_sesi.xlsx");
  };

  // Create or Update Sesi
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await axios.put(`${apiUrl}/${editingId}`, formData);
      } else {
        // Create
        await axios.post(apiUrl, formData);
      }
      fetchSesi();
      setFormData({
        no_sesi: "",
        nama: "",
        waktu_mulai: "",
        waktu_selesai: "",
        kota: localStorage.getItem("kota_vr") || "",
        lokasi: localStorage.getItem("lokasi_vr") || "",
      });
      setEditingId(null);
      setErrorMessage("");
    } catch (error) {
      const errMsg =
        error.response?.data?.error || "Terjadi kesalahan saat menyimpan data.";
      setErrorMessage(errMsg);
    }
  };

  // Edit Sesi
  const handleEdit = (sesi) => {
    setEditingId(sesi.id);
    setFormData({
      no_sesi: sesi.no_sesi || "",
      nama: sesi.nama || "",
      waktu_mulai: sesi.waktu_mulai || "",
      waktu_selesai: sesi.waktu_selesai || "", 
      kota: sesi.kota || "",
      lokasi: sesi.lokasi || "", 
    });
  };

  // Delete Sesi (Soft Delete)
  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Apakah Anda yakin ingin menghapus data ini?"
      );
      if (!confirmDelete) {
        return; // If user cancels, do nothing
      }

      await axios.delete(`${apiUrl}/${id}`);
      fetchSesi();
    } catch (error) {
      console.error("Error deleting sesi:", error);
    }
  };

  useEffect(() => {
    const storedKota = localStorage.getItem("kota_ar");
    const storedLokasi = localStorage.getItem("lokasi_ar");

    // Update state in a single call to avoid overwriting
    setFormData((prev) => ({
      ...prev,
      kota: storedKota || prev.kota, // Use stored value or keep the existing one
      lokasi: storedLokasi || prev.lokasi,
    }));
    fetchSesi();
  }, []);

  // Handle pagination
  const totalPages = Math.ceil(filteredSesiList.length / itemsPerPage);
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
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
        <div className="min-h-screen bg-gray-100 py-8 bg-cover bg-center">
          <div className="container mx-auto p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-6">AR log user play game</h1>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Kota */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Kota
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    value={formData.kota} // Controlled value
                    onChange={(e) => {
                      localStorage.setItem("kota_ar", e.target.value);
                      setFormData({ ...formData, kota: e.target.value })
                    }}
                  >
                    <option value="">Pilih Kota</option>
                    <option value="Ambon">Ambon</option>
                    <option value="Cilacap">Cilacap</option>
                    <option value="Jembrana">Jembrana</option>
                    <option value="Palu">Palu</option>
                    <option value="Pesisir Selatan">Pesisir Selatan</option>
                  </select>
                </div>

                {/* Kota */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    placeholder="Masukkan Lokasi"
                    value={formData.lokasi}
                    onChange={(e) => {
                      localStorage.setItem("lokasi_ar", e.target.value);
                      setFormData({ ...formData, lokasi: e.target.value })
                    }}
                  />
                </div>

                {/* No Sesi */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    No Sesi
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    placeholder="Masukkan No Sesi"
                    value={formData.no_sesi}
                    onChange={(e) => setFormData({ ...formData, no_sesi: e.target.value })}
                  />
                </div>

                {/* Nama */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nama
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    placeholder="Masukkan Nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                {/* Waktu Mulai */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Waktu Mulai
                  </label>
                  <input
                    type="datetime-local"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    value={formData.waktu_mulai}
                    onChange={(e) =>
                      setFormData({ ...formData, waktu_mulai: e.target.value })
                    }
                  />
                </div>

                {/* Waktu Selesai */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Waktu Selesai
                  </label>
                  <input
                    type="datetime-local"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    value={formData.waktu_selesai}
                    onChange={(e) =>
                      setFormData({ ...formData, waktu_selesai: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingId ? "Update" : "Tambah"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        no_sesi: "",
                        nama: "",
                        waktu_mulai: "",
                        waktu_selesai: "",
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>


             {/* Search Bar and Export Button */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Search Bar */}
              <div>
                <input
                  type="text"
                  placeholder="Cari berdasarkan No Sesi, Nama, atau Lokasi"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              {/* Export Button */}
              <div className="text-right">
                <button
                  onClick={handleExport}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Export to Excel
                </button>
              </div>
            </div>

            {/* Table */}
            <table className="table-auto w-full bg-white shadow-md rounded">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">No</th>
                  <th className="px-4 py-2">No Sesi</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Kota</th>
                  <th className="px-4 py-2">Lokasi</th>
                  <th className="px-4 py-2">Waktu Mulai</th>
                  <th className="px-4 py-2">Waktu Selesai</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((sesi, index) => (
                  <tr key={sesi.id} className="border-t">
                    <td className="px-4 py-2 text-center">
                      {firstItemIndex + index + 1}
                    </td>
                    <td className="px-4 py-2">{sesi.no_sesi || "-"}</td>
                    <td className="px-4 py-2">{sesi.nama || "-"}</td>
                    <td className="px-4 py-2">{sesi.kota || "-"}</td>
                    <td className="px-4 py-2">{sesi.lokasi || "-"}</td>
                    <td className="px-4 py-2">
                      {sesi.waktu_mulai
                        ? new Date(sesi.waktu_mulai).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {sesi.waktu_selesai
                        ? new Date(sesi.waktu_selesai).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(sesi)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sesi.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 text-black"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 text-black"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SesiCRUD;
