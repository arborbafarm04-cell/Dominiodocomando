import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface BlingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  onHelp?: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function BlingModal({
  isOpen,
  onClose,
  onOk,
  onCancel,
  onHelp,
  title,
  children,
}: BlingModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
    >
      {/* MAIN MODAL CONTAINER - 9:16 ASPECT RATIO */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, x: -200 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.7, opacity: 0, x: -200 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto"
        style={{ aspectRatio: '9 / 16' }}
      >
        {/* VOLUMETRIC GOD RAYS & LENS FLARES */}
        <div className="absolute -inset-12 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700/50 via-yellow-500/40 to-purple-700/50 rounded-[50px] blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/30 to-transparent rounded-[50px] blur-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-[50px] blur-2xl"></div>
        </div>

        {/* LENS FLARE EFFECTS */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-yellow-300/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/25 rounded-full blur-3xl pointer-events-none"></div>

        {/* MAIN MODAL BOX - BLACK-PURPLE GRADIENT */}
        <div className="relative bg-gradient-to-b from-slate-950 via-purple-950 to-black rounded-[50px] overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(234, 179, 8, 0.1) 0%, transparent 50%)
            `,
          }}
        >
          {/* RADIAL GRADIENT BACKGROUND WITH PARTICLES */}
          <div className="absolute inset-0 bg-radial-gradient opacity-50 pointer-events-none">
            <style>{`
              @keyframes float-particle {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
                50% { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
              }
              @keyframes sparkle {
                0%, 100% { opacity: 0.2; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.3); }
              }
              @keyframes sway {
                0%, 100% { transform: translateX(0px) rotateZ(0deg); }
                50% { transform: translateX(12px) rotateZ(3deg); }
              }
              @keyframes glow-pulse {
                0%, 100% { filter: drop-shadow(0 0 10px rgba(234, 179, 8, 0.5)); }
                50% { filter: drop-shadow(0 0 25px rgba(234, 179, 8, 1)); }
              }
              .particle {
                animation: float-particle 8s ease-in-out infinite;
              }
              .sparkle {
                animation: sparkle 4s ease-in-out infinite;
              }
              .sway {
                animation: sway 5s ease-in-out infinite;
              }
              .glow {
                animation: glow-pulse 5s ease-in-out infinite;
              }
            `}</style>
          </div>

          {/* DECORATIVE PARTICLES - ENHANCED */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Golden glitter particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="particle absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.4}s`,
                  boxShadow: '0 0 12px rgba(234, 179, 8, 0.9)',
                }}
              />
            ))}
            {/* Diamond dust sparkles */}
            {[...Array(15)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="sparkle absolute w-1 h-1 bg-purple-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  boxShadow: '0 0 10px rgba(168, 85, 247, 1)',
                }}
              />
            ))}
          </div>

          {/* MASSIVE GOLD DIAMOND-ENCRUSTED FRAME */}
          <div className="absolute inset-0 rounded-[50px] pointer-events-none" style={{
            border: '16px solid',
            borderImage: 'linear-gradient(135deg, #FFD700 0%, #FFA500 20%, #FFD700 40%, #FFA500 60%, #FFD700 80%, #FFA500 100%) 1',
            boxShadow: `
              inset 0 0 40px rgba(234, 179, 8, 0.8),
              inset 0 0 80px rgba(168, 85, 247, 0.4),
              0 0 50px rgba(234, 179, 8, 0.6),
              0 0 100px rgba(168, 85, 247, 0.3),
              0 0 150px rgba(234, 179, 8, 0.2)
            `,
          }} />

          {/* CORNER DIAMOND EMBELLISHMENTS - MASSIVE */}
          {[
            { top: '-16px', left: '-16px' },
            { top: '-16px', right: '-16px' },
            { bottom: '-16px', left: '-16px' },
            { bottom: '-16px', right: '-16px' },
          ].map((pos, i) => (
            <div
              key={`corner-diamond-${i}`}
              className="absolute w-12 h-12 pointer-events-none glow"
              style={{
                ...pos,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 30%, #e0e0e0 60%, #f0f0f0 100%)',
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                boxShadow: `
                  0 0 30px rgba(255, 255, 255, 0.9),
                  0 0 60px rgba(234, 179, 8, 0.8),
                  inset -3px -3px 12px rgba(0, 0, 0, 0.4)
                `,
              }}
            />
          ))}

          {/* LION HEAD CORNERS - LEFT - MASSIVE */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none glow">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  boxShadow: `
                    0 0 30px rgba(234, 179, 8, 0.9),
                    inset -8px -8px 20px rgba(0, 0, 0, 0.5)
                  `,
                }}>
                {/* Eyes with purple glow */}
                <div className="absolute w-4 h-4 bg-purple-500 rounded-full top-5 left-4 shadow-lg" style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 1)',
                }} />
                <div className="absolute w-4 h-4 bg-purple-500 rounded-full top-5 right-4 shadow-lg" style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 1)',
                }} />
                {/* Mane rays */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`mane-${i}`}
                    className="absolute w-3 h-8 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-full"
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-20px)`,
                      boxShadow: '0 0 12px rgba(234, 179, 8, 0.8)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* LION HEAD CORNERS - RIGHT - MASSIVE */}
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none glow">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  boxShadow: `
                    0 0 30px rgba(234, 179, 8, 0.9),
                    inset -8px -8px 20px rgba(0, 0, 0, 0.5)
                  `,
                }}>
                {/* Eyes with purple glow */}
                <div className="absolute w-4 h-4 bg-purple-500 rounded-full top-5 left-4 shadow-lg" style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 1)',
                }} />
                <div className="absolute w-4 h-4 bg-purple-500 rounded-full top-5 right-4 shadow-lg" style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 1)',
                }} />
                {/* Mane rays */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`mane-r-${i}`}
                    className="absolute w-3 h-8 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-full"
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-20px)`,
                      boxShadow: '0 0 12px rgba(234, 179, 8, 0.8)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* HEADER WITH GIANT CROWN */}
          <div className="relative pt-20 pb-10 px-10 text-center border-b-2 border-yellow-500/40">
            {/* GIANT CROWN DECORATION WITH HUGE DIAMOND */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 pointer-events-none">
              {/* Crown base */}
              <div className="relative w-full h-full">
                {/* Crown points - larger */}
                {[...Array(7)].map((_, i) => (
                  <div
                    key={`crown-${i}`}
                    className="absolute w-4 h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-full"
                    style={{
                      left: `${i * 14}%`,
                      boxShadow: `0 0 20px rgba(234, 179, 8, 1)`,
                    }}
                  />
                ))}
                {/* CENTER HUGE DIAMOND */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-14 h-20 bg-gradient-to-b from-purple-300 to-purple-700 rounded-full pointer-events-none glow"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%)',
                    boxShadow: `
                      0 0 40px rgba(168, 85, 247, 1),
                      0 0 80px rgba(168, 85, 247, 0.8),
                      inset -4px -4px 15px rgba(0, 0, 0, 0.5),
                      inset 4px 4px 15px rgba(255, 255, 255, 0.4)
                    `,
                  }} />
              </div>
            </div>

            {/* HANGING CRYSTAL CHAINS */}
            <div className="absolute top-12 left-12 w-16 h-20 pointer-events-none sway">
              <div className="w-full h-full flex flex-col items-center">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`chain-l-${i}`}
                    className="w-1.5 h-5 bg-gradient-to-b from-yellow-300 to-yellow-600"
                    style={{
                      boxShadow: '0 0 10px rgba(234, 179, 8, 0.8)',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute top-12 right-12 w-16 h-20 pointer-events-none sway" style={{ animationDelay: '0.5s' }}>
              <div className="w-full h-full flex flex-col items-center">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`chain-r-${i}`}
                    className="w-1.5 h-5 bg-gradient-to-b from-yellow-300 to-yellow-600"
                    style={{
                      boxShadow: '0 0 10px rgba(234, 179, 8, 0.8)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* TITLE */}
            {title && (
              <h2 className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-lg">
                {title}
              </h2>
            )}

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-black hover:from-yellow-200 hover:to-yellow-500 transition-all duration-300 shadow-lg"
              style={{
                boxShadow: `0 0 20px rgba(234, 179, 8, 0.8)`,
              }}
            >
              <X size={20} className="font-bold" />
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="relative px-10 py-8 min-h-40">
            {children}
          </div>

          {/* BUTTONS SECTION - LUXURY BLING STYLE */}
          <div className="relative px-10 py-10 flex flex-col items-center gap-6 border-t-2 border-yellow-500/40">
            {/* OK BUTTON - EXTREME BLING */}
            {onOk && (
              <motion.button
                whileHover={{ scale: 1.08, y: -6 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOk}
                className="w-56 py-6 px-8 rounded-full font-heading font-black text-xl relative group overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(234, 179, 8, 1) 0%, rgba(217, 119, 6, 1) 50%, rgba(180, 83, 9, 1) 100%)`,
                  boxShadow: `
                    0 0 30px rgba(234, 179, 8, 0.9),
                    0 0 60px rgba(168, 85, 247, 0.5),
                    inset 0 2px 10px rgba(255, 255, 255, 0.4),
                    inset 0 -3px 8px rgba(0, 0, 0, 0.4)
                  `,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  textShadow: '0 3px 6px rgba(0, 0, 0, 0.6)',
                }}
              >
                <span className="relative z-10 text-black font-black">
                  ✨ OK ✨
                </span>
                {/* Sparkles */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`ok-sparkle-${i}`}
                    className="absolute w-2 h-2 bg-purple-300 rounded-full"
                    style={{
                      left: `${15 + i * 20}%`,
                      top: '50%',
                      animation: `sparkle 3s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                      boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)',
                    }}
                  />
                ))}
              </motion.button>
            )}
            {/* CANCEL BUTTON */}
            {/* HELP BUTTON */}

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
