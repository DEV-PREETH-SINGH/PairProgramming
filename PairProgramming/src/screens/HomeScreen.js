// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import UserListScreen from './UserListScreen'; // Import UserListScreen
import ChatListScreen from './ChatListScreen'; // Import ChatScreen
import ProfileEditScreen from './ProfileEditScreen';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const [uid, setUsername] = useState('Guest');

  // Fetch the current user information
  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUsername(user.uid || 'Guest');
    }
  }, []);

  const handleStartToday = async () => {
    try {
      console.log('Username:', uid);

      // Send a POST request to your backend to save the user's "Start Today" click
      await axios.post('http://192.168.68.65:5000/start-today', { uid });

      // Navigate to UserListScreen after success
      navigation.navigate('UserList');
    } catch (error) {
      console.error('Error sending user data:', error);
    }
  };

  return (
    <Tab.Navigator>
      {/* User List Tab */}
      {/* <Tab.Screen
        name="UserList"
        component={UserListScreen}
        options={{ tabBarLabel: 'User List' }}
      /> */}



      {/* Welcome screen */}
      <Tab.Screen
        name="Welcome"
        component={() => (
          <View style={styles.container}>
            <Text style={styles.header}>Welcome to the Home Screen, {uid}!</Text>

            {/* Log out button */}
            <Button
              title="Log out"
              onPress={() => {
                auth().signOut(); // Sign out the user
                navigation.replace('Login'); // Redirect to the login screen
              }}
            />

            {/* Start Today Button */}
            <TouchableOpacity
              style={styles.startTodayButton}
              onPress={handleStartToday} // Call handleStartToday when pressed
            >
              <Text style={styles.startTodayText}>Start Today</Text>
            </TouchableOpacity>
          </View>
        )}
        options={{ tabBarLabel: 'Home' }}
      />

      {/* Chat Tab */}
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{ tabBarLabel: 'Chats' }}
      />

      <Tab.Screen
        name="ProfileEditScreen"
        component={ProfileEditScreen}
        options={{tabBarLabel:'Profile'}}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startTodayButton: {
    marginTop: 20,
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  startTodayText: {
    color: 'white',
    fontSize: 18,
  },
});

export default HomeScreen;
