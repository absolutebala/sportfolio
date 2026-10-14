import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import IdentityScreen from '../screens/IdentityScreen';
import SportSelectionScreen from '../screens/SportSelectionScreen';
import LevelSelectionScreen from '../screens/LevelSelectionScreen';
import ClubScreen from '../screens/ClubScreen';
import ProfileBuilderScreen from '../screens/ProfileBuilderScreen';
import BuildingProfileScreen from '../screens/BuildingProfileScreen';
import LogMatchScreen from '../screens/LogMatchScreen';
import PostNavigator from './PostNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { data, loaded } = useOnboarding();

  // Wait for AsyncStorage to load before deciding which screen to show
  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0d0a1a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={data.profileComplete ? 'MainApp' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0a0d14' },
      }}
    >
      {/* ── Onboarding ── */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Identity" component={IdentityScreen} />
      <Stack.Screen name="SportSelection" component={SportSelectionScreen} />
      <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
      <Stack.Screen name="ClubSearch" component={ClubScreen} />
      <Stack.Screen name="ProfileBuilder" component={ProfileBuilderScreen} />
      <Stack.Screen name="BuildingProfile" component={BuildingProfileScreen} />

      {/* ── Main app ── */}
      <Stack.Screen name="MainApp" component={MainTabNavigator} />

      {/* ── Modals ── */}
      {/* LogMatch: unified match log + post (replaces LogActivity + Post) */}
      <Stack.Screen
        name="LogMatch"
        component={LogMatchScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      {/* Post: 2-step moment/update post flow */}
      <Stack.Screen
        name="Post"
        component={PostNavigator}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <OnboardingProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </OnboardingProvider>
  );
}
