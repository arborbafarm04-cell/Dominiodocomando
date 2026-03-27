// playerSessionManager.ts

class PlayerSessionManager {
    private sessionToken: string | null = null;
    private refreshIntervalId: NodeJS.Timeout | null = null;

    constructor() {
        this.loadSession();
        this.startAutoRefresh();
    }

    private loadSession() {
        const savedToken = localStorage.getItem('sessionToken');
        if (savedToken) {
            this.sessionToken = savedToken;
        }
    }

    public getSessionToken(): string | null {
        return this.sessionToken;
    }

    public setSessionToken(token: string) {
        this.sessionToken = token;
        localStorage.setItem('sessionToken', token);
    }

    private startAutoRefresh() {
        if (this.refreshIntervalId) return;
        this.refreshIntervalId = setInterval(() => {
            this.refreshSessionToken();
        }, 15 * 60 * 1000); // Refresh every 15 minutes
    }

    private refreshSessionToken() {
        // Logic for refreshing the session token
        // This should be implemented based on your authentication service
        console.log('Session token refresh logic goes here');
    }

    public clearSession() {
        this.sessionToken = null;
        localStorage.removeItem('sessionToken');
        if (this.refreshIntervalId) {
            clearInterval(this.refreshIntervalId);
            this.refreshIntervalId = null;
        }
    }
}

export default PlayerSessionManager;