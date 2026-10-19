import React, { useEffect, useState } from 'react';

interface FlipDigitProps {
  char: string;
  litColor: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FlipDigit: React.FC<FlipDigitProps> = ({
  char,
  litColor,
  size = 'lg',
}) => {
  const [current, setCurrent] = useState(char);
  const [previous, setPrevious] = useState(char);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (char !== current) {
      setPrevious(current);
      setCurrent(char);
      setFlipping(true);
      const timer = setTimeout(() => {
        setFlipping(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [char, current]);

  const sizeClasses = {
    sm: 'w-7 h-12 text-2xl md:w-9 md:h-16 md:text-3xl',
    md: 'w-10 h-16 text-3xl md:w-14 md:h-24 md:text-5xl',
    lg: 'w-12 h-20 text-4xl sm:w-16 sm:h-28 sm:text-6xl md:w-24 md:h-40 md:text-8xl lg:w-32 lg:h-52 lg:text-9xl xl:w-36 xl:h-60',
    xl: 'w-16 h-28 text-5xl sm:w-24 sm:h-40 sm:text-7xl md:w-32 md:h-56 md:text-9xl lg:w-40 lg:h-68 lg:text-[10rem] xl:w-48 xl:h-80',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center font-orbitron font-bold rounded-lg overflow-hidden bg-gradient-to-b from-[#181d29] to-[#0c0f17] border border-slate-700/60 shadow-2xl ${sizeClasses}`}
      style={{ color: litColor }}
    >
      {/* Upper Half */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="tracking-tight"
          style={{ textShadow: `0 0 20px ${litColor}` }}
        >
          {current}
        </span>
      </div>

      {/* Flip seam divider */}
      <div className="flip-card-divider" />

      {/* Decorative side rivets */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-2 rounded bg-black/60 z-20" />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-2 rounded bg-black/60 z-20" />

      {/* Flipping animation gloss overlay */}
      {flipping && (
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none z-10" />
      )}
    </div>
  );
};