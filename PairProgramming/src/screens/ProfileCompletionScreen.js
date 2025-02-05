// ProfileCompletionScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';


const ProfileCompletionScreen = () => {
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [preferredSolvingTime, setPreferredSolvingTime] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const currentUser = auth().currentUser;

  const handleProfileSubmit = async () => {
    if (!preferredLanguage || !preferredSolvingTime) {
      alert('Please fill out all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://192.168.68.77:5000/create-profile', {
        uid: currentUser.uid,
        preferredLanguage,
        preferredSolvingTime,
      });

      if (response.status === 200) {
        console.log("done")
        navigation.navigate('Home'); // Navigate to the Home screen after profile is created
      }

     
    } catch (error) {
      alert('Error creating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>

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

      <Button
        title={loading ? 'Saving...' : 'Save Profile'}
        onPress={handleProfileSubmit}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingLeft: 10 },
});

export default ProfileCompletionScreen;
