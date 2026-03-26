# PHASE 2: Authentication Refactor - Separating Authentication from Player Progress

## Overview

This refactor separates the authentication system from player data management, establishing a central authentication system with fixed player IDs and proper player registration in the database.

## Architecture Changes

### Before (Monolithic)
```
Login Form
  ↓
Validate Email/Password
  ↓
Store Credential in IndexedDB
  ↓
Get Player ID
  ↓
Load Player Data
  ↓
Store Session
  ↓
Navigate
```

### After (Separated)
```
┌─────────────────────────────────────────┐
│   AUTHENTICATION LAYER (authService)    │
│  - Validate credentials                 │
│  - Register credentials                 │
│  - Manage sessions                      │
│  - Central auth logic                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   PLAYER DATA LAYER (playerService)     │
│  - Load player from database            │
│  - Update player data                   │
│  - Manage player state                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   STATE MANAGEMENT (playerStore)        │
│  - Store player data in Zustand         │
│  - Persist to localStorage              │
│  - Provide to components                │
└─────────────────────────────────────────┘
```

## New Login Flow

### Registration Flow
```
1. User submits email, password, player name
   ↓
2. Create player in database with fixed _id
   ↓
3. Register credentials in auth system (IndexedDB)
   ↓
4. Create authenticated session (IndexedDB)
   ↓
5. Clear previous session data (resetPlayer)
   ↓
6. Load player data into playerStore
   ↓
7. Navigate to game
```

### Login Flow
```
1. User submits email and password
   ↓
2. Validate credentials → returns player _id
   ↓
3. Load player data from database using _id
   ↓
4. Create authenticated session
   ↓
5. Clear previous session data (resetPlayer)
   ↓
6. Load player data into playerStore
   ↓
7. Navigate to game
```

## Key Components

### 1. authService.ts (NEW)
Central authentication service - handles email/password validation and session management.

**Key Functions:**
- `validateCredentials(email, password)` - Validates email/password, returns player _id
- `registerCredentials(email, password, playerId)` - Registers new credentials
- `createSession(playerId, email)` - Creates authenticated session
- `getAuthSession()` - Gets current session
- `destroySession()` - Destroys session on logout
- `isAuthenticated()` - Checks if user is authenticated

**Separation of Concerns:**
- Does NOT load player data
- Does NOT manage player state
- Only handles authentication logic

### 2. playerService.ts (REFACTORED)
Player data management service - now uses authService for authentication.

**Key Changes:**
- `registerLocalPlayer()` now:
  1. Creates player in database
  2. Calls `registerCredentials()` from authService
  3. Calls `createSession()` from authService
  
- `loginLocalPlayer()` now:
  1. Calls `validateCredentials()` from authService
  2. Loads player from database
  3. Calls `createSession()` from authService

**Separation of Concerns:**
- Handles player data operations
- Uses authService for authentication
- Does NOT manage player state directly

### 3. LocalLoginForm.tsx (REFACTORED)
Login UI component - now properly loads player data into playerStore.

**Key Changes:**
- After successful login/registration:
  1. Calls `resetPlayer()` to clear previous session
  2. Calls `loadPlayerData()` to populate playerStore
  3. Navigates to game

**Separation of Concerns:**
- Handles UI and user input
- Orchestrates authentication and data loading
- Properly manages player state

### 4. playerStore.ts (EXISTING)
Zustand store for player state - unchanged, but now properly populated.

## Data Flow

### Authentication Data
```
IndexedDB (authService)
  ├── Credentials: { email, hashedPassword, playerId }
  └── Session: { playerId, email }
```

### Player Data
```
Database (players collection)
  ├── _id (fixed player ID)
  ├── playerName
  ├── level
  ├── progress
  ├── cleanMoney
  ├── dirtyMoney
  ├── barracoLevel
  ├── profilePicture
  └── ... other fields
```

### Application State
```
playerStore (Zustand + localStorage)
  ├── playerId (from database _id)
  ├── playerName
  ├── level
  ├── progress
  ├── cleanMoney
  ├── dirtyMoney
  ├── barracoLevel
  ├── profilePicture
  └── ... other fields
```

## Benefits

### 1. Central Authentication
- Single source of truth for authentication logic
- Easier to add new auth methods (OAuth, etc.)
- Cleaner separation of concerns

### 2. Fixed Player IDs
- Player _id is permanent and immutable
- Stored in database, not generated on login
- Better for multiplayer and data consistency

### 3. Proper Player Registration
- Players are registered in database on signup
- Player data is loaded from database on login
- No more mixing authentication with player data

### 4. Session Management
- Clear session lifecycle
- Proper cleanup on logout
- Prevents session leaks

### 5. Multiplayer Ready
- Fixed player IDs enable real multiplayer
- Player data is centralized in database
- Easy to sync player state across sessions

## Migration Guide

### For Existing Players
If you have existing players in IndexedDB:
1. Their credentials are still valid
2. Their player data will be loaded from database
3. No manual migration needed

### For New Players
1. Register with email/password
2. Player is created in database with fixed _id
3. Credentials are stored in IndexedDB
4. Session is created
5. Player data is loaded into playerStore

## Testing Checklist

- [ ] Register new player with email/password
- [ ] Verify player is created in database
- [ ] Verify credentials are stored in IndexedDB
- [ ] Verify session is created
- [ ] Verify playerStore is populated
- [ ] Login with registered email/password
- [ ] Verify player data is loaded from database
- [ ] Verify playerStore is populated
- [ ] Logout and verify session is cleared
- [ ] Login again and verify session is restored
- [ ] Check that player data persists across sessions

## Future Improvements

### Phase 3: OAuth Integration
- Add Google OAuth authentication
- Use same authService for OAuth
- Automatically create player on first OAuth login

### Phase 4: Player Sync
- Sync player data across multiple sessions
- Real-time multiplayer updates
- Conflict resolution for concurrent updates

### Phase 5: Advanced Auth
- Two-factor authentication
- Password reset
- Email verification
- Account recovery

## Code Examples

### Register New Player
```typescript
// In LocalLoginForm.tsx
const player = await registerLocalPlayer(email, password, playerName);
resetPlayer();
loadPlayerData({
  playerId: player._id,
  playerName: player.playerName,
  level: player.level,
  // ... other fields
});
navigate('/star-map');
```

### Login Existing Player
```typescript
// In LocalLoginForm.tsx
const player = await loginLocalPlayer(email, password);
resetPlayer();
loadPlayerData({
  playerId: player._id,
  playerName: player.playerName,
  level: player.level,
  // ... other fields
});
navigate('/star-map');
```

### Check Authentication
```typescript
// In any component
import { isAuthenticated } from '@/services/authService';

const authenticated = await isAuthenticated();
if (!authenticated) {
  navigate('/login');
}
```

### Get Current Player
```typescript
// In any component
import { getCurrentLocalPlayer } from '@/services/playerService';

const player = await getCurrentLocalPlayer();
console.log(player.playerName);
```

## Security Notes

### Current Implementation
- Passwords are hashed with base64 (for demo only)
- Credentials stored in IndexedDB (client-side)
- Session stored in IndexedDB

### Production Recommendations
- Use bcrypt or Argon2 for password hashing
- Implement server-side authentication
- Use secure session tokens (JWT)
- Add HTTPS enforcement
- Implement rate limiting
- Add CSRF protection
- Validate all inputs server-side

## Troubleshooting

### Player not found after login
- Check that player exists in database
- Verify playerId matches between auth and database
- Check IndexedDB for session data

### Session not persisting
- Check IndexedDB for session data
- Verify browser allows IndexedDB
- Check for storage quota issues

### Player data not loading
- Check that player exists in database
- Verify playerStore is being populated
- Check browser console for errors

## Files Modified

1. **NEW**: `/src/services/authService.ts` - Central authentication service
2. **REFACTORED**: `/src/services/playerService.ts` - Uses authService
3. **REFACTORED**: `/src/components/LocalLoginForm.tsx` - Loads player data into playerStore
4. **EXISTING**: `/src/store/playerStore.ts` - No changes needed
5. **EXISTING**: `/src/services/indexedDBService.ts` - No changes needed

## Summary

This refactor establishes a proper authentication system with:
- ✅ Central authentication logic (authService)
- ✅ Fixed player IDs in database
- ✅ Proper player registration
- ✅ Clear separation of concerns
- ✅ Foundation for multiplayer
- ✅ Better session management
- ✅ Cleaner code organization
