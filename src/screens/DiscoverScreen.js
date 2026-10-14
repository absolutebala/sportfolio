import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, getSportColors } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

const SPORTS_BROWSE = [
  { key: 'football', label: 'Football', icon: '⚽', count: '2.4k players' },
  { key: 'badminton', label: 'Badminton', icon: '🏸', count: '1.8k players' },
  { key: 'cricket', label: 'Cricket', icon: '🏏', count: '3.1k players' },
  { key: 'swimming', label: 'Swimming', icon: '🏊', count: '940 players' },
  { key: 'tennis', label: 'Tennis', icon: '🎾', count: '760 players' },
  { key: 'athletics', label: 'Athletics', icon: '🏃', count: '1.2k players' },
];

const FEATURED_PLAYERS = [
  { name: 'Arjun Rajan', sport: 'football', city: 'Chennai', level: 'Competitive', initials: 'AR', matches: 47 },
  { name: 'Priya Suresh', sport: 'swimming', city: 'Bangalore', level: 'Competitive', initials: 'PS', matches: 31 },
  { name: 'Karthik Nair', sport: 'cricket', city: 'Mumbai', level: 'Recreational', initials: 'KN', matches: 24 },
  { name: 'Meena Bose', sport: 'tennis', city: 'Chennai', level: 'Competitive', initials: 'MB', matches: 19 },
];

const NEARBY_CLUBS = [
  { name: 'Chennai Smash Club', sport: 'badminton', members: 148, distance: '2.4 km' },
  { name: 'FC Chennai United', sport: 'football', members: 213, distance: '4.1 km' },
  { name: 'Aqua Masters', sport: 'swimming', members: 87, distance: '5.8 km' },
];

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('players');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textFaint} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search players, clubs, sports…"
          placeholderTextColor={colors.textFaint}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['players', 'clubs', 'sports'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'sports' && (
          <>
            <Text style={styles.sectionLabel}>Browse by Sport</Text>
            <View style={styles.sportsGrid}>
              {SPORTS_BROWSE.map((s) => {
                const sc = getSportColors(s.key);
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.sportCard, { backgroundColor: sc.dark, borderColor: sc.accent + '40' }]}
                  >
                    <Text style={styles.sportEmoji}>{s.icon}</Text>
                    <Text style={[styles.sportLabel, { color: sc.light }]}>{s.label}</Text>
                    <Text style={styles.sportCount}>{s.count}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {activeTab === 'players' && (
          <>
            <Text style={styles.sectionLabel}>Featured Players</Text>
            {FEATURED_PLAYERS.map((p) => {
              const sc = getSportColors(p.sport);
              return (
                <View key={p.name} style={styles.playerCard}>
                  <View style={[styles.playerAvatar, { borderColor: sc.accent, backgroundColor: sc.dark }]}>
                    <Text style={[styles.playerInitials, { color: sc.accent }]}>{p.initials}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{p.name}</Text>
                    <Text style={styles.playerMeta}>
                      {p.level} · {p.city}
                    </Text>
                    <View style={[styles.sportChip, { backgroundColor: sc.dark }]}>
                      <Text style={[styles.sportChipText, { color: sc.accent }]}>{p.sport}</Text>
                    </View>
                  </View>
                  <View style={styles.playerStats}>
                    <Text style={[styles.playerStatNum, { color: sc.accent }]}>{p.matches}</Text>
                    <Text style={styles.playerStatLabel}>matches</Text>
                  </View>
                  <TouchableOpacity style={[styles.followBtn, { borderColor: sc.accent }]}>
                    <Text style={[styles.followBtnText, { color: sc.accent }]}>Follow</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {activeTab === 'clubs' && (
          <>
            <Text style={styles.sectionLabel}>Clubs Near You</Text>
            {NEARBY_CLUBS.map((c) => {
              const sc = getSportColors(c.sport);
              return (
                <TouchableOpacity key={c.name} style={styles.clubCard}>
                  <View style={[styles.clubIcon, { backgroundColor: sc.dark }]}>
                    <Ionicons name="shield" size={20} color={sc.accent} />
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{c.name}</Text>
                    <Text style={styles.clubMeta}>
                      {c.members} members · {c.distance}
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.joinBtn, { backgroundColor: sc.dark }]}>
                    <Text style={[styles.joinBtnText, { color: sc.accent }]}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.bgCard, borderColor: colors.textSecondary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textFaint },
  tabTextActive: { color: colors.textPrimary },

  content: { paddingHorizontal: spacing.lg },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  // Sports grid
  sportsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  sportCard: {
    width: CARD_WIDTH,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  sportEmoji: { fontSize: 28, marginBottom: spacing.sm },
  sportLabel: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  sportCount: { fontSize: 11, color: colors.textMuted },

  // Player card
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitials: { fontSize: 14, fontWeight: '700' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  playerMeta: { fontSize: 11, color: colors.textMuted, marginTop: 1, marginBottom: 4 },
  sportChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  sportChipText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  playerStats: { alignItems: 'center', marginRight: spacing.sm },
  playerStatNum: { fontSize: 16, fontWeight: '800' },
  playerStatLabel: { fontSize: 10, color: colors.textMuted },
  followBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  followBtnText: { fontSize: 12, fontWeight: '700' },

  // Club card
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  clubIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubInfo: { flex: 1 },
  clubName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  clubMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  joinBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  joinBtnText: { fontSize: 12, fontWeight: '700' },
});
