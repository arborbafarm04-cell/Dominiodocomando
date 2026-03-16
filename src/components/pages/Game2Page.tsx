import { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';

export default function Game2Page() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([
    'https://static.wixstatic.com/media/50f4bf_8ad82d29d0444efcb381c4cdb3e2fbd7~mv2.png',
  ]);

  // Method to update the image during gameplay
  const updateGameImage = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
    setCurrentImageIndex(prev => prev + 1);
  };

  // Expose the update method globally for game logic to use
  useEffect(() => {
    (window as any).updateGame2Image = updateGameImage;
    return () => {
      delete (window as any).updateGame2Image;
    };
  }, []);

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black overflow-hidden">
      <Image
        src={currentImage}
        alt="Game 2 Scene"
        className="w-full h-full object-contain"
        width={1080}
        height={1920}
      />
    </div>
  );
}
