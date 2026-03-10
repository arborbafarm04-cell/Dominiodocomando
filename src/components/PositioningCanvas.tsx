import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Trash2 } from 'lucide-react';

interface PositionedElement {
  id: string;
  x: number;
  y: number;
  isDragging: boolean;
}

interface PositioningCanvasProps {
  children: React.ReactNode;
  isInspectorMode: boolean;
}

export default function PositioningCanvas({ children, isInspectorMode }: PositioningCanvasProps) {
  const [elements, setElements] = useState<Record<string, PositionedElement>>({});
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load positions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('positioning-canvas-elements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setElements(parsed);
      } catch (e) {
        console.error('Failed to load positions:', e);
      }
    }
  }, []);

  // Save positions to localStorage
  useEffect(() => {
    const toSave = Object.entries(elements).reduce((acc, [id, el]) => {
      acc[id] = { id: el.id, x: el.x, y: el.y, isDragging: false };
      return acc;
    }, {} as Record<string, any>);
    localStorage.setItem('positioning-canvas-elements', JSON.stringify(toSave));
  }, [elements]);

  // Register child elements
  useEffect(() => {
    if (!canvasRef.current) return;

    const children = canvasRef.current.querySelectorAll('[data-positionable]');
    const newElements: Record<string, PositionedElement> = { ...elements };

    children.forEach((child) => {
      const id = child.getAttribute('data-positionable');
      if (id && !newElements[id]) {
        newElements[id] = {
          id,
          x: 0,
          y: 0,
          isDragging: false,
        };
      }
    });

    if (Object.keys(newElements).length > Object.keys(elements).length) {
      setElements(newElements);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (!isInspectorMode) return;

    e.preventDefault();
    setSelectedElement(elementId);

    const element = elementRefs.current[elementId];
    if (element && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      setDragOffset({
        x: e.clientX - elementRect.left,
        y: e.clientY - elementRect.top,
      });

      setElements((prev) => ({
        ...prev,
        [elementId]: { ...prev[elementId], isDragging: true },
      }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isInspectorMode || !canvasRef.current) return;

    Object.entries(elements).forEach(([id, element]) => {
      if (element.isDragging) {
        const canvasRect = canvasRef.current!.getBoundingClientRect();
        const newX = e.clientX - canvasRect.left - dragOffset.x;
        const newY = e.clientY - canvasRect.top - dragOffset.y;

        setElements((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            x: Math.max(0, newX),
            y: Math.max(0, newY),
          },
        }));
      }
    });
  };

  const handleMouseUp = () => {
    setElements((prev) =>
      Object.entries(prev).reduce(
        (acc, [id, el]) => {
          acc[id] = { ...el, isDragging: false };
          return acc;
        },
        {} as Record<string, PositionedElement>
      )
    );
  };

  const handleInputChange = (elementId: string, axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value) || 0;
    setElements((prev) => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        [axis]: Math.max(0, numValue),
      },
    }));
  };

  const handleCopyPosition = (elementId: string) => {
    const el = elements[elementId];
    const text = `x: ${Math.round(el.x)}, y: ${Math.round(el.y)}`;
    navigator.clipboard.writeText(text);
  };

  const handleResetPosition = (elementId: string) => {
    setElements((prev) => ({
      ...prev,
      [elementId]: { ...prev[elementId], x: 0, y: 0 },
    }));
  };

  const handleResetAll = () => {
    localStorage.removeItem('positioning-canvas-elements');
    setElements({});
    window.location.reload();
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Render children with positioning wrapper */}
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const elementId = child.props['data-positionable'];
        if (!elementId || !elements[elementId]) {
          return child;
        }

        const element = elements[elementId];

        return (
          <motion.div
            key={elementId}
            ref={(el) => {
              if (el) elementRefs.current[elementId] = el;
            }}
            className={`absolute ${isInspectorMode ? 'cursor-move' : ''} ${
              selectedElement === elementId && isInspectorMode ? 'ring-2 ring-yellow-400' : ''
            }`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
              transition: element.isDragging ? 'none' : 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, elementId)}
            onMouseUp={(e) => e.stopPropagation()}
          >
            {child}
          </motion.div>
        );
      })}

      {/* Inspector Panel */}
      {isInspectorMode && (
        <div className="fixed bottom-4 left-4 bg-black/95 border-2 border-yellow-400 rounded-lg p-4 w-96 max-h-[600px] overflow-y-auto z-[100] shadow-[0_0_20px_rgba(255,193,7,0.3)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-yellow-400 text-sm">CANVAS POSITIONING</h3>
          </div>

          <div className="space-y-3 mb-4">
            {Object.entries(elements).map(([id, element]) => (
              <div
                key={id}
                className={`p-3 border rounded transition-all ${
                  selectedElement === id
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-yellow-400/50 bg-black/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading font-bold text-yellow-300 text-xs uppercase">{id}</h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopyPosition(id)}
                      className="p-1 text-yellow-400/70 hover:text-yellow-400 transition-colors"
                      title="Copy position"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleResetPosition(id)}
                      className="p-1 text-yellow-400/70 hover:text-red-400 transition-colors"
                      title="Reset position"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-yellow-400/70 block mb-1">X (px)</label>
                    <input
                      type="number"
                      value={Math.round(element.x)}
                      onChange={(e) => handleInputChange(id, 'x', e.target.value)}
                      onClick={() => setSelectedElement(id)}
                      className="w-full bg-black border border-yellow-400/50 text-yellow-300 px-2 py-1 rounded text-xs focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-yellow-400/70 block mb-1">Y (px)</label>
                    <input
                      type="number"
                      value={Math.round(element.y)}
                      onChange={(e) => handleInputChange(id, 'y', e.target.value)}
                      onClick={() => setSelectedElement(id)}
                      className="w-full bg-black border border-yellow-400/50 text-yellow-300 px-2 py-1 rounded text-xs focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleResetAll}
            className="w-full bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 px-3 py-2 rounded text-xs font-heading font-bold transition-colors"
          >
            RESET ALL POSITIONS
          </button>

          <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/50 rounded text-xs text-yellow-300">
            <p className="font-heading font-bold mb-1">MODO INSPECTOR:</p>
            <ul className="text-yellow-400/70 space-y-1">
              <li>• Arraste elementos para mover</li>
              <li>• Edite X e Y manualmente</li>
              <li>• Posicionamento absoluto livre</li>
              <li>• Sem restrições de grid</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
