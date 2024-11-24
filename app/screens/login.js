import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

/**
 * Login screen component for user authentication.
 *
 * This component provides a user interface for logging in with email and password.
 * It also includes links to the Register and Reset Password screens.
 *
 * @component
 * @returns {JSX.Element} The rendered login screen.
 */
const Login = () => {
    const navigation = useNavigation(); // Used to navigate between screens.
    const [email, setEmail] = useState(''); // Stores the user's email input.
    const [password, setPassword] = useState(''); // Stores the user's password input.

    /**
     * Logs a message when the login screen is rendered.
     *
     * @useEffect Logs a message every time the component renders.
     */
    useEffect(() => {
        console.log('Login screen rendered');
    }, []);

    /**
     * Handles user login with email and password.
     *
     * This function attempts to log in the user using Firebase Authentication.
     * If successful, an alert confirms the login. If an error occurs, an alert displays the error message.
     */
    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert('Login Successful', 'You are now logged in!');
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the Sports Update App</Text>
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
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
                Don't have an account? Register
            </Text>
            <Text style={styles.linkText} onPress={() => navigation.navigate('ResetPassword')}>
                Forgot Password?
            </Text>
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
    loginButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    loginButtonText: {
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

export default Login;
