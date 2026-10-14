import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, getSportColors } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';

const MY_CLUBS = [
  {
    id: '1',
    name: 'Chennai Smash Club',
    sport: 'badminton',
    role: 'Member',
    members: 148,
    nextEvent: 'Open Singles — Jul 12',
    unread: 3,
  },
];

const UPCOMING_EVENTS = [
  {
    id: 'e1',
    title: 'Open Singles Tournament',
    club: 'Chennai Smash Club',
    sport: 'badminton',
    date: 'Jul 12',
    slots: '8 left',
  },
  {
    id: 'e2',
    title: 'Friendly 5-a-side',
    club: 'FC Chennai United',
    sport: 'football',
    date: 'Jul 15',
    slots: '4 left',
  },
  {
    id: 'e3',
    title: 'Summer Swim Meet',
    club: 'Aqua Masters',
    sport: 'swimming',
    date: 'Jul 20',
    slots: 'Open',
  },
];

export default function ClubsScreen({ navigation }) {
  const { data } = useOnboarding();
  const [activeTab, setActiveTab] = useState('my');
  const primarySport = data.sports?.[0] || 'badminton';
  const sc = getSportColors(primarySport);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Clubs</Text>
        <TouchableOpacity style={[styles.createBtn, { backgroundColor: sc.dark }]}>
          <Ionicons name="add" size={18} color={sc.accent} />
          <Text style={[styles.createBtnText, { color: sc.accent }]}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[{ key: 'my', label: 'My Clubs' }, { key: 'events', label: 'Events' }, { key: 'explore', label: 'Explore' }].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'my' && (
          <>
            {MY_CLUBS.map((club) => {
              const csc = getSportColors(club.sport);
              return (
                <TouchableOpacity key={club.id} style={styles.myClubCard}>
                  <View style={styles.myClubTop}>
                    <View style={[styles.clubIcon, { backgroundColor: csc.dark }]}>
                      <Ionicons name="shield" size={22} color={csc.accent} />
                    </View>
                    <View style={styles.myClubInfo}>
                      <View style={styles.myClubNameRow}>
                        <Text style={styles.clubName}>{club.name}</Text>
                        {club.unread > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{club.unread}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.clubMeta}>{club.members} members · {club.role}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
                  </View>
                  {club.nextEvent && (
                    <View style={[styles.eventStrip, { backgroundColor: csc.dark }]}>
                      <Ionicons name="calendar-outline" size={13} color={csc.accent} />
                      <Text style={[styles.eventStripText, { color: csc.light }]}>
                        Next: {club.nextEvent}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.joinMore}>
              <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.joinMoreText}>Find more clubs to join</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'events' && (
          <>
            <Text style={styles.sectionLabel}>Upcoming Events</Text>
            {UPCOMING_EVENTS.map((evt) => {
              const esc = getSportColors(evt.sport);
              return (
                <View key={evt.id} style={styles.eventCard}>
                  <View style={[styles.eventDateBox, { backgroundColor: esc.dark }]}>
                    <Text style={[styles.eventDateText, { color: esc.accent }]}>{evt.date}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{evt.title}</Text>
                    <Text style={styles.eventClub}>{evt.club}</Text>
                    <View style={[styles.slotBadge, { backgroundColor: esc.dark }]}>
                      <Text style={[styles.slotText, { color: esc.accent }]}>{evt.slots} slots</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.registerBtn, { backgroundColor: esc.accent }]}>
                    <Text style={styles.registerBtnText}>Join</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {activeTab === 'explore' && (
          <>
            <Text style={styles.sectionLabel}>Popular Clubs in Chennai</Text>
            {[
              { name: 'Chennai Smash Club', sport: 'badminton', members: 148 },
              { name: 'FC Chennai United', sport: 'football', members: 213 },
              { name: 'Aqua Masters', sport: 'swimming', members: 87 },
              { name: 'RKN Cricket Academy', sport: 'cricket', members: 174 },
              { name: 'Baseline Tennis Club', sport: 'tennis', members: 62 },
            ].map((c) => {
              const csc = getSportColors(c.sport);
              return (
                <View key={c.name} style={styles.exploreCard}>
                  <View style={[styles.clubIcon, { backgroundColor: csc.dark }]}>
                    <Ionicons name="shield" size={20} color={csc.accent} />
                  </View>
                  <View style={styles.myClubInfo}>
                    <Text style={styles.clubName}>{c.name}</Text>
                    <Text style={styles.clubMeta}>{c.members} members</Text>
                  </View>
                  <TouchableOpacity style={[styles.requestBtn, { borderColor: csc.accent }]}>
                    <Text style={[styles.requestBtnText, { color: csc.accent }]}>Request</Text>
                  </TouchableOpacity>
                </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  createBtnText: { fontSize: 13, fontWeight: '700' },

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
  },

  // My Club card
  myClubCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  myClubTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  clubIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myClubInfo: { flex: 1 },
  myClubNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  clubName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  clubMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  unreadBadge: {
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  eventStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  eventStripText: { fontSize: 12, fontWeight: '600' },

  joinMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  joinMoreText: { flex: 1, fontSize: 14, color: colors.textSecondary, fontWeight: '600' },

  // Event card
  eventCard: {
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
  eventDateBox: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  eventClub: { fontSize: 11, color: colors.textMuted, marginTop: 2, marginBottom: 4 },
  slotBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  slotText: { fontSize: 10, fontWeight: '700' },
  registerBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  registerBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Explore
  exploreCard: {
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
  requestBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  requestBtnText: { fontSize: 12, fontWeight: '700' },
});
