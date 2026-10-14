/**
 * PostNavigator — wraps the 2-step post flow in its own stack.
 * Presented as a modal from RootNavigator, so Step 1 and Step 2
 * share the same modal sheet and navigation works correctly.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostScreen from '../screens/PostScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';

const Stack = createNativeStackNavigator();

export default function PostNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0d14' },
      }}
    >
      <Stack.Screen name="PostStep1" component={PostScreen} />
      <Stack.Screen
        name="PostDetails"
        component={PostDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
