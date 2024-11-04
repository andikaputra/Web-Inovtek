import React from "react"; 


function Quiz() {
  return (
    <div
      className="flex flex-col w-full h-full items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:  `url("/src/img/bg.jpg")`, // Ganti dengan URL gambar background yang diinginkan
      }}
    >
      <div className="bg-gray-800 text-white py-2 px-4 rounded-md text-2xl font-bold mb-6">
        Suara Ayam
      </div>
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
        <img
          src="https://via.placeholder.com/600x400" // ganti dengan gambar ayam yang diinginkan
          alt="Suara Ayam"
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
              11
            </div>
            <div className="bg-blue-600 text-white rounded-full px-4 py-2 font-semibold text-lg">
              30 Answers
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-700">
              Guk Guk
            </button>
            <button className="bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-700">
              Mooooooo
            </button>
            <button className="bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-700">
              Meonnngggg
            </button>
            <button className="bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-700">
              Kukuruyuk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
