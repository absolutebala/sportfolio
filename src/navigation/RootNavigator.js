import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';

import LoginScreen from '../screens/LoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import IdentityScreen from '../screens/IdentityScreen';
import SportSelectionScreen from '../screens/SportSelectionScreen';
import LevelSelectionScreen from '../screens/LevelSelectionScreen';
import ClubScreen from '../screens/ClubScreen';
import ProfileBuilderScreen from '../screens/ProfileBuilderScreen';
import BuildingProfileScreen from '../screens/BuildingProfileScreen';
import MainTabNavigator from './MainTabNavigator';
import PostNavigator from './PostNavigator';
import LogMatchScreen from '../screens/LogMatchScreen';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: '#0a0d14' },
};

function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { data, loaded: onboardingLoaded } = useOnboarding();

  // Show spinner until both auth state and AsyncStorage are ready
  if (authLoading || !onboardingLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0d14', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  // Conditional screen sets — React Navigation re-evaluates this on every state change
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !data.profileComplete ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="Identity" component={IdentityScreen} />
          <Stack.Screen name="SportSelection" component={SportSelectionScreen} />
          <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
          <Stack.Screen name="ClubSearch" component={ClubScreen} />
          <Stack.Screen name="ProfileBuilder" component={ProfileBuilderScreen} />
          <Stack.Screen name="BuildingProfile" component={BuildingProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
          <Stack.Screen
            name="LogMatch"
            component={LogMatchScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Post"
            component={PostNavigator}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </OnboardingProvider>
    </AuthProvider>
  );
}
