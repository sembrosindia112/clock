export type ClockStyle = 'seven-segment' | 'flip' | 'matrix' | 'neon' | 'minimal';
export type AppMode = 'clock' | 'stopwatch' | 'timer';

export interface Theme {
  id: string;
  name: string;
  colorHex: string;
  glowClass: string;
  borderClass: string;
  bgGradient: string;
  litColor: string;
  unlitColor: string;
  accentBadge: string;
}

export interface TimezoneOption {
  label: string;
  value: string;
  city: string;
  offset: string;
}

export interface LapTime {
  lapNumber: number;
  time: number;
  overallTime: number;
}