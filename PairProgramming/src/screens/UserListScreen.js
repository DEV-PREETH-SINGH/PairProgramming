import {baseUrl} from "@env";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Swiper from 'react-native-deck-swiper';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';

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

  const handleSwipedRight = (index) => {
    const user = users[index];
    handleChatPress(user.uid); // Navigate to chat screen
  };

  const handleSwipedLeft = () => {
    // Logic to handle swiping left (skip user)
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <ChevronLeft size={30} color="#aaa" onPress={() => navigation.goBack()} />
        <Text style={styles.heading}>CodeBuddies for Today</Text>
      </View>

      {users.length > 0 ? (
        <Swiper
          cards={users}
          renderCard={(user) => (
            <View style={styles.userCard}>
              <Image
                source={{ uri: user.profilePic || 'https://i.pinimg.com/736x/44/84/b6/4484b675ec3d56549907807fccf75b81.jpg' }}
                style={styles.profilePic}
              />
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{user.username}</Text>
              </View>
            </View>
          )}
          onSwipedRight={handleSwipedRight}
          onSwipedLeft={handleSwipedLeft}
          cardIndex={0}
          backgroundColor={'transparent'}
          stackSize={3}
        />
      ) : (
        <View style={styles.noUsersContainer}>
          <Image source={require('../assets/No_user.jpg')} style={styles.emptyImage} />
          <Text style={styles.noUsersText}>Looks like the place is empty, </Text>
          <Text style={styles.noUsersText}>check back soon.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
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
    paddingRight: 50,
    flex: 1,
    textAlign: 'center',
  },
  userCard: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%', // Take up most of the screen
    borderRadius: 10,
  },
  profilePic: {
    width: '100%', // Full width of the screen
    height: '100%', // Full height of the screen
    borderRadius: 10,
  },
  nameContainer: {
    position: 'absolute',
    bottom: 20, // Position the name at the bottom of the card
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
