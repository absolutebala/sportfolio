import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fonts } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import LogActivityScreen from '../screens/LogActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ClubsScreen from '../screens/ClubsScreen';
import CreateClubScreen from '../screens/CreateClubScreen';

const Tab = createBottomTabNavigator();
const ClubsStack = createNativeStackNavigator();

function ClubsNavigator() {
  return (
    <ClubsStack.Navigator screenOptions={{ headerShown: false }}>
      <ClubsStack.Screen name="ClubsList" component={ClubsScreen} />
      <ClubsStack.Screen name="CreateClub" component={CreateClubScreen} />
    </ClubsStack.Navigator>
  );
}

function TabLabel({ label, focused }) {
  return (
    <Text style={[styles.label, focused && styles.labelFocused]}>
      {label}
    </Text>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <Text style={styles.icon}>🏠</Text>,
          tabBarLabel: ({ focused }) => <TabLabel label="Feed" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogActivityScreen}
        options={{
          tabBarIcon: ({ focused }) => <Text style={styles.icon}>➕</Text>,
          tabBarLabel: ({ focused }) => <TabLabel label="Log" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ClubsTab"
        component={ClubsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <Text style={styles.icon}>🏟️</Text>,
          tabBarLabel: ({ focused }) => <TabLabel label="Clubs" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <Text style={styles.icon}>👤</Text>,
          tabBarLabel: ({ focused }) => <TabLabel label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgCard,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 8,
    height: 64,
  },
  icon: { fontSize: 20 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  labelFocused: { color: colors.primary },
});
