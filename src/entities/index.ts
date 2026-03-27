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
 * Collection ID: businessupgrades
 * Interface for BusinessUpgrades
 */
export interface BusinessUpgrades {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  upgradeName?: string;
  /** @wixFieldType number */
  cost?: number;
  /** @wixFieldType number */
  launderingRateEffect?: number;
  /** @wixFieldType number */
  baseTimeEffect?: number;
  /** @wixFieldType number */
  maxValueEffect?: number;
  /** @wixFieldType text */
  description?: string;
}


/**
 * Collection ID: financialhistory
 * Interface for FinancialHistory
 */
export interface FinancialHistory {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  playerId?: string;
  /** @wixFieldType text */
  operationType?: string;
  /** @wixFieldType number */
  value?: number;
  /** @wixFieldType number */
  balanceBefore?: number;
  /** @wixFieldType number */
  balanceAfter?: number;
  /** @wixFieldType text */
  actionOrigin?: string;
  /** @wixFieldType datetime */
  timestamp?: Date | string;
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
 * Collection ID: moneylaunderingbusinesses
 * Interface for MoneyLaunderingBusinesses
 */
export interface MoneyLaunderingBusinesses {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  businessName?: string;
  /** @wixFieldType number */
  initialValue?: number;
  /** @wixFieldType number */
  initialRate?: number;
  /** @wixFieldType number */
  baseTime?: number;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  businessImage?: string;
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
 * Collection ID: playerlots
 * Interface for Playerlots
 */
export interface Playerlots {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  playerId?: string;
  /** @wixFieldType text */
  playerName?: string;
  /** @wixFieldType number */
  gridX?: number;
  /** @wixFieldType number */
  gridZ?: number;
  /** @wixFieldType number */
  sizeX?: number;
  /** @wixFieldType number */
  sizeZ?: number;
  /** @wixFieldType number */
  rotation?: number;
  /** @wixFieldType text */
  complexo?: string;
  /** @wixFieldType text */
  area?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType date */
  dateAndTime?: Date | string;
  /** @wixFieldType date */
  updatedAt?: Date | string;
}


/**
 * Collection ID: playerpresence
 * Interface for PlayerPresence
 */
export interface PlayerPresence {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  playerId?: string;
  /** @wixFieldType text */
  mapPosition?: string;
  /** @wixFieldType datetime */
  lastSeenAt?: Date | string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  complexStatus?: string;
  /** @wixFieldType boolean */
  isOnline?: boolean;
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
  /** @wixFieldType datetime */
  createdAt?: Date | string;
  /** @wixFieldType datetime */
  lastLoginAt?: Date | string;
  /** @wixFieldType text */
  inventory?: string;
  /** @wixFieldType text */
  skillTrees?: string;
  /** @wixFieldType text */
  ownedLuxuryItems?: string;
  /** @wixFieldType text */
  investments?: string;
  /** @wixFieldType number */
  barracoLevel?: number;
  /** @wixFieldType number */
  spins?: number;
  /** @wixFieldType text */
  email?: string;
  /** @wixFieldType text */
  comercios?: string;
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
