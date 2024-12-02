import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import {getFirestore, addDoc, collection} from "firebase/firestore";
import { auth } from '../../config/firebaseConfig';

const db = getFirestore();

/**
 * A React component that allows users to add a new sports team to their profile.
 *
 * This component displays a form with a dropdown to select a sport and a text input for the team name.
 * On submission, the data is saved to a Firebase Firestore collection.
 *
 * @param {object} props - Component props.
 * @param {object} props.navigation - React Navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered component.
 */
export default function AddTeam({ navigation }) {
    const [sport, setSport] = useState(null); // Selected sport
    const [team, setTeam] = useState(''); // Team name
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevents multiple submissions

    // List of available sports for selection
    const sports = [
        { label: 'Soccer', value: 'Soccer' },
        { label: 'Basketball', value: 'Basketball' },
        { label: 'Baseball', value: 'Baseball' },
        { label: 'American Football', value: 'American Football' },
        { label: 'Cricket', value: 'Cricket' },
        { label: 'Hockey', value: 'Hockey' },
        { label: 'Rugby', value: 'Rugby' },
    ];

    /**
     * Handles the submission of the form.
     * Validates the input, saves the data to Firestore, and navigates back to the home screen.
     */
    const handleAddTeam = async () => {
        if (isSubmitting) return;

        if (!sport || !team.trim()) {
            Alert.alert('Validation Error', 'Please fill out all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get the current user ID from Firebase Auth
            const userId = auth.currentUser?.uid;

            if (!userId) {
                Alert.alert('Error', 'You must be logged in to add a team');
                setIsSubmitting(false);
                return;
            }

            // Save the sport and team to the "sports_teams" collection
            await addDoc(collection(db, 'sports_teams'), {
                userId: userId, // Reference the current user's ID
                sport: sport,
                team: team.trim(),
                createdAt: new Date(),
            });

            Alert.alert('Success', 'Team added successfully!');
            setSport(null); // Reset the dropdown
            setTeam(''); // Clear the input
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error adding team:', error);
            Alert.alert('Error', 'Failed to add team. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add a New Team</Text>
            <View style={styles.form}>
                <Text style={styles.label}>Select a Sport:</Text>
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholder}
                    selectedTextStyle={styles.selectedText}
                    inputSearchStyle={styles.inputSearch}
                    iconStyle={styles.iconStyle}
                    data={sports}
                    search
                    maxHeight={400}
                    labelField="label"
                    valueField="value"
                    placeholder="Select a sport"
                    searchPlaceholder="Search..."
                    value={sport}
                    onChange={(item) => {
                        setSport(item.value);
                    }}
                    renderLeftIcon={() => (
                        <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                    )}
                />
                <Text style={styles.label}>Team Name:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter team name"
                    value={team}
                    onChangeText={(text) => setTeam(text)}
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddTeam}
                    disabled={isSubmitting}
                >
                    <Text style={styles.addButtonText}>Add Team</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
        color: '#4A90E2',
    },
    form: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    placeholder: {
        color: '#999',
        fontSize: 16,
    },
    selectedText: {
        fontSize: 16,
        color: '#000',
    },
    addButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});