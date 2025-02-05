import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const ProfileEditScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [preferredSolvingTime, setPreferredSolvingTime] = useState('Morning'); // Default value
  const [loading, setLoading] = useState(false);

  const currentUserUID = auth().currentUser?.uid;

  useEffect(() => {
    if (!currentUserUID) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://192.168.68.77:5000/user/${currentUserUID}`);
        const { username, preferredLanguage, preferredSolvingTime } = response.data;

        setUsername(username || '');
        setPreferredLanguage(preferredLanguage || '');
        setPreferredSolvingTime(preferredSolvingTime || 'Morning');
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUserUID]); // Dependency added

  const handleUpdateProfile = async () => {
    if (!username || !preferredLanguage || !preferredSolvingTime) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://192.168.68.77:5000/update-profile`, {
        uid: currentUserUID, // Fixed this
        username,
        preferredLanguage,
        preferredSolvingTime,
      });

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {loading ? <ActivityIndicator size="large" color="#000" /> : null}

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter Name"
      />

      <TextInput
        style={styles.input}
        value={preferredLanguage}
        onChangeText={setPreferredLanguage}
        placeholder="Preferred Coding Language"
      />

      <Picker
        selectedValue={preferredSolvingTime}
        style={styles.input}
        onValueChange={setPreferredSolvingTime}
      >
        <Picker.Item label="Morning" value="Morning" />
        <Picker.Item label="Afternoon" value="Afternoon" />
        <Picker.Item label="Evening" value="Evening" />
      </Picker>

      <Button title="Update Profile" onPress={handleUpdateProfile} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingLeft: 10 },
});

export default ProfileEditScreen;
