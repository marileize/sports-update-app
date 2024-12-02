import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { auth } from '../../config/firebaseConfig';

const db = getFirestore();

/**
 * Firebase error messages mapping.
 * Maps Firebase error codes to user-friendly error messages.
 */
const firebaseErrorMessages = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'The email address is invalid.',
    'auth/operation-not-allowed': 'Registration is currently disabled. Please try again later.',
    'auth/weak-password': 'Your password is too weak. Please use a stronger password.',
};

/**
 * Gets a custom error message for the provided Firebase error code.
 *
 * @param {string} errorCode - The Firebase error code.
 * @returns {string} A user-friendly error message.
 */
const getCustomMessage = (errorCode) => {
    return firebaseErrorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

/**
 * Register screen component for creating a new user account.
 *
 * This component provides a user interface for inputting name, email, and password.
 * It interacts with Firebase Authentication and Firestore to create a user account
 * and store additional user data.
 *
 * @component
 * @returns {JSX.Element} The rendered registration screen.
 */
const Register = () => {
    const [name, setName] = useState(''); // Stores the user's name input.
    const [email, setEmail] = useState(''); // Stores the user's email input.
    const [password, setPassword] = useState(''); // Stores the user's password input.
    const [isSubmitting, setIsSubmitting] = useState(false); // Tracks whether the form is being submitted.

    /**
     * Handles the registration process.
     *
     * This function validates the input fields, creates a user in Firebase Authentication,
     * and stores additional user data (name and email) in Firestore.
     *
     * @async
     */
    const handleRegister = async () => {
        if (isSubmitting) return;

        // Validate input fields
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Name is required.');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Validation Error', 'Email is required.');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Validation Error', 'Password is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name: name.trim(),
                email: email.trim(),
            });

            Alert.alert('Registration Successful', 'Your account has been created!');
        } catch (error) {
            // Handle Firebase errors
            const errorMessage = getCustomMessage(error.code);
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isSubmitting}>
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4A90E2',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    registerButton: {
        backgroundColor: '#4A90E2',
        padding: 15,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Register;