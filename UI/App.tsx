import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Camera from './src/Components/Camera';
import HomePage from './src/Components/HomePage';
import LocationPage from './src/Components/LocationPage';
import MealPage from './src/Components/MealPage';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Camera"
          component={Camera}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Meal"
          component={MealPage}
          options={{headerShown: false}}
        />
        <Stack.Screen 
          name="Location" 
          component={LocationPage}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;