import { useEffect, useState } from 'react';
import { backgroundService } from '@/services/backgroundService';

/**
 * Background Images Configuration
 * Centralized configuration for background images used across all pages
 * 
 * Usage:
 * import { backgroundImages } from '@/config/backgroundImages';
 * const bgImage = backgroundImages.home;
 */

export const backgroundImages = {
  // Home page
  home: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  
  // Game pages
  giroNoAsfalto: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxuryShowroom: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  
  // Luxo pages (1-15)
  luxo1: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo2: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo3: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo4: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo5: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo6: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo7: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo8: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo9: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo10: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo11: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo12: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo13: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo14: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  luxo15: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  
  // Game locations
  game: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  casa: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  barraco: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  
  // Other pages
  projects: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  briberyGuard: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  about: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  contact: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  login: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  profile: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
  bribery: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
};

/**
 * Get background image URL by page name
 * @param pageName - The name of the page (e.g., 'home', 'luxo1', 'game')
 * @returns The background image URL
 */
export const getBackgroundImage = (pageName: keyof typeof backgroundImages): string => {
  return backgroundImages[pageName] || backgroundImages.home;
};

/**
 * Background image style object for easy use in components
 * @param imageName - The name of the image from backgroundImages
 * @returns CSS style object with background image
 */
export const getBackgroundStyle = (imageName: keyof typeof backgroundImages) => ({
  backgroundImage: `url('${backgroundImages[imageName]}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
});

/**
 * Hook to get background image from CMS
 * Falls back to static config if CMS image is not available
 * @param pageName - The name of the page
 * @returns Object with backgroundImage URL and isLoading state
 */
export const useBackgroundImage = (pageName: keyof typeof backgroundImages) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackground = async () => {
      setIsLoading(true);
      try {
        const cmsImage = await backgroundService.getBackgroundImageUrl(pageName);
        if (cmsImage) {
          setBackgroundImage(cmsImage);
        } else {
          // Fallback to static config
          setBackgroundImage(backgroundImages[pageName]);
        }
      } catch (error) {
        console.error(`Error fetching background for ${pageName}:`, error);
        // Fallback to static config
        setBackgroundImage(backgroundImages[pageName]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackground();
  }, [pageName]);

  return {
    backgroundImage: backgroundImage || backgroundImages[pageName],
    isLoading,
  };
};
