"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; // Pastikan menginstall axios atau gunakan fetch
import { useLocation } from "react-router-dom";


function QuizAdmin() {
  const [isOpenExcel, setIsOpenExcel] = useState(false);
  const [kode, setKode] = useState("");
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [answersQuiz, setAnswersQuiz] = useState([
    { text: "", color: "bg-red-500", correct: false, image: null, file:null },
    { text: "", color: "bg-blue-500", correct: false, image: null, file:null },
    { text: "", color: "bg-yellow-500", correct: false, image: null, file:null },
    { text: "", color: "bg-green-500", correct: true, image: null, file:null },
  ]);
  const [answersTF, setAnswersTF] = useState([
    { text: "True", color: "bg-red-500", correct: false},
    { text: "False", color: "bg-blue-500", correct: true}
  ]);
  const [answersUraian, setAnswersUraian] = useState([
    { text: "", color: "bg-red-500", correct: false}
  ]);
  const [quizList, setQuizList] = useState([]); // Menyimpan list soal yang telah diinput
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk menyimpan opsi dari API
  const [questionTypes, setQuestionTypes] = useState([]);
  const [timeLimits, setTimeLimits] = useState([]);


  const [fileExcel, setFileExcel] = useState(null);  
  const [formData, setFormData] = useState({
    id_quiz_kode: '',
    id_soal_jenis: '',
    id_waktu: '',
    pertanyaan: '',
    layout: ''
  });
  const [message, setMessage] = useState('');
  const apiUrl = process.env.apiUrl;

  const handleFileChangeExcel = (e) => {
    setFileExcel(e.target.files[0]);
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!fileExcel) {
      alert("Please select a file.");
      return;
    }
    if (!kode) {
      alert("Please enter Quiz Kode.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileExcel);
    formData.append("id_quiz_kode", kode);

    try {
      const response = await axios.post(`${apiUrl}/upload-soal-excel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchQuestions(kode);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred.");
    }
  };

 const fetchDataType = async () => {
    try { 
      const response = await axios.get(apiUrl + "/soal_jenis"); // Ganti URL dengan endpoint API sebenarnya
      console.log(response.data.data)
      setQuestionTypes(response.data.data); // Pastikan API mengembalikan data dalam format { types: [...] } 
    } catch (error) {
      console.log("Error fetching quiz options:", error);
    }
  };

 const fetchDataTIme = async () => {
    try {
      const response = await axios.get(apiUrl + "/waktu"); // Ganti URL dengan endpoint API sebenarnya
      console.log(response.data.data)
      setTimeLimits(response.data.data); // Pastikan API mengembalikan data dalam format { types: [...] } 
    } catch (error) {
      console.log("Error fetching quiz options:", error);
    }
  };

 const fetchQuestions = async (kode) => {
    try {
      setQuizList([]);
      const response = await axios.get(apiUrl + `/soal/${kode}`);
      setQuizList(response.data); // Simpan data soal di state
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch questions');
      setLoading(false);
    }
  };


  const handleSubmit = async () => { 
    
    // Buat FormData dan tambahkan file serta data lainnya
    const data = new FormData();
    data.append('file', file);
    data.append('id_quiz_kode', kode);
    data.append('id_soal_jenis', type);
    data.append('id_waktu', timeLimit);
    data.append('pertanyaan', question);
    data.append('layout', 1);

    // Tambahkan array of objects
    answersQuiz.forEach((answer, index) => {
      // Konversi setiap objek menjadi string JSON 
      data.append(`answers[${index}]`, JSON.stringify({
        text: answer.text,
        correct: answer.correct
      }));

      if (answer.file) {
        data.append(`file_${index}`, answer.file);
      }
    });

    try {
      const response = await axios.post(apiUrl+ '/soal', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) { // Cek jika status respons adalah 200
        setMessage('File uploaded successfully!');
        setQuestion("");
        setImage(null);
        setFile(null);
        setType("");
        setTimeLimit("");
        setAnswersQuiz([
          { text: "", color: "bg-red-500", correct: false, image: null, file:null },
          { text: "", color: "bg-blue-500", correct: false, image: null, file:null },
          { text: "", color: "bg-yellow-500", correct: false, image: null, file:null },
          { text: "", color: "bg-green-500", correct: false, image: null, file:null },
        ]);
        fetchQuestions(kode);
      } else {
        setMessage('Failed to upload file.');
      }
    } catch (error) {
      setMessage('Failed to upload file.');
    }
  };

 // Fungsi untuk menghapus soal berdasarkan ID
  const handleDelete = async (id) => {
    // Menampilkan dialog konfirmasi
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus soal ini?");
    
    // Jika pengguna menekan "OK", lanjutkan penghapusan
    if (confirmed) {
      try {
        await axios.delete(`${apiUrl}/soal/${id}`);
        setQuizList(quizList.filter((question) => question.id !== id)); // Hapus soal dari state
      } catch (error) {
        console.log('Failed to delete question', error);
      }
    }
  };

    // Fetch data dari API
  useEffect(() => {
    if(sessionStorage.getItem("islogin") != "true"){
      window.location.href = "/admin/login";
    }
    const queryParams = new URLSearchParams(window.location.search);
    const kodeParam = queryParams.get("kode");
    setKode(kodeParam);
    fetchDataType();
    fetchDataTIme();
    fetchQuestions(kodeParam);
  }, []);

  const handleImageChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
    setFile(e.target.files[0]);
  };

  const handleRemoveImage = () => {
    setImage(null); // Menghapus gambar soal
    setFile(null);
  };

  const handleAnswerImageChange = (index, e) => {
    const newAnswers = [...answersQuiz];
    newAnswers[index].image = URL.createObjectURL(e.target.files[0]);
    newAnswers[index].file =  e.target.files[0];
    newAnswers[index].text = ""; // Mengosongkan teks jika gambar diunggah
    setAnswersQuiz(newAnswers);
  };

  const handleRemoveAnswerImage = (index) => {
    const newAnswers = [...answersQuiz];
    newAnswers[index].image = null; // Menghapus gambar pada jawaban tertentu
    setAnswersQuiz(newAnswers);
  };

  const handleAnswerChange = (index, text) => {
    const newAnswers = [...answersQuiz];
    newAnswers[index].text = text;
    newAnswers[index].image = null; // Mengosongkan gambar jika teks diinput
    setAnswersQuiz(newAnswers);
  };

  const handleCorrectAnswer = (index) => { 
    console.log(answersQuiz);
    if(type == 1) {
      const newAnswers = answersQuiz.map((answer, i) => ({
        ...answer,
        correct: i === index,
      }));
      setAnswersQuiz(newAnswers); 
    }else if(type == 2){
      const newAnswers = answersQuiz.map((answer, i) => (
          i === index ? { ...answer, correct: !answer.correct } : answer
      ));
      
      setAnswersQuiz(newAnswers); 
    }else if(type == 3){
      const newAnswers = answersTF.map((answer, i) => ({
        ...answer,
        correct: i === index,
      }));
      setAnswersTF(newAnswers); 
    }
  };

  const handleSaveQuestion = () => {
    // setQuizList([
    //   ...quizList,
    //   {
    //     question,
    //     image,
    //     type,
    //     timeLimit,
    //     answers,
    //   },
    // ]);
    handleSubmit();
    
  };

  const handleBack = () =>{
    window.location.href = "/admin/quizzkode";
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-6"
      style={{
        backgroundImage: `url('/src/img/bg.jpg')`,
      }}
    > 
      {isOpenExcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Soal Excel</h2>
            <form onSubmit={handleUploadExcel}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Upload File</label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChangeExcel}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOpenExcel(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </form>
            {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
          </div>
        </div>
      )} 
      <div className="max-w-3xl w-full bg-white bg-opacity-80 shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">Input Soal Baru</h2>

        {/* Input Pertanyaan */}
        <div className="mb-4"> 
          <label className="block font-semibold mb-2">Pertanyaan</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Masukkan pertanyaan di sini"
          />
        </div>

        {/* Input Tipe Pertanyaan */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Tipe Pertanyaan</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value=""> {/* Pastikan 'value' sesuai dengan key dari data API */}
                  Pilih Tipe Pertanyaan {/* Pastikan 'label' sesuai dengan key dari data API */}
            </option>
            {questionTypes.length > 0 ? (
              questionTypes.map((item, index) => (
                <option key={index} value={item.id}> {/* Pastikan 'value' sesuai dengan key dari data API */}
                  {item.nama} {/* Pastikan 'label' sesuai dengan key dari data API */}
                </option>
              ))
            ) : (
              <option>Loading...</option> // Ditampilkan saat data belum dimuat
            )}
          </select>
        </div>


        {/* Batas Waktu */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Batas Waktu (detik)</label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value=""> {/* Pastikan 'value' sesuai dengan key dari data API */}
                  Pilih Waktu {/* Pastikan 'label' sesuai dengan key dari data API */}
            </option>
            {timeLimits.length > 0 ? (
              timeLimits.map((item, index) => (
                <option key={index} value={item.id}> {/* Pastikan 'value' sesuai dengan key dari data API */}
                  {item.nama} {/* Pastikan 'label' sesuai dengan key dari data API */}
                </option>
              ))
            ) : (
              <option>Loading...</option> // Ditampilkan saat data belum dimuat
            )}
          </select>
        </div> 

        {/* Input Gambar */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Gambar Soal</label>
          <input type="file" onChange={handleImageChange} className="w-full" />
          {image && (
            <div className="mt-4">
              <img src={image} alt="Preview" className="w-full h-64 object-cover rounded" />
              <button onClick={handleRemoveImage} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
                Hapus Gambar
              </button>
            </div>
          )}
        </div>

        {
          type == 1 || type == 2 ? (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Pilihan Jawaban</label>
              {answersQuiz.map((answer, index) => (
                <div key={index} className="flex items-center mb-2">
                  {!answer.image && (
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className={`w-full p-2 border border-gray-300 rounded ${answer.color} text-white font-semibold mr-4`}
                      placeholder={`Jawaban ${index + 1}`}
                    />
                  )}

                  {!answer.text && (
                    <input type="file" onChange={(e) => handleAnswerImageChange(index, e)} className="mr-4" />
                  )}

                  {answer.image && (
                    <div className="flex items-center">
                      <img
                        src={answer.image}
                        alt="Answer Preview"
                        className="w-12 h-12 object-cover rounded mr-2"
                      />
                      <button
                        onClick={() => handleRemoveAnswerImage(index)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleCorrectAnswer(index)}
                    className={`px-4 py-2 rounded ${
                      answer.correct ? "bg-green-600 text-white" : "bg-gray-300 text-gray-800"
                    }`}
                  >
                    {answer.correct ? "Benar" : "Pilih"}
                  </button>
                </div>
              ))}
            </div>
          ) : type == 3 ? (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Pilihan Jawaban</label>
              {answersTF.map((answer, index) => (
                <div key={index} className="flex items-center mb-2">
                  
                  <button 
                    className={`w-full p-2 border border-gray-300 rounded ${answer.color} text-white font-semibold mr-4
                    }`}
                  >
                    {answer.text}
                  </button>

                  <button
                    onClick={() => handleCorrectAnswer(index)}
                    className={`px-4 py-2 rounded ${
                      answer.correct ? "bg-green-600 text-white" : "bg-gray-300 text-gray-800"
                    }`}
                  >
                    {answer.correct ? "Benar" : "Pilih"}
                  </button>
                </div>
              ))}
            </div>
          ) : type == 3 ? (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Jawaban</label>
              {answersUraian.map((answer, index) => (
                <div key={index} className="flex items-center mb-2">
                  {!answer.image && (
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className={`w-full p-2 border border-gray-300 rounded  text-white font-semibold mr-4`}
                      placeholder={`Jawaban`}
                    />
                  )} 
                </div>
              ))}
            </div>
          ) : null
        }

        

        <div className="flex space-x-2 justify-center">
          <button
            onClick={handleBack}
            className="w-1/2 bg-gray-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Kembali
          </button>
          <button
            onClick={handleSaveQuestion}
            className="w-1/2 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Simpan Soal
          </button>
          <button
            onClick={() => setIsOpenExcel(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload Soal Excel
          </button>
        </div>
      </div>

     <div className="max-w-3xl w-full">
        <h3 className="text-2xl font-bold mb-4 text-white">Daftar Soal</h3>
        {quizList.map((question, index) => ( 
          <div
            key={question.id}
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2>{index + 1}. {question.pertanyaan}</h2>
              {question.file && (
                <p>
                  <a href={apiUrl + `/view/${question.file.split('\\').pop()}`} target="_blank" rel="noopener noreferrer">
                    View File  
                  </a>
                </p>
              )}
              <h3>Answers:</h3>
              <ul>
                {question.jawaban.map((answer, i) => {
                  const alphabet = String.fromCharCode(65 + i);
                  
                  // Cek apakah `text_jawaban` adalah path file atau teks biasa
                  const isFile = answer.text_jawaban && (answer.text_jawaban.includes('/') || answer.text_jawaban.match(/\.(pdf|jpg|jpeg|png|docx|txt)$/i));
                  const fileName = isFile ? answer.text_jawaban.split('\\').pop() : answer.text_jawaban;

                  return (
                    <li key={answer.id} style={{ color: answer.correct ? 'green' : 'black' }}>
                      {alphabet}.{" "}
                      {isFile ? (
                        <a href={apiUrl + `/view/${fileName}`} target="_blank" rel="noopener noreferrer">
                          View Answer File
                        </a>
                      ) : (
                        answer.text_jawaban
                      )}
                      {answer.correct && ' (Correct)'}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <button
              onClick={() => handleDelete(question.id)}
              style={{
                marginLeft: '20px',
                padding: '8px 16px',
                color: 'white',
                backgroundColor: 'red',
                border: 'none',
                borderRadius: '4px',
                alignSelf: 'flex-start'
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default QuizAdmin;
