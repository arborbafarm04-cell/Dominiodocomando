// src/config/apiConfig.ts

const apiConfig = {
    register: process.env.MULTIPLAYER_AUTH_SERVICE + '/register',
    login: process.env.MULTIPLAYER_AUTH_SERVICE + '/login',
    logout: process.env.MULTIPLAYER_AUTH_SERVICE + '/logout',
};

export default apiConfig;
