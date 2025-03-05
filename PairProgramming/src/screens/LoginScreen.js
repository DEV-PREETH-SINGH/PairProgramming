import {baseUrl} from "@env";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet,Image } from 'react-native';
import { googleSignIn, signIn } from '../services/authService';
import { Button } from 'react-native-paper';
import { ShieldCheck, LogIn, Mail, Lock } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      setLoading(false);
      console.log('User logged in');
      navigation.replace('Home');
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await googleSignIn(navigation);
    } catch (error) {
      setLoading(false);
      setError('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Sign In to CodeBuddy</Text>

      <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton}>
        <Image source={require('../assets/Google_png.png')} style={styles.googleLogo} />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Or Sign in with email</Text>

      <View style={styles.inputContainer}>
        <Mail size={20} color="#aaa" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} color="#aaa" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#000000" />
      ) : (
        <Button 
              style={styles.loginButton} 
              onPress={handleLogin} 
              labelStyle={{ color: 'white' }} // Ensures text color is white
              >
               Sign In
            </Button>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.textLink}>Don’t have an account? <Text style={styles.underline}>Sign up</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    marginBottom: 20, // Increased spacing
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    marginBottom: 20,
  },
  googleButtonText: {
    color: 'black',
    fontSize: 16,
    marginLeft: 10,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  orText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 10,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D3D3D3',
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    marginBottom: 15, // Added spacing
  },
  loginButton: {
    backgroundColor: '#000000',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textLink: {
    color: 'black',
    fontSize: 16,
    marginBottom: 15,
    opacity: 0.5,
  },
  underline: {
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
