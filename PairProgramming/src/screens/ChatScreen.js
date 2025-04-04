import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client'; // Import socket.io-client
import auth from '@react-native-firebase/auth';
import { ChevronLeft, Send } from 'lucide-react-native';
import { baseUrl } from '@env';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
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
        './send to send request',
        './accepted to accept request',
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

  // Fetch other user's name
  useEffect(() => {
    const fetchOtherUserName = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/users/get-username`, {
          params: { userUID: extractedOtherUserUID }
        });
        setOtherUserName(response.data.username);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchOtherUserName();
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

    // Check for special commands
    if (messageText.trim() === './send' || messageText.trim() === './accepted') {
      try {
        const apiUrl = messageText.trim() === './send' 
          ? `${baseUrl}/api/messages/send-special`
          : `${baseUrl}/api/messages/accepted`;

        axios.post(apiUrl, {
          senderUID: currentUserUID,
          receiverUID: extractedOtherUserUID,
        }).then(response => {
          if (response.status === 201) {
            console.log('API call successful:', response.data);
          }
        }).catch(err => {
          console.error('Error making API call:', err);
        });

        setMessageText('');
        return;
      } catch (err) {
        console.error('Error with special command:', err);
        return;
      }
    }

    // Prepare message object
    const newMessage = {
      _id: new Date().toISOString(),
      senderUID: currentUserUID,
      receiverUID: extractedOtherUserUID,
      message: messageText,
      timestamp: new Date().toISOString(),
      isTemp: true,
    };

    // Optimistically add message to UI
    // setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessageText('');

    // Send message via socket
    if (socket) {
      socket.emit('sendMessage', {
        senderUID: currentUserUID,
        receiverUID: extractedOtherUserUID,
        message: messageText,
      }, (response) => {
        if (response?.error) {
          // Handle send error
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.isTemp && msg._id === newMessage._id
                ? { ...msg, error: 'Failed to send' }
                : msg
            )
          );
        }
      });
    }
  };

  const RenderMessageItem = React.memo(({ item }) => {
    return (
      <View
        style={[
          styles.messageItem,
          item.senderUID === currentUserUID ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        {item.error && <Text style={styles.errorText}>{item.error}</Text>}
      </View>
    );
  });

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={30} color="#aaa" />
        </TouchableOpacity>
        <Text style={styles.chatHeader}>Chat with {otherUserName}</Text>
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
    backgroundColor:'white',
    flex: 1,
    justifyContent: 'flex-end',
  },
  topBar: {
    padding:20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom:15,
    backgroundColor: 'white',
    marginBottom:20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  renderingMessageBox:{
    padding:10,
  },
  chatHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    paddingRight:50,
    flex: 1,
    textAlign: 'center',
  },
  messageItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    maxWidth: '80%',
    backgroundColor: 'grey',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d6d6d6',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#d6d6d6',
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