import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ChatListScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const navigation = useNavigation();
  const currentUserUID = "currentUserUID"; // Replace with actual current user UID

  // Fetch distinct chat users from the backend
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const response = await axios.get('http://192.168.68.63:5000/get-chat-users', {
          params: { uid: currentUserUID }
        });
        setChatUsers(response.data); // Assuming the response is an array of user IDs
      } catch (error) {
        console.error('Error fetching chat users:', error);
      }
    };

    fetchChatUsers();
  }, []);

  // Navigate to the ChatScreen when a user is clicked
  const navigateToChat = (userUID) => {
    navigation.navigate('Chat', { receiverUID: userUID });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>

      {/* List of users */}
      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item._id} // Assuming each item has a unique _id
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => navigateToChat(item._id)}
          >
            <Text style={styles.userName}>{item._id}</Text> {/* Display the user UID for now */}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  userName: {
    fontSize: 18,
  },
});

export default ChatListScreen;
