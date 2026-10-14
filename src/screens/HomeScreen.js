import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, fonts, getSportColors } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';

// ─── My Activity Card ──────────────────────────────────────────────────────
function MyActivityCard({ activity, sc }) {
  const resultEmoji = activity.result === 'win' ? '🏆' : activity.result === 'loss' ? '💪' : '➡️';
  const resultColor = activity.result === 'win' ? '#22c55e' : activity.result === 'loss' ? '#f97316' : colors.textSecondary;
  const sportSc = getSportColors(activity.sport || 'badminton');

  let scoreText = '';
  if (activity.sportType === 'racquet') {
    scoreText = `${activity.gamesWon ?? 0}/${activity.gamesPlayed ?? 0} games`;
  } else if (activity.sportType === 'team') {
    scoreText = `${activity.myScore ?? 0} – ${activity.theirScore ?? 0}`;
  } else if (activity.sportType === 'solo') {
    scoreText = [activity.soloTime, activity.soloDistance && `${activity.soloDistance} km`].filter(Boolean).join(' · ');
  }

  return (
    <View style={[styles.myCard, { borderLeftColor: sportSc.accent }]}>
      <View style={styles.myCardRow}>
        <View style={[styles.sportDot, { backgroundColor: sportSc.dark }]}>
          <Text style={{ fontSize: 13 }}>{sportSc.icon || '🏅'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.myCardCaption} numberOfLines={1}>
            {activity.caption || 'Match logged'}
          </Text>
          {scoreText ? <Text style={styles.myCardScore}>{scoreText}</Text> : null}
        </View>
        <Text style={[styles.myCardResult, { color: resultColor }]}>{resultEmoji}</Text>
      </View>
      {activity.personalBest && (
        <View style={styles.pbBadge}>
          <Text style={styles.pbBadgeText}>⭐ Personal Best</Text>
        </View>
      )}
    </View>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Mock feed data ────────────────────────────────────────────────────────
const MOCK_FEED = [
  {
    id: '1',
    type: 'activity',
    user: { name: 'Arjun Rajan', sport: 'football', initials: 'AR', avatarColor: '#22c55e' },
    text: 'Won a match vs FC Tigers 3–1 ⚽',
    isBest: true,
    time: '2m ago',
    reactions: { fire: 12, trophy: 5 },
  },
  {
    id: '2',
    type: 'activity',
    user: { name: 'Divya Raj', sport: 'badminton', initials: 'DR', avatarColor: '#fb923c' },
    text: 'Logged a training session — 8 win streak this week 🏸',
    isBest: false,
    time: '18m ago',
    reactions: { fire: 7, trophy: 2 },
  },
  {
    id: '3',
    type: 'club_post',
    club: { name: 'Chennai Smash Club', sport: 'badminton' },
    text: 'Registration open for the July Open Singles! Limited spots — first come first served.',
    time: '1h ago',
    reactions: { fire: 24, trophy: 0 },
    cta: 'Register',
  },
  {
    id: '4',
    type: 'activity',
    user: { name: 'Priya Suresh', sport: 'swimming', initials: 'PS', avatarColor: '#38bdf8' },
    text: 'New PB — 56.2s in 100m freestyle 🏊',
    isBest: true,
    time: '3h ago',
    reactions: { fire: 31, trophy: 14 },
  },
  {
    id: '5',
    type: 'moment',
    user: { name: 'Karthik Nair', sport: 'cricket', initials: 'KN', avatarColor: '#a3e635' },
    text: 'Match day vibes 🏏',
    time: '5h ago',
    reactions: { fire: 9, trophy: 1 },
    hasPhoto: true,
  },
  {
    id: '6',
    type: 'activity',
    user: { name: 'Meena Bose', sport: 'tennis', initials: 'MB', avatarColor: '#f59e0b' },
    text: 'Won the quarterfinal at Besant Nagar Club tournament 🎾',
    isBest: true,
    time: '8h ago',
    reactions: { fire: 18, trophy: 9 },
  },
];

function Avatar({ user, size = 40 }) {
  const sc = getSportColors(user.sport);
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, borderColor: sc.accent },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35, color: sc.accent }]}>
        {user.initials}
      </Text>
    </View>
  );
}

function FeedCard({ item }) {
  const [reacted, setReacted] = useState(null);
  const sc = item.user ? getSportColors(item.user.sport) : getSportColors('badminton');

  if (item.type === 'club_post') {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.clubBadge, { backgroundColor: sc.dark }]}>
            <Ionicons name="shield" size={14} color={sc.accent} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardName}>{item.club.name}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
          <View style={[styles.clubTag, { backgroundColor: sc.dark }]}>
            <Text style={[styles.clubTagText, { color: sc.accent }]}>Club</Text>
          </View>
        </View>
        <Text style={styles.cardText}>{item.text}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: sc.accent }]}>
            <Text style={styles.ctaBtnText}>{item.cta}</Text>
          </TouchableOpacity>
          <ReactionRow item={item} reacted={reacted} setReacted={setReacted} sc={sc} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar user={item.user} />
        <View style={styles.cardMeta}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName}>{item.user.name}</Text>
            {item.isBest && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>⭐ Best</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
      </View>

      {item.hasPhoto && (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image-outline" size={32} color={colors.textFaint} />
        </View>
      )}

      <Text style={styles.cardText}>{item.text}</Text>

      <View style={styles.cardFooter}>
        <ReactionRow item={item} reacted={reacted} setReacted={setReacted} sc={sc} />
      </View>
    </View>
  );
}

function ReactionRow({ item, reacted, setReacted, sc }) {
  return (
    <View style={styles.reactions}>
      <TouchableOpacity
        style={[styles.reactionBtn, reacted === 'fire' && { backgroundColor: sc.dark }]}
        onPress={() => setReacted(reacted === 'fire' ? null : 'fire')}
      >
        <Text style={styles.reactionEmoji}>🔥</Text>
        <Text style={[styles.reactionCount, reacted === 'fire' && { color: sc.accent }]}>
          {item.reactions.fire + (reacted === 'fire' ? 1 : 0)}
        </Text>
      </TouchableOpacity>
      {item.reactions.trophy > 0 && (
        <TouchableOpacity
          style={[styles.reactionBtn, reacted === 'trophy' && { backgroundColor: sc.dark }]}
          onPress={() => setReacted(reacted === 'trophy' ? null : 'trophy')}
        >
          <Text style={styles.reactionEmoji}>🏆</Text>
          <Text style={[styles.reactionCount, reacted === 'trophy' && { color: sc.accent }]}>
            {item.reactions.trophy + (reacted === 'trophy' ? 1 : 0)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { data } = useOnboarding();
  const primarySportKey = data.sports?.[0] || 'badminton';
  const sc = getSportColors(primarySportKey);
  const firstName = data.name?.split(' ')[0] || 'Athlete';
  const recentActivities = (data.activities || []).slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.greetingName}>{firstName} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <View style={styles.notifDot} />
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.zonePills}
      >
        {['For You', 'Following', 'Clubs', 'Tournaments'].map((z, i) => (
          <TouchableOpacity
            key={z}
            style={[styles.zonePill, i === 0 && { backgroundColor: colors.purple900, borderColor: colors.accent }]}
          >
            <Text style={[styles.zonePillText, i === 0 && { color: colors.accent }]}>{z}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}
      >
        {/* ── My Recent Activity ── */}
        {recentActivities.length > 0 ? (
          <View style={styles.mySection}>
            <View style={styles.mySectionHeader}>
              <Text style={styles.mySectionTitle}>My Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('LogMatch')}>
                <Text style={[styles.mySectionLink, { color: sc.accent }]}>+ Log</Text>
              </TouchableOpacity>
            </View>
            {recentActivities.map((act, i) => (
              <MyActivityCard key={act.id || i} activity={act} sc={sc} />
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.logPrompt, { borderColor: sc.accent + '55' }]}
            onPress={() => navigation.navigate('LogMatch')}
          >
            <View style={[styles.logPromptIcon, { backgroundColor: sc.dark }]}>
              <Ionicons name="add" size={22} color={sc.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.logPromptTitle}>Log your first activity</Text>
              <Text style={styles.logPromptSub}>Record a match, run, or session</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* ── Community Feed ── */}
        <Text style={styles.feedSectionTitle}>What's happening</Text>

        {MOCK_FEED.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}

        <View style={styles.feedEnd}>
          <Text style={styles.feedEndText}>You're all caught up ✓</Text>
        </View>
      </ScrollView>

      {/* ── FAB: Log Match ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: sc.accent }]}
        onPress={() => navigation.navigate('LogMatch')}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  greetingName: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary, marginTop: 1 },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  headerBtn: { padding: spacing.sm, position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.error,
    zIndex: 1,
  },

  // Zone pills
  zonePills: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  zonePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zonePillText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Feed
  feed: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontFamily: fonts.bold },
  cardMeta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  cardName: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary },
  cardTime: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint, marginTop: 2 },
  bestBadge: {
    backgroundColor: '#78350f',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  bestBadgeText: { fontFamily: fonts.semiBold, fontSize: 10, color: colors.accentGold },
  cardText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },

  // Photo placeholder
  photoPlaceholder: {
    height: 160,
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer / reactions
  cardFooter: {},
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reactions: { flexDirection: 'row', gap: spacing.sm },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.bgTertiary,
  },
  reactionEmoji: { fontSize: 13 },
  reactionCount: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },

  // Club card specifics
  clubBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  clubTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  clubTagText: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.4 },
  ctaBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  ctaBtnText: { fontFamily: fonts.bold, fontSize: 13, color: '#fff' },

  // End
  feedEnd: { alignItems: 'center', paddingVertical: spacing.xxl },
  feedEndText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textFaint },

  // My Recent Activity section
  mySection: { marginBottom: spacing.lg },
  mySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  mySectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  mySectionLink: { fontFamily: fonts.semiBold, fontSize: 13 },
  myCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  myCardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sportDot: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  myCardCaption: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textPrimary },
  myCardScore: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  myCardResult: { fontSize: 20 },
  pbBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#78350f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  pbBadgeText: { fontFamily: fonts.semiBold, fontSize: 10, color: '#fbbf24' },

  // Log prompt (when no activities yet)
  logPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  logPromptIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  logPromptTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  logPromptSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Feed section title
  feedSectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
