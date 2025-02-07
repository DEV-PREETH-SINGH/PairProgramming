import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileCompletionScreen = () => {
  const [preferredLanguage, setPreferredLanguage] = useState('');
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
    if (!preferredLanguage || !preferredSolvingTime || !profilePic) {
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
      formData.append('preferredLanguage', preferredLanguage);
      formData.append('preferredSolvingTime', preferredSolvingTime);

      const response = await axios.post('http://192.168.68.65:5000/create-profile', formData, {
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

      <Button title="Select Profile Picture" onPress={selectImage} />
      {profilePic && <Image source={{ uri: profilePic.uri }} style={styles.profilePic} />}

      <TextInput
        style={styles.input}
        value={preferredLanguage}
        onChangeText={setPreferredLanguage}
        placeholder="Preferred Coding Language"
      />

      <Picker selectedValue={preferredSolvingTime} style={styles.input} onValueChange={setPreferredSolvingTime}>
        <Picker.Item label="Morning" value="Morning" />
        <Picker.Item label="Afternoon" value="Afternoon" />
        <Picker.Item label="Evening" value="Evening" />
      </Picker>

      <Button title={loading ? 'Saving...' : 'Save Profile'} onPress={handleProfileSubmit} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingLeft: 10 },
  profilePic: { width: 100, height: 100, borderRadius: 50, marginTop: 10 },
});

export default ProfileCompletionScreen;
