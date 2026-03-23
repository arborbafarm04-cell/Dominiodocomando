import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Cinematic background with animated grid and neon effects
export function CinematicBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Base gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0015] via-[#000814] to-[#0a0a1f] z-0" />

      {/* Animated grid pattern */}
      <div className="fixed inset-0 z-1 opacity-20">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,240,255,0.1)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated grid lines - horizontal */}
      <motion.div
        className="fixed inset-0 z-1 pointer-events-none"
        animate={{
          backgroundPosition: ['0px 0px', '0px 100px'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,240,255,0.03) 0px, rgba(0,240,255,0.03) 1px, transparent 1px, transparent 40px)',
          backgroundSize: '100% 100px',
        }}
      />

      {/* Animated grid lines - vertical */}
      <motion.div
        className="fixed inset-0 z-1 pointer-events-none"
        animate={{
          backgroundPosition: ['0px 0px', '100px 0px'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,240,255,0.03) 0px, rgba(0,240,255,0.03) 1px, transparent 1px, transparent 40px)',
          backgroundSize: '100px 100%',
        }}
      />

      {/* Ambient light glow - top left */}
      <motion.div
        className="fixed top-0 left-0 w-96 h-96 rounded-full z-0 pointer-events-none"
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle, rgba(0,240,255,0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Ambient light glow - bottom right */}
      <motion.div
        className="fixed bottom-0 right-0 w-96 h-96 rounded-full z-0 pointer-events-none"
        animate={{
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle, rgba(157,0,255,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Lens flare effect - subtle */}
      <div className="fixed top-20 right-20 w-32 h-32 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,240,0,0.4) 0%, transparent 50%)',
          filter: 'blur(40px)',
        }} />
      </div>
    </div>
  );
}

// Countdown timer component with neon styling
export function CountdownTimer({ 
  endTime, 
  onComplete 
}: { 
  endTime: number;
  onComplete?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);

      if (remaining === 0) {
        setTimeLeft('00:00:00');
        if (!isCompleted) {
          setIsCompleted(true);
          onComplete?.();
        }
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        setTimeLeft(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete, isCompleted]);

  return (
    <motion.div
      className="font-heading text-2xl font-bold"
      animate={{
        textShadow: [
          '0 0 5px #00f0ff, 0 0 10px #00f0ff, 0 0 20px #00f0ff',
          '0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #00f0ff',
          '0 0 5px #00f0ff, 0 0 10px #00f0ff, 0 0 20px #00f0ff',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        color: '#00f0ff',
      }}
    >
      {timeLeft}
    </motion.div>
  );
}

// Neon sign component for business names
export function NeonSign({ text, color = '#00f0ff' }: { text: string; color?: string }) {
  return (
    <motion.div
      className="font-heading text-xl font-bold"
      animate={{
        textShadow: [
          `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
          `0 0 20px ${color}, 0 0 40px ${color}, 0 0 80px ${color}, 0 0 120px ${color}`,
          `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
        ],
        opacity: [0.9, 1, 0.9],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        color: color,
      }}
    >
      {text}
    </motion.div>
  );
}

// Risk indicator component
export function RiskIndicator({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: { bg: 'bg-green-500/20', border: 'border-green-500/60', text: 'text-green-400', glow: 'shadow-green-500/30' },
    medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/60', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
    high: { bg: 'bg-red-500/20', border: 'border-red-500/60', text: 'text-red-400', glow: 'shadow-red-500/30' },
  };

  const config = colors[risk];
  const label = risk === 'low' ? 'BAIXO' : risk === 'medium' ? 'MÉDIO' : 'ALTO';

  return (
    <motion.div
      className={`inline-block px-3 py-1 rounded border ${config.bg} ${config.border} ${config.glow} shadow-lg`}
      animate={risk === 'high' ? { opacity: [0.7, 1, 0.7] } : {}}
      transition={risk === 'high' ? { duration: 1, repeat: Infinity } : {}}
    >
      <span className={`font-heading text-sm ${config.text}`}>{label}</span>
    </motion.div>
  );
}
