import React from 'react';

const KahootLogin = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-purple-700 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="flex flex-wrap justify-center">
          <div className="text-9xl text-purple-500 font-bold rotate-45">?</div>
          <div className="text-9xl text-purple-500 font-bold -rotate-45 ml-10">!</div>
          <div className="text-9xl text-purple-500 font-bold rotate-12 mt-10">"</div>
          <div className="text-9xl text-purple-500 font-bold -rotate-12 mt-16 ml-16">'</div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        <h1 className="text-white text-4xl font-bold text-center mb-8">Kahoot!</h1>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Nickname"
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-purple-500"
          />
          <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
            OK, go!
          </button>
        </div>
      </div>
    </div>
  );
};

export default KahootLogin;
