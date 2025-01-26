// src/services/authService.js

import auth from '@react-native-firebase/auth';

// SignUp function to create a new user
export const signUp = async (email, password) => {
  try {
    await auth().createUserWithEmailAndPassword(email, password);
    console.log('User account created & signed in!');
  } catch (error) {
    console.error('Error during sign up: ', error.message);
    throw error;  // Rethrow the error to handle it later in the component
  }
};
