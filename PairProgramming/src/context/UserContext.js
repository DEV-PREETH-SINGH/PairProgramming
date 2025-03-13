import React, { createContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { baseUrl } from "@env";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const response = await fetch(`${baseUrl}/users/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          throw new Error('User not found');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [auth().currentUser]);

  return (
    <UserContext.Provider value={{ userData, setUserData, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};
