import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ClubsScreen from '../screens/ClubsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors, getSportColors } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';

const Tab = createBottomTabNavigator();

const NAV_ITEMS = [
  { key: 'Home', icon: 'home', iconOutline: 'home-outline', label: 'Home' },
  { key: 'Discover', icon: 'compass', iconOutline: 'compass-outline', label: 'Discover' },
  { key: 'Clubs', icon: 'people', iconOutline: 'people-outline', label: 'Clubs' },
  { key: 'Profile', icon: 'person', iconOutline: 'person-outline', label: 'Profile' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { data } = useOnboarding();
  const primarySport = data.sports?.[0] || 'badminton';
  const sc = getSportColors(primarySport);

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {/* Post FAB in the center */}
      <View style={styles.tabItems}>
        {state.routes.map((route, index) => {
          const item = NAV_ITEMS.find((n) => n.key === route.name);
          if (!item) return null;

          const isFocused = state.index === index;

          // Insert FAB between Discover and Clubs (after index 1)
          const isAfterDiscover = item.key === 'Clubs';

          return (
            <React.Fragment key={route.key}>
              {isAfterDiscover && (
                <TouchableOpacity
                  style={[styles.fab, { backgroundColor: sc.accent }]}
                  onPress={() => navigation.navigate('Post')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={26} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isFocused ? item.icon : item.iconOutline}
                  size={22}
                  color={isFocused ? sc.accent : colors.navInactive}
                />
                <Text style={[styles.tabLabel, isFocused && { color: sc.accent }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Clubs" component={ClubsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0d111c',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
  tabItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.navInactive,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
