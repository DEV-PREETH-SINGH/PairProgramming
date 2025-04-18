import { baseUrl } from "@env";
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { MessageCircle, Clock } from 'lucide-react-native';
import { io } from "socket.io-client";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get('window');

// Skeleton component for chat item
const SkeletonChatItem = () => {
  // Animation value for shimmer effect
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    
    shimmerAnimation.start();
    
    return () => {
      shimmerAnimation.stop();
    };
  }, []);

  // Interpolate for shimmer animation
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.userItem}>
      {/* Skeleton for profile picture */}
      <View style={styles.skeletonProfilePic}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </View>
      
      {/* Skeleton for text content */}
      <View style={styles.userInfo}>
        <View style={styles.skeletonTextContainer}>
          <View style={styles.skeletonUsername}>
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />
          </View>
          <View style={styles.skeletonSubtext}>
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />
          </View>
        </View>
      </View>
      
      {/* Skeleton for icon */}
      <View style={styles.skeletonIcon}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </View>
    </View>
  );
};

const ChatListScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [partnerUID, setPartnerUID] = useState(null);
  const [streakCount, setStreakCount] = useState(null);
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState({});
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
      // Update unread message status
      if (data.receiverId === currentUserUID) {
        setUnreadMessages(prev => ({
          ...prev,
          [data.senderId]: true
        }));
        
        // Update last message timestamp
        setLastMessageTimestamps(prev => ({
          ...prev,
          [data.senderId]: new Date().toISOString()
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

  // Function to fetch last message timestamps
  const fetchLastMessageTimestamps = async () => {
    if (!currentUserUID) return;
    try {
      const response = await axios.get(`${baseUrl}/api/messages/last-timestamps`, {
        params: { userId: currentUserUID },
      });
      setLastMessageTimestamps(response.data);
    } catch (error) {
      console.error("Error fetching last message timestamps:", error);
    }
  };

  // Function to fetch streak count
  const fetchStreakCount = async () => {
    if (!currentUserUID || !partnerUID) return;
    
    try {
      const response = await axios.post(`${baseUrl}/api/messages/check-streak`, {
        userAUID: currentUserUID
      });
      
      
      setStreakCount(response.data.streakCount);
      //setStreakCount(10);
      
      // Optional: Handle already updated today scenario
      if (response.data.alreadyUpdatedToday) {
        console.log('Streak already updated today');
      } else {
        console.log("Streak newly updated");
      }
    } catch (error) {
      console.error('Error fetching streak count:', error);
      setStreakCount(0);
    }
  };

  // Main data fetching function
  const fetchAllData = async () => {
    if (!currentUserUID) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("ChatList: Refreshing data");
      
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
      
      // Fetch last message timestamps
      await fetchLastMessageTimestamps();
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAllData();
      
      return () => {
        // Cleanup if needed
      };
    }, [currentUserUID])
  );

  // Update streak count whenever partnerUID changes
  useEffect(() => {
    if (partnerUID) {
      fetchStreakCount();
    }
  }, [partnerUID]);

  // Function to sort users by last message timestamp
  const getSortedUsers = () => {
    if (!chatUsers || chatUsers.length === 0) return [];
    
    return [...chatUsers].sort((a, b) => {
      const timestampA = lastMessageTimestamps[a._id] || '1970-01-01T00:00:00.000Z';
      const timestampB = lastMessageTimestamps[b._id] || '1970-01-01T00:00:00.000Z';
      
      // Sort in descending order (newest first)
      return new Date(timestampB) - new Date(timestampA);
    });
  };

  // Format time for display
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the message is from today
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if the message is from yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Return the date for older messages
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

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

  // Render component
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Skeleton loading screen */}
        <FlatList
          data={[1, 2, 3, 4, 5]} // Create 5 skeleton items
          keyExtractor={(item) => `skeleton-${item}`}
          renderItem={() => <SkeletonChatItem />}
        />
      </View>
    );
  }

  if (chatUsers.length === 0) {
    return (
      <View style={styles.noChatContainer}>
        <LinearGradient
          colors={['#bc93ed', '#8b4ad3']}
          style={styles.emptyStateCard}
        >
          <Image
            source={require('../assets/CONVERSATION.png')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyStateTitle}>No conversations yet</Text>
          <Text style={styles.emptyStateText}>
            Find your perfect coding partner and start chatting!
          </Text>
          
          <TouchableOpacity 
            style={styles.findPartnersButton}
            onPress={() => navigation.navigate('UserList')}
          >
            <Text style={styles.findPartnersButtonText}>Find Coding Partners</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={getSortedUsers()}
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
                  <Text style={styles.partnerLabel}>CodeBuddy</Text>
                )}
              </View>
              
              {streakCount !== null && partnerUID === item._id && (
                <Text style={styles.streakText}>Streak: {streakCount} 🔥</Text>
              )}
            </View>

            <View style={styles.messageContainer}>
              {lastMessageTimestamps[item._id] && (
                <Text style={styles.messageTime}>
                  {formatMessageTime(lastMessageTimestamps[item._id])}
                </Text>
              )}
              {unreadMessages[item._id] && <View style={styles.unreadDot} />}
              <MessageCircle size={24} color="black" style={styles.icon} />
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
  // Skeleton styles
  skeletonProfilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
    marginRight: 16,
    overflow: 'hidden',
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonUsername: {
    height: 18,
    width: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  skeletonSubtext: {
    height: 14,
    width: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginLeft: 'auto',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  userItem: {
    flexDirection: 'row', 
    padding: 16,
    backgroundColor: "#d5bdf5",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    color:'black',
  },
  partnerLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: 'white',
    backgroundColor: '#8b4ad3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 13,
    color: 'black',
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
    backgroundColor: "white",
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
  emptyStateCard: {
    width: '90%',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    //elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyImage: {
    width: 200,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  findPartnersButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 25,
    //elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  findPartnersButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b4ad3',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'right',
  },
});

export default ChatListScreen;