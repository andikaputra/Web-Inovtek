import React from "react";

const KahootKodeScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-800 text-white">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Kahoot!</h1>
        
        <div className="bg-white p-6 rounded-lg w-72 mx-auto text-black">
          <input
            type="text"
            placeholder="Game PIN"
            className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:border-purple-600"
          />
          <button className="w-full px-4 py-2 text-white bg-purple-800 rounded hover:bg-purple-900">
            Enter
          </button>
        </div>
        
        <p className="text-sm">
          Create your own kahoot for FREE at <a href="https://kahoot.com" className="underline">kahoot.com</a>
        </p>
        
        <div className="flex justify-center space-x-4 text-xs">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Cookie notice</a>
        </div>
      </div>
      
      <div className="absolute top-4 right-4">
        <button className="bg-white text-black px-2 py-1 rounded">EN 🌐</button>
      </div>
    </div>
  );
};

export default KahootKodeScreen;
