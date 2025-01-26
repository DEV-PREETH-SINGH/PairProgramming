/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App'; // Update this path to point to App.js inside src folder
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
