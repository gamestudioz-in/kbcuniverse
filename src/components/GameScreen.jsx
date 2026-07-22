import React, { useState, useEffect, useRef } from 'react';
import { questions } from '../data/questions';
import AudiencePoll from './AudiencePoll';
import VideoCallFriend from './VideoCallFriend';
import SuperSandook from './SuperSandook'; 

const PRIZE_MONEY = {
  1: "5,000",
  2: "10,000",
  3: "15,000",
  4: "20,000",
  5: "25,000",
  6: "50,000",
  7: "1,00,000",
  8: "2,00,000",
  9: "3,00,000",
  10: "5,00,000",
  11: "7,50,000",
  12: "12,50,000",
  13: "25,00,000",
  14: "50,00,000",
  15: "1 Crore",
  16: "7 Crore"
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TimerLine = ({ duration = 45, isPaused, stage, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (stage === 'playing') setTimeLeft(duration);
  }, [stage, duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (stage === 'playing' && onTimeUp) onTimeUp();
      return;
    }
    if (isPaused || stage !== 'playing') return;
    
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused, stage, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;

  let color = '#22c55e'; 
  if (percentage <= 55 && percentage > 30) color = '#eab308'; 
  if (percentage <= 30) color = '#ef4444'; 

  return (
    <div className={`w-[83%] md:w-[83%] lg:w-[90%] mx-auto h-[4px] md:h-[4px] lg:h-[6px] bg-black/60 border border-[#ffcc00]/80 rounded-full relative z-20 mb-0 lg:mb-0 drop-shadow-xl overflow-hidden origin-center opacity-0 animate-[kbcExpand_0.5s_ease-out_0.3s_forwards]`}>
      <div 
        className="absolute top-0 bottom-0 left-0 rounded-full transition-all ease-linear"
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}, 0 0 2px ${color}`,
          transitionDuration: isPaused || stage !== 'playing' ? '0ms' : '1000ms'
        }}
      ></div>
    </div>
  );
};

const OptionPlate = ({ letter, text, isRightSide, inAnimationClass, status, isHidden }) => {
  const bgFlipClass = isRightSide ? 'scale-x-[-1]' : '';
  const paddingClass = isRightSide 
    ? 'pl-[3%] lg:pl-[5%] pr-[20%] lg:pr-[24%]' 
    : 'pl-[22%] lg:pl-[24%] pr-[4%] lg:pr-[5%]';

  let bgImage = "url('/images/option_strap_left.png')";
  if (status === 'locked') bgImage = "url('/images/option_strap_left_orange.png')";
  if (status === 'correct') bgImage = "url('/images/option_strap_left_green.png')";
  if (status === 'wrong') bgImage = "url('/images/option_strap_left_red.png')";

  return (
    <div className={`relative w-full h-[28px] md:h-[32px] lg:h-[55px] cursor-pointer group drop-shadow-md opacity-0 ${inAnimationClass}`}>
      <div 
        className={`absolute inset-0 w-full h-full transition-all duration-300 ${status === 'default' && !isHidden ? 'group-hover:brightness-125' : ''} ${bgFlipClass}`}
        style={{ backgroundImage: bgImage, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      ></div>
      <div className={`absolute inset-0 flex items-center w-full h-full z-10 ${paddingClass}`}>
        {!isHidden && (
          <>
            <span className="text-[#ffcc00] text-[7px] md:text-[9px] lg:text-[13px] mr-1.5 lg:mr-2 mt-[1px]">♦</span>
            <span className="font-tahoma text-[#ffcc00] font-semibold text-[9.5px] md:text-[12px] lg:text-[16px] mr-1.5 lg:mr-2 mt-[1px]">{letter}:</span>
            <span className="font-tahoma text-white antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[16px] uppercase tracking-wide truncate mt-[1px]">{text}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default function GameScreen({ onGameOver }) {
  const [isPaused, setIsPaused] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isFading, setIsFading] = useState(false); 
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [qData, setQData] = useState(null);
  
  const [stage, setStage] = useState('playing');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [answerStatus, setAnswerStatus] = useState('default');
  const [showWinningStrap, setShowWinningStrap] = useState(false);
  
  const [usedLifelines, setUsedLifelines] = useState({ fiftyFifty: false, audPoll: false, phone: false });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [showAudiencePoll, setShowAudiencePoll] = useState(false);
  const [pollData, setPollData] = useState(null);
  const [showPhoneAFriend, setShowPhoneAFriend] = useState(false);
  const [friendAnswer, setFriendAnswer] = useState(null);

  const [activeVideo, setActiveVideo] = useState(null); 
  const [activeAskVideo, setActiveAskVideo] = useState(null); 
  const [showSuperSandook, setShowSuperSandook] = useState(false);

  const tikTikAudioRef = useRef(null);
  const bgLoop2AudioRef = useRef(null);
  const suspenseAudioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    tikTikAudioRef.current = new Audio('/sounds/tiktik.mp3');
    tikTikAudioRef.current.loop = true;
    
    bgLoop2AudioRef.current = new Audio('/sounds/bgloop2.mp3');
    bgLoop2AudioRef.current.loop = true;

    suspenseAudioRef.current = new Audio('/sounds/suspense.ogg');
    
    return () => {
      if (tikTikAudioRef.current) tikTikAudioRef.current.pause();
      if (bgLoop2AudioRef.current) bgLoop2AudioRef.current.pause();
      if (suspenseAudioRef.current) suspenseAudioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    const isOverlayActive = isPaused || showAudiencePoll || showPhoneAFriend || showSuperSandook;
    const isPlayingStage = stage === 'playing';

    if (tikTikAudioRef.current && bgLoop2AudioRef.current) {
      if (isPlayingStage && !isOverlayActive) {
        if (currentLevel <= 10) {
          bgLoop2AudioRef.current.pause();
          const p = tikTikAudioRef.current.play();
          if (p !== undefined) p.catch(e => {});
        } else {
          tikTikAudioRef.current.pause();
          const p = bgLoop2AudioRef.current.play();
          if (p !== undefined) p.catch(e => {});
        }
      } else {
        tikTikAudioRef.current.pause();
        bgLoop2AudioRef.current.pause();
      }
    }
  }, [stage, isPaused, showAudiencePoll, showPhoneAFriend, showSuperSandook, currentLevel]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else if (stage === 'revealed') {
        videoRef.current.play().catch(e => console.log("Video auto-play blocked", e));
      }
    }
  }, [isPaused, stage]);

  const loadQuestion = (level) => {
    const availableQs = questions[level];
    if (!availableQs) {
      console.warn(`No questions found for level ${level}!`);
      return;
    }
    
    // --- LOCALSTORAGE SHUFFLE BAG LOGIC ---
    let usedQuestionsStorage = JSON.parse(localStorage.getItem('kbc_used_questions')) || {};
    let usedIndicesForLevel = usedQuestionsStorage[level] || [];

    // Find unused indices
    let unusedIndices = availableQs
      .map((_, index) => index)
      .filter(index => !usedIndicesForLevel.includes(index));

    // Self-maintaining: If pool exhausted, reset ONLY this level's pool
    if (unusedIndices.length === 0) {
      console.log(`Pool exhausted for level ${level}. Resetting list...`);
      unusedIndices = availableQs.map((_, index) => index);
      usedIndicesForLevel = [];
    }

    // Pick random from unused indices
    const randomUnusedIndex = unusedIndices[Math.floor(Math.random() * unusedIndices.length)];
    const randomQ = availableQs[randomUnusedIndex];

    // Mark as used and update localStorage
    usedIndicesForLevel.push(randomUnusedIndex);
    usedQuestionsStorage[level] = usedIndicesForLevel;
    localStorage.setItem('kbc_used_questions', JSON.stringify(usedQuestionsStorage));
    // ----------------------------------------

    const optionsWithMeta = randomQ.options.map(opt => ({ text: opt, isCorrect: opt === randomQ.answer }));
    const shuffled = shuffleArray(optionsWithMeta);
    
    setQData({
      question: randomQ.question,
      options: { A: shuffled[0], B: shuffled[1], C: shuffled[2], D: shuffled[3] }
    });
    
    setStage('playing');
    setSelectedLetter(null);
    setAnswerStatus('default');
    setShowWinningStrap(false);
    setActiveVideo(null);
    setHiddenOptions([]); 
    setPollData(null);    
    setFriendAnswer(null);
  };

  const proceedToLevel = (level) => {
    setCurrentLevel(level);
    if (level >= 11 && level <= 16) {
      setQData(null); 
      setStage('asking');
      setActiveAskVideo(`/videos/AskQ${level}.mp4`);
    } else {
      loadQuestion(level);
    }
  };

  useEffect(() => {
    proceedToLevel(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle5050 = () => {
    if (usedLifelines.fiftyFifty || stage !== 'playing' || showAudiencePoll || showPhoneAFriend || showSuperSandook || currentLevel === 16) return;
    const audio = new Audio('/sounds/5050.ogg');
    audio.play().catch(e => console.warn("5050 Audio Blocked", e));

    const correctLetter = Object.keys(qData.options).find(key => qData.options[key].isCorrect);
    const wrongLetters = Object.keys(qData.options).filter(key => key !== correctLetter);
    const shuffledWrong = shuffleArray(wrongLetters);
    setHiddenOptions([shuffledWrong[0], shuffledWrong[1]]);
    setUsedLifelines(prev => ({ ...prev, fiftyFifty: true }));
  };

  const handleAudPoll = () => {
    if (usedLifelines.audPoll || stage !== 'playing' || showAudiencePoll || showPhoneAFriend || showSuperSandook || currentLevel === 16) return;
    
    const correctLetter = Object.keys(qData.options).find(key => qData.options[key].isCorrect);
    let data = { A: 0, B: 0, C: 0, D: 0 };
    
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    let correctVal = 0;
    let decoyVal = 0;

    // Determine Base Percentages based on Difficulty Tier
    if (currentLevel >= 1 && currentLevel <= 5) {
      correctVal = getRandomInt(65, 90);
      let rem = 100 - correctVal;
      decoyVal = getRandomInt(0, rem);
    } else if (currentLevel >= 6 && currentLevel <= 10) {
      correctVal = getRandomInt(45, 65);
      decoyVal = getRandomInt(20, 30);
    } else if (currentLevel === 11) {
      correctVal = getRandomInt(40, 45);
      decoyVal = getRandomInt(28, 32);
    } else if (currentLevel === 12) {
      correctVal = getRandomInt(37, 43);
      decoyVal = getRandomInt(29, 33);
    } else if (currentLevel === 13) {
      correctVal = getRandomInt(34, 40);
      decoyVal = getRandomInt(30, 34);
    } else if (currentLevel === 14) {
      correctVal = getRandomInt(31, 38);
      decoyVal = getRandomInt(30, 36);
    } else if (currentLevel === 15) {
      correctVal = getRandomInt(28, 35);
      decoyVal = getRandomInt(28, 36);
    }

    if (hiddenOptions.length > 0) {
      // 50:50 Synergy: Scale the Correct and Decoy values up to 100%
      const remainingOption = Object.keys(data).find(k => k !== correctLetter && !hiddenOptions.includes(k));
      let scaledCorrect = Math.round((correctVal / (correctVal + decoyVal)) * 100);
      data[correctLetter] = scaledCorrect;
      data[remainingOption] = 100 - scaledCorrect;
    } else {
      // Normal Play: Assign Decoy and randomly split the rest
      const allWrongLetters = Object.keys(data).filter(k => k !== correctLetter);
      const decoyLetter = allWrongLetters[Math.floor(Math.random() * allWrongLetters.length)];
      const otherLetters = allWrongLetters.filter(k => k !== decoyLetter);

      data[correctLetter] = correctVal;
      data[decoyLetter] = decoyVal;

      let remaining = 100 - (correctVal + decoyVal);
      const split1 = Math.floor(Math.random() * remaining);
      const split2 = remaining - split1;

      data[otherLetters[0]] = split1;
      data[otherLetters[1]] = split2;
    }

    setPollData(data);
    setShowAudiencePoll(true);
    setUsedLifelines(prev => ({ ...prev, audPoll: true }));
  };

  const handlePhoneAFriend = () => {
    if (usedLifelines.phone || stage !== 'playing' || showAudiencePoll || showPhoneAFriend || showSuperSandook || currentLevel === 16) return;
    setShowPhoneAFriend(true);
  };

  const handlePhoneCallComplete = (letter) => {
    setShowPhoneAFriend(false);
    setUsedLifelines(prev => ({ ...prev, phone: true }));
    if (letter) setFriendAnswer(letter);
  };

  const handleTimeUp = () => {
    const takeHomePrize = currentLevel > 1 ? PRIZE_MONEY[currentLevel - 1] : "0";
    onGameOver(takeHomePrize);
  };

  const handleConfirmQuit = () => {
    const takeHomePrize = currentLevel > 1 ? PRIZE_MONEY[currentLevel - 1] : "0";
    onGameOver(takeHomePrize);
  };

  const handleOptionClick = (letter) => {
    if (stage !== 'playing' || hiddenOptions.includes(letter) || showAudiencePoll || showPhoneAFriend || showSuperSandook) return;
    
    setStage('locked');
    setSelectedLetter(letter);
    setAnswerStatus('locked');

    if (suspenseAudioRef.current) {
      suspenseAudioRef.current.currentTime = 0;
      const p = suspenseAudioRef.current.play();
      if(p !== undefined) p.catch(e => console.log("Suspense audio blocked", e));
    }

    setTimeout(() => {
      if (suspenseAudioRef.current) suspenseAudioRef.current.pause();
      
      const isCorrect = qData.options[letter].isCorrect;
      setStage('revealed');
      setAnswerStatus(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        if (currentLevel === 5) {
          setActiveVideo('/videos/correctAnsQ5.mp4');
        } else if (currentLevel === 10) {
          setActiveVideo('/videos/correctAnsQ10.mp4');
        } else if (currentLevel === 15) {
          setActiveVideo('/videos/correctAnsQ15.mp4');
        } else if (currentLevel === 16) {
          setActiveVideo('/videos/correctAnsQ16.mp4');
        } else {
          const randomVid = Math.floor(Math.random() * 4) + 1;
          setActiveVideo(`/videos/correct${randomVid}.mp4`);
        }

        setTimeout(() => {
          setShowWinningStrap(true);
        }, 1500);

      } else {
        setActiveVideo('/videos/wrong.mp4');
      }
    }, 2000);
  };

  const handleVideoEnd = () => {
    setIsFading(true);
    
    setTimeout(() => {
      setActiveVideo(null); 
      
      if (answerStatus === 'correct') {
        if (currentLevel === 10) {
          setShowSuperSandook(true);
          setIsFading(false); 
          return; 
        }
        
        if (currentLevel < 16) {
          proceedToLevel(currentLevel + 1);
        } else {
          onGameOver(PRIZE_MONEY[16]); 
        }
      } else if (answerStatus === 'wrong') {
        let wrongPrize = "0";
        if (currentLevel > 10) {
          wrongPrize = PRIZE_MONEY[10]; 
        } else if (currentLevel > 5) {
          wrongPrize = PRIZE_MONEY[5]; 
        }
        onGameOver(wrongPrize);
      }
      
      setTimeout(() => {
        setIsFading(false);
      }, 100);

    }, 1000); 
  };

  const handleSandookComplete = (revivedLifelineKey) => {
    setIsFading(true);
    
    setTimeout(() => {
      setShowSuperSandook(false);
      
      if (revivedLifelineKey) {
        setUsedLifelines(prev => ({ ...prev, [revivedLifelineKey]: false }));
      }
      
      proceedToLevel(11);

      setTimeout(() => {
        setIsFading(false);
      }, 500);
    }, 1000);
  };

  const handleQuitClick = () => { setIsPaused(true); setShowQuitConfirm(true); };
  const handleCancelQuit = () => { setShowQuitConfirm(false); setIsPaused(false); };
  const handlePauseGame = () => setIsPaused(true);
  const handleResumeGame = () => setIsPaused(false);
  
  if (showSuperSandook) {
    return (
      <>
        <div className={`absolute inset-0 bg-black z-[100] transition-opacity duration-1000 ${isFading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}></div>
        <SuperSandook usedLifelines={usedLifelines} onComplete={handleSandookComplete} />
      </>
    );
  }

  return (
    <div 
      className="w-full h-screen relative overflow-hidden animate-[simpleFadeIn_1s_ease-out_forwards]"
      style={{ backgroundImage: "url('/stage_bg.jpg')", backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @font-face { font-family: 'TahomaCustom'; src: url('/fonts/tahoma.ttf') format('truetype'); }
        .font-tahoma { font-family: 'TahomaCustom', sans-serif; }
        @keyframes kbcExpand { 0% { transform: scaleX(0); opacity: 0; } 100% { transform: scaleX(1); opacity: 1; } }
        @keyframes kbcSlideLeftIn { 0% { transform: translateX(-15%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes kbcSlideRightIn { 0% { transform: translateX(15%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
      `}} />

      <div className={`absolute inset-0 bg-black z-[100] transition-opacity duration-1000 ${isFading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}></div>

      {showAudiencePoll && (
        <AudiencePoll data={pollData} onClose={() => setShowAudiencePoll(false)} />
      )}
      
      {showPhoneAFriend && (
        <VideoCallFriend 
          currentLevel={currentLevel}
          qData={qData}
          onClose={() => setShowPhoneAFriend(false)}
          onCallComplete={handlePhoneCallComplete} 
        />
      )}

      {/* --- ASK QUESTION VIDEO INTERSTITIAL (Q11-Q16) --- */}
      {activeAskVideo && (
        <video 
          src={activeAskVideo} 
          autoPlay 
          onEnded={() => {
            setActiveAskVideo(null);
            loadQuestion(currentLevel);
          }}
          onError={() => {
            console.warn("Ask Video failed to play, skipping.");
            setActiveAskVideo(null);
            loadQuestion(currentLevel);
          }}
          className="absolute inset-0 w-full h-full object-cover z-50"
        />
      )}

      {activeVideo && (
        <video 
          ref={videoRef}
          src={activeVideo} 
          autoPlay 
          onEnded={handleVideoEnd}
          onError={() => {
            console.warn("Video failed to play, running fallback timer.");
            setTimeout(handleVideoEnd, 4000);
          }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Hide controls during Interstitial Videos */}
      {!activeAskVideo && (
        <div className={`relative z-40 transition-opacity duration-500 ${showWinningStrap ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button onClick={handleQuitClick} className="absolute top-2 lg:top-6 left-2 lg:left-6 hover:scale-105 transition-transform drop-shadow-md">
            <img src="/images/quit.png" alt="Quit Game" className="w-[50px] md:w-[65px] lg:w-[85px] aspect-[200/162] object-contain" />
          </button>

          <button onClick={handlePauseGame} className="absolute top-2 lg:top-6 right-2 lg:right-6 bg-[#000033]/80 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-full text-white text-[9px] lg:text-[13px] font-bold uppercase tracking-widest border border-[#ffcc00]/60 hover:bg-[#000033] hover:border-[#ffcc00] transition-colors drop-shadow-md flex items-center gap-1.5 lg:gap-2">
            <i className="fa-solid fa-pause text-[#eab308]"></i> <span className="hidden md:inline">Pause</span>
          </button>

          {/* NO LIFELINES ALLOWED ON Q16 */}
          {currentLevel !== 16 && (
            <div className="absolute top-2 lg:top-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 md:gap-2 lg:gap-6">
              <img 
                src={usedLifelines.fiftyFifty ? "/images/5050_dis.png" : "/images/5050.png"} 
                alt="50:50" 
                onClick={handle5050}
                className={`w-12 md:w-16 lg:w-24 object-contain ${usedLifelines.fiftyFifty ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform drop-shadow-md'}`} 
              />
              <img 
                src={usedLifelines.audPoll ? "/images/audpoll_dis.png" : "/images/audpoll.png"} 
                alt="Audience Poll" 
                onClick={handleAudPoll}
                className={`w-12 md:w-16 lg:w-24 object-contain ${usedLifelines.audPoll ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform drop-shadow-md'}`} 
              />
              
              <div className="relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24">
                <img 
                  src={usedLifelines.phone ? "/images/phone_dis.png" : "/images/phone.png"} 
                  alt="Phone a Friend" 
                  onClick={handlePhoneAFriend}
                  className={`w-full h-full object-contain transition-all ${usedLifelines.phone ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-105 drop-shadow-md'}`} 
                />
                
                {friendAnswer && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-[simpleFadeIn_0.5s_ease-out_forwards]">
                    <span 
                      className="font-tahoma font-black text-white text-3xl md:text-4xl lg:text-5xl"
                      style={{ textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)' }}
                    >
                      {friendAnswer}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hide main play area entirely while Ask Video plays */}
      {!activeAskVideo && qData && (
        <div className="absolute bottom-6 md:bottom-2 lg:bottom-8 left-0 w-full flex flex-col items-center justify-end z-20 px-2 md:px-12 lg:px-16 min-h-[150px]">
          
          <div className="w-full max-w-[950px] lg:max-w-[1100px] flex flex-col gap-0.5 lg:gap-1 relative">
            
            <div key={currentLevel} className={`w-full flex flex-col gap-0.5 lg:gap-1 transition-opacity duration-500 ${showWinningStrap ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              
              {currentLevel <= 10 && (
                <TimerLine 
                  duration={45} 
                  isPaused={isPaused || showAudiencePoll || showPhoneAFriend} 
                  stage={stage} 
                  onTimeUp={handleTimeUp} 
                />
              )}

              <div 
                className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] flex items-center justify-center h-[46px] md:h-[54px] lg:h-[80px] drop-shadow-xl z-10 opacity-0 origin-center animate-[kbcExpand_0.6s_ease-out_0.5s_forwards]"
                style={{ backgroundImage: "url('/images/question_strap.png')", backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              >
                <p className="font-tahoma text-white antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[17px] text-center uppercase tracking-wide leading-[1.5] mt-[2px] px-[12%] lg:px-[10%]">
                  {qData.question}
                </p>
              </div>

              <div className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] grid grid-cols-2 gap-x-0 gap-y-[2px] lg:gap-y-1 z-10 relative">
                {Object.entries(qData.options).map(([letter, data], index) => {
                  const isRightSide = letter === 'B' || letter === 'D';
                  const status = selectedLetter === letter ? answerStatus : 'default';
                  const isHidden = hiddenOptions.includes(letter);
                  
                  const inAnimations = [
                    "animate-[kbcSlideLeftIn_0.4s_ease-out_1.0s_forwards]",
                    "animate-[kbcSlideRightIn_0.4s_ease-out_1.3s_forwards]",
                    "animate-[kbcSlideLeftIn_0.4s_ease-out_1.6s_forwards]",
                    "animate-[kbcSlideRightIn_0.4s_ease-out_1.9s_forwards]"
                  ];

                  return (
                    <div key={letter} onClick={() => handleOptionClick(letter)}>
                      <OptionPlate letter={letter} text={data.text} isRightSide={isRightSide} status={status} inAnimationClass={inAnimations[index]} isHidden={isHidden} />
                    </div>
                  );
                })}
              </div>
            </div>

            {showWinningStrap && (
              <div 
                className="absolute left-0 bottom-0 md:-bottom-1 lg:-bottom-2 w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] flex flex-col items-center justify-center h-[46px] md:h-[54px] lg:h-[80px] drop-shadow-2xl origin-center animate-[kbcExpand_0.6s_ease-out_forwards] z-50 pointer-events-none"
                style={{ backgroundImage: "url('/images/question_strap.png')", backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              >
                <p className="font-tahoma text-white antialiased font-bold text-[14px] md:text-[18px] lg:text-[24px] text-center uppercase tracking-widest drop-shadow-md leading-none">
                  SCORE: {PRIZE_MONEY[currentLevel]}
                </p>
                <p className="font-tahoma text-[#ff9900] antialiased font-semibold text-[6px] md:text-[8px] lg:text-[10px] text-center uppercase tracking-wide mt-1 lg:mt-1.5 drop-shadow-sm px-[12%] lg:px-[10%]">
                  * Virtual score only. No real money awarded.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {isPaused && !showQuitConfirm && !showAudiencePoll && !showPhoneAFriend && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md animate-[simpleFadeIn_0.2s_ease-out_forwards]">
          <div className="w-[85%] max-w-[350px] bg-gradient-to-b from-[#000033] to-[#00001a] border-2 border-[#ffcc00] rounded-2xl p-8 drop-shadow-2xl flex flex-col items-center">
            <h2 className="font-tahoma text-[#ffcc00] text-[20px] md:text-[24px] font-bold text-center uppercase tracking-widest mb-3 drop-shadow-md">Game Paused</h2>
            <div className="w-full h-[1px] bg-white/20 mb-6"></div>
            <button onClick={handleResumeGame} className="w-full py-3 bg-gradient-to-r from-green-700 to-green-500 hover:brightness-125 border border-[#ffcc00]/80 rounded-full font-tahoma text-white font-bold text-[14px] md:text-[16px] uppercase tracking-wide transition-all drop-shadow-md flex items-center justify-center gap-2">
              <i className="fa-solid fa-play"></i> Resume
            </button>
          </div>
        </div>
      )}

      {showQuitConfirm && !showAudiencePoll && !showPhoneAFriend && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md animate-[simpleFadeIn_0.2s_ease-out_forwards]">
          <div className="w-[85%] max-w-[400px] bg-gradient-to-b from-[#000033] to-[#00001a] border-2 border-[#ffcc00] rounded-2xl p-6 drop-shadow-2xl flex flex-col items-center">
            <img src="/images/quit.png" alt="Quit" className="w-[70px] md:w-[90px] aspect-[200/162] mb-4 object-contain" />
            <h2 className="font-tahoma text-white text-[14px] md:text-[18px] font-medium text-center uppercase tracking-wide mb-6">Are you sure you want to quit the game?</h2>
            <div className="w-full flex gap-4 justify-center">
              <button onClick={handleCancelQuit} className="flex-1 py-2 bg-gradient-to-r from-blue-900 to-blue-700 hover:brightness-125 border border-[#ffcc00]/50 rounded-full font-tahoma text-white font-semibold text-[13px] md:text-[15px] uppercase tracking-wide transition-all drop-shadow-md">No, Stay</button>
              <button onClick={handleConfirmQuit} className="flex-1 py-2 bg-gradient-to-r from-red-800 to-red-600 hover:brightness-125 border border-[#ffcc00]/50 rounded-full font-tahoma text-white font-semibold text-[13px] md:text-[15px] uppercase tracking-wide transition-all drop-shadow-md">Yes, Quit</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}