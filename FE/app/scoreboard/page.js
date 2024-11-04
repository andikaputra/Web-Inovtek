import React from "react"; 

function Scoreboard() {
  const scores = [
    { name: "Modaser", score: 6802, top: true },
    { name: "Mozamel J 🔥", score: 6646 },
    { name: "NPC", score: 6628 },
    { name: "Rizz girl", score: 6555 },
    { name: "Ismailpro", score: 5774 },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url("/src/img/bg.jpg")`,
      }}
    >
      <div className="bg-gray-800 text-white py-2 px-4 rounded-md text-2xl font-bold mb-6">
        Scoreboard
      </div>
      
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        {scores.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center px-4 py-3 ${
              item.top ? "bg-gray-200 text-gray-900 font-semibold" : "bg-purple-700 text-white"
            } ${index !== scores.length - 1 && "border-b border-gray-300"}`}
          >
            <span>{item.name}</span>
            <span>{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scoreboard;
