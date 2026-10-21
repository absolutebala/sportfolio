import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { colors, fonts, spacing, radius } from '../theme';

const SPORT_ICON = { badminton: '🏸', cricket: '🏏' };
const SPORT_COLOR = { badminton: colors.badminton, cricket: colors.cricket };

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) console.warn('[Profile] activities error:', error.message);
        setActivities(data ?? []);
        setLoading(false);
      });
  }, [user]);

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + name */}
        <View style={styles.profileCard}>
          {profile?.avatar_url
            ? <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            : <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(profile?.full_name ?? user?.email ?? '?')[0].toUpperCase()}
                </Text>
              </View>
          }
          <Text style={styles.name}>{profile?.full_name ?? 'Player'}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {/* Sport badges */}
          {profile?.sports?.length > 0 && (
            <View style={styles.sportBadges}>
              {profile.sports.map(s => (
                <View key={s} style={[styles.sportBadge, { borderColor: (SPORT_COLOR[s] ?? colors.primary) + '55' }]}>
                  <Text style={styles.sportBadgeText}>{SPORT_ICON[s] ?? '🏅'} {s}</Text>
                </View>
              ))}
            </View>
          )}

          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Activities" value={activities.length} />
          <StatBox label="Sports" value={profile?.sports?.length ?? 0} />
        </View>

        {/* Activity history */}
        <Text style={styles.sectionTitle}>Activity History</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : activities.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No activities logged yet. Hit Log to get started!</Text>
          </View>
        ) : (
          activities.map(item => (
            <ActivityRow key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityRow({ item }) {
  const sport = item.sport ?? 'badminton';
  const color = SPORT_COLOR[sport] ?? colors.primary;
  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: color + '22' }]}>
        <Text style={{ fontSize: 18 }}>{SPORT_ICON[sport] ?? '🏅'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.activitySummary} numberOfLines={2}>{item.summary}</Text>
        <Text style={styles.activityDate}>{formatDate(item.created_at)}</Text>
      </View>
    </View>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.lg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.text },
  signOutBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
  },
  signOutText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },

  profileCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontFamily: fonts.bold, fontSize: 32, color: colors.primary },
  name: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  email: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  sportBadges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  sportBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1, backgroundColor: colors.bgCard,
  },
  sportBadgeText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  bio: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: spacing.md },
  statBox: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontFamily: fonts.bold, fontSize: 28, color: colors.primary },
  statLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },

  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },

  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  activityIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  activitySummary: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, lineHeight: 18 },
  activityDate: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },

  empty: { padding: spacing.lg, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
