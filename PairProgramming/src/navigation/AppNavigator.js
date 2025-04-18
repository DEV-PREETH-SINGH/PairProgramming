import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator, View } from 'react-native';
import axios from 'axios';
import { baseUrl } from "@env";

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import UserListScreen from '../screens/UserListScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileCompletionScreen from '../screens/ProfileCompletionScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import DSASheetListScreen from '../screens/DSASheetListScreen';

import Header from '../components/Header';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Check if user has a profile
        try {
          const response = await axios.get(`${baseUrl}/user/${authUser.uid}`);
          // If we can get user data, profile exists
          if (response.status === 200 && response.data) {
            // Check if essential profile data exists
            const profileData = response.data;
            if (profileData.username && profileData.leetcodeProfileId && profileData.profilePic) {
              setHasProfile(true);
            } else {
              setHasProfile(false);
            }
          } else {
            setHasProfile(false);
          }
        } catch (error) {
          // If API call fails, assume profile doesn't exist
          console.log('Error checking profile:', error);
          setHasProfile(false);
        }
      } else {
        // Explicitly set hasProfile to false when user is not authenticated
        setHasProfile(false);
      }
      
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Determine initial route based on authentication and profile status
  let initialRoute = 'Login';
  if (user) {
    initialRoute = hasProfile ? 'Home' : 'ProfileCompletion';
  } else {
    // Ensure we always go to Login when there's no authenticated user
    initialRoute = 'Login';
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          header: () => <Header uid={user?.uid} />, // Pass uid here
        }} 
      />
      <Stack.Screen name="UserList" component={UserListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileEditScreen" component={ProfileEditScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DSASheetList" component={DSASheetListScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
