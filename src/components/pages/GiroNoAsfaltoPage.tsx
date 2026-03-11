import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';
import SlotMachine from '@/components/SlotMachine';
import DraggableContainer from '@/components/DraggableContainer';
import { useDraggableContainers } from '@/hooks/useDraggableContainers';
import { RotateCcw } from 'lucide-react';

export default function GiroNoAsfaltoPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { containers, removeContainer, toggleContainer, resetPositions } = useDraggableContainers([
    { id: 'header', title: 'Header', isVisible: true },
    { id: 'slot-machine', title: 'Slot Machine', isVisible: true },
    { id: 'footer', title: 'Footer', isVisible: true },
  ]);

  const handleEdit = (id: string) => {
    const container = containers.find(c => c.id === id);
    if (container) {
      setEditingId(id);
      setEditTitle(container.title);
    }
  };

  const handleSaveEdit = () => {
    if (editingId) {
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col relative">
      {/* Edit Mode Controls */}
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-black/80 border border-[#00eaff]/50 rounded px-4 py-2 backdrop-blur-sm">
        <button
          onClick={resetPositions}
          className="flex items-center gap-2 px-3 py-1 bg-[#FF4500]/20 hover:bg-[#FF4500]/40 border border-[#FF4500]/50 rounded text-white/80 hover:text-white transition-all text-sm font-paragraph"
          title="Reset all container positions"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Positions
        </button>
      </div>

      {/* Edit Title Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101] backdrop-blur-sm">
          <div className="bg-black border border-[#00eaff]/50 rounded p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-heading text-white mb-4">Edit Container Title</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-black/40 border border-[#00eaff]/50 rounded px-3 py-2 text-white font-paragraph mb-4 focus:outline-none focus:border-[#00eaff]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-[#00eaff]/20 hover:bg-[#00eaff]/40 border border-[#00eaff]/50 rounded text-white transition-all font-paragraph"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-all font-paragraph"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Containers */}
      <div className="relative w-full flex-1">
        {containers.find(c => c.id === 'header')?.isVisible && (
          <DraggableContainer
            id="header"
            title="Header"
            onRemove={removeContainer}
            onEdit={handleEdit}
            className="w-full"
          >
            <Header />
          </DraggableContainer>
        )}

        {/* Slot Machine Illustration Section - Fixed Background */}
        {containers.find(c => c.id === 'slot-machine')?.isVisible && (
          <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#0a0d14] to-[#0f1419] flex items-center justify-center min-h-screen bg-fixed">
            <Image
              src="https://static.wixstatic.com/media/50f4bf_f0f13bffd67f4487bbad4fec560e36e5~mv2.png?originWidth=1024&originHeight=1920"
              alt="Ultra-realistic cinematic slot machine arcade cabinet viewed straight from the front, facing the player directly, with empty blank display panel, bright LED neon panel displaying GIRO NO ASFALTO with glowing neon effect, in a Brazilian community bar with immersive atmosphere"
              width={1024}
              height={1920}
              className="w-full h-full object-cover fixed top-0 left-0 brightness-125 contrast-110"
            />
            {/* Slot Machine Component positioned inside the slot machine screen - TV display area */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 relative z-10">
              <div className="bg-transparent flex items-center justify-center">
                <SlotMachine />
              </div>
            </div>
          </div>
        )}

        {containers.find(c => c.id === 'footer')?.isVisible && (
          <DraggableContainer
            id="footer"
            title="Footer"
            onRemove={removeContainer}
            onEdit={handleEdit}
            className="w-full"
          >
            <Footer />
          </DraggableContainer>
        )}
      </div>
    </div>
  );
}
