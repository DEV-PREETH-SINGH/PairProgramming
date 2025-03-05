// ChatListScreen.js (React Native)
import {baseUrl} from "@env";
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity,Image,Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { ChevronLeft,MessageCircle } from 'lucide-react-native';

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
      // const baseUrl = process.env.BASE_URL || 'http://192.168.68.50:5000'; // Default to localhost for development
      const response = await axios.get(`${baseUrl}/get-chat-users`, {
        params: { uid: currentUserUID }
      });

      setChatUsers(response.data);
      console.log(response.data); // Log the data to check

      if (response.data.length === 0) {
        console.log('No chat users found');
      }

      setChatUsers(response.data); // Set the chat users from the response
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
    return (
      <View style={styles.noChatContainer}>
        <Image
                  source={require('../assets/StartConversation.jpg')} // Replace with your image URL
                  style={styles.emptyImage}
                />
        <Text style={styles.noChatText} >No chats yet? Say hi to someone!</Text>
      </View>
    );
  }

    return (
    <View style={styles.container}>
      
      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => navigateToChat(item._id)}>
            
            <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
            <Text style={styles.userName}>{item.username}</Text> 
            
            <MessageCircle size={20} color="#000" style={styles.icon} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    // backgroundColor:'white',
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row', // Align profile pic, username, and icon horizontally
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center', // Align items vertically
    justifyContent: 'space-between', // Space out items: profile pic + username on the left, icon on the right
  },
  profilePic: {
    width: 50, // Size of the profile picture
    height: 50,
    borderRadius: 25, // Make the profile picture circular
    marginRight: 10, // Space between profile picture and username
  },
  userName: {
    fontSize: 18,
  },
  icon: {
    marginLeft: 'auto', // Push the icon to the right side of the container
  },
  noChatContainer: {
    backgroundColor:'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatText: {
    fontSize: 18,
    color: '#888', // Customize the color as needed
  },
  emptyImage: {
    width: 250,
    height: 150,
    marginBottom: 20,
  },
});
export default ChatListScreen;
