import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

/**
 * Context for managing user authentication state throughout the app.
 *
 * Provides the current user, a flag to indicate initialization, and a logout function.
 */
export const AuthContext = createContext();

/**
 * Authentication Provider component that wraps the application with user authentication context.
 *
 * - Monitors Firebase authentication state changes.
 * - Provides the authenticated user, an initialization state, and a logout function via context.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - The child components that need access to the authentication context.
 * @returns {JSX.Element} The authentication provider component.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Holds the current authenticated user.
    const [initializing, setInitializing] = useState(true); // Tracks whether Firebase is still initializing.

    /**
     * Sets up a listener for authentication state changes using Firebase.
     *
     * Updates the `user` state when the authentication state changes.
     *
     * @returns {Function} A cleanup function to unsubscribe from the listener when the component unmounts.
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state changed:', currentUser);
            setUser(currentUser); // Update the user state with the current Firebase user.
            setInitializing(false); // Mark initialization as complete.
        });

        return () => unsubscribe(); // Clean up the subscription on component unmount.
    }, []);

    /**
     * Logs the user out of the application using Firebase Authentication.
     *
     * - Signs the user out and clears the `user` state.
     * - Handles potential errors during the sign-out process.
     *
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the user is logged out.
     */
    const logout = async () => {
        try {
            await signOut(auth);
            console.log('User logged out');
            setUser(null); // Clear the user state on logout.
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
