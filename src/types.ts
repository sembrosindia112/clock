export type ClockStyle = 'seven-segment' | 'neon' | 'flip' | 'matrix' | 'minimal';

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
  value: string; // IANA timezone e.g. "UTC", "America/New_York"
  city: string;
  offset: string;
}

export interface LapTime {
  lapNumber: number;
  time: number;
  overallTime: number;
}