import {baseUrl} from "@env";
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import Swiper from 'react-native-deck-swiper';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);

  // Call the start-today API when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const callStartTodayAPI = async () => {
        try {
          const currentUserUID = auth().currentUser?.uid;
          if (!currentUserUID) {
            console.error('No user is currently logged in');
            return;
          }
          
          const response = await axios.post(`${baseUrl}/start-today`, {
            uid: currentUserUID
          });
          console.log('Start Today API response:', response.data);
        } catch (error) {
          console.error('Error calling Start Today API:', error);
        }
      };
      
      callStartTodayAPI();
    }, [])
  );

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

  // Handle when all cards are swiped
  const handleAllSwiped = () => {
    // Reset the swiper to start from the first card again
    if (swiperRef.current && users.length > 0) {
      swiperRef.current.jumpToCardIndex(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.topBar}>
        <ChevronLeft size={30} color="#aaa" onPress={() => navigation.goBack()} />
        <Text style={styles.heading}>CodeBuddies for Today</Text>
      </View> */}

      {users.length > 0 ? (
        <Swiper
          ref={swiperRef}
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
          onSwipedAll={handleAllSwiped}
          cardIndex={0}
          backgroundColor={'transparent'}
          stackSize={3}
          infinite={true}
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
    backgroundColor: "#f0f7ff",
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  userCard: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%', // Equal spacing from top and bottom
    borderRadius: 10,
    marginTop:-40,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  nameContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20, // Name on the left side
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  noUsersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUsersText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});

export default UserListScreen;

//going to work on 5)