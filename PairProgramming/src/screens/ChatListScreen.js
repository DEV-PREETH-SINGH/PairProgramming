// ChatListScreen.js (React Native)
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity,Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const ChatListScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUserUID = auth().currentUser?.uid; // Replace with actual current user UID
console.log(currentUserUID)
  useEffect(() => {
    const fetchChatUsers = async () => {
      if (!currentUserUID) {
        console.error('User UID is not available');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://192.168.68.65:5000/get-chat-users', {
          params: { uid: currentUserUID }
        });
        console.log(currentUserUID)
        setChatUsers(response.data); // Set the chat users from the response
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching chat users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, [currentUserUID]);

  const navigateToChat = (userUID) => {
    console.log("another person userid",userUID)
    navigation.navigate('Chat', { userUID });
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (chatUsers.length === 0) {
    return <Text>No chat users found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => navigateToChat(item._id)}>
            <Text style={styles.userName}>{item._id}</Text>
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
