// UserListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth'; // Correct Firebase import

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch user list from the backend
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        // Get the UID of the current user from Firebase Auth
        const currentUserUID = auth().currentUser?.uid; // Ensure it’s correctly fetched

        if (!currentUserUID) {
          throw new Error('No user is currently logged in');
        }

        console.log('Current User UID:', currentUserUID); // Debugging line

        // Make sure the IP address is correct (replace with your server's local IP)
        const response = await axios.get(`http://192.168.68.80:5000/get-users?uid=${currentUserUID}`);

        setUsers(response.data.users); // Set the fetched users to state
      } catch (err) {
        setError('Error fetching user list');
        console.error(err);
      }
    };

    fetchUserList();
  }, []); 

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>User List for Today</Text>
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id.toString()} // Assuming MongoDB uses ObjectId for unique user ID
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.userText}>{item.username}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.text}>No users have clicked "Start Today" yet.</Text>
      )}
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
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userText: {
    fontSize: 18,
  },
});

export default UserListScreen;
