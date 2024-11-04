import React from "react";

function QuizQuestion() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-700 text-white relative">
      {/* Top left corner indicator */}
      <div className="absolute top-4 left-4 bg-purple-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
        11
      </div>

      {/* Top center quiz label */}
      <div className="absolute top-4 flex justify-center items-center">
        <div className="bg-white text-gray-800 rounded-full px-4 py-1 text-sm font-semibold shadow-md">
          Quiz
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-white text-gray-800 py-4 px-8 rounded-md text-2xl font-semibold">
        Which <span className="font-bold">Football/Soccer Player</span> is this?
      </div>

      {/* Bottom loading bar */}
      <div className="absolute bottom-16 w-11/12 bg-gray-300 rounded-full h-2 overflow-hidden">
        <div className="bg-black h-full w-2/5 rounded-full"></div>
      </div>

      {/* Bottom left name */}
      <div className="absolute bottom-4 left-4 text-gray-300">
        Den
      </div>

      {/* Bottom right score */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-gray-300 rounded-full px-3 py-1 text-sm font-semibold">
        511
      </div>
    </div>
  );
}

export default QuizQuestion;
