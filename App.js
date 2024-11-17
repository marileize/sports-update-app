import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import Login from './app/screens/login';
import Register from './app/screens/register';
import { View, Text, Button, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [initializing]);

  if (initializing) {
    // Optionally show a loading screen during initialization
    return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
    );
  }

  return (
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
              <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
              </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
  );
}

function HomeScreen() {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert('Successfully logged out');
    } catch (error) {
      alert('Logout failed: ' + error.message);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to the Home Screen!</Text>
        <Button title="Logout" onPress={handleLogout} />
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
  },
});
