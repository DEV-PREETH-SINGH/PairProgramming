import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client'; // Import socket.io-client
import auth from '@react-native-firebase/auth';
import { ChevronLeft, Send, User } from 'lucide-react-native';
import { baseUrl } from '@env';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const [otherUserPic, setOtherUserPic] = useState(null);
  const [socket, setSocket] = useState(null);

  const currentUserUID = auth().currentUser?.uid;
  const { otherUserUID, userUID } = route.params;
  const extractedOtherUserUID = otherUserUID?.uid || otherUserUID || userUID;
  const chatContainerRef = useRef();

  const [placeholder, setPlaceholder] = useState('Type a message...');
  const placeholderCycleRef = useRef(null);

    // Placeholder cycling effect
    useEffect(() => {
      const placeholderMessages = [
        'Type a message...',
        './addbuddy to send request',
        './acceptbuddy to accept request',
      ];
      let currentIndex = 0;
  
      const cyclePlaceholder = () => {
        currentIndex = (currentIndex + 1) % placeholderMessages.length;
        setPlaceholder(placeholderMessages[currentIndex]);
      };
  
      // Start placeholder cycling
      placeholderCycleRef.current = setInterval(cyclePlaceholder, 3000);
  
      // Clean up interval on component unmount
      return () => {
        if (placeholderCycleRef.current) {
          clearInterval(placeholderCycleRef.current);
        }
      };
    }, []);

  // Establish WebSocket connection
  useEffect(() => {
    // Create socket connection
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    // Join a room specific to this chat
    newSocket.emit('joinChat', { 
      user1: currentUserUID, 
      user2: extractedOtherUserUID 
    });

    // Listen for new messages
    newSocket.on('newMessage', (newMessage) => {
      // Only add message if it's related to current chat
      if (
        (newMessage.senderUID === extractedOtherUserUID && newMessage.receiverUID === currentUserUID) ||
        (newMessage.senderUID === currentUserUID && newMessage.receiverUID === extractedOtherUserUID)
      ) {
        setMessages((prevMessages) => {
          // Avoid duplicates
          const isDuplicate = prevMessages.some(msg => msg._id === newMessage._id);
          return isDuplicate ? prevMessages : [...prevMessages, newMessage];
        });
      }
    });

    // Clean up the WebSocket connection when component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, [currentUserUID, extractedOtherUserUID]);

  // Fetch other user's name and profile picture
  useEffect(() => {
    const fetchOtherUserData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/users/${extractedOtherUserUID}`);
        setOtherUserName(response.data.username);
        setOtherUserPic(response.data.profilePic);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchOtherUserData();
  }, [extractedOtherUserUID]);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/messages/get-messages`, {
          params: { user1: currentUserUID, user2: extractedOtherUserUID },
        });
        const validMessages = response.data.messages?.filter(
          (msg) => msg.senderUID && msg.message
        ) || [];

        setMessages(validMessages);

        // Auto-scroll to bottom when messages are fetched
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollToEnd({ animated: true });
        }

      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [currentUserUID, extractedOtherUserUID]);

  const handleSendMessage = () => {
    if (messageText.trim() === '') return;

    // Create message object for both regular and special messages
    const newMessage = {
      _id: new Date().toISOString(),
      senderUID: currentUserUID,
      receiverUID: extractedOtherUserUID,
      message: messageText,
      timestamp: new Date().toISOString(),
      isTemp: true,
    };

    // Check for special commands
    if (messageText.trim() === './addbuddy' || messageText.trim() === './acceptbuddy') {
      // Add special messages to UI immediately
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      
      try {
        const apiUrl = messageText.trim() === './addbuddy' 
          ? `${baseUrl}/api/messages/send-special`
          : `${baseUrl}/api/messages/accepted`;

        axios.post(apiUrl, {
          senderUID: currentUserUID,
          receiverUID: extractedOtherUserUID,
          message: messageText, // Also send the message text to store in database
        })
        .then(response => {
          if (response.status === 201) {
            console.log('API call successful:', response.data);
            // Update the temp message to remove isTemp flag
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.isTemp && msg._id === newMessage._id
                  ? { ...msg, isTemp: false, _id: response.data.messageId || msg._id }
                  : msg
              )
            );
          }
        })
        .catch(err => {
          console.error('Error making API call:', err);
          // Mark message with error
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.isTemp && msg._id === newMessage._id
                ? { ...msg, error: 'Failed to send' }
                : msg
            )
          );
        });

        setMessageText('');
        return;
      } catch (err) {
        console.error('Error with special command:', err);
        return;
      }
    }

    // Reset the input field
    setMessageText('');

    // For regular messages, don't add them to UI immediately
    // Instead, rely on the socket to receive and add the message
    // This prevents duplicate messages
    if (socket) {
      socket.emit('sendMessage', {
        senderUID: currentUserUID,
        receiverUID: extractedOtherUserUID,
        message: messageText,
      }, (response) => {
        if (response?.error) {
          console.error('Error sending message via socket:', response.error);
        }
      });
    }
  };

  // const RenderMessageItem = React.memo(({ item }) => {
  //   return (
  //     <View
  //       style={[
  //         styles.messageItem,
  //         item.senderUID === currentUserUID ? styles.sentMessage : styles.receivedMessage,
  //       ]}
  //     >
  //       <Text style={styles.messageText}>{item.message}</Text>
  //       {item.error && <Text style={styles.errorText}>{item.error}</Text>}
  //     </View>
  //   );
  // });

  const RenderMessageItem = React.memo(({ item }) => {
    // Check if it's a special message
    const isSpecialMessage = item.message === './addbuddy' || item.message === './acceptbuddy' || item.message === './addbuddy ' || item.message === './acceptbuddy ';
    
  
    return (
      <View
        style={[
          styles.messageItem,
          item.senderUID === currentUserUID ? styles.sentMessage : styles.receivedMessage,
          isSpecialMessage && styles.specialMessage, // Apply special message style
        ]}
      >
        <Text style={[styles.messageText, isSpecialMessage && styles.specialMessageText]}>
          {item.message}
        </Text>
        {item.error && <Text style={styles.errorText}>{item.error}</Text>}
      </View>
    );
  });
  
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={30} color="white" />
        </TouchableOpacity>
        
        <View style={styles.userInfoContainer}>
          {otherUserPic ? (
            <Image source={{ uri: otherUserPic }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePicPlaceholder}>
              <User size={18} color="white" />
            </View>
          )}
          <Text style={styles.chatHeader}>{otherUserName}</Text>
        </View>
      </View>

      {/* Message list */}
      <FlatList
        style={styles.renderingMessageBox}
        ref={chatContainerRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <RenderMessageItem item={item} />}
        onContentSizeChange={() => {
          chatContainerRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* Input and Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder={placeholder}
          placeholderTextColor="#888"

        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Send size={24} color="#949494" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#faf6fe',
    flex: 1,
    justifyContent: 'flex-end',
  },
  specialMessage: {
    backgroundColor: '#8b4ad3', // Light background color for special messages
  },
  specialMessageText: {
    color: 'white', // Red font color for special messages
    fontWeight: 'bold', // Optionally make the text bold for special messages
  },
  topBar: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    backgroundColor: '#8b4ad3',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
  },
  chatHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  profilePicPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  renderingMessageBox:{
    padding:10,
  },
  messageItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    maxWidth: '80%',
    backgroundColor: '#d5bdf5',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d5bdf5',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f2ebfc',
  },
  messageText: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    flex: 0.8,
    paddingLeft: 10,
  },
  sendButton: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

export default ChatScreen;