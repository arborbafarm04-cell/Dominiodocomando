// authService.ts

import crypto from 'crypto';
import { getSessionToken, saveSessionToken } from './sessionService';
import { User } from '../models/user';

// Validate email format using regex
const isValidEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
};

// Strong password validation function
const isValidPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasNonalphas = /[!@#$%^&*]/.test(password);
    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasNonalphas
    );
};

// Hash password using crypto
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Authenticate user function
export const authenticateUser = async (email, password) => {
    try {
        if (!isValidEmail(email)) {
            throw new Error('Invalid email format.');
        }
        if (!isValidPassword(password)) {
            throw new Error('Password does not meet the complexity requirements.');
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found.');
        }

        const hashedPassword = hashPassword(password);
        if (hashedPassword !== user.password) {
            throw new Error('Incorrect password.');
        }

        const token = getSessionToken();
        saveSessionToken(user.id, token);
        return { user, token };
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
};
