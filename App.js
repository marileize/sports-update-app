import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './app/screens/login';
import Register from './app/screens/register';
import ResetPassword from './app/screens/resetPassword';
import Home from './app/screens/home';
import AddTeam from './app/screens/addTeam';
import { View, Text, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, initializing } = useContext(AuthContext);

    if (initializing) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator id="MainStack" initialRouteName={user ? "Home" : "Login"}>
            {user ? (
                <>
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen name="AddTeam" component={AddTeam} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Register" component={Register} />
                    <Stack.Screen name="ResetPassword" component={ResetPassword} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
