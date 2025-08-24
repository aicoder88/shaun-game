import React from 'react';

interface EnhancedIconProps {
  emoji: string;
  size?: 'small' | 'medium' | 'large';
  effect?: 'float' | 'pulse' | 'sparkle' | 'rotate' | 'bounce';
  color?: string;
  className?: string;
}

export const EnhancedIcon: React.FC<EnhancedIconProps> = ({ 
  emoji, 
  size = 'medium', 
  effect = 'float', 
  color, 
  className = '' 
}) => {
  const sizeMap = {
    small: '1.2rem',
    medium: '2rem', 
    large: '3rem'
  };

  const effectClass = {
    float: 'floating-icon',
    pulse: 'pulse-glow',
    sparkle: 'sparkle-effect',
    rotate: 'rotate-icon',
    bounce: 'bounce-icon'
  };

  return (
    <span 
      className={`enhanced-icon ${effectClass[effect]} ${className}`}
      style={{
        fontSize: sizeMap[size],
        color: color,
        display: 'inline-block',
        filter: 'drop-shadow(0 0 10px currentColor)',
      }}
    >
      {emoji}
    </span>
  );
};