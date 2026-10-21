import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { colors, fonts, spacing, radius } from '../theme';

const SPORTS = [
  { id: 'badminton', label: 'Badminton', icon: '🏸', color: colors.badminton },
  { id: 'cricket', label: 'Cricket', icon: '🏏', color: colors.cricket },
];

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

export default function LogActivityScreen() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [sport, setSport] = useState(profile?.sports?.[0] ?? 'badminton');
  const [saving, setSaving] = useState(false);

  // Badminton fields
  const [bGamesPlayed, setBGamesPlayed] = useState('');
  const [bGamesWon, setBGamesWon] = useState('');
  const [bGamesLost, setBGamesLost] = useState('');
  const [bVenue, setBVenue] = useState('');
  const [bNotes, setBNotes] = useState('');

  // Cricket fields
  const [cMatchType, setCMatchType] = useState('');
  const [cRuns, setCRuns] = useState('');
  const [cWickets, setCWickets] = useState('');
  const [cResult, setCResult] = useState('');
  const [cGround, setCGround] = useState('');
  const [cNotes, setCNotes] = useState('');

  function buildDetails() {
    if (sport === 'badminton') {
      return {
        games_played: bGamesPlayed ? Number(bGamesPlayed) : null,
        games_won: bGamesWon ? Number(bGamesWon) : null,
        games_lost: bGamesLost ? Number(bGamesLost) : null,
        venue: bVenue || null,
      };
    } else {
      return {
        match_type: cMatchType || null,
        runs: cRuns ? Number(cRuns) : null,
        wickets: cWickets ? Number(cWickets) : null,
        result: cResult || null,
        ground: cGround || null,
      };
    }
  }

  function buildSummary() {
    if (sport === 'badminton') {
      const parts = [];
      if (bGamesPlayed) parts.push(`Played ${bGamesPlayed} game${bGamesPlayed > 1 ? 's' : ''}`);
      if (bGamesWon) parts.push(`won ${bGamesWon}`);
      if (bGamesLost) parts.push(`lost ${bGamesLost}`);
      if (bVenue) parts.push(`at ${bVenue}`);
      if (bNotes) parts.push(bNotes);
      return parts.join(' · ') || 'Badminton session';
    } else {
      const parts = [];
      if (cMatchType) parts.push(cMatchType);
      if (cRuns) parts.push(`${cRuns} runs`);
      if (cWickets) parts.push(`${cWickets} wickets`);
      if (cResult) parts.push(cResult);
      if (cGround) parts.push(`at ${cGround}`);
      if (cNotes) parts.push(cNotes);
      return parts.join(' · ') || 'Cricket match';
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const { error } = await supabase.from('activities').insert({
        user_id: user.id,
        sport,
        summary: buildSummary(),
        details: buildDetails(),
        notes: sport === 'badminton' ? bNotes : cNotes,
      });
      if (error) throw error;

      Alert.alert('Logged!', 'Your activity has been saved.', [{ text: 'Great!' }]);
      // Reset form
      setBGamesPlayed(''); setBGamesWon(''); setBGamesLost(''); setBVenue(''); setBNotes('');
      setCMatchType(''); setCRuns(''); setCWickets(''); setCResult(''); setCGround(''); setCNotes('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Log Activity</Text>

          {/* Sport selector */}
          <View style={styles.sportRow}>
            {SPORTS.map(s => {
              const active = sport === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.sportBtn, active && { borderColor: s.color, backgroundColor: s.color + '18' }]}
                  onPress={() => setSport(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sportBtnIcon}>{s.icon}</Text>
                  <Text style={[styles.sportBtnLabel, active && { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sport-specific form */}
          {sport === 'badminton' ? (
            <View style={styles.form}>
              <View style={styles.row3}>
                <View style={{ flex: 1 }}>
                  <Field label="Games Played" value={bGamesPlayed} onChangeText={setBGamesPlayed} placeholder="0" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Won" value={bGamesWon} onChangeText={setBGamesWon} placeholder="0" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Lost" value={bGamesLost} onChangeText={setBGamesLost} placeholder="0" keyboardType="numeric" />
                </View>
              </View>
              <Field label="Venue" value={bVenue} onChangeText={setBVenue} placeholder="e.g. Sports Hub" />
              <Field label="Notes (optional)" value={bNotes} onChangeText={setBNotes} placeholder="Anything to add…" multiline />
            </View>
          ) : (
            <View style={styles.form}>
              <Field label="Match Type" value={cMatchType} onChangeText={setCMatchType} placeholder="e.g. T20, Test, Friendly" />
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Field label="Runs Scored" value={cRuns} onChangeText={setCRuns} placeholder="0" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Wickets" value={cWickets} onChangeText={setCWickets} placeholder="0" keyboardType="numeric" />
                </View>
              </View>
              <Field label="Result" value={cResult} onChangeText={setCResult} placeholder="Won / Lost / Draw" />
              <Field label="Ground" value={cGround} onChangeText={setCGround} placeholder="e.g. Wankhede Stadium" />
              <Field label="Notes (optional)" value={cNotes} onChangeText={setCNotes} placeholder="Anything to add…" multiline />
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Activity</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.lg },

  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text },

  sportRow: { flexDirection: 'row', gap: spacing.md },
  sportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  sportBtnIcon: { fontSize: 20 },
  sportBtnLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary },

  form: { gap: spacing.md },
  row3: { flexDirection: 'row', gap: spacing.sm },
  row2: { flexDirection: 'row', gap: spacing.md },

  field: { gap: 6 },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  input: {
    backgroundColor: colors.bgInput, borderRadius: radius.md, padding: 12,
    fontFamily: fonts.regular, fontSize: 15, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },

  saveBtn: {
    backgroundColor: colors.primary, padding: 16,
    borderRadius: radius.md, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#fff' },
});
