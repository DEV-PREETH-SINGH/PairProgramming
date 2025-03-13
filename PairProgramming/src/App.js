import {PORT} from "@env"
console.log('PORT:',PORT)

console.log("Type of PORT:", typeof PORT);
console.log("PORT:", JSON.stringify(PORT, null, 2));


import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Only this container
import AppNavigator from './navigation/AppNavigator';
import { UserProvider } from './context/UserContext';

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer> {/* Keep only one here */}
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
