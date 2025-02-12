import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';

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
        const response = await axios.get(`http://192.168.67.29:5000/get-users?uid=${currentUserUID}`);
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
      <Text style={styles.text}>User List for Today</Text>
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
              <Button title="Chat" onPress={() => handleChatPress(item.uid)} />
            </View>
          )}
        />
      ) : (
        <Text style={styles.text}>No users have clicked "Start Today" yet.</Text>
      )}
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
});

export default UserListScreen;
