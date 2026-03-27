import create from 'zustand';

// Define a Zustand store for authentication management
const useAuthStore = create((set) => ({
    isAuthenticated: false,
    user: null,
    login: (userData) => set({ isAuthenticated: true, user: userData }),
    logout: () => set({ isAuthenticated: false, user: null }),
}));

// Custom hook for accessing authentication state
const useAuth = () => {
    const { isAuthenticated, user, login, logout } = useAuthStore();
    return { isAuthenticated, user, login, logout };
};

export default useAuth;