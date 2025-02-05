import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import UserListScreen from '../screens/UserListScreen';
import ChatScreen from '../screens/ChatScreen'; // Import the ChatScreen
import ChatListScreen from '../screens/ChatListScreen'; // Import the ChatScreen
import ProfileCompletionScreen from '../screens/ProfileCompletionScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="UserList" component={UserListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} /> 
      <Stack.Screen name="ChatList" component={ChatListScreen} /> 
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} /> 
      <Stack.Screen name="ProfileEditScreen" component={ProfileEditScreen} /> 
    </Stack.Navigator>
  );
};

export default AppNavigator;
