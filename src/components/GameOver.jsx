import React, { useState, useEffect } from 'react';

export default function GameOver({ score, username, onHome }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger smooth fade and slide-up on mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`} 
      style={{ 
        backgroundImage: "url('/stage_bg.jpg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
    >
      {/* Dark Blur Overlay - Added overflow-y-auto to prevent cutting off on compact screens */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md overflow-y-auto flex flex-col items-center justify-center p-2 md:p-4">
        
        {/* --- MINIMAL CONTENT WRAPPER --- */}
        <div 
          className={`flex flex-col items-center justify-center text-center transition-all duration-1000 ease-out transform ${visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'} min-h-max py-4 md:py-6`}
        >
          
          {/* Icon */}
          <i className="fa-solid fa-trophy text-3xl md:text-4xl lg:text-5xl text-[#ffcc00] mb-2 md:mb-4 drop-shadow-[0_0_15px_rgba(255,204,0,0.5)]"></i>
          
          {/* Header */}
          <h2 className="font-tahoma text-white text-lg md:text-2xl lg:text-3xl font-bold uppercase tracking-[0.2em] mb-1 drop-shadow-md">
            Game Over
          </h2>
          <h3 className="font-tahoma text-[#ffcc00] text-sm md:text-lg lg:text-xl font-medium uppercase tracking-widest mb-4 md:mb-6 drop-shadow-sm">
            {username}
          </h3>

          {/* Score Section */}
          <div className="flex flex-col items-center mb-4 md:mb-6">
            <p className="font-tahoma text-gray-300 text-[10px] md:text-xs lg:text-sm uppercase tracking-[0.3em] mb-1 md:mb-2 drop-shadow-sm">
              Final Score
            </p>
            <span className="font-tahoma text-white text-4xl md:text-6xl lg:text-7xl font-black tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-none">
              {score}
            </span>
          </div>

          {/* Disclaimer */}
          <p className="font-tahoma text-red-500 font-bold text-[8px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.2em] text-center mb-6 md:mb-8 drop-shadow-sm">
            * Virtual score only. No real money awarded *
          </p>
          
          {/* Action Button */}
          <button 
            onClick={onHome}
            className="px-6 py-2.5 md:px-10 md:py-3.5 bg-gradient-to-b from-[#ffcc00] to-[#b38f00] rounded-full font-tahoma text-black font-black text-[10px] md:text-[12px] lg:text-[14px] uppercase tracking-[0.2em] hover:scale-105 hover:brightness-110 transition-all drop-shadow-[0_0_20px_rgba(255,204,0,0.5)] border-2 border-white/40 flex items-center gap-2 md:gap-3 shrink-0"
          >
            <i className="fa-solid fa-house text-sm md:text-base"></i> Return to Main Menu
          </button>

        </div>
      </div>
    </div>
  );
}