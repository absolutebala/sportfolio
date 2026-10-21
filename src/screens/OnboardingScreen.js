import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { colors, fonts, spacing, radius } from '../theme';

const SPORTS = [
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
];

export default function OnboardingScreen() {
  const { user } = useAuth();
  const { updateProfile } = useProfile();

  const [name, setName] = useState(user?.user_metadata?.full_name ?? '');
  const [selectedSports, setSelectedSports] = useState([]);
  const [saving, setSaving] = useState(false);

  function toggleSport(id) {
    setSelectedSports(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  async function handleContinue() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to continue.');
      return;
    }
    if (selectedSports.length === 0) {
      Alert.alert('Select a sport', 'Please select at least one sport.');
      return;
    }
    try {
      setSaving(true);
      await updateProfile({
        full_name: name.trim(),
        sports: selectedSports,
        avatar_url: user?.user_metadata?.avatar_url ?? null,
      });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Build your profile</Text>
        <Text style={styles.sub}>Just two quick things to get started</Text>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Arjun Kumar"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        {/* Sports */}
        <View style={styles.section}>
          <Text style={styles.label}>Sports you play</Text>
          <View style={styles.sportRow}>
            {SPORTS.map(sport => {
              const selected = selectedSports.includes(sport.id);
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[styles.sportCard, selected && styles.sportCardSelected]}
                  onPress={() => toggleSport(sport.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sportIcon}>{sport.icon}</Text>
                  <Text style={[styles.sportLabel, selected && styles.sportLabelSelected]}>
                    {sport.label}
                  </Text>
                  {selected && <View style={styles.sportCheck}><Text style={styles.checkMark}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Continue →</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg },

  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 4 },

  section: { gap: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },

  input: {
    backgroundColor: colors.bgInput, borderRadius: radius.md, padding: 14,
    fontFamily: fonts.regular, fontSize: 15, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },

  sportRow: { flexDirection: 'row', gap: spacing.md },
  sportCard: {
    flex: 1, padding: spacing.lg, alignItems: 'center', gap: 8,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.border,
  },
  sportCardSelected: { borderColor: colors.primary, backgroundColor: '#1a1208' },
  sportIcon: { fontSize: 36 },
  sportLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  sportLabelSelected: { color: colors.primary },
  sportCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 11, color: '#fff', fontFamily: fonts.bold },

  btn: {
    backgroundColor: colors.primary, padding: 16,
    borderRadius: radius.md, alignItems: 'center', marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#fff' },
});
