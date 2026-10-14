import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import ProgressHeader from '../components/ProgressHeader';
import { SPORTS } from '../data/onboardingData';
import { useOnboarding } from '../context/OnboardingContext';

const MAX_SPORTS = 3;

export default function SportSelectionScreen({ navigation }) {
  const { data, update } = useOnboarding();
  const [selected, setSelected] = useState(data.sports.length ? data.sports : []);

  function toggleSport(key) {
    setSelected((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      if (prev.length >= MAX_SPORTS) {
        return prev;
      }
      return [...prev, key];
    });
  }

  function handleContinue() {
    update({ sports: selected });
    navigation.navigate('LevelSelection');
  }

  return (
    <SafeAreaView style={styles.root}>
      <ProgressHeader step={3} onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.title}>What sport do you play?</Text>
        <Text style={styles.sub}>
          Choose up to 3. We'll ask which is primary if you pick more than one.
        </Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={14} color={colors.textFaint} />
          <Text style={styles.searchPlaceholder}>Search sports...</Text>
        </View>

        <View style={styles.grid}>
          {SPORTS.map((sport) => {
            const isSelected = selected.includes(sport.key);
            return (
              <TouchableOpacity
                key={sport.key}
                style={[styles.tile, isSelected && styles.tileSelected]}
                onPress={() => toggleSport(sport.key)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={8} color="#052e16" />
                  </View>
                )}
                <Ionicons
                  name={sport.icon}
                  size={22}
                  color={isSelected ? '#86efac' : colors.textMuted}
                />
                <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>
                  {sport.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.count}>{selected.length} of {MAX_SPORTS} sports selected</Text>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.nextBtn, selected.length === 0 && styles.nextBtnDisabled]}
          disabled={selected.length === 0}
          onPress={handleContinue}
        >
          <Text style={[styles.nextBtnText, selected.length === 0 && { color: colors.textFaint }]}>Continue</Text>
        </TouchableOpacity>
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
    marginBottom: spacing.xl,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    marginBottom: spacing.lg,
  },
  searchPlaceholder: {
    color: colors.textFaint,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
    paddingHorizontal: 6,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgTertiary,
    position: 'relative',
  },
  tileSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#14532d',
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tileLabelSelected: {
    color: '#bbf7d0',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  bottomArea: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl + 4,
    paddingTop: spacing.lg,
  },
  nextBtn: {
    backgroundColor: '#22c55e',
    borderRadius: radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: colors.bgTertiary,
  },
  nextBtnText: {
    color: '#052e16',
    fontSize: 15,
    fontWeight: '700',
  },
});
