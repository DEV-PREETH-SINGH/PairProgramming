import React from 'react';
import { View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth'; // Import auth module

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Welcome to the Home Screen!</Text>
      <Button
        title="Log out"
        onPress={() => {
          auth()
            .signOut()  // Sign out the user
            .then(() => {
              console.log('User signed out');
              navigation.replace('Login');  // Redirect to login screen
            })
            .catch((error) => {
              console.log('Error signing out: ', error);
            });
        }}
      />
    </View>
  );
};

export default HomeScreen;
