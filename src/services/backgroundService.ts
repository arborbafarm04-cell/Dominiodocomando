import { BaseCrudService } from '@/integrations';
import { Background } from '@/entities';

const COLLECTION_ID = 'BackgroundPages';

// Map page names to CMS page names
const pageNameMap: Record<string, string> = {
  home: 'home',
  giroNoAsfalto: 'giro-no-asfalto',
  luxuryShowroom: 'luxury-showroom',
  luxo1: 'luxo-1',
  luxo2: 'luxo-2',
  luxo3: 'luxo-3',
  luxo4: 'luxo-4',
  luxo5: 'luxo-5',
  luxo6: 'luxo-6',
  luxo7: 'luxo-7',
  luxo8: 'luxo-8',
  luxo9: 'luxo-9',
  luxo10: 'luxo-10',
  luxo11: 'luxo-11',
  luxo12: 'luxo-12',
  luxo13: 'luxo-13',
  luxo14: 'luxo-14',
  luxo15: 'luxo-15',
  game: 'game',
  casa: 'casa',
  barraco: 'barraco',
  projects: 'projects',
  briberyGuard: 'bribery-guard',
  about: 'about',
  contact: 'contact',
  login: 'login',
  profile: 'profile',
  bribery: 'bribery',
};

export const backgroundService = {
  // Get all backgrounds
  async getAllBackgrounds(): Promise<Background[]> {
    try {
      const result = await BaseCrudService.getAll<Background>(COLLECTION_ID);
      return result.items;
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
      return [];
    }
  },

  // Get background by page name
  async getBackgroundByPageName(pageName: string): Promise<Background | null> {
    try {
      const cmsPageName = pageNameMap[pageName] || pageName;
      const result = await BaseCrudService.getAll<Background>(COLLECTION_ID);
      const background = result.items.find(
        (bg) => bg.pageName?.toLowerCase() === cmsPageName.toLowerCase()
      );
      return background || null;
    } catch (error) {
      console.error(`Error fetching background for page ${pageName}:`, error);
      return null;
    }
  },

  // Get background image URL by page name
  async getBackgroundImageUrl(pageName: string): Promise<string | null> {
    try {
      const background = await backgroundService.getBackgroundByPageName(pageName);
      return background?.backgroundImage || background?.image || null;
    } catch (error) {
      console.error(`Error getting background image URL for ${pageName}:`, error);
      return null;
    }
  },
};
