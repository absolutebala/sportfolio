/**
 * LogMatchScreen — unified post + match log, sport-aware.
 *
 * Sport types:
 *   racquet  → badminton, tennis, squash, table tennis, pickleball
 *              Singles or Doubles; opponent(s) tagged; inline games score
 *   team     → football, cricket, basketball, hockey, volleyball, kabaddi
 *              Score vs opponent team; teammate tagging
 *   solo     → swimming, athletics, cycling, running, gym, yoga, gymnastics,
 *              weightlifting, boxing, martial arts, golf…
 *              Time, distance, personal best toggle
 *   generic  → anything else; free-text result
 *
 * Player tagging:
 *   - Type a name/handle → shows mock search results
 *   - Tap to add chip → tagged players listed under entry
 *   - Tagged players receive a "confirm this match?" notification (mutual log)
 */

import React, { useState, useRef } from 'react';
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
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, getSportColors } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';
import { pickImage } from '../utils/imagePicker';

// ─── Sport classification ────────────────────────────────────────────────────

const RACQUET = ['badminton', 'tennis', 'squash', 'tabletennis', 'table tennis', 'pickleball'];
const TEAM = ['football', 'cricket', 'basketball', 'hockey', 'volleyball', 'kabaddi', 'handball', 'rugby', 'baseball'];
const SOLO = ['swimming', 'athletics', 'cycling', 'running', 'gym', 'yoga', 'gymnastics', 'weightlifting', 'boxing', 'mma', 'judo', 'karate', 'taekwondo', 'archery', 'golf', 'skiing', 'surfing', 'rowing', 'marathon', 'triathlon'];

function classifySport(name) {
  const k = (name || '').toLowerCase().replace(/[-_\s]/g, '');
  if (RACQUET.some((s) => k.includes(s.replace(/\s/g, '')))) return 'racquet';
  if (TEAM.some((s) => k.includes(s))) return 'team';
  if (SOLO.some((s) => k.includes(s))) return 'solo';
  return 'generic';
}

// ─── Mock player search (replace with Supabase query later) ─────────────────

const MOCK_PLAYERS = [
  { id: 'p1', name: 'Arjun Rajan', handle: '@arjunr', sport: 'badminton', avatarColor: '#22c55e' },
  { id: 'p2', name: 'Divya Raj', handle: '@divyar', sport: 'badminton', avatarColor: '#fb923c' },
  { id: 'p3', name: 'Kiran Bala', handle: '@kiranbala', sport: 'badminton', avatarColor: '#38bdf8' },
  { id: 'p4', name: 'Priya Suresh', handle: '@priyas', sport: 'tennis', avatarColor: '#a78bfa' },
  { id: 'p5', name: 'Raj Kumar', handle: '@rajk', sport: 'football', avatarColor: '#f59e0b' },
  { id: 'p6', name: 'Sundar V', handle: '@sundarv', sport: 'cricket', avatarColor: '#84cc16' },
  { id: 'p7', name: 'Meena Bose', handle: '@meenab', sport: 'tennis', avatarColor: '#ec4899' },
  { id: 'p8', name: 'Vignesh K', handle: '@vigneshk', sport: 'badminton', avatarColor: '#06b6d4' },
];

function searchPlayers(query, sport, exclude) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return MOCK_PLAYERS.filter(
    (p) =>
      !exclude.find((e) => e.id === p.id) &&
      (p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q))
  ).slice(0, 4);
}

// ─── Small components ────────────────────────────────────────────────────────

function SectionLabel({ text, style }) {
  return <Text style={[sl.label, style]}>{text}</Text>;
}
const sl = StyleSheet.create({
  label: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
    textTransform: 'uppercase', color: colors.textMuted,
    marginBottom: spacing.sm, marginTop: spacing.xl,
  },
});

function ChipToggle({ options, value, onChange, accent }) {
  return (
    <View style={ct.row}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[ct.chip, active && { backgroundColor: accent + '22', borderColor: accent }]}
            onPress={() => onChange(opt.value)}
          >
            {opt.icon ? <Text style={{ fontSize: 14 }}>{opt.icon}</Text> : null}
            <Text style={[ct.label, active && { color: accent }]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const ct = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: radius.pill, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
});

function ScoreBox({ label, value, onChange, accent }) {
  return (
    <View style={sb.wrap}>
      <Text style={sb.label}>{label}</Text>
      <TextInput
        style={[sb.input, { borderColor: value ? accent : colors.border }]}
        value={value}
        onChangeText={onChange}
        placeholder="0"
        placeholderTextColor={colors.textFaint}
        keyboardType="number-pad"
        maxLength={3}
        textAlign="center"
        returnKeyType="done"
      />
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center' },
  label: { fontSize: 11, color: colors.textMuted, marginBottom: 6, textAlign: 'center' },
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1.5,
    borderRadius: radius.xl, width: '100%', paddingVertical: 14,
    fontSize: 28, fontWeight: '800', color: colors.textPrimary,
    textAlign: 'center',
  },
});

// ─── Player tag input ────────────────────────────────────────────────────────

function PlayerTagInput({ label, tagged, onAdd, onRemove, sport, maxPlayers = 5 }) {
  const [query, setQuery] = useState('');
  const results = searchPlayers(query, sport, tagged);

  return (
    <View>
      <SectionLabel text={label} />

      {/* Tagged chips */}
      {tagged.length > 0 && (
        <View style={pt.chipRow}>
          {tagged.map((p) => (
            <View key={p.id} style={[pt.chip, { backgroundColor: p.avatarColor + '22', borderColor: p.avatarColor + '55' }]}>
              <Text style={[pt.chipName, { color: p.avatarColor }]}>{p.name.split(' ')[0]}</Text>
              <TouchableOpacity onPress={() => onRemove(p.id)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <Ionicons name="close-circle" size={15} color={p.avatarColor} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Search input */}
      {tagged.length < maxPlayers && (
        <View style={pt.inputWrap}>
          <Ionicons name="person-add-outline" size={16} color={colors.textFaint} />
          <TextInput
            style={pt.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or @handle…"
            placeholderTextColor={colors.textFaint}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textFaint} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results dropdown */}
      {results.length > 0 && (
        <View style={pt.dropdown}>
          {results.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={pt.resultRow}
              onPress={() => { onAdd(p); setQuery(''); }}
            >
              <View style={[pt.resultAvatar, { backgroundColor: p.avatarColor + '33' }]}>
                <Text style={[pt.resultInitial, { color: p.avatarColor }]}>
                  {p.name[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={pt.resultName}>{p.name}</Text>
                <Text style={pt.resultHandle}>{p.handle}</Text>
              </View>
              <View style={[pt.addBtn, { borderColor: p.avatarColor }]}>
                <Text style={[pt.addBtnText, { color: p.avatarColor }]}>Add</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {tagged.length > 0 && (
        <View style={pt.mutualNote}>
          <Ionicons name="checkmark-circle-outline" size={13} color={colors.textMuted} />
          <Text style={pt.mutualNoteText}>
            Tagged players will be asked to confirm this match result.
          </Text>
        </View>
      )}
    </View>
  );
}

const pt = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: radius.pill, borderWidth: 1,
  },
  chipName: { fontSize: 13, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary },
  dropdown: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    marginTop: 4, overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  resultAvatar: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  resultInitial: { fontSize: 14, fontWeight: '700' },
  resultName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  resultHandle: { fontSize: 11, color: colors.textFaint, marginTop: 1 },
  addBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.pill, borderWidth: 1,
  },
  addBtnText: { fontSize: 12, fontWeight: '700' },
  mutualNote: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginTop: spacing.sm,
  },
  mutualNoteText: { fontSize: 11, color: colors.textMuted, flex: 1, lineHeight: 16 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

const RESULT_OPTIONS = [
  { value: 'win', label: 'Won', icon: '🏆' },
  { value: 'loss', label: 'Lost', icon: '😤' },
  { value: 'draw', label: 'Draw', icon: '🤝' },
];

export default function LogMatchScreen({ navigation }) {
  const { data, logActivity } = useOnboarding();

  const primarySport = data.sports?.[0] || '';
  const sportType = classifySport(primarySport);
  const sc = getSportColors(primarySport);

  // Caption + media
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Result
  const [result, setResult] = useState(null);

  // Racquet
  const [matchFormat, setMatchFormat] = useState('singles');
  const [gamesPlayed, setGamesPlayed] = useState('');
  const [gamesWon, setGamesWon] = useState('');
  const [opponents, setOpponents] = useState([]);
  const [partners, setPartners] = useState([]);

  // Team
  const [myScore, setMyScore] = useState('');
  const [theirScore, setTheirScore] = useState('');
  const [teammates, setTeammates] = useState([]);

  // Solo
  const [soloTime, setSoloTime] = useState('');
  const [soloDistance, setSoloDistance] = useState('');
  const [personalBest, setPersonalBest] = useState(false);

  // Generic
  const [resultNote, setResultNote] = useState('');

  // Posting state
  const [posting, setPosting] = useState(false);

  async function handlePickImage() {
    pickImage({ aspect: [4, 3], onPicked: (uri) => setImageUri(uri) });
  }

  function buildPayload() {
    const base = {
      id: Date.now().toString(),
      caption,
      imageUri,
      sport: primarySport,
      sportType,
      timestamp: new Date().toISOString(),
      result,
      pendingConfirm: [], // IDs of tagged players who haven't confirmed
    };

    if (sportType === 'racquet') {
      const tagged = [...opponents, ...partners];
      return {
        ...base,
        matchFormat,
        gamesPlayed,
        gamesWon,
        opponents,
        partners,
        pendingConfirm: tagged.map((p) => p.id),
      };
    }
    if (sportType === 'team') {
      return {
        ...base,
        myScore,
        theirScore,
        teammates,
        pendingConfirm: teammates.map((p) => p.id),
      };
    }
    if (sportType === 'solo') {
      return { ...base, soloTime, soloDistance, personalBest };
    }
    return { ...base, resultNote };
  }

  async function handlePost() {
    setPosting(true);
    const activity = buildPayload();
    logActivity(activity);
    await new Promise((r) => setTimeout(r, 600));
    setPosting(false);
    navigation.goBack();
  }

  const canPost = caption.trim().length > 0 || imageUri != null || result != null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>

        {/* ── Header ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Log Match</Text>
            {primarySport ? (
              <View style={[styles.sportBadge, { backgroundColor: sc.dark, borderColor: sc.accent + '55' }]}>
                <Text style={[styles.sportBadgeText, { color: sc.accent }]}>{primarySport}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.postBtn, { backgroundColor: canPost ? sc.accent : colors.bgCard }]}
            onPress={handlePost}
            disabled={!canPost || posting}
          >
            {posting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={[styles.postBtnText, !canPost && { color: colors.textFaint }]}>Post</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >

          {/* ── Author + caption ──────────────────────────────── */}
          <View style={styles.authorRow}>
            <View style={[styles.avatar, { backgroundColor: sc.dark, borderColor: sc.accent }]}>
              {data.avatarUri
                ? <Image source={{ uri: data.avatarUri }} style={styles.avatarImg} />
                : <Text style={[styles.avatarInitials, { color: sc.accent }]}>
                    {(data.name || 'U').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  </Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{data.name || 'You'}</Text>
              <Text style={styles.authorSub}>{data.city?.split(',')[0] || 'Athlete'}</Text>
            </View>
          </View>

          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="What happened? Share the highlights…"
            placeholderTextColor={colors.textFaint}
            multiline
            maxLength={400}
            textAlignVertical="top"
            autoFocus={false}
          />

          {/* Photo */}
          {imageUri ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImg} onPress={() => setImageUri(null)}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.photoBtn, { borderColor: sc.accent + '55' }]} onPress={handlePickImage}>
              <Ionicons name="camera-outline" size={18} color={sc.accent} />
              <Text style={[styles.photoBtnText, { color: sc.accent }]}>Add photo</Text>
            </TouchableOpacity>
          )}

          {/* ── Divider ────────────────────────────────────────── */}
          <View style={styles.divider} />

          {/* ── Result ─────────────────────────────────────────── */}
          <SectionLabel text="Result" style={{ marginTop: 0 }} />
          <ChipToggle
            options={RESULT_OPTIONS}
            value={result}
            onChange={setResult}
            accent={sc.accent}
          />

          {/* ════ RACQUET ═══════════════════════════════════════ */}
          {sportType === 'racquet' && (
            <>
              <SectionLabel text="Format" />
              <ChipToggle
                options={[
                  { value: 'singles', label: 'Singles', icon: '🙋' },
                  { value: 'doubles', label: 'Doubles', icon: '👥' },
                ]}
                value={matchFormat}
                onChange={setMatchFormat}
                accent={sc.accent}
              />

              <SectionLabel text="Score" />
              <View style={styles.scoreRow}>
                <ScoreBox label="Games played" value={gamesPlayed} onChange={setGamesPlayed} accent={sc.accent} />
                <Text style={styles.vsText}>of</Text>
                <ScoreBox label="Games won" value={gamesWon} onChange={setGamesWon} accent={sc.accent} />
              </View>

              {/* Opponents */}
              <PlayerTagInput
                label={matchFormat === 'doubles' ? 'Opponents (2)' : 'Opponent'}
                tagged={opponents}
                onAdd={(p) => setOpponents((prev) => matchFormat === 'doubles' && prev.length < 2 ? [...prev, p] : matchFormat === 'singles' ? [p] : prev)}
                onRemove={(id) => setOpponents((prev) => prev.filter((p) => p.id !== id))}
                sport={primarySport}
                maxPlayers={matchFormat === 'doubles' ? 2 : 1}
              />

              {/* Partners — only in doubles */}
              {matchFormat === 'doubles' && (
                <PlayerTagInput
                  label="Your partner"
                  tagged={partners}
                  onAdd={(p) => setPartners([p])}
                  onRemove={(id) => setPartners([])}
                  sport={primarySport}
                  maxPlayers={1}
                />
              )}
            </>
          )}

          {/* ════ TEAM ══════════════════════════════════════════ */}
          {sportType === 'team' && (
            <>
              <SectionLabel text="Score" />
              <View style={styles.scoreRow}>
                <ScoreBox label="Your team" value={myScore} onChange={setMyScore} accent={sc.accent} />
                <Text style={styles.vsText}>vs</Text>
                <ScoreBox label="Opponents" value={theirScore} onChange={setTheirScore} accent={sc.accent} />
              </View>

              <PlayerTagInput
                label="Teammates"
                tagged={teammates}
                onAdd={(p) => setTeammates((prev) => [...prev, p])}
                onRemove={(id) => setTeammates((prev) => prev.filter((p) => p.id !== id))}
                sport={primarySport}
                maxPlayers={10}
              />
            </>
          )}

          {/* ════ SOLO ══════════════════════════════════════════ */}
          {sportType === 'solo' && (
            <>
              <SectionLabel text="Performance" />
              <View style={styles.soloRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.soloFieldLabel}>Time</Text>
                  <TextInput
                    style={[styles.soloInput, { borderColor: soloTime ? sc.accent : colors.border }]}
                    value={soloTime}
                    onChangeText={setSoloTime}
                    placeholder="e.g. 1h 23m"
                    placeholderTextColor={colors.textFaint}
                    returnKeyType="done"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.soloFieldLabel}>Distance (km)</Text>
                  <TextInput
                    style={[styles.soloInput, { borderColor: soloDistance ? sc.accent : colors.border }]}
                    value={soloDistance}
                    onChangeText={setSoloDistance}
                    placeholder="e.g. 10.5"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.pbToggle, personalBest && { borderColor: '#f59e0b', backgroundColor: '#f59e0b18' }]}
                onPress={() => setPersonalBest(!personalBest)}
              >
                <Text style={{ fontSize: 18 }}>{personalBest ? '🏅' : '🏅'}</Text>
                <Text style={[styles.pbText, personalBest && { color: '#f59e0b' }]}>
                  Personal best!
                </Text>
                <View style={{ flex: 1 }} />
                <View style={[styles.pbCheck, personalBest && { backgroundColor: '#f59e0b' }]}>
                  {personalBest && <Ionicons name="checkmark" size={12} color="#000" />}
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* ════ GENERIC ═══════════════════════════════════════ */}
          {sportType === 'generic' && (
            <>
              <SectionLabel text="Result / Notes" />
              <TextInput
                style={[styles.soloInput, { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                value={resultNote}
                onChangeText={setResultNote}
                placeholder="e.g. Ranked 4th in district finals…"
                placeholderTextColor={colors.textFaint}
                multiline
              />
            </>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  iconBtn: { padding: 4, minWidth: 36 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sportBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: radius.pill, borderWidth: 1,
  },
  sportBadgeText: { fontSize: 11, fontWeight: '600' },
  postBtn: {
    minWidth: 64, paddingHorizontal: spacing.lg, paddingVertical: 9,
    borderRadius: radius.pill, alignItems: 'center',
  },
  postBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 80 },

  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 42, height: 42 },
  avatarInitials: { fontSize: 15, fontWeight: '700' },
  authorName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  authorSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  captionInput: {
    paddingVertical: spacing.sm,
    fontSize: 15, color: colors.textPrimary, minHeight: 80, lineHeight: 23,
  },

  imageWrap: { borderRadius: radius.xl, overflow: 'hidden', marginTop: spacing.sm },
  image: { width: '100%', height: 200 },
  removeImg: { position: 'absolute', top: 8, right: 8 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: spacing.sm,
    paddingVertical: 11, paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl, borderWidth: 1, borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  photoBtnText: { fontSize: 13, fontWeight: '600' },

  divider: {
    height: 1, backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },

  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  vsText: {
    fontSize: 16, fontWeight: '800', color: colors.textFaint, marginTop: 18,
  },

  soloRow: { flexDirection: 'row', gap: spacing.md },
  soloFieldLabel: {
    fontSize: 11, color: colors.textMuted, marginBottom: 5,
  },
  soloInput: {
    backgroundColor: colors.bgCard, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: 12,
    fontSize: 15, color: colors.textPrimary,
  },

  pbToggle: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.lg, padding: spacing.lg,
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
  },
  pbText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  pbCheck: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.bgTertiary, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
});
