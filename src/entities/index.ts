/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: BackgroundPages
 * Interface for Background
 */
export interface Background {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  pageName?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  backgroundImage?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  image?: string;
}


/**
 * Collection ID: itensdeluxo
 * Interface for ItensdeLuxo
 */
export interface ItensdeLuxo {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  level?: number;
  /** @wixFieldType text */
  itemName?: string;
  /** @wixFieldType number */
  price?: number;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  imageUrl?: string;
  /** @wixFieldType text */
  category?: string;
}


/**
 * Collection ID: personagens
 * Interface for Characters
 */
export interface Characters {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  characterName?: string;
  /** @wixFieldType number */
  startLevel?: number;
  /** @wixFieldType number */
  endLevel?: number;
  /** @wixFieldType text */
  mainDialogue?: string;
  /** @wixFieldType text */
  acceptOptionText?: string;
  /** @wixFieldType text */
  denounceOptionText?: string;
  /** @wixFieldType number */
  baseBribeValue?: number;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  characterImage?: string;
}


/**
 * Collection ID: players
 * Interface for Players
 */
export interface Players {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  cleanMoney?: number;
  /** @wixFieldType date */
  updatedAt?: Date | string;
  /** @wixFieldType number */
  dirtyMoney?: number;
  /** @wixFieldType text */
  playerId?: string;
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


/**
 * Collection ID: playerslogados
 * Interface for LoggedInPlayers
 */
export interface LoggedInPlayers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  memberId?: string;
  /** @wixFieldType text */
  playerName?: string;
  /** @wixFieldType text */
  nickname?: string;
  /** @wixFieldType datetime */
  lastSeen?: Date | string;
  /** @wixFieldType boolean */
  isOnline?: boolean;
}
