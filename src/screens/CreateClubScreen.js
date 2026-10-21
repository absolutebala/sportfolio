import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, radius } from '../theme';

const SPORTS = [
  { id: 'badminton', label: 'Badminton', icon: '🏸', color: colors.badminton },
  { id: 'cricket', label: 'Cricket', icon: '🏏', color: colors.cricket },
];

export default function CreateClubScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSports, setSelectedSports] = useState([]);
  const [saving, setSaving] = useState(false);

  function toggleSport(id) {
    setSelectedSports(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a club name.');
      return;
    }
    if (selectedSports.length === 0) {
      Alert.alert('Sport required', 'Select at least one sport for this club.');
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase.from('clubs').insert({
        name: name.trim(),
        description: description.trim() || null,
        sports: selectedSports,
        created_by: user.id,
        member_count: 1,
      });
      if (error) throw error;
      Alert.alert('Club created!', `"${name.trim()}" is live.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Club</Text>
          </View>

          {/* Club name */}
          <View style={styles.field}>
            <Text style={styles.label}>Club Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chennai Shuttlers"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="What is this club about?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Sports */}
          <View style={styles.field}>
            <Text style={styles.label}>Sports *</Text>
            <View style={styles.sportRow}>
              {SPORTS.map(sport => {
                const selected = selectedSports.includes(sport.id);
                return (
                  <TouchableOpacity
                    key={sport.id}
                    style={[styles.sportBtn, selected && { borderColor: sport.color, backgroundColor: sport.color + '18' }]}
                    onPress={() => toggleSport(sport.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sportIcon}>{sport.icon}</Text>
                    <Text style={[styles.sportLabel, selected && { color: sport.color }]}>{sport.label}</Text>
                    {selected && <Text style={[styles.check, { color: sport.color }]}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.note}>
            Anyone can create a club page. Verified clubs will get a badge in future updates.
          </Text>

          <TouchableOpacity
            style={[styles.createBtn, saving && styles.btnDisabled]}
            onPress={handleCreate}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.createBtnText}>Create Club</Text>
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

  header: { gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text },

  field: { gap: 6 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  input: {
    backgroundColor: colors.bgInput, borderRadius: radius.md, padding: 14,
    fontFamily: fonts.regular, fontSize: 15, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  inputMultiline: { height: 90, textAlignVertical: 'top' },

  sportRow: { flexDirection: 'row', gap: spacing.md },
  sportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  sportIcon: { fontSize: 20 },
  sportLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary },
  check: { fontFamily: fonts.bold, fontSize: 14 },

  note: {
    fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted,
    textAlign: 'center', lineHeight: 18,
  },

  createBtn: {
    backgroundColor: colors.primary, padding: 16,
    borderRadius: radius.md, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  createBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#fff' },
});
