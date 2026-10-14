import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme';
import ProgressHeader from '../components/ProgressHeader';
import { WHEN_OPTIONS, STYLE_OPTIONS } from '../data/onboardingData';
import { useOnboarding } from '../context/OnboardingContext';

export default function ProfileBuilderScreen({ navigation }) {
  const { data, update } = useOnboarding();
  const [when, setWhen] = useState(data.when.length ? data.when : []);
  const [style, setStyle] = useState(data.style.length ? data.style : []);
  const [lookingForPartners, setLookingForPartners] = useState(
    data.lookingForPartners
  );
  const [bio, setBio] = useState(data.bio);

  function toggle(list, setList, value) {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function finish() {
    update({ when, style, lookingForPartners, bio: bio.trim() });
    navigation.navigate('BuildingProfile');
  }

  function skip() {
    // Keep whatever was already chosen, just don't force entry
    update({ when, style, lookingForPartners, bio: bio.trim() });
    navigation.navigate('BuildingProfile');
  }

  return (
    <SafeAreaView style={styles.root}>
      <ProgressHeader step={6} onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.title}>A few quick details</Text>
        <Text style={styles.sub}>This personalises who you play with.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Short bio (optional)</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Tell other players a bit about yourself..."
            placeholderTextColor={colors.textFaint}
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={120}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>When do you usually play?</Text>
          <View style={styles.chips}>
            {WHEN_OPTIONS.map((opt) => {
              const isSelected = when.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggle(when, setWhen, opt)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Preferred style</Text>
          <View style={styles.chips}>
            {STYLE_OPTIONS.map((opt) => {
              const isSelected = style.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggle(style, setStyle, opt)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleTitle}>Looking for playing partners</Text>
            <Text style={styles.toggleSub}>Show me to nearby players</Text>
          </View>
          <TouchableOpacity
            style={[styles.switch, lookingForPartners && styles.switchOn]}
            onPress={() => setLookingForPartners((v) => !v)}
          >
            <View style={[styles.knob, lookingForPartners && styles.knobOn]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.nextBtn} onPress={finish}>
          <Text style={styles.nextBtnText}>Finish</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.skipLink}>Skip for now</Text>
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
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  bioInput: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 13,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgTertiary,
  },
  chipSelected: {
    borderColor: '#fb923c',
    backgroundColor: '#7c2d12',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: '#fed7aa',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
  toggleTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleSub: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  switch: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.border,
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#fb923c',
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  knobOn: {
    marginLeft: 18,
  },
  bottomArea: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl + 4,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  nextBtn: {
    backgroundColor: '#22c55e',
    borderRadius: radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#052e16',
    fontSize: 15,
    fontWeight: '700',
  },
  skipLink: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
