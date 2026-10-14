import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Onboarding screens
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import IdentityScreen from '../screens/IdentityScreen';
import SportSelectionScreen from '../screens/SportSelectionScreen';
import LevelSelectionScreen from '../screens/LevelSelectionScreen';
import ClubScreen from '../screens/ClubScreen';
import ProfileBuilderScreen from '../screens/ProfileBuilderScreen';
import BuildingProfileScreen from '../screens/BuildingProfileScreen';

// Main app
import MainTabNavigator from './MainTabNavigator';
import PostNavigator from './PostNavigator';
import LogMatchScreen from '../screens/LogMatchScreen';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: '#0a0d14' },
};

// ── Inner navigator — needs both auth + onboarding contexts ─────────────────
function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { data, loaded: onboardingLoaded } = useOnboarding();

  // Wait for both auth session check and AsyncStorage onboarding load
  if (authLoading || !onboardingLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0d0a1a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  // Determine initial route
  let initialRouteName;
  if (!user) {
    initialRouteName = 'Login';
  } else if (!data.profileComplete) {
    initialRouteName = 'Welcome';
  } else {
    initialRouteName = 'MainApp';
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={SCREEN_OPTIONS}>
      {/* ── Auth ── */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

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
    </Stack.Navigator>
  );
}

// ── Root — provides both contexts ───────────────────────────────────────────
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
