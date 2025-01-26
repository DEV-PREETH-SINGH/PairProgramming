// HomeScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState(auth().currentUser.displayName || 'Guest');

  const handleStartToday = async () => {
    try {
      console.log(username)
      await axios.post('http://192.168.68.85:5000/start-today', { username });
      navigation.navigate('UserList'); // Navigate to UserListScreen after success
    } catch (error) {
      console.error('Error sending user data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to the Home Screen!</Text>
      
      <Button
        title="Log out"
        onPress={() => {
          auth().signOut(); // Sign out the user
          navigation.replace('Login'); // Redirect to login screen
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
