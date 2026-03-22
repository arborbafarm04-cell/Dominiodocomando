import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Zap } from 'lucide-react';

interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  cost: number;
  duration: number;
  description: string;
  icon: string;
  status: 'locked' | 'available' | 'completed' | 'upgrading';
  remainingTime?: number;
  progress?: number;
}

interface SkillTreeVisualizationProps {
  title: string;
  nodes: SkillNode[];
  primaryColor: string;
  accentColor: string;
  onNodeClick: (nodeId: string) => void;
  onUpgrade: (nodeId: string) => void;
}

const SkillTreeVisualization: React.FC<SkillTreeVisualizationProps> = ({
  title,
  nodes,
  primaryColor,
  accentColor,
  onNodeClick,
  onUpgrade,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Draw connections between nodes
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    // Draw connections
    nodes.forEach((node, index) => {
      if (index < nodes.length - 1) {
        const fromNode = nodes[index];
        const toNode = nodes[index + 1];

        const fromY = 100 + index * 120;
        const toY = 100 + (index + 1) * 120;
        const x = canvas.width / (2 * scale);

        // Draw curved line
        ctx.beginPath();
        ctx.strokeStyle =
          fromNode.status === 'completed'
            ? '#10b981'
            : fromNode.status === 'available'
              ? accentColor
              : '#6b7280';
        ctx.lineWidth = 2;
        ctx.moveTo(x, fromY);

        // Bezier curve
        const controlY = (fromY + toY) / 2;
        ctx.bezierCurveTo(x + 30, fromY, x + 30, toY, x, toY);
        ctx.stroke();

        // Glow effect for active connections
        if (fromNode.status === 'available' || fromNode.status === 'upgrading') {
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = accentColor;
          ctx.globalAlpha = 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      }
    });

    ctx.restore();
  }, [nodes, scale, pan, accentColor]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#10b981', border: '#059669', glow: '#10b981' };
      case 'available':
        return { bg: accentColor, border: primaryColor, glow: accentColor };
      case 'upgrading':
        return { bg: '#3b82f6', border: '#1e40af', glow: '#60a5fa' };
      default:
        return { bg: '#4b5563', border: '#2d3748', glow: '#6b7280' };
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-black via-gray-950 to-black rounded-lg overflow-hidden border border-gray-800">
      {/* Background particles effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Canvas for connections */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Nodes container */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {nodes.map((node, index) => {
          const colors = getNodeColor(node.status);
          const isSelected = selectedNode === node.id;

          return (
            <motion.div
              key={node.id}
              className="absolute pointer-events-auto"
              style={{
                left: `calc(50% - 40px)`,
                top: `${100 + index * 120}px`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => {
                  setSelectedNode(isSelected ? null : node.id);
                  onNodeClick(node.id);
                }}
                className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group"
                style={{
                  background: `radial-gradient(circle, ${colors.bg}, ${colors.border})`,
                  border: `2px solid ${colors.border}`,
                  boxShadow: `0 0 20px ${colors.glow}80, inset 0 0 10px ${colors.glow}40`,
                }}
                whileHover={node.status !== 'locked' ? { scale: 1.1 } : {}}
                whileTap={node.status !== 'locked' ? { scale: 0.95 } : {}}
              >
                {/* Node content */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl">{node.icon}</span>
                  {node.status === 'locked' && (
                    <Lock className="w-3 h-3 absolute top-1 right-1 text-red-400" />
                  )}
                  {node.status === 'completed' && (
                    <CheckCircle className="w-3 h-3 absolute top-1 right-1 text-green-400" />
                  )}
                  {node.status === 'upgrading' && (
                    <motion.div
                      className="absolute top-1 right-1 w-3 h-3 rounded-full"
                      style={{ background: '#3b82f6' }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Glow animation for available nodes */}
                {node.status === 'available' && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: colors.glow }}
                    animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Progress ring for upgrading nodes */}
                {node.status === 'upgrading' && node.progress !== undefined && (
                  <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={`${(node.progress / 100) * 282.7} 282.7`}
                    />
                  </svg>
                )}
              </motion.button>

              {/* Node label */}
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap pointer-events-none">
                <p className="text-xs font-bold text-white">{node.name}</p>
                <p className="text-xs text-gray-400">
                  {node.level}/{node.maxLevel}
                </p>
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-16 left-1/2 transform -translate-x-1/2 z-50 w-48 bg-gray-900 border-2 rounded-lg p-3 shadow-lg pointer-events-auto"
                    style={{ borderColor: colors.border }}
                  >
                    <p className="text-xs font-bold text-white mb-1">{node.name}</p>
                    <p className="text-xs text-gray-300 mb-2">{node.description}</p>

                    {node.status !== 'completed' && (
                      <div className="text-xs text-yellow-400 font-semibold mb-2">
                        Custo: ${node.cost.toLocaleString()}
                      </div>
                    )}

                    {node.status === 'upgrading' && node.remainingTime !== undefined && (
                      <div className="text-xs text-blue-400 font-semibold mb-2">
                        Tempo: {Math.ceil(node.remainingTime / 1000)}s
                      </div>
                    )}

                    {node.status === 'completed' && (
                      <div className="text-xs text-green-400 font-semibold">✓ Completo</div>
                    )}

                    {node.status === 'locked' && (
                      <div className="text-xs text-red-400 font-semibold">🔒 Bloqueado</div>
                    )}

                    {node.status === 'available' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpgrade(node.id);
                        }}
                        className="w-full mt-2 px-2 py-1 bg-gradient-to-r rounded text-xs font-bold text-white transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                        }}
                      >
                        Fazer Upgrade
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Title overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent pointer-events-none">
        <h3 className="text-lg font-bold text-center" style={{ color: accentColor }}>
          {title}
        </h3>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent pointer-events-none">
        <p className="text-xs text-gray-500 text-center">Scroll para zoom • Arraste para mover</p>
      </div>
    </div>
  );
};

export default SkillTreeVisualization;
