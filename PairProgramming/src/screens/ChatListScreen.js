import { baseUrl } from "@env";
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';

const ChatListScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerUID, setPartnerUID] = useState(null); // State to store partner UID
  const [streakCount, setStreakCount] = useState(null); // State to store streak count
  const navigation = useNavigation();
  const currentUserUID = auth().currentUser?.uid; // Get current user UID

  useEffect(() => {
    const fetchPartnerUID = async () => {
      if (!currentUserUID) {
        console.error('User UID is not available');
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/get-partner`, {
          params: { uid: currentUserUID },
        });
        setPartnerUID(response.data.partnerUID); // Assuming response contains partner UID
        console.log("FROM FRONTEND:", response.data.partnerUID);
      } catch (error) {
        console.error('Error fetching partner UID:', error);
      }
    };

    const fetchChatUsers = async () => {
      if (!currentUserUID) {
        console.error('User UID is not available');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/get-chat-users`, {
          params: { uid: currentUserUID },
        });

        setChatUsers(response.data);
        console.log(response.data); // Log the data to check

        if (response.data.length === 0) {
          console.log('No chat users found');
        }

      } catch (error) {
        console.error('Error fetching chat users:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStreak = async () => {
      if (!partnerUID) return;

      try {
        const response = await axios.post(`${baseUrl}/api/messages/check-streak`, { userAUID: currentUserUID });
        setStreakCount(response.data.streakCount); // Set streak count from API response
      } catch (error) {
        console.error('Error fetching streak:', error);
      }
    };

    fetchPartnerUID(); // Fetch partner UID
    fetchChatUsers(); // Fetch chat users
    fetchStreak(); // Fetch streak count

  }, [currentUserUID, partnerUID]);

  const navigateToChat = (userUID) => {
    console.log("Navigating to chat with user:", userUID);
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
        <Text style={styles.noChatText}>No chats yet? Say hi to someone!</Text>
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
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{item.username}</Text>
              {/* Display "My Partner" if the user is the current user's partner */}
              {partnerUID && partnerUID === item._id && (
                <Text style={styles.partnerLabel}>My Partner</Text>
              )}
            </View>
            {streakCount !== null && partnerUID === item._id && (
              <Text style={styles.streakText}>My Streak: {streakCount}</Text> // Display streak count
            )}
            <MessageCircle size={20} color="#000" style={styles.icon} />
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
    flexDirection: 'row', 
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
  },
  partnerLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#888',
  },
  streakText: {
    fontSize: 14,
    color: '#4CAF50', // Green color for streak text
  },
  icon: {
    marginLeft: 'auto', 
  },
  noChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatText: {
    fontSize: 18,
    color: '#888',
  },
  emptyImage: {
    width: 250,
    height: 150,
    marginBottom: 20,
  },
});

export default ChatListScreen;
