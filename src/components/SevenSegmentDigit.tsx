import React from 'react';

interface SevenSegmentDigitProps {
  char: string;
  litColor: string;
  unlitColor?: string;
  glow?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 7-segment mapping: a(top), b(top-right), c(bottom-right), d(bottom), e(bottom-left), f(top-left), g(middle)
const SEGMENT_MAP: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
  '-': [0, 0, 0, 0, 0, 0, 1],
  ' ': [0, 0, 0, 0, 0, 0, 0],
};

export const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({
  char,
  litColor,
  unlitColor = '#151922',
  glow = 'drop-shadow(0 0 16px currentColor)',
  size = 'lg',
}) => {
  const segments = SEGMENT_MAP[char] ?? [0, 0, 0, 0, 0, 0, 0];

  // SVG coordinate definitions for modern sharp polygonal 7-segments
  // ViewBox: 0 0 70 120
  const pathA = 'M 14 10 L 22 2 L 48 2 L 56 10 L 48 18 L 22 18 Z'; // top
  const pathB = 'M 58 12 L 66 20 L 66 52 L 58 60 L 50 52 L 50 20 Z'; // top-right
  const pathC = 'M 58 64 L 66 72 L 66 104 L 58 112 L 50 104 L 50 72 Z'; // bottom-right
  const pathD = 'M 14 114 L 22 106 L 48 106 L 56 114 L 48 122 L 22 122 Z'; // bottom
  const pathE = 'M 12 64 L 20 72 L 20 104 L 12 112 L 4 104 L 4 72 Z'; // bottom-left
  const pathF = 'M 12 12 L 20 20 L 20 52 L 12 60 L 4 52 L 4 20 Z'; // top-left
  const pathG = 'M 14 62 L 22 55 L 48 55 L 56 62 L 48 69 L 22 69 Z'; // middle

  const sizeClasses = {
    sm: 'w-7 h-12 md:w-9 md:h-16',
    md: 'w-10 h-16 md:w-14 md:h-24',
    lg: 'w-12 h-20 sm:w-16 sm:h-28 md:w-24 md:h-40 lg:w-32 lg:h-52 xl:w-36 xl:h-60',
    xl: 'w-16 h-28 sm:w-24 sm:h-40 md:w-32 md:h-56 lg:w-40 lg:h-68 xl:w-48 xl:h-80',
  }[size];

  const paths = [pathA, pathB, pathC, pathD, pathE, pathF, pathG];

  return (
    <div className={`relative inline-block ${sizeClasses} select-none transition-all`}>
      <svg
        viewBox="0 -2 70 126"
        className="w-full h-full"
        style={{ color: litColor }}
      >
        {paths.map((d, index) => {
          const isLit = segments[index] === 1;
          return (
            <path
              key={index}
              d={d}
              fill={isLit ? litColor : unlitColor}
              className={isLit ? 'segment-lit' : 'segment-unlit'}
              style={{
                filter: isLit ? glow : 'none',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};