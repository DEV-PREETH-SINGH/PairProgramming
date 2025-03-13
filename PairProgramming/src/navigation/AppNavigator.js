import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator, View } from 'react-native';

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

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
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

  const initialRoute = user ? 'Home' : 'Login';

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
