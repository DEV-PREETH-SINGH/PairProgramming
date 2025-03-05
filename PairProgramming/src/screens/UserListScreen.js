import {baseUrl} from "@env";
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Image ,TouchableOpacity} from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';


import { ChevronLeft,MessageCircle } from 'lucide-react-native';

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const currentUserUID = auth().currentUser?.uid;
        if (!currentUserUID) {
          throw new Error('No user is currently logged in');
        }

        console.log(currentUserUID)
        // const baseUrl = process.env.BASE_URL || 'http://192.168.68.50:5000'; // Default to localhost for development
        const response = await axios.get(`${baseUrl}/get-users?uid=${currentUserUID}`);
        setUsers(response.data.users);
      } catch (err) {
        setError('Error fetching user list');
        console.error(err);
      }
      
    };

    fetchUserList();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  const handleChatPress = (otherUserUID) => {
    navigation.navigate('Chat', { otherUserUID });
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <ChevronLeft 
          
          size={30}
          color="#aaa"
          onPress={() => navigation.goBack()} // Navigate to the previous screen
        />
        <Text style={styles.heading}>CodeBuddies for Today</Text>
      </View>

      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid.toString()}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Image
                source={{ uri: item.profilePic || 'https://i.pinimg.com/736x/44/84/b6/4484b675ec3d56549907807fccf75b81.jpg' }}
                style={styles.profilePic}
              />
              <Text style={styles.userText}>{item.username}</Text>
              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => handleChatPress(item.uid)}
              >
                <MessageCircle size={20} color="#000" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.noUsersContainer}>
        <Image
            source={require('../assets/No_user.jpg')} // Replace with your image URL
            style={styles.emptyImage}
          />
          <Text style={styles.noUsersText}>Looks like the place is empty, </Text>
          <Text style={styles.noUsersText}>check back soon.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:'white',
    flex: 1,
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    paddingRight:50,
    flex: 1,
    textAlign: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userText: {
    fontSize: 18,
    flex: 1,
  },
  noUsersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  noUsersText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});

export default UserListScreen;
