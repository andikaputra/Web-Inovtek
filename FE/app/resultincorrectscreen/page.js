import React from "react";

function QuizIncorrect() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white relative">
      <div className="absolute top-4 left-4 bg-purple-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
        11
      </div>

      <div className="absolute top-4 flex justify-center items-center">
        <div className="bg-white text-gray-800 rounded-full px-4 py-1 text-sm font-semibold shadow-md">
          Quiz
        </div>
      </div>

      <div className="text-center">
        <p className="text-3xl font-bold mb-4">Incorrect</p>

        <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="white"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="text-sm text-yellow-300 font-semibold mb-2">
          Answer Streak lost
        </div>

        <div className="bg-purple-900 text-white py-2 px-6 rounded-md text-lg font-semibold mb-6">
          You can still turn the tables!
        </div>

        <p className="text-sm">
          You’re in <span className="font-semibold">13<sup>th</sup></span> place,
          <br />
          1,484 points behind Roan
        </p>
      </div>

      <div className="absolute bottom-4 left-4 text-gray-300">
        Den
      </div>

      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 rounded-full px-3 py-1 text-sm font-semibold">
        511
      </div>
    </div>
  );
}

export default QuizIncorrect;
