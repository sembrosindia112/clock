import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, BellRing } from 'lucide-react';
import { sound } from '../utils/sound';

interface TimerProps {
  litColor: string;
}

export const Timer: React.FC<TimerProps> = ({ litColor }) => {
  const [totalSeconds, setTotalSeconds] = useState(300); // Default 5 mins
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsFinished(true);
            sound.playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remainingSeconds]);

  const toggleTimer = () => {
    sound.playTick(true);
    if (isFinished) {
      setIsFinished(false);
      setRemainingSeconds(totalSeconds);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    sound.playTick(true);
    setIsActive(false);
    setIsFinished(false);
    setRemainingSeconds(totalSeconds);
  };

  const adjustMinutes = (delta: number) => {
    if (isActive) return;
    const newTotal = Math.max(60, Math.min(3600 * 24, totalSeconds + delta * 60));
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
    setIsFinished(false);
  };

  const setPreset = (seconds: number) => {
    if (isActive) return;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsFinished(false);
  };

  const hours = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;

  const hStr = hours.toString().padStart(2, '0');
  const mStr = mins.toString().padStart(2, '0');
  const sStr = secs.toString().padStart(2, '0');

  // Progress percentage
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-6">
      {/* Alarm ringing alert banner */}
      {isFinished && (
        <div className="flex items-center gap-3 px-6 py-3 mb-6 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 font-bold animate-bounce shadow-lg">
          <BellRing className="w-6 h-6 animate-spin" />
          <span>TIME EXPIRED! ALARM SOUNDING</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: litColor,
            boxShadow: `0 0 12px ${litColor}`,
          }}
        />
      </div>

      {/* Giant Countdown Display */}
      <div className="flex items-center justify-center font-orbitron font-extrabold tracking-tight select-none">
        {hours > 0 && (
          <>
            <span
              className="text-6xl sm:text-8xl md:text-9xl transition-all"
              style={{ color: litColor, textShadow: `0 0 25px ${litColor}60` }}
            >
              {hStr}
            </span>
            <span className="text-4xl sm:text-6xl md:text-7xl mx-2 opacity-60" style={{ color: litColor }}>
              :
            </span>
          </>
        )}
        <span
          className="text-6xl sm:text-8xl md:text-9xl transition-all"
          style={{ color: litColor, textShadow: `0 0 25px ${litColor}60` }}
        >
          {mStr}
        </span>
        <span className="text-4xl sm:text-6xl md:text-7xl mx-2 opacity-60" style={{ color: litColor }}>
          :
        </span>
        <span
          className="text-6xl sm:text-8xl md:text-9xl transition-all"
          style={{ color: litColor, textShadow: `0 0 25px ${litColor}60` }}
        >
          {sStr}
        </span>
      </div>

      {/* Quick Adjust Buttons (disabled while running) */}
      {!isActive && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            onClick={() => adjustMinutes(-5)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1 transition"
          >
            <Minus className="w-3.5 h-3.5" /> 5 Min
          </button>
          <button
            onClick={() => adjustMinutes(-1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1 transition"
          >
            <Minus className="w-3.5 h-3.5" /> 1 Min
          </button>
          <button
            onClick={() => adjustMinutes(1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> 1 Min
          </button>
          <button
            onClick={() => adjustMinutes(5)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> 5 Min
          </button>
        </div>
      )}

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        {[
          { label: '1m', secs: 60 },
          { label: '3m', secs: 180 },
          { label: '5m', secs: 300 },
          { label: '10m', secs: 600 },
          { label: '15m', secs: 900 },
          { label: '25m (Pomodoro)', secs: 1500 },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => setPreset(preset.secs)}
            disabled={isActive}
            className={`px-3 py-1 rounded text-xs font-mono font-medium border transition ${
              totalSeconds === preset.secs
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold shadow-lg transition-all active:scale-95 ${
            isActive
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          {isActive ? 'PAUSE' : isFinished ? 'RESTART' : 'START TIMER'}
        </button>

        <button
          onClick={resetTimer}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          RESET
        </button>
      </div>
    </div>
  );
};