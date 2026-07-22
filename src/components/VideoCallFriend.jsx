import React, { useState } from 'react';

// --- Character Data with Intelligence Ranges ---
const ALL_CONTACTS = [
  { 
    id: 1, 
    name: "Prof. Relativestein", 
    description: "Furiously filling a blackboard with equations", 
    avatar: "/images/characters/prof.jpg",
    range: [90, 98]
  },
  { 
    id: 2, 
    name: "Muskey", 
    description: "Taking your call live from Mars.", 
    avatar: "/images/characters/muskey.jpg",
    range: [77, 85]
  },
  { 
    id: 3, 
    name: "Sir Leo Da Panty", 
    description: "Busy Painting a mysterious smile", 
    avatar: "/images/characters/leo.jpg",
    range: [82, 90]
  },
  { 
    id: 4, 
    name: "Mr. Meta Marky", 
    description: "Somewhere between reality and Virtual Reality.", 
    avatar: "/images/characters/marky.jpg",
    range: [86, 94]
  }
];

// --- Module-Level Cache to Persist Data Across Open/Close ---
let sessionContacts = null;
let lastSeenLevel = 0;
let lastSeenQuestion = "";

export default function VideoCallFriend({ currentLevel, qData, onClose, onCallComplete }) {
  const [step, setStep] = useState('select');
  const [callingId, setCallingId] = useState(null); 
  const [activeCallData, setActiveCallData] = useState(null);

  // --- NEW GAME DETECTION LOGIC ---
  // If the question level goes backwards (e.g., Quit at Q5, started new game at Q1)
  // OR if we are on the same level but the actual question text changed, it is a NEW GAME!
  if (
    currentLevel < lastSeenLevel || 
    (currentLevel <= lastSeenLevel && qData && qData.question !== lastSeenQuestion)
  ) {
    sessionContacts = null; // Wipe the old friends
  }

  // Update our trackers
  lastSeenLevel = currentLevel;
  if (qData) {
    lastSeenQuestion = qData.question;
  }

  // Initialize 3 random contacts ONCE per game session
  const [contacts] = useState(() => {
    if (!sessionContacts) {
      const shuffled = [...ALL_CONTACTS].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      sessionContacts = shuffled.map(contact => {
        const min = contact.range[0];
        const max = contact.range[1];
        const baseInt = Math.floor(Math.random() * (max - min + 1)) + min;
        return { ...contact, baseInt };
      });
    }
    return sessionContacts;
  });

  const handleStartCall = (contact) => {
    if (callingId) return; 
    setCallingId(contact.id);

    // --- Dynamic Probability Logic ---
    let currentInt = contact.baseInt;

    if (currentLevel >= 6 && currentLevel <= 10) {
      // Decrease by 3% for each question from 6 to 10
      currentInt -= ((currentLevel - 5) * 3);
    } else if (currentLevel >= 11 && currentLevel <= 15) {
      // Decrease by 15% (for levels 6-10) PLUS 5% for each question from 11 to 15
      currentInt -= 15 + ((currentLevel - 10) * 5);
    }

    // Convert percentage to decimal (e.g., 92% -> 0.92)
    const prob = currentInt / 100;
    const isYes = Math.random() < prob;

    // --- Answer Extraction ---
    const correctLetter = Object.keys(qData.options).find(k => qData.options[k].isCorrect);
    const correctText = qData.options[correctLetter].text;
    const ansHighlight = `Option ${correctLetter}: ${correctText}`;

    // --- Video & Subtitle Logic ---
    let videoUrl = '';
    let subtitle = '';
    let highlight = '';

    if (contact.id === 1) { 
      if (isYes) {
        videoUrl = '/videos/characters/profYes.mp4';
        subtitle = 'According to the theory of relativity, This Option is relatively Correct!';
        highlight = ansHighlight;
      } else {
        videoUrl = '/videos/characters/profNo.mp4';
        subtitle = 'E=mc^2, But E does not equal every correct answer. SORRY!';
        highlight = 'NO ANSWER';
      }
    } else if (contact.id === 2) { 
      if (isYes) {
        videoUrl = '/videos/characters/muskeyYes.mp4';
        subtitle = 'Greetings from Mars, My Best Guess is this Answer.';
        highlight = ansHighlight;
      } else {
        videoUrl = '/videos/characters/muskeyNo.mp4';
        subtitle = 'SORRY! The signal from Mars is too weak.';
        highlight = 'NO SIGNAL = NO ANSWER';
      }
    } else if (contact.id === 3) { 
      if (isYes) {
        videoUrl = '/videos/characters/leoYes.mp4';
        subtitle = "I've solved tougher puzzles than this. This option is the correct one. Paint your victory.";
        highlight = ansHighlight;
      } else {
        videoUrl = '/videos/characters/leoNo.mp4'; 
        subtitle = "Even the Mona Lisa refuses to give me an answer. Use another lifeline -- or blame history if I'm wrong.";
        highlight = 'NO ANSWER';
      }
    } else if (contact.id === 4) { 
      if (isYes) {
        videoUrl = '/videos/characters/markyYes.mp4';
        subtitle = "Yeah, I've checked every virtual world. This is the correct answer.";
        highlight = ansHighlight;
      } else {
        videoUrl = '/videos/characters/markyNo.mp4';
        subtitle = "SORRY! I lost the answer in the virtual world.";
        highlight = 'NO ANSWER';
      }
    }

    setActiveCallData({ isYes, videoUrl, subtitle, highlight, correctLetter });

    setTimeout(() => {
      setStep('video');
    }, 3000);
  };

  const handleVideoEnd = () => {
    onCallComplete(activeCallData.isYes ? activeCallData.correctLetter : null);
  };

  return (
    <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-[simpleFadeIn_0.3s_ease-out_forwards] p-3 md:p-8">
      
      {/* --- STEP 1: SELECT CONTACT & RINGING --- */}
      {step === 'select' && (
        <>
          <div className="w-full max-w-5xl flex items-center justify-between mb-4 md:mb-8 px-1">
            <h2 className="text-[#ffcc00] font-tahoma font-bold text-lg md:text-3xl uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,204,0,0.8)] flex items-center gap-3">
              <i className="fa-solid fa-phone-volume"></i> Phone A Friend
            </h2>
            
            <button 
              onClick={onClose} 
              disabled={callingId !== null}
              className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[#ffcc00] border border-[#ffcc00]/50 shadow-lg transition-all ${callingId ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-[#000033]/80 hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-105'}`}
            >
              <i className="fa-solid fa-xmark text-sm md:text-xl"></i>
            </button>
          </div>

          <div className="w-full max-w-5xl grid grid-cols-3 gap-2 md:gap-8">
            {contacts.map(contact => {
              const isCallingThis = callingId === contact.id;
              const isCallingOther = callingId !== null && callingId !== contact.id;

              return (
                <div 
                  key={contact.id} 
                  onClick={() => handleStartCall(contact)}
                  className={`relative w-full h-[65vh] max-h-[350px] rounded-xl md:rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-[1.5px] md:border-2 border-[#ffcc00]/40 transition-all duration-300 bg-cover bg-center 
                    ${isCallingOther ? 'opacity-30 grayscale pointer-events-none scale-95' : 'hover:border-[#ffcc00] hover:shadow-[0_0_30px_rgba(255,204,0,0.3)] hover:-translate-y-1 cursor-pointer group'}
                  `}
                  style={{ backgroundImage: `url(${contact.avatar})` }}
                >
                  <div className={`absolute bottom-0 left-0 w-full h-[75%] bg-gradient-to-t from-[#000022] via-[#000022]/90 to-[#000022]/0 p-2 md:p-5 flex items-end justify-between transition-all duration-300 ${isCallingThis ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex flex-col pr-1 md:pr-3 mb-0.5 flex-1">
                      <span className="text-white font-tahoma font-bold text-[10px] md:text-xl leading-[1.1] md:leading-tight drop-shadow-lg mb-1 line-clamp-2 whitespace-normal">
                        {contact.name}
                      </span>
                      <span className="font-tahoma text-[8px] md:text-sm leading-[1.25] text-[#ffcc00] font-medium drop-shadow-md opacity-90 line-clamp-3 whitespace-normal">
                        {contact.description}
                      </span>
                    </div>
                    <button className="w-7 h-7 md:w-14 md:h-14 rounded-full bg-gradient-to-b from-[#ffcc00] to-[#b38f00] border border-white/40 flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,204,0,0.5)] group-hover:scale-110 group-hover:brightness-110 transition-all shrink-0 mb-0.5">
                      <i className="fa-solid fa-video text-[9px] md:text-xl drop-shadow-sm"></i>
                    </button>
                  </div>

                  {isCallingThis && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 animate-[simpleFadeIn_0.2s_ease-out_forwards]">
                      <div className="relative flex items-center justify-center w-12 h-12 md:w-20 md:h-20">
                        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-60"></div>
                        <div className="relative z-10 w-10 h-10 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.8)]">
                          <i className="fa-solid fa-phone-flip text-white text-sm md:text-2xl animate-bounce"></i>
                        </div>
                      </div>
                      <span className="text-white font-tahoma font-bold text-[10px] md:text-lg mt-3 md:mt-4 tracking-widest animate-pulse">
                        CALLING...
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- STEP 2: VIDEO INTERFACE --- */}
      {step === 'video' && (
        <div className="absolute inset-0 z-[120] bg-black animate-[simpleFadeIn_0.5s_ease-out_forwards]">
          
          <video 
            src={activeCallData.videoUrl} 
            autoPlay 
            onEnded={handleVideoEnd}
            onError={() => {
              console.warn("Video failed to play, running fallback.");
              setTimeout(handleVideoEnd, 5000);
            }}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          
          <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10"></div>

          <div className="absolute bottom-[5%] md:bottom-[8%] left-0 right-0 z-50 flex flex-col items-center gap-1 md:gap-3 px-4 pointer-events-none">
            
            <span 
              className="font-tahoma font-extrabold text-sm md:text-2xl text-[#ffcc00] uppercase tracking-widest"
              style={{ textShadow: '0px 2px 4px black, 0px 0px 10px black, 0px 0px 20px black' }}
            >
              {activeCallData.highlight}
            </span>
            
            <p 
              className="text-white font-tahoma font-medium text-xs md:text-xl leading-snug tracking-wide text-center max-w-[95%] md:max-w-4xl"
              style={{ textShadow: '1px 1px 3px black, 0px 0px 8px black' }}
            >
              "{activeCallData.subtitle}"
            </p>

          </div>

        </div>
      )}

    </div>
  );
}