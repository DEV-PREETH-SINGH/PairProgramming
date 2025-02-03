import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth'; // Correct Firebase import

const UserListScreen = ({ navigation }) => {
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

        // console.log('Current User UID:', currentUserUID); // Debugging line

        // Make sure the IP address is correct (replace with your server's local IP)
        const response = await axios.get(`http://192.168.68.63:5000/get-users?uid=${currentUserUID}`);

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

  const handleChatPress = (otherUserUID) => {
    // Navigate to the Chat screen, passing the other user's UID as a parameter
    navigation.navigate('Chat', { otherUserUID });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>User List for Today</Text>
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid.toString()} // Assuming each user has a 'uid'
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.userText}>{item.username}</Text>
              <Button
                title="Chat"
                onPress={() => handleChatPress(item.uid)} // Pass the other user's UID instead of _id
              />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  userText: {
    fontSize: 18,
    flex: 1,
  },
});

export default UserListScreen;
