/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: players
 * Interface for Players
 */
export interface Players {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  playerName?: string;
  /** @wixFieldType number */
  level?: number;
  /** @wixFieldType number */
  progress?: number;
  /** @wixFieldType text */
  externalPlayerId?: string;
  /** @wixFieldType datetime */
  lastUpdated?: Date | string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  profilePicture?: string;
  /** @wixFieldType boolean */
  isGuest?: boolean;
}
