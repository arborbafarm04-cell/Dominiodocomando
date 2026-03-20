import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface LuxuryNPCDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  onDenounce?: () => void;
  onViewCollection?: () => void;
  title?: string;
  message?: string;
}

export default function LuxuryNPCDialog({
  isOpen,
  onClose,
  onAccept,
  onDenounce,
  onViewCollection,
  title = 'Bem-vindo ao Showroom',
  message = 'Aqui não é sobre comprar. É sobre se posicionar. Cada coleção revela o seu nível.',
}: LuxuryNPCDialogProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-start pl-12"
    >
      {/* MAIN MODAL CONTAINER - 9:16 ASPECT RATIO */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, x: -250 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.6, opacity: 0, x: -250 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative w-full max-w-sm max-h-[95vh] overflow-y-auto"
        style={{ aspectRatio: '9 / 16' }}
      >
        {/* VOLUMETRIC GOD RAYS EFFECT - ENHANCED */}
        <div className="absolute -inset-16 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700/60 via-yellow-500/50 to-purple-700/60 rounded-[50px] blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/40 to-transparent rounded-[50px] blur-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-600/30 to-transparent rounded-[50px] blur-2xl"></div>
        </div>

        {/* LENS FLARE EFFECTS - MASSIVE */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* MAIN MODAL BOX - BLACK-PURPLE GRADIENT */}
        <div 
          className="relative bg-gradient-to-b from-slate-950 via-purple-950 to-black rounded-[50px] overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)
            `,
          }}
        >
          {/* ANIMATED PARTICLE SYSTEM - ENHANCED */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <style>{`
              @keyframes float-particle {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
                50% { transform: translateY(-40px) translateX(20px); opacity: 0.9; }
              }
              @keyframes sparkle-intense {
                0%, 100% { opacity: 0.15; transform: scale(0.7); }
                50% { opacity: 1; transform: scale(1.4); }
              }
              @keyframes sway-gentle {
                0%, 100% { transform: translateX(0px) rotateZ(0deg); }
                50% { transform: translateX(15px) rotateZ(3deg); }
              }
              @keyframes glow-pulse {
                0%, 100% { filter: drop-shadow(0 0 12px rgba(234, 179, 8, 0.5)); }
                50% { filter: drop-shadow(0 0 30px rgba(234, 179, 8, 1)); }
              }
              .particle { animation: float-particle 10s ease-in-out infinite; }
              .sparkle { animation: sparkle-intense 4s ease-in-out infinite; }
              .sway { animation: sway-gentle 6s ease-in-out infinite; }
              .glow { animation: glow-pulse 6s ease-in-out infinite; }
            `}</style>

            {/* GOLDEN GLITTER PARTICLES - MORE */}
            {[...Array(30)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="particle absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  boxShadow: '0 0 12px rgba(234, 179, 8, 0.9)',
                  opacity: 0.7,
                }}
              />
            ))}

            {/* DIAMOND DUST SPARKLES - MORE */}
            {[...Array(25)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="sparkle absolute w-1.5 h-1.5 bg-purple-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.25}s`,
                  boxShadow: '0 0 10px rgba(168, 85, 247, 1)',
                }}
              />
            ))}
          </div>

          {/* THICK ORNATE GOLD BORDER WITH DIAMONDS - MASSIVE */}
          <div 
            className="absolute inset-0 rounded-[50px] pointer-events-none"
            style={{
              border: '18px solid',
              borderImage: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFA500 75%, #FFD700 100%) 1',
              boxShadow: `
                inset 0 0 50px rgba(234, 179, 8, 0.8),
                inset 0 0 100px rgba(168, 85, 247, 0.4),
                0 0 60px rgba(234, 179, 8, 0.6),
                0 0 120px rgba(168, 85, 247, 0.4),
                0 0 180px rgba(234, 179, 8, 0.2)
              `,
            }}
          />

          {/* CORNER DIAMOND EMBELLISHMENTS - MASSIVE */}
          {[
            { top: '-18px', left: '-18px' },
            { top: '-18px', right: '-18px' },
            { bottom: '-18px', left: '-18px' },
            { bottom: '-18px', right: '-18px' },
          ].map((pos, i) => (
            <div
              key={`corner-diamond-${i}`}
              className="absolute w-16 h-16 pointer-events-none glow"
              style={{
                ...pos,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 30%, #e0e0e0 60%, #f0f0f0 100%)',
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                boxShadow: `
                  0 0 40px rgba(255, 255, 255, 1),
                  0 0 80px rgba(234, 179, 8, 0.9),
                  inset -4px -4px 15px rgba(0, 0, 0, 0.5)
                `,
              }}
            />
          ))}

          {/* ARCHED HEADER WITH GIANT CROWN */}
          <div className="relative pt-24 pb-12 px-12 text-center border-b-2 border-yellow-500/40">
            {/* GIANT CROWN CENTERPIECE WITH HUGE DIAMOND */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-24 pointer-events-none">
              <div className="relative w-full h-full">
                {/* Crown arch */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-full"
                  style={{
                    boxShadow: `
                      0 0 40px rgba(234, 179, 8, 1),
                      inset -8px -8px 25px rgba(0, 0, 0, 0.4),
                      inset 8px 8px 25px rgba(255, 255, 255, 0.5)
                    `,
                  }}
                />

                {/* Crown points with diamonds - larger */}
                {[...Array(9)].map((_, i) => (
                  <div
                    key={`crown-point-${i}`}
                    className="absolute w-5 h-14 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-full"
                    style={{
                      left: `${i * 11}%`,
                      boxShadow: `0 0 20px rgba(234, 179, 8, 1)`,
                    }}
                  />
                ))}

                {/* CENTER MASSIVE PURPLE CRYSTAL - HUGE */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -top-10 w-16 h-24 pointer-events-none glow"
                  style={{
                    background: 'linear-gradient(135deg, #e0b0ff 0%, #c084fc 25%, #a855f7 50%, #9333ea 75%, #7e22ce 100%)',
                    clipPath: 'polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%)',
                    boxShadow: `
                      0 0 50px rgba(168, 85, 247, 1),
                      0 0 100px rgba(168, 85, 247, 0.9),
                      inset -5px -5px 20px rgba(0, 0, 0, 0.6),
                      inset 5px 5px 20px rgba(255, 255, 255, 0.4)
                    `,
                  }}
                />

                {/* SURROUNDING CLEAR DIAMONDS - LARGER */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`crown-diamond-${i}`}
                    className="absolute w-7 h-7 pointer-events-none"
                    style={{
                      left: `${10 + i * 10}%`,
                      top: '55%',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
                      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                      boxShadow: `
                        0 0 20px rgba(255, 255, 255, 1),
                        0 0 40px rgba(234, 179, 8, 0.7),
                        inset -2px -2px 8px rgba(0, 0, 0, 0.3)
                      `,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* HANGING CRYSTAL TASSELS - LARGER */}
            {[
              { left: '8%', delay: '0s' },
              { left: '20%', delay: '0.2s' },
              { right: '20%', delay: '0.2s' },
              { right: '8%', delay: '0s' },
            ].map((pos, i) => (
              <div
                key={`tassel-${i}`}
                className="absolute top-16 w-20 h-32 pointer-events-none sway"
                style={{
                  ...pos,
                  animationDelay: pos.delay,
                }}
              >
                {/* Chain */}
                <div className="w-2 h-full bg-gradient-to-b from-yellow-400 to-yellow-600 mx-auto"
                  style={{
                    boxShadow: '0 0 12px rgba(234, 179, 8, 0.9)',
                  }}
                />
                {/* Hanging crystals */}
                {[...Array(4)].map((_, j) => (
                  <div
                    key={`crystal-${j}`}
                    className="absolute w-4 h-6 left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{
                      top: `${15 + j * 22}%`,
                      background: 'linear-gradient(135deg, #e0b0ff 0%, #a855f7 100%)',
                      clipPath: 'polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%)',
                      boxShadow: `0 0 15px rgba(168, 85, 247, 0.9)`,
                    }}
                  />
                ))}
              </div>
            ))}

            {/* TITLE */}
            {title && (
              <h2 className="text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-lg">
                {title}
              </h2>
            )}

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-black hover:from-yellow-200 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-2xl"
              style={{
                boxShadow: `0 0 25px rgba(234, 179, 8, 0.9)`,
              }}
            >
              <X size={24} className="font-bold" />
            </button>
          </div>

          {/* CONTENT AREA WITH MESSAGE */}
          <div className="relative px-12 py-10 min-h-48 flex items-center justify-center">
            <p className="text-center text-xl font-paragraph text-gray-100 leading-relaxed drop-shadow-lg">
              {message}
            </p>
          </div>

          {/* LUXURIOUS PILL-SHAPED BUTTONS SECTION - EXTREME BLING */}
          <div className="relative px-12 py-12 flex flex-col items-center gap-8 border-t-2 border-yellow-500/30">
            {/* TOP BUTTON - NUDE BEIGE WITH DIAMOND */}
            {onViewCollection && (
              <motion.button
                whileHover={{ scale: 1.1, y: -6 }}
                whileTap={{ scale: 0.95 }}
                onClick={onViewCollection}
                className="w-64 py-7 px-10 rounded-full font-heading font-black text-2xl relative group overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #f5e6d3 0%, #e8d4b8 50%, #dcc4a0 100%)',
                  boxShadow: `
                    0 0 40px rgba(234, 179, 8, 0.7),
                    0 0 80px rgba(168, 85, 247, 0.3),
                    inset 0 3px 12px rgba(255, 255, 255, 0.7),
                    inset 0 -4px 12px rgba(0, 0, 0, 0.3)
                  `,
                  border: '4px solid rgba(234, 179, 8, 0.7)',
                  textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
                }}
              >
                <span className="relative z-10 text-amber-900 font-black flex items-center justify-center gap-3">
                  ✨ Ver Coleção ✨
                </span>
                {/* Center diamond sparkle */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-8 pointer-events-none glow"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                    boxShadow: `0 0 20px rgba(255, 255, 255, 1)`,
                  }}
                />
              </motion.button>
            )}
            {/* MIDDLE BUTTON - GOLD CHROME WITH PURPLE CRYSTAL */}
            {/* BOTTOM BUTTON - NUDE TO OFF-WHITE WITH DIAMOND RIM */}

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
