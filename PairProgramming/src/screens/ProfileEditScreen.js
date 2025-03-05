import {baseUrl} from "@env";
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity,Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileEditScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [preferredSolvingTime, setPreferredSolvingTime] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const currentUserUID = auth().currentUser?.uid;

  useEffect(() => {
    if (!currentUserUID) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        // const baseUrl = process.env.BASE_URL || 'http://192.168.68.50:5000'; // Default to localhost for development
        const response = await axios.get(`${baseUrl}/user/${currentUserUID}`);
        const { username, preferredLanguage, preferredSolvingTime, profilePic } = response.data;

        setUsername(username || '');
        setPreferredLanguage(preferredLanguage || '');
        setPreferredSolvingTime(preferredSolvingTime || '');
        setProfilePic(profilePic || null);
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUserUID]);

  const selectImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error:', response.errorMessage);
      } else {
        setProfilePic(response.assets[0].uri);
      }
    });
  };

  const handleUpdateProfile = async () => {
    if (!username || !preferredLanguage || !preferredSolvingTime) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('uid', currentUserUID);
      formData.append('username', username);
      formData.append('preferredLanguage', preferredLanguage);
      formData.append('preferredSolvingTime', preferredSolvingTime);

      if (profilePic) {
        formData.append('profilePic', {
          uri: profilePic,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }
      // const baseUrl = process.env.BASE_URL || 'http://192.168.68.50:5000'; // Default to localhost for development
      await axios.put(`${baseUrl}/update-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      {loading && <ActivityIndicator size="large" color="#000" />}
      <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <Text style={styles.imagePlaceholder}>Select Profile Picture</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="User Name"
        placeholderTextColor="#888"
      />
      <View style={styles.pickerContainer}>
        <Picker selectedValue={preferredLanguage} style={styles.picker} onValueChange={setPreferredLanguage}>
          <Picker.Item label="Select Programming Language" value={null} />
          <Picker.Item label="C" value="C" />
          <Picker.Item label="C++" value="C++" />
          <Picker.Item label="Python" value="Python" />
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={preferredSolvingTime} style={styles.picker} onValueChange={setPreferredSolvingTime}>
          <Picker.Item label="Select Preferred Coding Time" value={null} />
          <Picker.Item label="Morning" value="Morning" />
          <Picker.Item label="Afternoon" value="Afternoon" />
          <Picker.Item label="Evening" value="Evening" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={loading}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
            auth().signOut(); // Sign out the user
            navigation.replace('Login'); // Redirect to the login screen
            }} >
        <Text style={styles.buttonText}>Log out</Text>
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
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholder: {
    color: '#555',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    width: '100%',
    height: 55,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: '100%',
    color: '#333',
  },
  button: {
    backgroundColor: '#000000',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: 'white',
    // fontSize: 18,
    // fontWeight: 'bold',
  },
});

export default ProfileEditScreen;
