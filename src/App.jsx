import { useState, useEffect } from 'react';
import GameScreen from './components/GameScreen';
import GameOver from './components/GameOver'; // IMPORT THE NEW COMPONENT

// --- Reusable Fade Wrapper for Smooth Transitions ---
const ScreenWrapper = ({ isVisible, onExited, children, className = "" }) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      } ${className}`}
      onTransitionEnd={() => {
        if (!isVisible && onExited) onExited();
      }}
    >
      {children}
    </div>
  );
};

// --- 1. Start Screen ---
const StartScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenWrapper isVisible={visible} onExited={onComplete}>
      <div className="w-full h-full bg-black flex flex-col items-center justify-center">
        <div className="w-full max-w-xl px-12 animate-[simpleFadeIn_1.5s_ease-out_forwards]">
          <img src="/branding.png" alt="Game Studioz" className="w-full h-auto object-contain" />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes simpleFadeIn {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
    </ScreenWrapper>
  );
};

// --- 2. Disclaimer Screen ---
const DisclaimerScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  return (
    <ScreenWrapper isVisible={visible} onExited={onComplete}>
      <div className="w-full h-full bg-cover bg-center flex items-center justify-center p-8" style={{ backgroundImage: "url('/stage_bg.jpg')" }}>
        <div className="max-w-3xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <h1 className="text-2xl font-bold text-gray-300 mb-6 tracking-[0.2em] uppercase">
            <i className="fa-solid fa-circle-exclamation mr-3 text-yellow-500"></i>Legal Disclaimer
          </h1>
          
          <div className="space-y-4 text-gray-400 text-sm font-light leading-relaxed mb-8 text-justify px-4">
            <p>This application is an unofficial, fan-made simulation developed strictly for entertainment and educational purposes. It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with the "Kaun Banega Crorepati" franchise, its broadcasters, or any of its subsidiaries.</p>
            <p>All related names, marks, emblems, and images are registered trademarks of their respective owners. The use of any trade name or trademark is for identification and reference purposes only.</p>
            <p className="text-white font-medium uppercase tracking-widest mt-6 text-center">
              <i className="fa-solid fa-coins text-yellow-500 mr-2"></i> No real money or prizes are awarded
            </p>
          </div>

          <button onClick={() => setVisible(false)} className="px-12 py-3 bg-white/10 text-white border border-white/20 rounded-full text-sm font-bold hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all tracking-[0.1em] uppercase">
            Acknowledge
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
};

// --- 3. Feedback Screen ---
const FeedbackScreen = ({ onClose }) => {
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState('idle');

  const handleClose = () => setVisible(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <ScreenWrapper isVisible={visible} onExited={onClose}>
      <div className="w-full h-full bg-gray-50 flex flex-col absolute inset-0 z-50">
        <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 tracking-wide uppercase flex items-center gap-3">
            <i className="fa-solid fa-comment-dots text-yellow-500"></i>Feedback & Support
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 w-full overflow-y-auto flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 animate-[simpleFadeIn_0.4s_ease-out_forwards]">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <i className="fa-solid fa-check text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                <p className="text-gray-500 text-center mb-8">Your feedback helps us improve the experience.</p>
                <button onClick={handleClose} className="px-10 py-3 bg-gray-900 text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors font-bold tracking-widest uppercase text-sm shadow-md">
                  Return to Menu
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-[simpleFadeIn_0.4s_ease-out_forwards]">
                <div className="text-center mb-2">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">We value your thoughts</h3>
                  <p className="text-gray-500 text-sm">Help us improve the game experience.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Topic</label>
                  <select className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-yellow-500 transition-colors text-sm font-medium bg-gray-50">
                    <option>General Feedback</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
                  <textarea rows="5" required className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-yellow-500 transition-colors text-sm resize-none bg-gray-50 font-medium" placeholder="Tell us what you think..."></textarea>
                </div>
                <button type="submit" disabled={status === 'submitting'} className="mt-2 w-full bg-gray-900 text-white font-bold py-4 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors tracking-widest uppercase text-sm disabled:opacity-70 flex justify-center items-center gap-3 shadow-md">
                  {status === 'submitting' ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane"></i> Submit Feedback</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

// --- Sub-Components for Main Menu ---
const IconTool = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 text-gray-400 hover:text-white hover:-translate-y-1 transition-all group">
    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
      <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">{text}</span>
  </button>
);

const GoldPlayButton = ({ onClick }) => (
  <div className="relative group cursor-pointer" onClick={onClick}>
    <div className="absolute inset-0 bg-yellow-500 blur-[30px] opacity-40 group-hover:opacity-70 transition-opacity duration-500 rounded-full"></div>
    <button className="relative z-10 flex items-center justify-center gap-4 px-16 py-5 bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-700 rounded-full border-2 border-yellow-200 text-black shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300">
      <i className="fa-solid fa-play text-2xl"></i>
      <span className="font-black text-2xl tracking-[0.15em] uppercase">Play Now</span>
    </button>
  </div>
);

// --- 4. Main Menu ---
const MainMenu = ({ onPlay, onDisclaimer, onFeedback }) => {
  const [visible, setVisible] = useState(true);
  const [name, setName] = useState(localStorage.getItem('kbc_playerName') || 'Guest Player');
  const [isEditing, setIsEditing] = useState(false);
  const highScore = localStorage.getItem('kbc_highScore') || '0';

  const handleNameSave = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditing(false);
      localStorage.setItem('kbc_playerName', name || 'Guest Player');
      if (!name) setName('Guest Player');
    }
  };

  const handleTransition = (callback) => {
    setVisible(false);
    setTimeout(callback, 700);
  };

  return (
    <ScreenWrapper isVisible={visible}>
      <div className="w-full h-full flex flex-col justify-between bg-cover bg-center" style={{ backgroundImage: "url('/stage_bg.jpg')" }}>
        <div className="flex justify-between items-start w-full p-8">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 py-2 px-5 rounded-full flex items-center gap-3 shadow-lg hover:bg-black/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_10px_rgba(255,204,0,0.4)]">
              <i className="fa-solid fa-user text-black text-sm"></i>
            </div>
            {isEditing ? (
              <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleNameSave} onBlur={handleNameSave} className="bg-transparent text-white focus:outline-none w-28 font-semibold uppercase tracking-wider text-sm" maxLength={15} />
            ) : (
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsEditing(true)}>
                <span className="font-semibold text-gray-200 tracking-wider uppercase text-sm group-hover:text-white transition-colors">{name}</span>
                <i className="fa-solid fa-pen text-[10px] text-gray-500 group-hover:text-yellow-500 transition-colors"></i>
              </div>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/10 py-2 px-6 rounded-full flex items-center gap-4 shadow-lg">
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Highest Score</span>
              <span className="text-lg font-bold text-white font-mono leading-none tracking-wider">{highScore}</span>
            </div>
            <i className="fa-solid fa-coins text-2xl text-yellow-500 drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]"></i>
          </div>
        </div>

        <div className="w-full flex justify-center items-center gap-16 p-8 pb-12 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <IconTool icon="fa-file-contract" text="Disclaimer" onClick={() => handleTransition(onDisclaimer)} />
          <GoldPlayButton onClick={() => handleTransition(onPlay)} />
          <IconTool icon="fa-comment-dots" text="Feedback" onClick={() => handleTransition(onFeedback)} />
        </div>
      </div>
    </ScreenWrapper>
  );
};

// --- 5. Loading Screen ---
const LoadingScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenWrapper isVisible={visible} onExited={onComplete}>
      <div className="w-full h-full bg-cover bg-center flex flex-col justify-center items-center" style={{ backgroundImage: "url('/stage_bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-8">
            <i className="fa-solid fa-circle-notch fa-spin text-5xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"></i>
            <i className="fa-solid fa-coins absolute text-xl text-white"></i>
          </div>
          <h2 className="text-xl font-light text-white tracking-[0.4em] uppercase mb-6 drop-shadow-md">
            Entering Hot Seat
          </h2>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 animate-[loading_2.5s_ease-in-out_forwards] shadow-[0_0_10px_rgba(234,179,8,1)]"></div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes loading {
          0% { width: 0%; }
          40% { width: 40%; }
          80% { width: 80%; }
          100% { width: 100%; }
        }
      `}} />
    </ScreenWrapper>
  );
};

// --- Main Application State Machine ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('start'); 
  const [finalScore, setFinalScore] = useState("0");
  
  // Get playerName from localStorage dynamically when passing it down
  const getPlayerName = () => localStorage.getItem('kbc_playerName') || 'Guest Player';

  const handleGameOver = (score) => {
    setFinalScore(score);
    // Basic high score saving check
    const currentHigh = parseInt((localStorage.getItem('kbc_highScore') || '0').replace(/,/g, ''));
    const newScoreParsed = parseInt(score.replace(/,/g, ''));
    if (newScoreParsed > currentHigh) {
      localStorage.setItem('kbc_highScore', score);
    }
    setCurrentScreen('game_over');
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      {currentScreen === 'start' && <StartScreen onComplete={() => setCurrentScreen('disclaimer')} />}
      {currentScreen === 'disclaimer' && <DisclaimerScreen onComplete={() => setCurrentScreen('menu')} />}
      {currentScreen === 'feedback' && <FeedbackScreen onClose={() => setCurrentScreen('menu')} />}
      
      {currentScreen === 'menu' && (
        <MainMenu 
          onPlay={() => setCurrentScreen('loading')} 
          onDisclaimer={() => setCurrentScreen('disclaimer')}
          onFeedback={() => setCurrentScreen('feedback')}
        />
      )}
      
      {currentScreen === 'loading' && <LoadingScreen onComplete={() => setCurrentScreen('game')} />}
      
      {/* Play Screen */}
      {currentScreen === 'game' && <GameScreen onGameOver={handleGameOver} />}

      {/* Game Over Screen */}
      {currentScreen === 'game_over' && (
        <GameOver 
          score={finalScore} 
          username={getPlayerName()} 
          onHome={() => setCurrentScreen('menu')} 
        />
      )}
    </div>
  );
}