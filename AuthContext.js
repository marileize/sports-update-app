import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Holds the current user
    const [initializing, setInitializing] = useState(true); // Tracks whether Firebase is initializing

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state changed:', currentUser);
            setUser(currentUser); // Update user state based on auth state
            setInitializing(false); // Firebase initialization is complete
        });

        return () => unsubscribe(); // Clean up the subscription on unmount
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            console.log('User logged out');
            setUser(null); // Explicitly clear user state
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, initializing, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
