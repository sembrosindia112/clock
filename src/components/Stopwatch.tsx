import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { LapTime } from '../types';
import { sound } from '../utils/sound';

interface StopwatchProps {
  litColor: string;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ litColor }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime;
      const updateTimer = () => {
        setElapsedTime(performance.now() - startTimeRef.current);
        rafRef.current = requestAnimationFrame(updateTimer);
      };
      rafRef.current = requestAnimationFrame(updateTimer);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    sound.playTick(true);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sound.playTick(true);
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning) return;
    sound.playTick(true);
    const previousTotal = laps.length > 0 ? laps[0].overallTime : 0;
    const lapDuration = elapsedTime - previousTotal;

    const newLap: LapTime = {
      lapNumber: laps.length + 1,
      time: lapDuration,
      overallTime: elapsedTime,
    };
    setLaps([newLap, ...laps]);
  };

  const formatParts = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return {
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
      c: centis.toString().padStart(2, '0'),
    };
  };

  const currentFormatted = formatParts(elapsedTime);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-6">
      {/* Big Stopwatch Display */}
      <div className="flex items-baseline justify-center font-orbitron font-extrabold tracking-tight select-none">
        <span
          className="text-6xl sm:text-8xl md:text-9xl transition-all"
          style={{ color: litColor, textShadow: `0 0 25px ${litColor}60` }}
        >
          {currentFormatted.m}:{currentFormatted.s}
        </span>
        <span
          className="text-3xl sm:text-5xl md:text-6xl ml-3 opacity-80"
          style={{ color: litColor }}
        >
          .{currentFormatted.c}
        </span>
      </div>

      {/* Stopwatch Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handleStartStop}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold shadow-lg transition-all active:scale-95 ${
            isRunning
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          {isRunning ? 'STOP' : 'START'}
        </button>

        <button
          onClick={handleLap}
          disabled={!isRunning}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-40 disabled:pointer-events-none active:scale-95"
        >
          <Flag className="w-5 h-5" />
          LAP
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          RESET
        </button>
      </div>

      {/* Lap Table */}
      {laps.length > 0 && (
        <div className="w-full max-w-xl mt-8 bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3 bg-slate-950/70 border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>Lap</span>
            <span>Split Time</span>
            <span>Overall Time</span>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-mono text-sm">
            {laps.map((lap) => {
              const split = formatParts(lap.time);
              const overall = formatParts(lap.overallTime);
              return (
                <div
                  key={lap.lapNumber}
                  className="flex items-center justify-between px-6 py-2.5 text-slate-300 hover:bg-slate-800/30 transition"
                >
                  <span className="font-bold text-cyan-400">
                    #{lap.lapNumber.toString().padStart(2, '0')}
                  </span>
                  <span>
                    +{split.m}:{split.s}.{split.c}
                  </span>
                  <span className="text-slate-400">
                    {overall.m}:{overall.s}.{overall.c}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};