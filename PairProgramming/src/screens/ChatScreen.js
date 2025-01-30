import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');

  const currentUserUID = auth().currentUser?.uid;
  const { otherUserUID } = route.params;

  const extractedOtherUserUID = otherUserUID?.uid || otherUserUID;
  const chatContainerRef = useRef();  // Reference for auto-scrolling

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://192.168.141.29:5000/api/messages/get-messages', {
          params: { user1: currentUserUID, user2: extractedOtherUserUID },
        });

        const validMessages = response.data.messages?.filter(
          (msg) => msg.senderUID && msg.message
        ) || [];

        console.log('Fetched messages:', validMessages);  // Log fetched messages

        setMessages(validMessages);

        // Auto-scroll to bottom when messages are fetched
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollToEnd({ animated: true });
        }

      } catch (err) {
        setError('Error fetching messages');
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [currentUserUID, extractedOtherUserUID]); // Dependency array to trigger fetch when UIDs change

  // Handle sending a message
  const handleSendMessage = async () => {
    if (messageText.trim() === '') return; // Prevent sending empty messages
  
    // Create a temporary message for optimistic UI updates
    const tempMessage = {
      _id: new Date().toISOString(), // Temporary ID to uniquely identify the message
      senderUID: currentUserUID,
      receiverUID: extractedOtherUserUID,
      message: messageText,
      timestamp: new Date().toISOString(),
      isTemp: true, // Mark this as temporary
    };
  
    // Update the UI immediately with the temporary message
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setMessageText(''); // Clear the input field
  
    try {
      // Send the message to the backend
      const response = await axios.post('http://192.168.141.29:5000/api/messages/send-message', {
        senderUID: currentUserUID,
        receiverUID: extractedOtherUserUID,
        message: messageText,
      });
  
      if (response.status === 201) {
        const savedMessage = response.data.data; // Access saved message from the response
  
        // Replace the temporary message with the backend-confirmed message
        // setMessages((prevMessages) =>
        //   prevMessages.map((msg) =>
        //     msg.isTemp && msg._id === tempMessage._id ? savedMessage : msg
        //   )
        // );
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
  
      // Mark the temporary message as failed
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
    // Log the item to see if it's valid
    console.log('Rendering message item:', item);
  
    // Check if the item is valid
    if (!item || !item.message || !item.senderUID || item.message === '') {
      console.error("Invalid message item:", item); // Log invalid item
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
      <Text style={styles.text}>Chat with {extractedOtherUserUID}</Text>

      {/* Message list */}
      <FlatList
        ref={chatContainerRef} // Reference for auto-scrolling
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <RenderMessageItem item={item} />}
        onContentSizeChange={() => {
          chatContainerRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* Input and Send Button */}
      <TextInput
        style={styles.input}
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#cce5ff',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
});

export default ChatScreen;
