import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image,TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileCompletionScreen = () => {
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [username, setUsername] = useState('');
  const [preferredSolvingTime, setPreferredSolvingTime] = useState('');
  const [profilePic, setProfilePic] = useState(null); // Store profile picture
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error) {
        setProfilePic(response.assets[0]); // Store selected image
      }
    });
  };

  const handleProfileSubmit = async () => {
    if (!username || !preferredLanguage || !preferredSolvingTime || !profilePic) {
      Alert.alert('Error', 'Please fill out all fields and select a profile picture.');
      return;
    }

    try {
      setLoading(true);

      // Upload image first
      const formData = new FormData();
      formData.append('profilePic', {
        uri: profilePic.uri,
        type: profilePic.type,
        name: profilePic.fileName,
      });
      formData.append('uid', currentUser.uid);
      formData.append('username', username);
      formData.append('email', currentUser.email);
      formData.append('preferredLanguage', preferredLanguage);
      formData.append('preferredSolvingTime', preferredSolvingTime);
      console.log(currentUser.uid)
      console.log(username)
      //console.log(currentUser.displayName)
      console.log(currentUser.email)
      console.log(preferredLanguage)
      console.log(preferredSolvingTime)

      const response = await axios.post('http://192.168.68.50:5000/create-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        navigation.navigate('Home'); // Navigate to Home after profile creation
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>

      <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic.uri }} style={styles.profilePic} />
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
        <Picker
          selectedValue={preferredLanguage}
          style={styles.picker}
          onValueChange={setPreferredLanguage}
        >
         <Picker.Item label="Select Programming Language" value={null} />
          <Picker.Item label="C" value="C" />
          <Picker.Item label="C++" value="C++" />
          <Picker.Item label="PYTHON" value="PYTHON" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={preferredSolvingTime}
          style={styles.picker}
          onValueChange={setPreferredSolvingTime}
        >
         <Picker.Item label="Select Preferred Coding Time" value={null} />
          <Picker.Item label="Morning" value="Morning" />
          <Picker.Item label="Afternoon" value="Afternoon" />
          <Picker.Item label="Evening" value="Evening" />
        </Picker>
      </View>

      <TouchableOpacity 
        onPress={handleProfileSubmit} 
        style={[styles.button, loading && styles.buttonDisabled]} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
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

export default ProfileCompletionScreen;