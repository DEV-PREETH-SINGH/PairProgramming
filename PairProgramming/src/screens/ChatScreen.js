import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { ChevronLeft,Send } from 'lucide-react-native';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [otherUserName, setOtherUserName] = useState('');


  const currentUserUID = auth().currentUser?.uid;
  const { otherUserUID } = route.params;
  const { userUID } = route.params;

  const extractedOtherUserUID = otherUserUID?.uid || otherUserUID || userUID;
  const chatContainerRef = useRef();  // Reference for auto-scrolling

  useEffect(() => {
    const fetchOtherUserName = async () => {
      try {
        const response = await axios.get('http://192.168.68.50:5000/api/users/get-username', {
          params: { userUID: extractedOtherUserUID }
        });
        setOtherUserName(response.data.username);
        console.log(response.data.username);
        console.log(extractedOtherUserUID);
        //console.log(data);// Assuming response contains a 'name' field
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchOtherUserName();
  }, [extractedOtherUserUID]);

//console.log(otherUserName)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://192.168.68.50:5000/api/messages/get-messages', {
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
        setError('Error fetching messages');
      }
    };

    fetchMessages();
  }, [currentUserUID, extractedOtherUserUID]); 

  // Handle sending a message
  const handleSendMessage = async () => {
    if (messageText.trim() === '') return; // Prevent sending empty messages
  
    const tempMessage = {
      _id: new Date().toISOString(), // Temporary ID to uniquely identify the message
      senderUID: currentUserUID,
      receiverUID: extractedOtherUserUID,
      message: messageText,
      timestamp: new Date().toISOString(),
      isTemp: true, // Mark this as temporary
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setMessageText(''); // Clear the input field

    try {
      const response = await axios.post('http://192.168.68.50:5000/api/messages/send-message', {
        senderUID: currentUserUID,
        receiverUID: extractedOtherUserUID,
        message: messageText,
      });

      if (response.status === 201) {
        const savedMessage = response.data.data;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.isTemp && msg._id === tempMessage._id
            ? { ...msg, error: 'Failed to send' }
            : msg
        )
      );

      setError('Failed to send message');
    }
  };

  const RenderMessageItem = React.memo(({ item }) => {
    if (!item || !item.message || !item.senderUID || item.message === '') {
      return null; // Skip rendering if the item is invalid
    }

    return (
      <View
        style={[
          styles.messageItem,
          item.senderUID === currentUserUID ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
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
      <FlatList style={styles.renderingMessageBox}
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
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Send  size={24} color="#949494" />
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
    // padding: 20,
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
    backgroundColor: 'grey', // Updated to grey background
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
    flex: 0.8, // Takes up 80% of the width
    paddingLeft: 10,
  },
  sendButton: {
    flex: 0.2, // Takes up 20% of the width
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

export default ChatScreen;
