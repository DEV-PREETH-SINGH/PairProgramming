import {PORT} from "@env";
import {baseUrl} from "@env";

console.log('PORT:',PORT);
console.log('BASEURL',baseUrl);
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import UserListScreen from './UserListScreen';
import ChatListScreen from './ChatListScreen';
import ProfileEditScreen from './ProfileEditScreen';
import { House, MessageCircle, UserRoundPen } from 'lucide-react-native';
console.log(PORT); // Output: http://example.com/api


console.log('BASEURL',baseUrl);
console.log('BASEURL',PORT);

const fetchUsersTodayCount = async () => {
  try {
    // Use the imported BASE_URL variable
    const response = await axios.get(`${BASE_URL}/count-start-today`);
    setUsersTodayCount(response.data.count); // Update the count
    console.log(response.data.count);
  } catch (error) {
    console.error('Error fetching users today count:', error);
  }
};



const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const [uid, setUid] = useState('Guest');
  const [usersTodayCount, setUsersTodayCount] = useState(0); // Added state for count

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUid(user.uid || 'Guest');
    }

    // Fetch the number of users who started today
    fetchUsersTodayCount();
  }, []);

  const fetchUsersTodayCount = async () => {
    try {
      // const baseUrl = baseUrl ; // Default to localhost for developmentconst 
      console.log('THIS BASEURL',baseUrl,"/count-start-today");

      const response = await axios.get(`${baseUrl}/count-start-today`);
      console.log(baseUrl);
      console.log(response.data.count);
      setUsersTodayCount(response.data.count); // Update the count
      console.log(response.data.count);
    } catch (error) {
      console.error('Error fetching users today count:', error);
    }

  };

  const handleStartToday = async () => {
    try {
      console.log('Username:', uid);
      // const baseUrl = baseUrl ;
      
      await axios.post(`${baseUrl}/start-today`, { uid });
      fetchUsersTodayCount(); // Refresh count after pressing the button
      navigation.navigate('UserList');
    } catch (error) {
      console.error('Error sending user data:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // Remove labels
      }}
    >
      <Tab.Screen
        name="Home"
        component={() => (
          <View style={styles.container}>
            <Text style={styles.heading}>Welcome to Code Buddy</Text>
            <Text style={styles.text}>Ready to solve problems with your coding partner?</Text>
            
            <TouchableOpacity
              style={styles.startTodayButton}
              onPress={handleStartToday}
            >
              <Text style={styles.startTodayText}>Start Today</Text>
            </TouchableOpacity>

            {/* Show number of users who started today */}
            <Text style={styles.usersTodayText}>
              {usersTodayCount} user(s) have started today
            </Text>
          </View>
        )}
        options={{
          // headerShown: false,
          tabBarIcon: ({ color, size }) => <House size={20} color="#000" />,
        }}
      />

      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MessageCircle size={20} color="#000" />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileEditScreen}
        options={{
          tabBarIcon: ({ color, size }) => <UserRoundPen size={20} color="#000" />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor: 'white',
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  startTodayButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  startTodayText: {
    color: 'white',
    fontSize: 18,
  },
  usersTodayText: {
    marginTop: 10, // Space between button and text
    fontSize: 16,
    color: 'gray',
    // fontWeight: 'bold',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: 'white',
    paddingTop:'5',
    // marginBottom: 15,
    // marginHorizontal: 15,
    // borderRadius: 20,
    // elevation: 5,
    // borderWidth: 2, // Border thickness
    // borderColor: 'gray', // Border color
  },
});

export default HomeScreen;
