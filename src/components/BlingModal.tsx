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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-start pl-8 z-50"
    >
      {/* MAIN MODAL CONTAINER */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, x: -100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.8, opacity: 0, x: -100 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-[40%] max-w-2xl"
      >
        {/* OUTER GLOW - VOLUMETRIC EFFECT */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-yellow-500/20 to-purple-600/30 rounded-3xl blur-2xl animate-pulse"></div>

        {/* MAIN MODAL BOX */}
        <div className="relative bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 rounded-3xl overflow-hidden shadow-2xl">
          {/* RADIAL GRADIENT BACKGROUND WITH PARTICLES */}
          <div className="absolute inset-0 bg-radial-gradient opacity-40 pointer-events-none">
            <style>{`
              @keyframes float-particle {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
                50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
              }
              @keyframes sparkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
              }
              @keyframes sway {
                0%, 100% { transform: translateX(0px); }
                50% { transform: translateX(8px); }
              }
              .particle {
                animation: float-particle 6s ease-in-out infinite;
              }
              .sparkle {
                animation: sparkle 3s ease-in-out infinite;
              }
              .sway {
                animation: sway 4s ease-in-out infinite;
              }
            `}</style>
          </div>

          {/* DECORATIVE PARTICLES */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Golden glitter particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="particle absolute w-1 h-1 bg-yellow-400 rounded-full opacity-40"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
            {/* Diamond dust sparkles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="sparkle absolute w-0.5 h-0.5 bg-purple-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
          </div>

          {/* GOLDEN BAROQUE BORDER */}
          <div className="absolute inset-0 rounded-3xl border-8 border-yellow-500 pointer-events-none shadow-inner" style={{
            boxShadow: `
              inset 0 0 20px rgba(234, 179, 8, 0.4),
              inset 0 0 40px rgba(168, 85, 247, 0.2),
              0 0 30px rgba(234, 179, 8, 0.3),
              0 0 60px rgba(168, 85, 247, 0.2)
            `,
          }} />

          {/* LION HEAD CORNERS - LEFT */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none">
            <div className="relative w-full h-full">
              {/* Lion head simplified with CSS */}
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  boxShadow: `
                    0 0 20px rgba(234, 179, 8, 0.6),
                    inset -5px -5px 15px rgba(0, 0, 0, 0.4)
                  `,
                }}>
                {/* Eyes */}
                <div className="absolute w-3 h-3 bg-purple-500 rounded-full top-4 left-3 shadow-lg" style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
                }} />
                <div className="absolute w-3 h-3 bg-purple-500 rounded-full top-4 right-3 shadow-lg" style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
                }} />
                {/* Mane rays */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`mane-${i}`}
                    className="absolute w-2 h-6 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-full"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-16px)`,
                      boxShadow: '0 0 8px rgba(234, 179, 8, 0.6)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* LION HEAD CORNERS - RIGHT */}
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  boxShadow: `
                    0 0 20px rgba(234, 179, 8, 0.6),
                    inset -5px -5px 15px rgba(0, 0, 0, 0.4)
                  `,
                }}>
                {/* Eyes */}
                <div className="absolute w-3 h-3 bg-purple-500 rounded-full top-4 left-3 shadow-lg" style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
                }} />
                <div className="absolute w-3 h-3 bg-purple-500 rounded-full top-4 right-3 shadow-lg" style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
                }} />
                {/* Mane rays */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`mane-r-${i}`}
                    className="absolute w-2 h-6 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-full"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-16px)`,
                      boxShadow: '0 0 8px rgba(234, 179, 8, 0.6)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* HEADER WITH CROWN */}
          <div className="relative pt-12 pb-8 px-8 text-center border-b border-yellow-500/30">
            {/* CROWN DECORATION */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-12 pointer-events-none">
              {/* Crown base */}
              <div className="relative w-full h-full">
                {/* Crown points */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`crown-${i}`}
                    className="absolute w-3 h-8 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-full"
                    style={{
                      left: `${i * 25}%`,
                      boxShadow: `0 0 12px rgba(234, 179, 8, 0.8)`,
                    }}
                  />
                ))}
                {/* Center amethyst diamond */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-6 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                    boxShadow: `
                      0 0 20px rgba(168, 85, 247, 0.8),
                      0 0 40px rgba(168, 85, 247, 0.5),
                      inset -2px -2px 8px rgba(0, 0, 0, 0.4)
                    `,
                  }} />
              </div>
            </div>

            {/* HANGING CHAINS */}
            <div className="absolute top-8 left-8 w-12 h-16 pointer-events-none sway">
              <div className="w-full h-full flex flex-col items-center">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`chain-l-${i}`}
                    className="w-1 h-4 bg-gradient-to-b from-yellow-400 to-yellow-600"
                    style={{
                      boxShadow: '0 0 6px rgba(234, 179, 8, 0.6)',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute top-8 right-8 w-12 h-16 pointer-events-none sway" style={{ animationDelay: '0.5s' }}>
              <div className="w-full h-full flex flex-col items-center">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`chain-r-${i}`}
                    className="w-1 h-4 bg-gradient-to-b from-yellow-400 to-yellow-600"
                    style={{
                      boxShadow: '0 0 6px rgba(234, 179, 8, 0.6)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* TITLE */}
            {title && (
              <h2 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300">
                {title}
              </h2>
            )}

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg"
              style={{
                boxShadow: `0 0 15px rgba(234, 179, 8, 0.6)`,
              }}
            >
              <X size={18} className="font-bold" />
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="relative px-8 py-6 min-h-32">
            {children}
          </div>

          {/* BUTTONS SECTION */}
          <div className="relative px-8 py-8 flex flex-col items-center gap-4 border-t border-yellow-500/30">
            {/* OK BUTTON */}
            {onOk && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOk}
                className="w-48 py-4 px-6 rounded-full font-heading font-bold text-lg relative group overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(234, 179, 8, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)`,
                  boxShadow: `
                    0 0 20px rgba(234, 179, 8, 0.6),
                    0 0 40px rgba(168, 85, 247, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3),
                    inset 0 -2px 5px rgba(0, 0, 0, 0.3)
                  `,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                <span className="relative z-10 text-black font-bold">
                  OK
                </span>
                {/* Sparkles */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`ok-sparkle-${i}`}
                    className="absolute w-1 h-1 bg-purple-300 rounded-full"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: '50%',
                      animation: `sparkle 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </motion.button>
            )}

            {/* CANCEL BUTTON */}
            {onCancel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="w-48 py-4 px-6 rounded-full font-heading font-bold text-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)`,
                  boxShadow: `
                    0 0 20px rgba(236, 72, 153, 0.6),
                    0 0 40px rgba(168, 85, 247, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  border: '2px solid rgba(234, 179, 8, 0.8)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                <span className="relative z-10 text-pink-300 font-bold">
                  CANCEL
                </span>
              </motion.button>
            )}

            {/* HELP BUTTON */}
            {onHelp && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHelp}
                className="w-48 py-4 px-6 rounded-full font-heading font-bold text-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(234, 179, 8, 0.7) 0%, rgba(217, 119, 6, 0.7) 50%, rgba(180, 83, 9, 0.7) 100%)`,
                  boxShadow: `
                    0 0 15px rgba(234, 179, 8, 0.5),
                    0 0 30px rgba(217, 119, 6, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2),
                    inset 0 -2px 5px rgba(0, 0, 0, 0.2)
                  `,
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                <span className="relative z-10 text-yellow-300 font-bold">
                  HELP
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
