import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

interface LiveNPCProps {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
  width?: number;
  height?: number;
}

export default function LiveNPC({
  src,
  alt,
  onClick,
  className = '',
  width = 400,
  height = 800,
}: LiveNPCProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [blink, setBlink] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout>();
  const nextBlinkRef = useRef<NodeJS.Timeout>();

  // 👁️ PISCAR DE OLHOS - intervalo aleatório 3-6s
  useEffect(() => {
    const scheduleNextBlink = () => {
      const randomDelay = Math.random() * 3000 + 3000; // 3-6s
      nextBlinkRef.current = setTimeout(() => {
        setBlink(true);
        blinkTimeoutRef.current = setTimeout(() => {
          setBlink(false);
          scheduleNextBlink();
        }, 150); // duração do blink: 150ms
      }, randomDelay);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
      if (nextBlinkRef.current) clearTimeout(nextBlinkRef.current);
    };
  }, []);

  // 👀 RASTREAMENTO DE MOUSE - olhar seguindo o cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Calcular ângulo e distância
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = Math.max(rect.width, rect.height);

      // Limitar deslocamento a 2-5px baseado na distância
      const maxOffset = 5;
      const offset = Math.min((distance / maxDistance) * maxOffset, maxOffset);

      // Normalizar direção
      const dirX = deltaX / distance || 0;
      const dirY = deltaY / distance || 0;

      // Aplicar lerp suave (interpolação linear)
      setMousePosition({
        x: dirX * offset * 0.7, // 70% do offset máximo para suavidade
        y: dirY * offset * 0.7,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Resetar posição do mouse ao sair da tela (mobile)
  useEffect(() => {
    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    window.addEventListener('mouseleave', handleMouseLeave);
    return () => window.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  // 🎭 ANIMAÇÕES
  const breathingVariants = {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 3.5,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  const bodyMovementVariants = {
    animate: {
      y: [0, -2, 0],
      transition: {
        duration: 5,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: 1.05,
      filter: 'brightness(1.1)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    normal: {
      scale: 1,
      filter: 'brightness(1)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const pressVariants = {
    press: {
      scale: 0.97,
      transition: {
        duration: 0.1,
      },
    },
    release: {
      scale: isHovered ? 1.05 : 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  const blinkVariants = {
    normal: {
      opacity: 1,
      transition: { duration: 0.05 },
    },
    blink: {
      opacity: 0.3,
      transition: { duration: 0.05 },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <motion.div
        variants={breathingVariants}
        animate="animate"
        className="relative"
      >
        <motion.div
          variants={bodyMovementVariants}
          animate="animate"
          className="relative"
        >
          <motion.div
            variants={hoverVariants}
            animate={isHovered ? 'hover' : 'normal'}
            className="relative"
          >
            <motion.div
              variants={pressVariants}
              animate={isPressed ? 'press' : 'release'}
              className="relative"
              style={{
                x: mousePosition.x,
                y: mousePosition.y,
              }}
            >
              {/* GLOW SUAVE */}
              <div className="absolute inset-0 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.3), transparent)',
                  filter: 'blur(40px)',
                }}
              />

              {/* SOMBRA SUAVE ABAIXO */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl opacity-30"
                style={{
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.4), transparent)',
                }}
              />

              {/* NPC IMAGE COM BLINK OVERLAY */}
              <motion.div
                variants={blinkVariants}
                animate={blink ? 'blink' : 'normal'}
                className="relative"
              >
                <Image
                  src={src}
                  alt={alt}
                  onClick={onClick}
                  className={`relative z-10 cursor-pointer transition-shadow duration-300 ${
                    isHovered ? 'drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'drop-shadow-lg'
                  } ${className}`}
                  width={width}
                  height={height}
                />

                {/* BLINK OVERLAY - simula fechamento de olhos */}
                {blink && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.05 }}
                    className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent rounded-lg pointer-events-none"
                    style={{
                      top: '20%',
                      height: '15%',
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* EFEITO DE PRESENÇA - GLOW SUTIL AO REDOR */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: isHovered
            ? '0 0 40px rgba(255, 215, 0, 0.2), 0 0 80px rgba(255, 215, 0, 0.1)'
            : '0 0 20px rgba(255, 215, 0, 0.05)',
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
