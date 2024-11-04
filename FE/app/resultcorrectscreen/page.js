import React from "react";

function QuizResult() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white">
      <div className="absolute top-4 left-4 bg-purple-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
        10
      </div>

      <div className="absolute top-4 flex justify-center items-center">
        <div className="bg-white text-gray-800 rounded-full px-4 py-1 text-sm font-semibold shadow-md">
          Quiz
        </div>
      </div>

      <div className="text-center">
        <p className="text-3xl font-bold mb-4">Correct</p>

        <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="text-sm text-yellow-300 font-semibold mb-6">
          Answer Streak 🔥
        </div>

        <div className="bg-purple-900 text-white py-2 px-6 rounded-md text-2xl font-bold mb-4">
          + 511
        </div>

        <p className="text-sm">
          You’re in <span className="font-semibold">13<sup>th</sup></span> place,
          <br />
          812 points behind Roan
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

export default QuizResult;
