import React, { useState, useEffect } from 'react';

export default function AudiencePoll({ data, onClose }) {
  const [isRevealing, setIsRevealing] = useState(true);
  const [dancingHeights, setDancingHeights] = useState({ A: 10, B: 10, C: 10, D: 10 });

  // --- Robust Audio Sync ---
  useEffect(() => {
    let isMounted = true;
    const audio = new Audio('/sounds/audiencepoll.ogg');
    let failsafeTimer;

    const finishReveal = () => {
      if (isMounted) setIsRevealing(false);
      clearTimeout(failsafeTimer);
    };

    // Native event listener waits exactly for the audio to finish naturally
    audio.addEventListener('ended', finishReveal);
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Audio is playing successfully. Add a generous 12-second failsafe just in case.
        failsafeTimer = setTimeout(finishReveal, 12000); 
      }).catch(e => {
        if (e.name === 'AbortError') {
          // Ignore AbortError: This happens in React Strict Mode during rapid re-mounts.
          // Ignoring this prevents the fallback timer from prematurely triggering.
          console.log("Audio play aborted (React Strict Mode). Waiting for valid mount.");
        } else {
          // If genuinely blocked by browser, use a shorter fallback
          console.warn("Audio autoplay blocked by browser. Using short fallback.", e);
          failsafeTimer = setTimeout(finishReveal, 4000);
        }
      });
    }

    return () => {
      isMounted = false;
      audio.removeEventListener('ended', finishReveal);
      audio.pause();
      clearTimeout(failsafeTimer);
    };
  }, []);

  // --- Dancing Bars Animation ---
  useEffect(() => {
    if (!isRevealing) return;
    
    const interval = setInterval(() => {
      setDancingHeights({
        A: Math.floor(Math.random() * 75) + 10,
        B: Math.floor(Math.random() * 75) + 10,
        C: Math.floor(Math.random() * 75) + 10,
        D: Math.floor(Math.random() * 75) + 10,
      });
    }, 100); // Faster updates for a jittery, calculating feel

    return () => clearInterval(interval);
  }, [isRevealing]);

  if (!data) return null;

  const displayData = isRevealing ? dancingHeights : data;

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center">
      
      {/* Lightened Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 animate-[simpleFadeIn_0.8s_ease-out_forwards]"
        style={{ 
          backgroundImage: "url('/images/audience_bg.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay' 
        }}
      ></div>
      
      {/* Compact KBC-Style Card */}
      <div className="relative z-10 bg-gradient-to-b from-[#000033] via-[#000022] to-[#000011] border-[1.5px] border-[#ffcc00] p-5 md:p-6 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center w-[85%] max-w-[320px] md:max-w-[400px] animate-[simpleFadeIn_0.5s_ease-out_forwards]">
        
        <h2 className="text-[#ffcc00] font-tahoma font-bold text-sm md:text-base uppercase tracking-[0.2em] mb-5 drop-shadow-[0_0_5px_rgba(255,204,0,0.6)] flex items-center gap-2">
          <i className="fa-solid fa-users text-xs md:text-sm"></i> Audience Poll
        </h2>
        
        {/* Chart Area */}
        <div className="flex items-end justify-between w-full h-[140px] md:h-[180px] border-b border-white/20 pb-2 mb-5 px-3 md:px-5">
          {['A', 'B', 'C', 'D'].map(letter => (
            <div key={letter} className="flex flex-col items-center justify-end h-full w-8 md:w-12">
              
              <span className={`text-white font-tahoma text-[10px] md:text-xs font-bold mb-1.5 transition-opacity duration-700 ${isRevealing ? 'opacity-0' : 'opacity-100'}`}>
                {data[letter]}%
              </span>
              
              {/* Golden Bars */}
              <div 
                className={`w-full rounded-t-sm shadow-[0_0_8px_rgba(255,204,0,0.5)] ${
                  isRevealing 
                    ? 'bg-[#ffcc00]/70 transition-all duration-[100ms]' 
                    : 'bg-gradient-to-t from-[#b38f00] via-[#ffcc00] to-[#ffe680] border-[0.5px] border-[#ffcc00] transition-all duration-1000 ease-out'
                }`}
                style={{ height: `${displayData[letter]}%` }}
              ></div>
              
              <span className="text-[#ffcc00] font-tahoma font-bold mt-2 text-xs md:text-sm drop-shadow-md">
                {letter}
              </span>
            </div>
          ))}
        </div>

        {/* Minimal Action Button */}
        <button 
          onClick={onClose} 
          disabled={isRevealing}
          className={`px-6 py-2 rounded-full font-tahoma font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all drop-shadow-md border ${
            isRevealing 
              ? 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-800 to-red-600 hover:brightness-125 text-white border-[#ffcc00]/50 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
          }`}
        >
          {isRevealing ? 'Polling...' : 'Close Result'}
        </button>
      </div>
    </div>
  );
}