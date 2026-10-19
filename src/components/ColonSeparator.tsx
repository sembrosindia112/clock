import React from 'react';

interface ColonSeparatorProps {
  litColor: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  blink?: boolean;
}

export const ColonSeparator: React.FC<ColonSeparatorProps> = ({
  litColor,
  size = 'lg',
  blink = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-12 md:w-6 md:h-16',
    md: 'w-6 h-16 md:w-8 md:h-24',
    lg: 'w-6 h-20 sm:w-10 sm:h-28 md:w-14 md:h-40 lg:w-16 lg:h-52 xl:w-20 xl:h-60',
    xl: 'w-8 h-28 sm:w-12 sm:h-40 md:w-18 md:h-56 lg:w-20 lg:h-68 xl:w-24 xl:h-80',
  }[size];

  const dotSize = {
    sm: 'w-1.5 h-1.5 md:w-2 md:h-2',
    md: 'w-2 h-2 md:w-3 md:h-3',
    lg: 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6',
    xl: 'w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-around py-4 sm:py-6 md:py-8 ${sizeClasses} ${
        blink ? 'animate-colon' : ''
      }`}
    >
      <div
        className={`${dotSize} rounded-sm shadow-sm transition-all`}
        style={{
          backgroundColor: litColor,
          boxShadow: `0 0 16px ${litColor}, 0 0 4px ${litColor}`,
        }}
      />
      <div
        className={`${dotSize} rounded-sm shadow-sm transition-all`}
        style={{
          backgroundColor: litColor,
          boxShadow: `0 0 16px ${litColor}, 0 0 4px ${litColor}`,
        }}
      />
    </div>
  );
};