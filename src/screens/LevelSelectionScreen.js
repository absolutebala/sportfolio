import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import ProgressHeader from '../components/ProgressHeader';
import { LEVELS } from '../data/onboardingData';
import { useOnboarding } from '../context/OnboardingContext';

export default function LevelSelectionScreen({ navigation }) {
  const { update } = useOnboarding();

  function selectLevel(levelKey) {
    update({ level: levelKey });
    navigation.navigate('ClubSearch');
  }

  return (
    <SafeAreaView style={styles.root}>
      <ProgressHeader step={4} onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.title}>How would you describe yourself?</Text>
        <Text style={styles.sub}>
          Tap one — this shapes your entire profile and feed experience.
        </Text>

        <View style={styles.cards}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.key}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => selectLevel(level.key)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={level.icon} size={18} color={colors.textMuted} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{level.title}</Text>
                <Text style={styles.cardDesc}>{level.desc}</Text>
              </View>
              <View style={styles.radio} />
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
    paddingTop: spacing.xxl,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xxl,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgTertiary,
    padding: spacing.xl - 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
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
    marginBottom: 3,
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textFaint,
    marginTop: 2,
  },
});
