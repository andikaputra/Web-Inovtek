"use client";

import React, { useState } from "react";

function QuizAdmin() {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [answers, setAnswers] = useState([
    { text: "", color: "bg-red-500", correct: false },
    { text: "", color: "bg-blue-500", correct: false },
    { text: "", color: "bg-yellow-500", correct: false },
    { text: "", color: "bg-green-500", correct: true }, // contoh jawaban benar
  ]);
  const [quizList, setQuizList] = useState([]); // Menyimpan list soal yang telah diinput

  const handleImageChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleAnswerChange = (index, text) => {
    const newAnswers = [...answers];
    newAnswers[index].text = text;
    setAnswers(newAnswers);
  };

  const handleCorrectAnswer = (index) => {
    const newAnswers = answers.map((answer, i) => ({
      ...answer,
      correct: i === index,
    }));
    setAnswers(newAnswers);
  };

  const handleSaveQuestion = () => {
    // Menyimpan soal baru ke dalam list
    setQuizList([
      ...quizList,
      {
        question,
        image,
        answers,
      },
    ]);

    // Reset input setelah disimpan
    setQuestion("");
    setImage(null);
    setAnswers([
      { text: "", color: "bg-red-500", correct: false },
      { text: "", color: "bg-blue-500", correct: false },
      { text: "", color: "bg-yellow-500", correct: false },
      { text: "", color: "bg-green-500", correct: false },
    ]);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-6"
      style={{
        backgroundImage: `url('/src/img/bg.jpg')`, // Ganti dengan path gambar background Anda
      }}
    >
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

        {/* Input Gambar */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Gambar Soal</label>
          <input type="file" onChange={handleImageChange} className="w-full" />
          {image && (
            <img src={image} alt="Preview" className="mt-4 w-full h-64 object-cover rounded" />
          )}
        </div>

        {/* Input Jawaban */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Pilihan Jawaban</label>
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={answer.text}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded ${answer.color} text-white font-semibold mr-4`}
                placeholder={`Jawaban ${index + 1}`}
              />
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

        {/* Tombol Simpan */}
        <div className="text-center">
          <button
            onClick={handleSaveQuestion}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Simpan Soal
          </button>
        </div>
      </div>

      {/* List Soal */}
      <div className="max-w-3xl w-full">
        <h3 className="text-2xl font-bold mb-4 text-white">Daftar Soal</h3>
        {quizList.map((quiz, index) => (
          <div key={index} className="bg-white bg-opacity-80 shadow-lg rounded-lg p-4 mb-4">
            <h4 className="text-xl font-semibold mb-2">{quiz.question}</h4>
            {quiz.image && (
              <img src={quiz.image} alt="Quiz" className="w-full h-48 object-cover rounded mb-4" />
            )}
            <div>
              {quiz.answers.map((answer, i) => (
                <div
                  key={i}
                  className={`p-2 rounded mb-2 text-white font-semibold ${
                    answer.color
                  } ${answer.correct ? "border-2 border-green-600" : ""}`}
                >
                  {answer.text} {answer.correct && <span className="text-green-300 ml-2">✓</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizAdmin;
