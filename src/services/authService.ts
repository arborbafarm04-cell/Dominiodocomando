import {
  storeCredential,
  getCredential,
  storeSession,
  getSession,
  clearSession,
  credentialExists,
} from './indexedDBService';

/**
 * Central Authentication Service
 * Handles email/password validation and session management
 * Separated from player data loading
 */

export interface AuthCredentials {
  email: string;
  playerId: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate email and password, return player ID if valid
 */
export async function validateCredentials(email: string, password: string): Promise<string> {
  const normalizedEmail = normalizeEmail(email);
  const credential = await getCredential(normalizedEmail);

  if (!credential) {
    throw new Error('Email não encontrado');
  }

  const hashedPassword = btoa(password);
  if (credential.password !== hashedPassword) {
    throw new Error('Senha incorreta');
  }

  return credential.playerId;
}

/**
 * Register new credentials in the authentication system
 */
export async function registerCredentials(
  email: string,
  password: string,
  playerId: string
): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  const exists = await credentialExists(normalizedEmail);

  if (exists) {
    throw new Error('Email já registrado');
  }

  const hashedPassword = btoa(password);
  await storeCredential(normalizedEmail, hashedPassword, playerId);
}

/**
 * Create authenticated session
 */
export async function createSession(playerId: string, email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  await storeSession(playerId, normalizedEmail);
}

/**
 * Get current authenticated session
 */
export async function getAuthSession(): Promise<AuthCredentials | null> {
  const session = await getSession();

  if (!session?.playerId || !session?.email) {
    return null;
  }

  return {
    email: normalizeEmail(session.email),
    playerId: session.playerId,
  };
}

/**
 * Destroy authenticated session
 */
export async function destroySession(): Promise<void> {
  await clearSession();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session;
}