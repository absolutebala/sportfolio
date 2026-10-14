import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, radius } from '../theme';
import ProgressHeader from '../components/ProgressHeader';
import { useOnboarding } from '../context/OnboardingContext';

function formatDate(date) {
  if (!date) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function IdentityScreen({ navigation }) {
  const { data, update } = useOnboarding();
  const [name, setName] = useState(data.name);
  const [dob, setDob] = useState(data.dob);
  const [showPicker, setShowPicker] = useState(false);

  const age = calculateAge(dob);
  const isUnder16 = age !== null && age < 16;
  const isValid = name.trim().length > 0 && dob !== null;

  function onChangeDate(event, selectedDate) {
    if (selectedDate) {
      setDob(selectedDate);
    }
    if (Platform.OS === 'android') {
      // Android's picker is a dialog that closes itself after selection
      setShowPicker(false);
    }
    // iOS spinner stays open — dismissed explicitly via the Done button
  }

  function handleContinue() {
    update({ name: name.trim(), dob, city: data.city });
    navigation.navigate('SportSelection');
  }

  return (
    <SafeAreaView style={styles.root}>
      <ProgressHeader step={2} onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.sub}>
          This helps us build your sports passport correctly from day one.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Meera Shankar"
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity
            style={styles.tappableField}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="calendar-outline" size={16} color="#22c55e" />
            <Text
              style={[
                styles.tappableFieldText,
                !dob && { color: colors.textFaint },
              ]}
            >
              {dob ? formatDate(dob) : 'Select your date of birth'}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
          </TouchableOpacity>

          {isUnder16 && (
            <View style={styles.under16Note}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
              <Text style={styles.under16Text}>
                We'll need a parent or guardian to link to your account. We'll remind you
                to do this after setup.
              </Text>
            </View>
          )}

          {showPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={dob || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant="dark"
                textColor={colors.textPrimary}
                maximumDate={new Date()}
                onChange={onChangeDate}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.pickerDoneBtn}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>City / location</Text>
          <TouchableOpacity style={styles.tappableField}>
            <Ionicons name="location-outline" size={16} color="#22c55e" />
            <Text style={styles.tappableFieldText}>{data.city}</Text>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.nextBtn, !isValid && styles.nextBtnDisabled]}
          disabled={!isValid}
          onPress={handleContinue}
        >
          <Text
            style={[styles.nextBtnText, !isValid && styles.nextBtnTextDisabled]}
          >
            Continue
          </Text>
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
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: spacing.sm,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xxxl,
  },
  fieldGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
  tappableField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  tappableFieldText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  changeText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  under16Note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  under16Text: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  pickerContainer: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  pickerDoneBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
  },
  pickerDoneText: {
    color: '#052e16',
    fontSize: 14,
    fontWeight: '700',
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
  nextBtnTextDisabled: {
    color: colors.textFaint,
  },
});
