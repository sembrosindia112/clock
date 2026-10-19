import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Code,
  Globe,
  Settings,
  Sparkles,
  Timer as TimerIcon,
  Clock,
  Zap,
} from 'lucide-react';
import { ClockStyle, AppMode, Theme, TimezoneOption } from './types';
import { SevenSegmentDigit } from './components/SevenSegmentDigit';
import { ColonSeparator } from './components/ColonSeparator';
import { FlipDigit } from './components/FlipDigit';
import { MatrixDigit } from './components/MatrixDigit';
import { Stopwatch } from './components/Stopwatch';
import { Timer } from './components/Timer';
import { AngularSourceModal } from './components/AngularSourceModal';
import { sound } from './utils/sound';

const THEMES: Theme[] = [
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    colorHex: '#00f0ff',
    glowClass: 'shadow-cyan-500/20',
    borderClass: 'border-cyan-500/30',
    bgGradient: 'from-cyan-950/20 via-[#060a12] to-[#040609]',
    litColor: '#00f0ff',
    unlitColor: '#091e2b',
    accentBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Green',
    colorHex: '#10b981',
    glowClass: 'shadow-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    bgGradient: 'from-emerald-950/20 via-[#060f0c] to-[#030806]',
    litColor: '#10b981',
    unlitColor: '#081f15',
    accentBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'amber-nixie',
    name: 'Amber Glow',
    colorHex: '#f59e0b',
    glowClass: 'shadow-amber-500/20',
    borderClass: 'border-amber-500/30',
    bgGradient: 'from-amber-950/20 via-[#0d0903] to-[#060401]',
    litColor: '#f59e0b',
    unlitColor: '#261806',
    accentBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    id: 'neon-magenta',
    name: 'Neon Pink',
    colorHex: '#ec4899',
    glowClass: 'shadow-pink-500/20',
    borderClass: 'border-pink-500/30',
    bgGradient: 'from-pink-950/20 via-[#10060d] to-[#060205]',
    litColor: '#ec4899',
    unlitColor: '#250817',
    accentBadge: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  },
  {
    id: 'hyper-violet',
    name: 'Hyper Violet',
    colorHex: '#8b5cf6',
    glowClass: 'shadow-violet-500/20',
    borderClass: 'border-violet-500/30',
    bgGradient: 'from-violet-950/20 via-[#0c0717] to-[#04020a]',
    litColor: '#a78bfa',
    unlitColor: '#1b1131',
    accentBadge: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  },
  {
    id: 'pure-white',
    name: 'Glacier Ice',
    colorHex: '#f8fafc',
    glowClass: 'shadow-slate-300/20',
    borderClass: 'border-slate-500/30',
    bgGradient: 'from-slate-900/30 via-[#07090e] to-[#020305]',
    litColor: '#f8fafc',
    unlitColor: '#1a1f2e',
    accentBadge: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  },
];

const TIMEZONES: TimezoneOption[] = [
  { label: 'Local System Time', value: 'local', city: 'Local', offset: 'SYS' },
  { label: 'UTC Universal Time', value: 'UTC', city: 'London (UTC)', offset: 'UTC+0' },
  { label: 'New York (EDT/EST)', value: 'America/New_York', city: 'New York', offset: 'UTC-4' },
  { label: 'San Francisco (PDT)', value: 'America/Los_Angeles', city: 'San Francisco', offset: 'UTC-7' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo', city: 'Tokyo', offset: 'UTC+9' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney', city: 'Sydney', offset: 'UTC+10' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai', city: 'Dubai', offset: 'UTC+4' },
  { label: 'Paris (CEST)', value: 'Europe/Paris', city: 'Paris', offset: 'UTC+2' },
];

export function App() {
  // App state
  const [appMode, setAppMode] = useState<AppMode>('clock');
  const [clockStyle, setClockStyle] = useState<ClockStyle>('seven-segment');
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [is24Hour, setIs24Hour] = useState<boolean>(true);
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [showMillis, setShowMillis] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [timezone, setTimezone] = useState<string>('local');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAngularModalOpen, setIsAngularModalOpen] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Live time ticker state
  const [now, setNow] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 40ms interval yields smooth 25 FPS update for milliseconds & crisp seconds
    const interval = setInterval(() => {
      setNow(new Date());
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Periodic subtle audio tick on second change
  const prevSecRef = useRef<number>(-1);
  useEffect(() => {
    const curSec = now.getSeconds();
    if (curSec !== prevSecRef.current) {
      prevSecRef.current = curSec;
      if (soundEnabled && appMode === 'clock') {
        sound.playTick(true);
      }
    }
  }, [now, soundEnabled, appMode]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Parse time based on selected timezone
  const getTimeParts = () => {
    let d = now;
    if (timezone !== 'local') {
      try {
        const str = now.toLocaleString('en-US', { timeZone: timezone });
        d = new Date(str);
      } catch {
        d = now;
      }
    }

    let h = d.getHours();
    const isPM = h >= 12;
    if (!is24Hour) {
      h = h % 12 || 12;
    }
    const m = d.getMinutes();
    const s = d.getSeconds();
    const ms = Math.floor(d.getMilliseconds() / 10);

    return {
      hoursStr: h.toString().padStart(2, '0'),
      minsStr: m.toString().padStart(2, '0'),
      secsStr: s.toString().padStart(2, '0'),
      msStr: ms.toString().padStart(2, '0'),
      ampm: isPM ? 'PM' : 'AM',
      rawDate: d,
    };
  };

  const { hoursStr, minsStr, secsStr, msStr, ampm, rawDate } = getTimeParts();

  // Formatted date string
  const dateFormatted = rawDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const renderDigit = (char: string, keyPrefix: string) => {
    switch (clockStyle) {
      case 'seven-segment':
        return (
          <SevenSegmentDigit
            key={keyPrefix}
            char={char}
            litColor={theme.litColor}
            unlitColor={theme.unlitColor}
            size="xl"
          />
        );
      case 'flip':
        return (
          <FlipDigit
            key={keyPrefix}
            char={char}
            litColor={theme.litColor}
            size="xl"
          />
        );
      case 'matrix':
        return (
          <MatrixDigit
            key={keyPrefix}
            char={char}
            litColor={theme.litColor}
            size="xl"
          />
        );
      case 'neon':
      case 'minimal':
      default:
        return (
          <div
            key={keyPrefix}
            className={`font-orbitron font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none select-none transition-all px-1 sm:px-2 ${
              clockStyle === 'neon' ? 'tracking-wider' : 'tracking-normal'
            }`}
            style={{
              color: theme.litColor,
              textShadow:
                clockStyle === 'neon'
                  ? `0 0 15px ${theme.litColor}, 0 0 35px ${theme.litColor}90, 0 0 70px ${theme.litColor}40`
                  : `0 0 20px ${theme.litColor}30`,
            }}
          >
            {char}
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full bg-gradient-to-b ${theme.bgGradient} flex flex-col justify-between overflow-hidden transition-colors duration-500 ${
        scanlines ? 'crt-overlay' : ''
      }`}
    >
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-25"
        style={{ backgroundColor: theme.colorHex }}
      />

      {/* TOP HEADER / APP BAR */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 backdrop-blur-sm border-b border-white/5">
        {/* Left: Branding & Angular TS Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-lg">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-orbitron font-bold tracking-wider text-slate-100 uppercase">
                Digital Time Station
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                LIVE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span>High Precision Standalone</span>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => setIsAngularModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline decoration-cyan-500/40 hover:decoration-cyan-400 flex items-center gap-1 transition"
                title="View Angular TypeScript source code"
              >
                <Code className="w-3 h-3 inline" /> Angular TS Code
              </button>
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher Tabs */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner">
          <button
            onClick={() => setAppMode('clock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              appMode === 'clock'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            CLOCK
          </button>
          <button
            onClick={() => setAppMode('stopwatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              appMode === 'stopwatch'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TimerIcon className="w-4 h-4" />
            STOPWATCH
          </button>
          <button
            onClick={() => setAppMode('timer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              appMode === 'timer'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            COUNTDOWN
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Angular Source Modal Button */}
          <button
            onClick={() => setIsAngularModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold shadow-lg transition active:scale-95"
            title="Inspect Angular TypeScript code"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Angular TS</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) sound.playTick(true);
            }}
            className={`p-2.5 rounded-xl border transition active:scale-95 ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Ticks / Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Settings Drawer Toggle */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2.5 rounded-xl border transition active:scale-95 ${
              showSettingsDrawer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Customization Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Mode Tabs (shown on small screens) */}
      <div className="flex md:hidden justify-center px-4 pt-3">
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-full max-w-sm justify-around">
          <button
            onClick={() => setAppMode('clock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
              appMode === 'clock' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Clock
          </button>
          <button
            onClick={() => setAppMode('stopwatch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
              appMode === 'stopwatch' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => setAppMode('timer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
              appMode === 'timer' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Countdown
          </button>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {/* TIMEZONE & DATE HEADER BADGE */}
        {appMode === 'clock' && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-8 text-center">
            {/* Date Display */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg text-xs sm:text-sm font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colorHex }} />
              <span className="font-semibold text-slate-200">{dateFormatted}</span>
            </div>

            {/* Timezone Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg text-xs font-mono text-slate-400">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {TIMEZONES.find((t) => t.value === timezone)?.city || timezone}
              </span>
            </div>
          </div>
        )}

        {/* CLOCK MODE: GIANT DISPLAY */}
        {appMode === 'clock' && (
          <div className="w-full max-w-7xl flex flex-col items-center justify-center">
            {/* The Big Stage Frame */}
            <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 px-4 py-8 sm:px-10 sm:py-14 rounded-3xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
              {/* Hours */}
              <div className="flex items-center">
                {renderDigit(hoursStr[0], 'h0')}
                {renderDigit(hoursStr[1], 'h1')}
              </div>

              {/* Pulsing Colon */}
              <ColonSeparator litColor={theme.litColor} size="xl" />

              {/* Minutes */}
              <div className="flex items-center">
                {renderDigit(minsStr[0], 'm0')}
                {renderDigit(minsStr[1], 'm1')}
              </div>

              {/* Seconds (Optional) */}
              {showSeconds && (
                <>
                  <ColonSeparator litColor={theme.litColor} size="xl" />
                  <div className="flex items-center">
                    {renderDigit(secsStr[0], 's0')}
                    {renderDigit(secsStr[1], 's1')}
                  </div>
                </>
              )}

              {/* Milliseconds Tag (Optional) */}
              {showMillis && (
                <div className="flex items-baseline ml-2">
                  <span
                    className="text-2xl sm:text-4xl md:text-5xl font-orbitron font-extrabold opacity-75"
                    style={{ color: theme.litColor }}
                  >
                    .{msStr}
                  </span>
                </div>
              )}

              {/* 12H AM / PM Indicator */}
              {!is24Hour && (
                <div className="flex flex-col items-center justify-center ml-2 sm:ml-4">
                  <div
                    className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg font-orbitron font-black text-xs sm:text-base tracking-widest border"
                    style={{
                      borderColor: theme.litColor,
                      color: theme.litColor,
                      backgroundColor: `${theme.litColor}15`,
                      boxShadow: `0 0 16px ${theme.litColor}30`,
                    }}
                  >
                    {ampm}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STOPWATCH MODE */}
        {appMode === 'stopwatch' && <Stopwatch litColor={theme.litColor} />}

        {/* TIMER MODE */}
        {appMode === 'timer' && <Timer litColor={theme.litColor} />}

        {/* QUICK CONTROL TOGGLES (Clock Mode) */}
        {appMode === 'clock' && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-10 font-mono text-xs">
            <button
              onClick={() => setIs24Hour(!is24Hour)}
              className={`px-4 py-2 rounded-xl border transition-all ${
                is24Hour
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {is24Hour ? 'Format: 24-Hour' : 'Format: 12-Hour'}
            </button>

            <button
              onClick={() => setShowSeconds(!showSeconds)}
              className={`px-4 py-2 rounded-xl border transition-all ${
                showSeconds
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Seconds: {showSeconds ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setShowMillis(!showMillis)}
              className={`px-4 py-2 rounded-xl border transition-all ${
                showMillis
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Milliseconds: {showMillis ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-30 px-6 py-4 border-t border-white/5 bg-[#070a10]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: theme.colorHex }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: theme.colorHex }}
            />
          </span>
          <span className="text-slate-300">
            Angular Architecture Engine • Standalone Signals Component
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAngularModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5" />
            <span>View Angular TS Source</span>
          </button>
          <span className="text-slate-700">•</span>
          <span className="text-slate-500">Press F11 for Fullscreen Wall Clock</span>
        </div>
      </footer>

      {/* SETTINGS / CUSTOMIZATION SLIDE-OVER DRAWER */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#0c1018] border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-orbitron font-bold text-white text-base">
                    CLOCK CUSTOMIZER
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Close
                </button>
              </div>

              {/* Clock Display Styles */}
              <div className="mt-6">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Digit Rendering Style
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {[
                    { id: 'seven-segment', label: '7-Segment LED' },
                    { id: 'flip', label: 'Mechanical Flip' },
                    { id: 'matrix', label: 'Dot Matrix Grid' },
                    { id: 'neon', label: 'Glow Neon' },
                    { id: 'minimal', label: 'Minimal Clean' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setClockStyle(style.id as ClockStyle)}
                      className={`p-3 rounded-xl border text-left font-medium transition ${
                        clockStyle === style.id
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Themes */}
              <div className="mt-6">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Color Theme & Glow
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${
                        theme.id === th.id
                          ? 'bg-slate-800/90 border-slate-500 ring-2 ring-cyan-400/40'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full shadow-md"
                        style={{
                          backgroundColor: th.colorHex,
                          boxShadow: `0 0 10px ${th.colorHex}`,
                        }}
                      />
                      <span className="text-[11px] font-mono text-slate-300 text-center">
                        {th.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone Selector */}
              <div className="mt-6">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  World Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visual Toggles */}
              <div className="mt-6 space-y-3">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Effects & Audio
                </label>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span>Retro CRT Scanlines</span>
                  <input
                    type="checkbox"
                    checked={scanlines}
                    onChange={(e) => setScanlines(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span>Audio Ticks & Chimes</span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => {
                      setSoundEnabled(e.target.checked);
                      if (e.target.checked) sound.playTick(true);
                    }}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  sound.playChime();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 border border-slate-700 transition"
              >
                Test Chime
              </button>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition shadow-lg shadow-cyan-600/30"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Angular TS Source Code Inspector Modal */}
      <AngularSourceModal
        isOpen={isAngularModalOpen}
        onClose={() => setIsAngularModalOpen(false)}
      />
    </div>
  );
}

export default App;