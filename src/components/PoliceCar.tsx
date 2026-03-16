import { motion } from 'framer-motion';

interface PoliceCarProps {
  x: number;
  y: number;
  scale?: number;
}

export default function PoliceCar({ x, y, scale = 1 }: PoliceCarProps) {
  // Giroflex animation - rotating light
  const giroflexVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  // Police officer waving animation
  const officerArmVariants = {
    animate: {
      rotate: [0, 30, 0, -30, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Officer head slight movement
  const officerHeadVariants = {
    animate: {
      y: [0, -2, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        width={120 * scale}
        height={100 * scale}
        viewBox="0 0 120 100"
        className="drop-shadow-lg"
      >
        {/* Car Body */}
        <rect x="10" y="50" width="100" height="35" rx="5" fill="#0066FF" />

        {/* Car Roof */}
        <rect x="25" y="35" width="70" height="20" rx="3" fill="#0052CC" />

        {/* Front Bumper */}
        <rect x="8" y="48" width="5" height="40" fill="#333" />

        {/* Back Bumper */}
        <rect x="107" y="48" width="5" height="40" fill="#333" />

        {/* Windows */}
        <rect x="30" y="38" width="20" height="15" rx="2" fill="#87CEEB" opacity="0.7" />
        <rect x="55" y="38" width="20" height="15" rx="2" fill="#87CEEB" opacity="0.7" />

        {/* Front Lights */}
        <circle cx="15" cy="55" r="3" fill="#FFFF00" />
        <circle cx="15" cy="70" r="3" fill="#FF0000" />

        {/* Back Lights */}
        <circle cx="105" cy="55" r="3" fill="#FFFF00" />
        <circle cx="105" cy="70" r="3" fill="#FF0000" />

        {/* Wheels */}
        <circle cx="30" cy="88" r="8" fill="#222" />
        <circle cx="30" cy="88" r="5" fill="#444" />
        <circle cx="90" cy="88" r="8" fill="#222" />
        <circle cx="90" cy="88" r="5" fill="#444" />

        {/* Giroflex (Rotating Light) - Red */}
        <motion.g variants={giroflexVariants} animate="animate" origin="60 40">
          <circle cx="60" cy="40" r="6" fill="#FF0000" opacity="0.8" />
          <circle cx="60" cy="40" r="4" fill="#FF3333" />
        </motion.g>

        {/* Giroflex (Rotating Light) - Blue */}
        <motion.g variants={giroflexVariants} animate="animate" origin="60 40">
          <circle cx="60" cy="40" r="6" fill="#0066FF" opacity="0.8" />
          <circle cx="60" cy="40" r="4" fill="#3399FF" />
        </motion.g>

        {/* Police Officer - Standing on top of car */}
        <g>
          {/* Officer Body */}
          <rect x="50" y="15" width="20" height="25" rx="3" fill="#003366" />

          {/* Officer Head */}
          <motion.circle
            cx="60"
            cy="10"
            r="6"
            fill="#D4A574"
            variants={officerHeadVariants}
            animate="animate"
          />

          {/* Officer Cap */}
          <motion.path
            d="M 54 8 L 66 8 L 65 5 L 55 5 Z"
            fill="#000"
            variants={officerHeadVariants}
            animate="animate"
          />

          {/* Officer Left Arm (Waving) */}
          <motion.g
            transformOrigin="55 20"
            variants={officerArmVariants}
            animate="animate"
          >
            <rect x="48" y="18" width="7" height="18" rx="3" fill="#D4A574" />
            <circle cx="50" cy="37" r="3" fill="#D4A574" />
          </motion.g>

          {/* Officer Right Arm */}
          <rect x="65" y="18" width="7" height="18" rx="3" fill="#D4A574" />
          <circle cx="70" cy="37" r="3" fill="#D4A574" />

          {/* Officer Legs */}
          <rect x="53" y="42" width="4" height="12" fill="#000" />
          <rect x="63" y="42" width="4" height="12" fill="#000" />

          {/* Officer Shoes */}
          <rect x="52" y="54" width="6" height="3" fill="#333" />
          <rect x="62" y="54" width="6" height="3" fill="#333" />
        </g>

        {/* Police Text on side */}
        <text
          x="20"
          y="75"
          fontSize="8"
          fill="#FFF"
          fontWeight="bold"
          letterSpacing="1"
        >
          POLÍCIA
        </text>

        {/* Stripe on car */}
        <line x1="10" y1="65" x2="110" y2="65" stroke="#FFF" strokeWidth="2" />
      </svg>
    </div>
  );
}
