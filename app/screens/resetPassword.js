import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

/**
 * ResetPassword screen component for initiating a password reset process.
 *
 * This component allows users to request a password reset email by providing their email address.
 * It interacts with Firebase Authentication to send a reset password email.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.navigation - Navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered ResetPassword screen.
 */
export default function ResetPassword({ navigation }) {
    const [email, setEmail] = useState(''); // Stores the user's email input.

    /**
     * Handles the password reset process.
     *
     * This function validates the email input and sends a password reset email
     * using Firebase Authentication. On success, it redirects the user to the login screen.
     *
     * @async
     */
    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                'Password Reset Email Sent',
                'Please check your email for instructions to reset your password.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
            />
            <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
            >
                <Text style={styles.resetButtonText}>Reset Password</Text>
            </TouchableOpacity>
            <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
                Back to Login
            </Text>
        </View>
    );
}

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
        color: '#4A90E2', // Same color as the home footer background
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    resetButton: {
        backgroundColor: '#4A90E2', // Same color as the home footer background
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        marginTop: 20,
        color: '#1e90ff',
        textDecorationLine: 'underline',
    },
});