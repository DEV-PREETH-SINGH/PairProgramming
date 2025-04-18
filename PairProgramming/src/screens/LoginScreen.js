import {baseUrl} from "@env";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { googleSignIn, signIn } from '../services/authService';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

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
        console.error(error);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#8b4ad3" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LinearGradient
            colors={['#8b4ad3', '#bc93ed']}
            style={styles.header}
          >
            
            <Text style={styles.headerText}>Welcome Back</Text>
          </LinearGradient>
          
          <View style={styles.container}>
            <Text style={styles.title}>CodeBuddy</Text>
            <Text style={styles.subtitle}>Sign in to continue coding together</Text>
            
            <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton}>
              <Image source={require('../assets/Google_png.png')} style={styles.googleLogo} />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
            
            <Text style={styles.orText}>Or sign in with email</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#8a8a8a" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#8a8a8a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#8a8a8a" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#8a8a8a"
                />
              </View>
            </View>
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  orText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  error: {
    color: '#ff6384',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#8b4ad3',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#8b4ad3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    //elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#8b4ad3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default LoginScreen;
