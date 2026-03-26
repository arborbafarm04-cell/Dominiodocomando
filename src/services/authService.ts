// authService.ts

const PLAYER_ID_KEY = 'playerId';

export const login = (playerId) => {
    localStorage.setItem(PLAYER_ID_KEY, playerId);
};

export const logout = () => {
    localStorage.removeItem(PLAYER_ID_KEY);
};

export const loadPlayerData = async () => {
    const playerId = localStorage.getItem(PLAYER_ID_KEY);
    if (!playerId) return null;
    
    try {
        const response = await fetch(
            `https://api.example.com/players/${playerId}`
        );
        if (!response.ok) throw new Error('Error fetching player data');
        const playerData = await response.json();
        return playerData;
    } catch (error) {
        console.error(error);
        return null;
    }
};

