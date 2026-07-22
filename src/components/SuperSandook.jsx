import React, { useState, useEffect, useRef } from 'react';
import { sandookQuestions } from '../data/sandookQuestions';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function SuperSandook({ usedLifelines, onComplete }) {
  const [phase, setPhase] = useState('rules');
  const [timer, setTimer] = useState(90);
  const [isPaused, setIsPaused] = useState(false);
  
  const [sandookQs, setSandookQs] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [indicators, setIndicators] = useState(Array(10).fill('blue'));
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [answerStatus, setAnswerStatus] = useState('default');
  const [isProcessing, setIsProcessing] = useState(false);

  const [revivedLifeline, setRevivedLifeline] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const audioRef = useRef(null);
  const tiktikRef = useRef(null);

  useEffect(() => {
    const shuffledPool = shuffleArray(sandookQuestions).slice(0, 10);
    const formattedQs = shuffledPool.map(q => {
      const optionsWithMeta = q.options.map((opt, index) => ({ 
        text: opt, 
        isCorrect: index === q.correct 
      }));
      const shuffledOpts = shuffleArray(optionsWithMeta);
      return {
        question: q.question,
        options: { A: shuffledOpts[0], B: shuffledOpts[1], C: shuffledOpts[2], D: shuffledOpts[3] }
      };
    });
    setSandookQs(formattedQs);
  }, []);

  useEffect(() => {
    tiktikRef.current = new Audio('/sounds/sandook_tiktik.mp3');
    tiktikRef.current.loop = true;
    return () => {
      if (tiktikRef.current) tiktikRef.current.pause();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (phase === 'rules') {
      audioRef.current = new Audio('/sounds/sandookExplain.mp3');
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Rules Audio Blocked/Missing. Proceeding.", e);
        });
      }
      audioRef.current.onended = () => { if(isMounted) setPhase('intro'); };
      
    } else if (phase === 'intro') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      audioRef.current = new Audio('/sounds/sandookPlay.mp3');
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Intro Audio Blocked. Auto-starting game.", e);
          if(isMounted) setPhase('playing');
        });
      }
      audioRef.current.onended = () => { if(isMounted) setPhase('playing'); };
    } 

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && !isPaused && timer > 0) {
      if (tiktikRef.current) {
        const p = tiktikRef.current.play();
        if (p !== undefined) p.catch(e => {});
      }
    } else {
      if (tiktikRef.current) tiktikRef.current.pause();
    }
  }, [phase, isPaused, timer]);

  const handleSkipRules = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPhase('intro');
  };

  useEffect(() => {
    if (phase !== 'playing' || timer <= 0 || isPaused) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, timer, isPaused]);

  useEffect(() => {
    if (timer <= 0 && phase === 'playing') {
      setPhase('result');
    }
  }, [timer, phase]);

  const handleOptionClick = (letter) => {
    if (phase !== 'playing' || isProcessing || timer <= 0 || isPaused) return;
    
    setIsProcessing(true);
    setSelectedLetter(letter);
    
    const currentQ = sandookQs[currentQIndex];
    const isCorrect = currentQ.options[letter].isCorrect;
    
    setAnswerStatus(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setIndicators(prev => { const newInd = [...prev]; newInd[currentQIndex] = 'gold'; return newInd; });
      const p = new Audio('/sounds/sandook_correct.mp3').play();
      if(p !== undefined) p.catch(e => {});
    } else {
      setIndicators(prev => { const newInd = [...prev]; newInd[currentQIndex] = 'red'; return newInd; });
      const p = new Audio('/sounds/sandook_wrong.mp3').play();
      if(p !== undefined) p.catch(e => {});
    }

    setTimeout(() => {
      setSelectedLetter(null);
      setAnswerStatus('default');
      setIsProcessing(false);
      
      if (currentQIndex + 1 < 10 && timer > 0) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        setPhase('result');
      }
    }, 2000);
  };

  const handleRevive = (lifelineKey) => {
    if (revivedLifeline) return;
    setRevivedLifeline(lifelineKey);
    
    setCountdown(4);
    const countInt = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countInt);
          setTimeout(() => onComplete(lifelineKey), 0); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (phase === 'result') {
      const availableToRevive = Object.keys(usedLifelines).filter(k => usedLifelines[k]);
      if (score < 6 || availableToRevive.length === 0) {
        setCountdown(4);
        const countInt = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countInt);
              setTimeout(() => onComplete(null), 0); 
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]); 

  const usedKeys = Object.keys(usedLifelines).filter(k => usedLifelines[k]);
  const isEligible = score >= 6 && usedKeys.length > 0;

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black animate-[simpleFadeIn_1s_ease-out_forwards]">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kbcExpand { 0% { transform: scaleX(0); opacity: 0; } 100% { transform: scaleX(1); opacity: 1; } }
      `}} />

      {/* Background with Professional Dimming */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 bg-cover bg-center bg-no-repeat ${
          (phase === 'rules' || phase === 'result') ? 'opacity-30 blur-[2px]' : 'opacity-100'
        }`}
        style={{ backgroundImage: "url('/images/sandook_stage_bg.jpg')" }}
      ></div>

      {(phase === 'rules' || phase === 'result') && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-1000"></div>
      )}

      {/* --- PHASE 1: RULES (Strictly Scaled for Compact Screens, NO Scrolling) --- */}
      {phase === 'rules' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-2 md:p-6 animate-[simpleFadeIn_0.5s_ease-out_forwards]">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl m-auto">
            <h1 className="text-[#ffcc00] font-tahoma font-bold text-xl md:text-4xl lg:text-5xl uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,204,0,0.8)] mb-3 md:mb-8 text-center shrink-0">
              Super Sandook
            </h1>
            
            <div className="w-full space-y-1.5 md:space-y-4 lg:space-y-6 mb-4 md:mb-10 text-center shrink-0 px-2">
              <p className="text-white font-tahoma text-[10px] sm:text-xs md:text-lg lg:text-xl drop-shadow-lg tracking-wide leading-tight">
                <strong className="text-[#ffcc00] tracking-widest mr-1 md:mr-2">FORMAT:</strong> 10 rapid-fire multiple-choice questions.
              </p>
              <p className="text-white font-tahoma text-[10px] sm:text-xs md:text-lg lg:text-xl drop-shadow-lg tracking-wide leading-tight">
                <strong className="text-[#ffcc00] tracking-widest mr-1 md:mr-2">TIME LIMIT:</strong> 90 seconds global timer.
              </p>
              <p className="text-white font-tahoma text-[10px] sm:text-xs md:text-lg lg:text-xl drop-shadow-lg tracking-wide leading-tight">
                <strong className="text-red-400 tracking-widest mr-1 md:mr-2">RESTRICTION:</strong> No penalty for incorrect answers. Lifelines disabled.
              </p>
              <p className="text-white font-tahoma text-[10px] sm:text-xs md:text-lg lg:text-xl drop-shadow-lg tracking-wide leading-tight">
                <strong className="text-[#22c55e] tracking-widest mr-1 md:mr-2">REWARD:</strong> 6+ correct answers revive ONE lifeline!
              </p>
            </div>

            <button 
              onClick={handleSkipRules}
              className="px-6 py-2 md:px-12 md:py-3 lg:px-16 lg:py-4 rounded-full bg-gradient-to-b from-[#ffcc00] to-[#b38f00] flex items-center justify-center text-black hover:scale-105 hover:brightness-110 transition-all border-[1px] border-white/60 shadow-[0_0_20px_rgba(255,204,0,0.6)] font-tahoma font-bold text-xs sm:text-sm md:text-xl lg:text-2xl uppercase tracking-widest shrink-0"
            >
              Play Now
            </button>
          </div>
        </div>
      )}

      {/* --- PHASE 2 & 3: PLAYING --- */}
      {(phase === 'intro' || phase === 'playing') && sandookQs.length > 0 && (
        <>
          <div className={`relative z-40 transition-opacity duration-500`}>
            <button onClick={() => setIsPaused(true)} className="absolute top-2 lg:top-6 right-2 lg:right-6 bg-[#000033]/80 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-full text-white text-[9px] lg:text-[13px] font-bold uppercase tracking-widest border border-[#ffcc00]/60 hover:bg-[#000033] hover:border-[#ffcc00] transition-colors drop-shadow-md flex items-center gap-1.5 lg:gap-2">
              <i className="fa-solid fa-pause text-[#eab308]"></i> <span className="hidden md:inline">Pause</span>
            </button>
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[70px] h-[70px] md:w-[100px] md:h-[100px] lg:w-[130px] lg:h-[130px] flex items-center justify-center z-50 drop-shadow-[0_0_20px_rgba(255,204,0,0.8)]">
            <img src="/images/timer_bg.png" className="absolute inset-0 w-full h-full object-cover animate-[simpleFadeIn_0.5s_ease-out_forwards]" alt="Timer BG" />
            <span className="relative z-10 font-tahoma font-bold text-[#ffcc00] text-2xl md:text-4xl lg:text-5xl drop-shadow-lg" style={{ textShadow: '0 0 10px black' }}>
              {timer}
            </span>
          </div>

          <div className="absolute bottom-6 md:bottom-2 lg:bottom-8 left-0 w-full flex flex-col items-center justify-end z-20 px-2 md:px-12 lg:px-16 min-h-[150px]">
            <div className="w-full max-w-[950px] lg:max-w-[1100px] flex flex-col gap-0 lg:gap-0 relative transition-opacity duration-500">
              
              {/* Tighter width so indicators never overlap the curved edges of the strap */}
              <div className="w-[75%] sm:w-[80%] md:w-[82%] lg:w-[90%] mx-auto flex items-center justify-center gap-[0px] mb-1 lg:mb-2 z-30">
                {indicators.map((status, i) => (
                  <img 
                    key={i} 
                    src={`/images/sandook_indicator_${status}.png`} 
                    className="flex-1 h-[24px] md:h-[30px] lg:h-[44px] object-fill transition-all duration-300"
                    alt={`Q${i+1} ${status}`} 
                  />
                ))}
              </div>

              <div 
                className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] flex items-center justify-center h-[46px] md:h-[54px] lg:h-[80px] drop-shadow-xl z-10 opacity-0 origin-center animate-[kbcExpand_0.6s_ease-out_forwards]"
                style={{ backgroundImage: "url('/images/sandook_question_strap.png')", backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              >
                <p className="font-tahoma text-white antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[17px] text-center uppercase tracking-wide leading-[1.5] mt-[2px] px-[12%] lg:px-[10%]">
                  {sandookQs[currentQIndex].question}
                </p>
              </div>

              <div className="w-[110%] -ml-[5%] lg:w-[120%] lg:-ml-[10%] grid grid-cols-2 gap-x-0 gap-y-[2px] lg:gap-y-1 z-10 relative">
                {Object.entries(sandookQs[currentQIndex].options).map(([letter, data]) => {
                  const isRightSide = letter === 'B' || letter === 'D';
                  const bgFlipClass = isRightSide ? 'scale-x-[-1]' : '';
                  const paddingClass = isRightSide ? 'pl-[3%] lg:pl-[5%] pr-[20%] lg:pr-[24%]' : 'pl-[22%] lg:pl-[24%] pr-[4%] lg:pr-[5%]';

                  let bgImage = "url('/images/sandook_option_strap_left.png')";
                  let fontColorClass = "text-white";
                  
                  if (selectedLetter === letter) {
                    if (answerStatus === 'correct') {
                      bgImage = "url('/images/sandook_option_strap_left_correct.png')";
                      fontColorClass = "text-black";
                    } else if (answerStatus === 'wrong') {
                      bgImage = "url('/images/option_strap_left_red.png')";
                    }
                  } else if (selectedLetter !== null && data.isCorrect) {
                    bgImage = "url('/images/sandook_option_strap_left_correct.png')";
                    fontColorClass = "text-black";
                  }

                  return (
                    <div 
                      key={letter} 
                      onClick={() => handleOptionClick(letter)}
                      className="relative w-full h-[28px] md:h-[32px] lg:h-[55px] cursor-pointer group drop-shadow-md animate-[simpleFadeIn_0.3s_ease-out_forwards]"
                    >
                      <div 
                        className={`absolute inset-0 w-full h-full transition-all duration-200 ${!selectedLetter ? 'group-hover:brightness-125' : ''} ${bgFlipClass}`}
                        style={{ backgroundImage: bgImage, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                      ></div>
                      <div className={`absolute inset-0 flex items-center w-full h-full z-10 ${paddingClass}`}>
                        <span className={`${fontColorClass === 'text-black' ? 'text-black' : 'text-[#ffcc00]'} text-[7px] md:text-[9px] lg:text-[13px] mr-1.5 lg:mr-2 mt-[1px]`}>♦</span>
                        <span className={`font-tahoma font-semibold ${fontColorClass === 'text-black' ? 'text-black' : 'text-[#ffcc00]'} text-[9.5px] md:text-[12px] lg:text-[16px] mr-1.5 lg:mr-2 mt-[1px]`}>{letter}:</span>
                        <span className={`font-tahoma ${fontColorClass} antialiased font-medium text-[9.5px] md:text-[12px] lg:text-[16px] uppercase tracking-wide truncate mt-[1px]`}>{data.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </>
      )}

      {/* --- PHASE 4: RESULT (Strictly Scaled for Compact Screens, NO Scrolling) --- */}
      {phase === 'result' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-2 md:p-6 animate-[simpleFadeIn_0.5s_ease-out_forwards]">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl m-auto">
            
            <h1 className="text-white font-tahoma font-bold text-lg md:text-3xl lg:text-4xl uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] mb-1 md:mb-2 text-center shrink-0">
              Round Over
            </h1>
            
            <p className="font-tahoma text-xl md:text-3xl lg:text-4xl text-[#ffcc00] font-black mb-3 md:mb-8 tracking-wider drop-shadow-[0_0_15px_rgba(255,204,0,0.6)] shrink-0">
              Score: {score} / 10
            </p>
            
            <div className="w-full flex flex-col items-center justify-center min-h-[80px] md:min-h-[140px] shrink-0">
              {revivedLifeline ? (
                <div className="animate-[simpleFadeIn_0.5s_ease-out_forwards] flex flex-col items-center">
                  <span className="font-tahoma text-[#22c55e] font-bold text-base md:text-2xl lg:text-3xl uppercase tracking-widest drop-shadow-[0_0_20px_rgba(34,197,94,0.8)] mb-2 md:mb-6">Lifeline Revived!</span>
                  <img src={`/images/${revivedLifeline === 'fiftyFifty' ? '5050' : revivedLifeline === 'audPoll' ? 'audpoll' : 'phone'}.png`} className="w-12 md:w-20 lg:w-24 object-contain animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" alt="Revived" />
                </div>
              ) : isEligible ? (
                <div className="animate-[simpleFadeIn_0.5s_ease-out_forwards] flex flex-col items-center w-full">
                  <p className="font-tahoma text-white text-xs md:text-lg lg:text-xl font-medium tracking-wide mb-3 md:mb-6 drop-shadow-md text-center px-2">Congratulations! Choose ONE lifeline to revive:</p>
                  <div className="flex items-center justify-center gap-4 md:gap-10">
                    {usedKeys.map(key => (
                      <div key={key} className="relative group cursor-pointer" onClick={() => handleRevive(key)}>
                        <div className="absolute inset-0 bg-[#ffcc00] blur-xl opacity-0 group-hover:opacity-60 transition-opacity rounded-full"></div>
                        <img 
                          src={`/images/${key === 'fiftyFifty' ? '5050' : key === 'audPoll' ? 'audpoll' : 'phone'}.png`}
                          className="w-10 md:w-20 lg:w-24 object-contain hover:scale-110 transition-all relative z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                          alt={key}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-[simpleFadeIn_0.5s_ease-out_forwards] flex flex-col items-center text-center px-4">
                  <i className="fa-solid fa-circle-exclamation text-red-500 text-xl md:text-4xl mb-1 md:mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"></i>
                  <p className="font-tahoma text-red-400 text-xs md:text-xl lg:text-2xl font-medium tracking-wide drop-shadow-lg leading-tight">
                    {score < 6 ? "You needed 6 correct answers to revive a lifeline." : "You haven't used any lifelines yet to revive!"}
                  </p>
                </div>
              )}
            </div>

            {countdown > 0 && (
              <p className="font-tahoma text-[#ffcc00] font-bold text-[10px] md:text-base lg:text-lg uppercase tracking-widest animate-pulse mt-4 md:mt-10 drop-shadow-md shrink-0">
                Returning to Hot Seat in {countdown}...
              </p>
            )}

          </div>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md animate-[simpleFadeIn_0.2s_ease-out_forwards]">
          <div className="w-[85%] max-w-[350px] bg-gradient-to-b from-[#000033] to-[#00001a] border-2 border-[#ffcc00] rounded-2xl p-8 drop-shadow-2xl flex flex-col items-center">
            <h2 className="font-tahoma text-[#ffcc00] text-[20px] md:text-[24px] font-bold text-center uppercase tracking-widest mb-3 drop-shadow-md">Game Paused</h2>
            <div className="w-full h-[1px] bg-white/20 mb-6"></div>
            <button onClick={() => setIsPaused(false)} className="w-full py-3 bg-gradient-to-r from-green-700 to-green-500 hover:brightness-125 border border-[#ffcc00]/80 rounded-full font-tahoma text-white font-bold text-[14px] md:text-[16px] uppercase tracking-wide transition-all drop-shadow-md flex items-center justify-center gap-2">
              <i className="fa-solid fa-play"></i> Resume
            </button>
          </div>
        </div>
      )}

    </div>
  );
}