import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);

    const navigateToAddTeam = () => {
        navigation.navigate('AddTeam'); // Navigate to the AddTeam page
    };

    return (
        <View style={styles.container}>
            <Button title="Add New Team" onPress={navigateToAddTeam} />
            <Button title="Logout" onPress={logout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});
