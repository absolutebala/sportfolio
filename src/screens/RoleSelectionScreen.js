import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const ROLES = [
  {
    key: 'athlete',
    title: 'Athlete',
    desc: 'I play or practice a sport',
    icon: 'walk-outline',
    enabled: true,
  },
  {
    key: 'parent',
    title: 'Parent',
    desc: "Follow my child's sports journey",
    icon: 'people-outline',
    enabled: false,
  },
  {
    key: 'coach',
    title: 'Coach',
    desc: 'I train and guide athletes',
    icon: 'megaphone-outline',
    enabled: false,
  },
  {
    key: 'clubadmin',
    title: 'Club admin',
    desc: 'I manage a club or academy',
    icon: 'business-outline',
    enabled: false,
  },
];

export default function RoleSelectionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text style={styles.title}>I am a...</Text>
        <Text style={styles.sub}>One tap. We'll tailor everything from here.</Text>

        <View style={styles.cards}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[styles.card, !role.enabled && styles.cardDisabled]}
              activeOpacity={role.enabled ? 0.7 : 1}
              disabled={!role.enabled}
              onPress={() => {
                if (role.key === 'athlete') {
                  navigation.navigate('Identity');
                }
              }}
            >
              <View
                style={[
                  styles.iconWrap,
                  role.enabled && { backgroundColor: '#14532d' },
                ]}
              >
                <Ionicons
                  name={role.icon}
                  size={20}
                  color={role.enabled ? '#86efac' : colors.textMuted}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardDesc}>{role.desc}</Text>
              </View>
              {role.enabled ? (
                <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
              ) : (
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  body: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: spacing.xxl,
    marginBottom: 6,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.xxl + 4,
  },
  cards: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgTertiary,
    padding: spacing.xl - 2,
  },
  cardDisabled: {
    opacity: 0.35,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: 11,
  },
  soonBadge: {
    backgroundColor: colors.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  soonText: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
