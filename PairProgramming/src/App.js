import {PORT} from "@env"
console.log('PORT:',PORT)

console.log("Type of PORT:", typeof PORT);
console.log("PORT:", JSON.stringify(PORT, null, 2));



import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
