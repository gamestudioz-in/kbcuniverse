import React from 'react';

// Reusable Option Component
const OptionPlate = ({ letter, text, isRightSide }) => {
  // Flip the background horizontally for B and D so the line points to the right edge
  const bgFlipClass = isRightSide ? 'scale-x-[-1]' : '';
  
  // Adjusted Padding Logic for Perfect Symmetry:
  // - Tail Edges (Left side of A/C, Right side of B/D) get exactly 23% padding on PC.
  // - Inner Joint Edges (Right side of A/C, Left side of B/D) get exactly 5% padding on PC.
  const paddingClass = isRightSide 
    ? 'pl-[3%] lg:pl-[5%] pr-[20%] lg:pr-[24%]' 
    : 'pl-[22%] lg:pl-[24%] pr-[4%] lg:pr-[5%]';

  return (
    <div className="relative w-full h-[28px] md:h-[32px] lg:h-[55px] cursor-pointer group drop-shadow-md">
      
      {/* Background Strap Layer */}
      <div 
        className={`absolute inset-0 w-full h-full transition-all duration-300 group-hover:brightness-125 ${bgFlipClass}`}
        style={{
          backgroundImage: "url('/images/option_strap_left.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      {/* Text Layer (Sits on top, un-flipped) */}
      <div className={`absolute inset-0 flex items-center w-full h-full z-10 ${paddingClass}`}>
        {/* Golden Diamond */}
        <span className="text-[#ffcc00] text-[7px] md:text-[9px] lg:text-[13px] mr-1.5 lg:mr-2 mt-[1px]">
          ♦
        </span>
        {/* Option Letter */}
        <span className="font-tahoma text-[#ffcc00] font-semibold text-[9.5px] md:text-[12px] lg:text-[16px] mr-1.5 lg:mr-2 mt-[1px]">
          {letter}:
        </span>
        {/* Option Text */}
        <span className="font-tahoma text-white antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[16px] uppercase tracking-wide truncate mt-[1px]">
          {text}
        </span>
      </div>
    </div>
  );
};

export default function GameScreen({ onQuit }) {
  return (
    <div 
      className="w-full h-screen relative overflow-hidden animate-[simpleFadeIn_1s_ease-out_forwards]"
      style={{ 
        backgroundImage: "url('/stage_bg.jpg')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      {/* Custom Tahoma Font Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @font-face {
          font-family: 'TahomaCustom';
          src: url('/fonts/tahoma.ttf') format('truetype');
        }
        .font-tahoma {
          font-family: 'TahomaCustom', sans-serif;
        }
      `}} />

      {/* Quit Button (Top Left) */}
      <button 
        onClick={onQuit}
        className="absolute top-2 lg:top-6 left-2 lg:left-6 z-50 bg-black/50 px-2 py-1 lg:px-5 lg:py-2.5 rounded-full text-white text-[8px] lg:text-[12px] font-bold uppercase tracking-widest border border-white/30 hover:bg-white/20 transition-colors"
      >
        <i className="fa-solid fa-arrow-left lg:mr-2"></i> <span className="hidden lg:inline">Quit</span>
      </button>

      {/* Lifelines - Top Center */}
      <div className="absolute top-2 lg:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-1 md:gap-2 lg:gap-6">
        <img src="/images/5050.png" alt="50:50" className="w-12 md:w-16 lg:w-24 object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md" />
        <img src="/images/audpoll.png" alt="Audience Poll" className="w-12 md:w-16 lg:w-24 object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md" />
        <img src="/images/phone.png" alt="Phone a Friend" className="w-12 md:w-16 lg:w-24 object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md" />
      </div>

      {/* MAIN PLAY AREA */}
      <div className="absolute bottom-6 md:bottom-2 lg:bottom-8 left-0 w-full flex flex-col items-center z-40 px-2 md:px-12 lg:px-16">
        
        {/* Reduced PC vertical gap between question and options to lg:gap-0.5 */}
        <div className="w-full max-w-[950px] lg:max-w-[1100px] flex flex-col gap-0.5 lg:gap-1">
          
          {/* Question Plate */}
          <div 
            className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] flex items-center justify-center h-[46px] md:h-[54px] lg:h-[80px] drop-shadow-xl"
            style={{
              backgroundImage: "url('/images/question_strap.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <p className="font-tahoma text-white antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[17px] text-center uppercase tracking-wide leading-[1.5] mt-[2px] px-[12%] lg:px-[10%]">
              Out of the following distinguished leaders, who is the last person to have served as the Vice President of India before eventually being elected to the office of the President?
            </p>
          </div>

          {/* Options Grid (Removed extra top margin) */}
          <div className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] grid grid-cols-2 gap-x-0 gap-y-[2px] lg:gap-y-1">
            
            <OptionPlate letter="A" text="Shri KR Narayanan" isRightSide={false} />
            <OptionPlate letter="B" text="Dr Shankar Dayal Sharma" isRightSide={true} />
            <OptionPlate letter="C" text="Shri R Venkataraman" isRightSide={false} />
            <OptionPlate letter="D" text="Shri VV Giri" isRightSide={true} />

          </div>
        </div>
      </div>
      
    </div>
  );
}

second:
import React, { useState, useEffect } from 'react';

// --- Timer Component ---
const TimerLine = ({ duration = 45, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Stop counting if time is up OR the game is paused
    if (timeLeft <= 0 || isPaused) return;
    
    // Decrement time every second
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  const percentage = (timeLeft / duration) * 100;

  // Multi-color logic based on time remaining
  let color = '#22c55e'; // Green
  if (percentage <= 55 && percentage > 30) color = '#eab308'; // Yellow
  if (percentage <= 30) color = '#ef4444'; // Red

  return (
    <div className="w-[83%] md:w-[83%] lg:w-[90%] mx-auto h-[4px] md:h-[4px] lg:h-[6px] bg-black/60 border border-[#ffcc00]/80 rounded-full relative z-20 mb-0 lg:mb-0 drop-shadow-xl overflow-hidden opacity-0 origin-center animate-[kbcExpand_0.5s_ease-out_0.3s_forwards]">
      <div 
        className="absolute top-0 bottom-0 left-0 rounded-full transition-all ease-linear"
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}, 0 0 2px ${color}`,
          transitionDuration: isPaused ? '0ms' : '1000ms' // Prevent animation drift when paused
        }}
      ></div>
    </div>
  );
};

// --- Reusable Option Component ---
const OptionPlate = ({ letter, text, isRightSide, animationClass }) => {
  const bgFlipClass = isRightSide ? 'scale-x-[-1]' : '';
  const paddingClass = isRightSide 
    ? 'pl-[3%] lg:pl-[5%] pr-[20%] lg:pr-[24%]' 
    : 'pl-[22%] lg:pl-[24%] pr-[4%] lg:pr-[5%]';

  return (
    <div className={`relative w-full h-[28px] md:h-[32px] lg:h-[55px] cursor-pointer group drop-shadow-md ${animationClass || ''}`}>
      <div 
        className={`absolute inset-0 w-full h-full transition-all duration-300 group-hover:brightness-125 ${bgFlipClass}`}
        style={{
          backgroundImage: "url('/images/option_strap_left.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      <div className={`absolute inset-0 flex items-center w-full h-full z-10 ${paddingClass}`}>
        <span className="text-[#ffcc00] text-[7px] md:text-[9px] lg:text-[13px] mr-1.5 lg:mr-2 mt-[1px]">♦</span>
        <span className="font-tahoma text-[#ffcc00] font-semibold text-[9.5px] md:text-[12px] lg:text-[16px] mr-1.5 lg:mr-2 mt-[1px]">{letter}:</span>
        <span className="font-tahoma text-white antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[16px] uppercase tracking-wide truncate mt-[1px]">{text}</span>
      </div>
    </div>
  );
};

// --- Main Game Screen ---
export default function GameScreen({ onQuit }) {
  const [isPaused, setIsPaused] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Handlers
  const handleQuitClick = () => {
    setIsPaused(true);
    setShowQuitConfirm(true);
  };

  const handleCancelQuit = () => {
    setShowQuitConfirm(false);
    setIsPaused(false);
  };

  const handlePauseGame = () => {
    setIsPaused(true);
  };

  const handleResumeGame = () => {
    setIsPaused(false);
  };

  return (
    <div 
      className="w-full h-screen relative overflow-hidden animate-[simpleFadeIn_1s_ease-out_forwards]"
      style={{ 
        backgroundImage: "url('/stage_bg.jpg')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @font-face {
          font-family: 'TahomaCustom';
          src: url('/fonts/tahoma.ttf') format('truetype');
        }
        .font-tahoma {
          font-family: 'TahomaCustom', sans-serif;
        }
        @keyframes kbcExpand {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes kbcSlideLeft {
          0% { transform: translateX(-15%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes kbcSlideRight {
          0% { transform: translateX(15%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}} />

      {/* Quit Button (Top Left) */}
      <button 
        onClick={handleQuitClick}
        className="absolute top-2 lg:top-6 left-2 lg:left-6 z-40 hover:scale-105 transition-transform drop-shadow-md"
      >
        <img 
          src="/images/quit.png" 
          alt="Quit Game" 
          className="w-[50px] md:w-[65px] lg:w-[85px] aspect-[200/162] object-contain"
        />
      </button>

      {/* Pause Button (Top Right) */}
      <button 
        onClick={handlePauseGame}
        className="absolute top-2 lg:top-6 right-2 lg:right-6 z-40 bg-[#000033]/80 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-full text-white text-[9px] lg:text-[13px] font-bold uppercase tracking-widest border border-[#ffcc00]/60 hover:bg-[#000033] hover:border-[#ffcc00] transition-colors drop-shadow-md flex items-center gap-1.5 lg:gap-2"
      >
        <i className="fa-solid fa-pause text-[#eab308]"></i> <span className="hidden md:inline">Pause</span>
      </button>

      {/* Lifelines - Top Center */}
      <div className="absolute top-2 lg:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1 md:gap-2 lg:gap-6">
        <img src="/images/5050.png" alt="50:50" className="w-12 md:w-16 lg:w-24 object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md" />
        <img src="/images/audpoll.png" alt="Audience Poll" className="w-12 md:w-16 lg:w-24 object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md" />
        <img src="/images/phone.png" alt="Phone a Friend" className="w-12 md:w-16 lg:w-24 object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md" />
      </div>

      {/* MAIN PLAY AREA */}
      <div className="absolute bottom-6 md:bottom-2 lg:bottom-8 left-0 w-full flex flex-col items-center z-20 px-2 md:px-12 lg:px-16">
        <div className="w-full max-w-[950px] lg:max-w-[1100px] flex flex-col gap-0.5 lg:gap-1">
          
          <TimerLine duration={45} isPaused={isPaused} />

          {/* Question Plate */}
          <div 
            className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] flex items-center justify-center h-[46px] md:h-[54px] lg:h-[80px] drop-shadow-xl z-10 opacity-0 origin-center animate-[kbcExpand_0.6s_ease-out_0.5s_forwards]"
            style={{
              backgroundImage: "url('/images/question_strap.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <p className="font-tahoma text-white antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[17px] text-center uppercase tracking-wide leading-[1.5] mt-[2px] px-[12%] lg:px-[10%]">
              Out of the following distinguished leaders, who is the last person to have served as the Vice President of India before eventually being elected to the office of the President?
            </p>
          </div>

          {/* Options Grid */}
          <div className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] grid grid-cols-2 gap-x-0 gap-y-[2px] lg:gap-y-1 z-10">
            <OptionPlate letter="A" text="Shri KR Narayanan" isRightSide={false} animationClass="opacity-0 animate-[kbcSlideLeft_0.4s_ease-out_1.0s_forwards]" />
            <OptionPlate letter="B" text="Dr Shankar Dayal Sharma" isRightSide={true} animationClass="opacity-0 animate-[kbcSlideRight_0.4s_ease-out_1.3s_forwards]" />
            <OptionPlate letter="C" text="Shri R Venkataraman" isRightSide={false} animationClass="opacity-0 animate-[kbcSlideLeft_0.4s_ease-out_1.6s_forwards]" />
            <OptionPlate letter="D" text="Shri VV Giri" isRightSide={true} animationClass="opacity-0 animate-[kbcSlideRight_0.4s_ease-out_1.9s_forwards]" />
          </div>
        </div>
      </div>

      {/* --- PAUSE MENU OVERLAY --- */}
      {isPaused && !showQuitConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-[simpleFadeIn_0.2s_ease-out_forwards]">
          <div className="w-[85%] max-w-[350px] bg-gradient-to-b from-[#000033] to-[#00001a] border-2 border-[#ffcc00] rounded-2xl p-8 drop-shadow-2xl flex flex-col items-center">
            
            <h2 className="font-tahoma text-[#ffcc00] text-[20px] md:text-[24px] font-bold text-center uppercase tracking-widest mb-3 drop-shadow-md">
              Game Paused
            </h2>
            
            <div className="w-full h-[1px] bg-white/20 mb-6"></div>
            
            <button 
              onClick={handleResumeGame}
              className="w-full py-3 bg-gradient-to-r from-green-700 to-green-500 hover:brightness-125 border border-[#ffcc00]/80 rounded-full font-tahoma text-white font-bold text-[14px] md:text-[16px] uppercase tracking-wide transition-all drop-shadow-md flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-play"></i> Resume
            </button>
          </div>
        </div>
      )}

      {/* --- QUIT CONFIRMATION OVERLAY --- */}
      {showQuitConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-[simpleFadeIn_0.2s_ease-out_forwards]">
          <div className="w-[85%] max-w-[400px] bg-gradient-to-b from-[#000033] to-[#00001a] border-2 border-[#ffcc00] rounded-2xl p-6 drop-shadow-2xl flex flex-col items-center">
            
            <img 
              src="/images/quit.png" 
              alt="Quit" 
              className="w-[70px] md:w-[90px] aspect-[200/162] mb-4 object-contain" 
            />
            
            <h2 className="font-tahoma text-white text-[14px] md:text-[18px] font-medium text-center uppercase tracking-wide mb-6">
              Are you sure you want to quit the game?
            </h2>
            
            <div className="w-full flex gap-4 justify-center">
              <button 
                onClick={handleCancelQuit}
                className="flex-1 py-2 bg-gradient-to-r from-blue-900 to-blue-700 hover:brightness-125 border border-[#ffcc00]/50 rounded-full font-tahoma text-white font-semibold text-[13px] md:text-[15px] uppercase tracking-wide transition-all drop-shadow-md"
              >
                No, Stay
              </button>
              
              <button 
                onClick={onQuit} 
                className="flex-1 py-2 bg-gradient-to-r from-red-800 to-red-600 hover:brightness-125 border border-[#ffcc00]/50 rounded-full font-tahoma text-white font-semibold text-[13px] md:text-[15px] uppercase tracking-wide transition-all drop-shadow-md"
              >
                Yes, Quit
              </button>
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  );
}