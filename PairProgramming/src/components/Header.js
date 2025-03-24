import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { baseUrl } from "@env";

const Header = ({ uid }) => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const fetchUserData = async (uid) => {
    try {
      // Make sure baseUrl is correct in your environment variable
      const response = await fetch(`${baseUrl}/users/${uid}`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchUserData(uid);
    }
  }, [uid]);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: "#f0f7ff" }}>
      {/* Left section with "Hello" and username on separate lines */}
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Hello
        </Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {userData?.username || 'User'}.
        </Text>
      </View>
  
      {/* Profile picture on the right */}
      <TouchableOpacity onPress={() => navigation.navigate('ProfileEditScreen')}>
        <Image
          source={{ uri: userData?.profilePic || 'https://via.placeholder.com/50' }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      </TouchableOpacity>
    </View>
  );
  
  
};

export default Header;
