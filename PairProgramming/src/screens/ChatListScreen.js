import { baseUrl } from "@env";
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { MessageCircle } from 'lucide-react-native';
import { io } from "socket.io-client";

const ChatListScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [partnerUID, setPartnerUID] = useState(null);
  const [streakCount, setStreakCount] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const currentUserUID = auth().currentUser?.uid;
  
  useEffect(() => {
    // Only create socket if user is logged in
    if (!currentUserUID) return;

    // Initialize socket for receiving notifications
    const socket = io(baseUrl, {
      transports: ['websocket'],
      reconnection: true
    });
    
    // Socket connection handler
    socket.on("connect", () => {
      console.log("ChatList: Connected to WebSocket server");
      socket.emit('userConnected', { userId: currentUserUID });
    });
    
    // New message handler
    const handleNewMessage = (data) => {
      // Only update unread if the message is for the current user 
      // and not already read
      if (data.receiverId === currentUserUID) {
        setUnreadMessages(prev => ({
          ...prev,
          [data.senderId]: true
        }));
      }
    };
    
    socket.on("newMessage", handleNewMessage);
    
    // Cleanup socket on unmount
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [currentUserUID]);

  // Function to fetch and reset unread messages
  const fetchUnreadMessages = async () => {
    if (!currentUserUID) return;
    try {
      const response = await axios.get(`${baseUrl}/get-unread-messages`, {
        params: { uid: currentUserUID },
      });
      setUnreadMessages(response.data);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserUID) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch partner UID
        const partnerResponse = await axios.get(`${baseUrl}/get-partner`, {
          params: { uid: currentUserUID },
        });
        setPartnerUID(partnerResponse.data.partnerUID);

        // Fetch chat users
        const usersResponse = await axios.get(`${baseUrl}/get-chat-users`, {
          params: { uid: currentUserUID },
        });
        setChatUsers(usersResponse.data);

        // Fetch unread messages
        await fetchUnreadMessages();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserUID]);

  useEffect(() => {
    const fetchStreakCount = async () => {
      if (!currentUserUID || !partnerUID) return;
      
      try {
        const response = await axios.post(`${baseUrl}/api/messages/check-streak`, {
          userAUID: currentUserUID
        });
        
        setStreakCount(response.data.streakCount);
        
        // Optional: Handle already updated today scenario
        if (response.data.alreadyUpdatedToday) {
          console.log('Streak already updated today');
        }else{
          console.log("nope")
        }
      } catch (error) {
        console.error('Error fetching streak count:', error);
        setStreakCount(0);
      }
    };
  
    fetchStreakCount();
  }, [currentUserUID, partnerUID]);

  const navigateToChat = async (userUID) => {
    try {
      // Make API call to mark messages as read
      await axios.post(`${baseUrl}/api/messages/mark-as-read`, {
        userId: currentUserUID,
        chatPartnerId: userUID
      });
  
      // Remove unread status locally
      setUnreadMessages(prev => ({
        ...prev,
        [userUID]: false
      }));
      
      // Navigate to chat screen
      navigation.navigate('Chat', { 
        userUID,
        currentUserUID
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      
      // Fallback navigation in case of API error
      navigation.navigate('Chat', { 
        userUID,
        currentUserUID
      });
    }
  };

  // Rest of the component remains the same as your original implementation

  // Render component
  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (chatUsers.length === 0) {
    return (
      <View style={styles.noChatContainer}>
        <Image
          source={require('../assets/CONVERSATION.png')}
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
            <View style={styles.userInfo}>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{item.username}</Text>
                {partnerUID && partnerUID === item._id && (
                  <Text style={styles.partnerLabel}>My Partner</Text>
                )}
              </View>
              
              {streakCount !== null && partnerUID === item._id && (
                <Text style={styles.streakText}>Streak: {streakCount} 🔥</Text>
              )}
            </View>

            <View style={styles.messageContainer}>
              {unreadMessages[item._id] && <View style={styles.unreadDot} />}
              <MessageCircle size={24} color="white" style={styles.icon} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  userItem: {
    flexDirection: 'row', 
    padding: 16,
    backgroundColor: "#8b4ad3",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevation: 2,
    alignItems: 'center', 
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color:'white',
  },
  partnerLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: 'white',
    backgroundColor: '#d5bdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  messageContainer: {
    position: 'relative',
    padding: 8,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#fff',
  },
  icon: {
    marginLeft: 'auto',
  },
  noChatContainer: {
    backgroundColor: "#f0f7ff",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noChatText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  emptyImage: {
    width: 250,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
});

export default ChatListScreen;