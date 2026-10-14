import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';

// ── Sport classification ─────────────────────────────────────────────────────

const RACQUET_SPORTS = [
  'badminton', 'tennis', 'squash', 'table tennis', 'pickleball', 'tabletennis',
];
const TEAM_SPORTS = [
  'football', 'cricket', 'basketball', 'hockey', 'volleyball', 'kabaddi',
  'handball', 'rugby', 'baseball', 'softball',
];
const SOLO_SPORTS = [
  'swimming', 'athletics', 'cycling', 'running', 'gym', 'yoga', 'gymnastics',
  'weightlifting', 'wrestling', 'boxing', 'mma', 'judo', 'karate', 'taekwondo',
  'archery', 'shooting', 'golf', 'skiing', 'snowboarding', 'surfing', 'rowing',
  'triathlon', 'marathon',
];

function classifySport(sportName) {
  const key = (sportName || '').toLowerCase().replace(/[-_\s]/g, '');
  if (RACQUET_SPORTS.some((s) => key.includes(s.replace(/\s/g, '')))) return 'racquet';
  if (TEAM_SPORTS.some((s) => key.includes(s))) return 'team';
  if (SOLO_SPORTS.some((s) => key.includes(s))) return 'solo';
  return 'generic';
}

// ── Chip toggle ──────────────────────────────────────────────────────────────

function ChipToggle({ options, value, onChange }) {
  return (
    <View style={chipStyles.row}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[chipStyles.chip, active && chipStyles.chipActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[chipStyles.label, active && chipStyles.labelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  label: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.textMuted,
  },
  labelActive: { color: '#fff' },
});

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ text }) {
  return <Text style={sectionStyles.label}>{text}</Text>;
}

const sectionStyles = StyleSheet.create({
  label: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 11, letterSpacing: 0.7,
    textTransform: 'uppercase', color: colors.textMuted,
    marginBottom: spacing.sm, marginTop: spacing.xl,
  },
});

// ── Inline field ─────────────────────────────────────────────────────────────

function Field({ label, placeholder, value, onChangeText, keyboardType = 'default', style }) {
  return (
    <View style={fieldStyles.wrap}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <TextInput
        style={[fieldStyles.input, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        returnKeyType="done"
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.textMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg, paddingVertical: 13,
    fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.textPrimary,
  },
});

// ── Score pair ────────────────────────────────────────────────────────────────

function ScorePair({ myLabel = 'Your score', theirLabel = 'Opponent', myScore, theirScore, onMyChange, onTheirChange }) {
  return (
    <View style={scoreStyles.row}>
      <View style={scoreStyles.col}>
        <Text style={scoreStyles.sideLabel}>{myLabel}</Text>
        <TextInput
          style={scoreStyles.input}
          value={myScore}
          onChangeText={onMyChange}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          maxLength={3}
          textAlign="center"
          returnKeyType="done"
        />
      </View>
      <Text style={scoreStyles.vsText}>vs</Text>
      <View style={scoreStyles.col}>
        <Text style={scoreStyles.sideLabel}>{theirLabel}</Text>
        <TextInput
          style={scoreStyles.input}
          value={theirScore}
          onChangeText={onTheirChange}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          maxLength={3}
          textAlign="center"
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
  },
  col: { flex: 1, alignItems: 'center' },
  sideLabel: {
    fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.textMuted,
    marginBottom: 6, textAlign: 'center',
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl,
    paddingVertical: 14,
    fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.textPrimary,
    width: '100%',
  },
  vsText: {
    fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.textMuted,
    marginTop: 20,
  },
});

// ── Result chip (Win / Loss / Draw) ──────────────────────────────────────────

const RESULT_OPTIONS = [
  { value: 'win', label: '🏆 Won' },
  { value: 'loss', label: '❌ Lost' },
  { value: 'draw', label: '🤝 Draw' },
];

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PostDetailsScreen({ route, navigation }) {
  const { caption = '', imageUri = null } = route.params || {};
  const { data, logActivity } = useOnboarding();

  // Determine primary sport
  const primarySport = (data.sports && data.sports[0]) || '';
  const sportType = classifySport(primarySport);
  const sportName = primarySport || 'Activity';

  // Common state
  const [result, setResult] = useState(null); // 'win' | 'loss' | 'draw'
  const [posting, setPosting] = useState(false);

  // Racquet-specific
  const [matchFormat, setMatchFormat] = useState('singles'); // 'singles' | 'doubles'
  const [gamesPlayed, setGamesPlayed] = useState('');
  const [gamesWon, setGamesWon] = useState('');
  const [opponentName, setOpponentName] = useState('');

  // Team-specific
  const [myScore, setMyScore] = useState('');
  const [theirScore, setTheirScore] = useState('');

  // Solo-specific
  const [soloTime, setSoloTime] = useState('');
  const [soloDistance, setSoloDistance] = useState('');
  const [personalBest, setPersonalBest] = useState(false);

  // Generic
  const [resultNote, setResultNote] = useState('');

  function buildActivityPayload() {
    const base = {
      id: Date.now().toString(),
      caption,
      imageUri,
      sport: primarySport,
      sportType,
      timestamp: new Date().toISOString(),
      result,
    };
    if (sportType === 'racquet') {
      return { ...base, matchFormat, gamesPlayed, gamesWon, opponentName };
    }
    if (sportType === 'team') {
      return { ...base, myScore, theirScore };
    }
    if (sportType === 'solo') {
      return { ...base, soloTime, soloDistance, personalBest };
    }
    return { ...base, resultNote };
  }

  async function handlePost() {
    setPosting(true);
    const activity = buildActivityPayload();
    logActivity(activity);
    // small delay to feel snappy
    await new Promise((r) => setTimeout(r, 600));
    setPosting(false);
    // Close both modal screens and go back to feed
    navigation.getParent()?.goBack?.();
    navigation.popToTop?.();
    navigation.goBack?.();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <TouchableOpacity
            style={[styles.postBtn, posting && { opacity: 0.6 }]}
            onPress={handlePost}
            disabled={posting}
          >
            {posting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.postBtnText}>Post</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >

          {/* ── Sport badge ───────────────────────────────────────── */}
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{sportName}</Text>
          </View>

          {/* ── Result chip ───────────────────────────────────────── */}
          <SectionLabel text="Result" />
          <ChipToggle
            options={RESULT_OPTIONS}
            value={result}
            onChange={setResult}
          />

          {/* ════════════════ RACQUET SPORTS ═══════════════════════ */}
          {sportType === 'racquet' && (
            <>
              <SectionLabel text="Format" />
              <ChipToggle
                options={[
                  { value: 'singles', label: 'Singles' },
                  { value: 'doubles', label: 'Doubles' },
                ]}
                value={matchFormat}
                onChange={setMatchFormat}
              />

              <SectionLabel text="Score" />
              <View style={styles.racquetScoreRow}>
                <View style={styles.racquetScoreCol}>
                  <Text style={styles.racquetScoreCaption}>Games played</Text>
                  <TextInput
                    style={scoreStyles.input}
                    value={gamesPlayed}
                    onChangeText={setGamesPlayed}
                    placeholder="0"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="number-pad"
                    maxLength={2}
                    textAlign="center"
                    returnKeyType="done"
                  />
                </View>
                <Text style={scoreStyles.vsText}>of</Text>
                <View style={styles.racquetScoreCol}>
                  <Text style={styles.racquetScoreCaption}>Games won</Text>
                  <TextInput
                    style={[scoreStyles.input, gamesWon && Number(gamesWon) > Number(gamesPlayed) && styles.inputError]}
                    value={gamesWon}
                    onChangeText={setGamesWon}
                    placeholder="0"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="number-pad"
                    maxLength={2}
                    textAlign="center"
                    returnKeyType="done"
                  />
                </View>
              </View>

              <SectionLabel text={matchFormat === 'doubles' ? 'Opponents' : 'Opponent'} />
              <Field
                placeholder={matchFormat === 'doubles' ? 'e.g. Raj & Priya' : 'e.g. Kiran Bala'}
                value={opponentName}
                onChangeText={setOpponentName}
              />
            </>
          )}

          {/* ════════════════ TEAM SPORTS ══════════════════════════ */}
          {sportType === 'team' && (
            <>
              <SectionLabel text="Score" />
              <ScorePair
                myLabel="Your team"
                theirLabel="Opponents"
                myScore={myScore}
                theirScore={theirScore}
                onMyChange={setMyScore}
                onTheirChange={setTheirScore}
              />
            </>
          )}

          {/* ════════════════ SOLO / FITNESS SPORTS ════════════════ */}
          {sportType === 'solo' && (
            <>
              <SectionLabel text="Performance" />
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Time (e.g. 1h 23m)"
                    placeholder="—"
                    value={soloTime}
                    onChangeText={setSoloTime}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Distance (km)"
                    placeholder="—"
                    value={soloDistance}
                    onChangeText={setSoloDistance}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.pbToggle, personalBest && styles.pbToggleActive]}
                onPress={() => setPersonalBest(!personalBest)}
              >
                <Ionicons
                  name={personalBest ? 'trophy' : 'trophy-outline'}
                  size={18}
                  color={personalBest ? '#f59e0b' : colors.textMuted}
                />
                <Text style={[styles.pbText, personalBest && styles.pbTextActive]}>
                  Personal best!
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ════════════════ GENERIC ══════════════════════════════ */}
          {sportType === 'generic' && (
            <>
              <SectionLabel text="Add a result" />
              <Field
                placeholder="e.g. Won 3-1, ranked 4th, finished under 2 hours…"
                value={resultNote}
                onChangeText={setResultNote}
              />
            </>
          )}

          {/* ── Skip hint ─────────────────────────────────────────── */}
          <TouchableOpacity style={styles.skipBtn} onPress={handlePost}>
            <Text style={styles.skipText}>Skip details and post as-is</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.15)',
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.textPrimary },
  postBtn: {
    paddingHorizontal: 22, paddingVertical: 9, borderRadius: 999,
    backgroundColor: '#7c3aed',
    minWidth: 70, alignItems: 'center',
  },
  postBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#fff' },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },
  sportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)',
    paddingHorizontal: 14, paddingVertical: 6,
    marginTop: spacing.xl,
  },
  sportBadgeText: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#a78bfa',
  },
  racquetScoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
  },
  racquetScoreCol: { flex: 1, alignItems: 'center' },
  racquetScoreCaption: {
    fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.textMuted,
    marginBottom: 6, textAlign: 'center',
  },
  inputError: { borderColor: '#ef4444' },
  pbToggle: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: 12, paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  pbToggleActive: { borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)' },
  pbText: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.textMuted,
  },
  pbTextActive: { color: '#f59e0b' },
  skipBtn: {
    marginTop: spacing.xxxl,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.textFaint,
    textDecorationLine: 'underline',
  },
});
