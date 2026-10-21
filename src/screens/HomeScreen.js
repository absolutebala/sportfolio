import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, radius } from '../theme';

const SPORT_COLOR = { badminton: colors.badminton, cricket: colors.cricket };
const SPORT_ICON = { badminton: '🏸', cricket: '🏏' };

function ActivityCard({ item }) {
  const sport = item.sport ?? 'badminton';
  const accentColor = SPORT_COLOR[sport] ?? colors.primary;

  return (
    <View style={styles.card}>
      {/* Author row */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrap}>
          {item.profiles?.avatar_url
            ? <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
            : <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor + '33' }]}>
                <Text style={[styles.avatarInitial, { color: accentColor }]}>
                  {(item.profiles?.full_name ?? '?')[0].toUpperCase()}
                </Text>
              </View>
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{item.profiles?.full_name ?? 'Player'}</Text>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.sportBadge, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
          <Text style={styles.sportBadgeText}>{SPORT_ICON[sport]} {sport}</Text>
        </View>
      </View>

      {/* Summary */}
      <Text style={styles.summary}>{item.summary}</Text>

      {/* Stats row for badminton */}
      {sport === 'badminton' && item.details && (
        <View style={styles.statsRow}>
          {item.details.games_played != null && (
            <StatChip label="Games" value={item.details.games_played} color={accentColor} />
          )}
          {item.details.games_won != null && (
            <StatChip label="Won" value={item.details.games_won} color={accentColor} />
          )}
          {item.details.games_lost != null && (
            <StatChip label="Lost" value={item.details.games_lost} color={colors.error} />
          )}
        </View>
      )}

      {/* Stats row for cricket */}
      {sport === 'cricket' && item.details && (
        <View style={styles.statsRow}>
          {item.details.runs != null && (
            <StatChip label="Runs" value={item.details.runs} color={accentColor} />
          )}
          {item.details.wickets != null && (
            <StatChip label="Wickets" value={item.details.wickets} color={accentColor} />
          )}
          {item.details.result && (
            <StatChip label="Result" value={item.details.result} color={accentColor} />
          )}
        </View>
      )}

      {/* Reaction row */}
      <View style={styles.reactionRow}>
        <TouchableOpacity style={styles.reactionBtn}>
          <Text style={styles.reactionText}>🔥 {item.reaction_count ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionBtn}>
          <Text style={styles.reactionText}>💬 {item.comment_count ?? 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatChip({ label, value, color }) {
  return (
    <View style={[styles.statChip, { borderColor: color + '44' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles ( full_name, avatar_url )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[Feed] fetch error:', error.message);
    } else {
      setActivities(data ?? []);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFeed().finally(() => setLoading(false));
  }, [fetchFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  }, [fetchFeed]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}><Text style={styles.logoS}>S</Text></View>
          <Text style={styles.logoText}>Sportfolio</Text>
        </View>
      </View>

      <FlatList
        data={activities}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ActivityCard item={item} />}
        contentContainerStyle={activities.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySub}>Log your first game and it'll appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoS: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  logoText: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },

  list: { padding: spacing.md, gap: spacing.md },
  emptyContainer: { flex: 1 },

  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarWrap: {},
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontFamily: fonts.bold, fontSize: 16 },
  authorName: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  cardDate: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 1 },

  sportBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  sportBadgeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textSecondary },

  summary: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statChip: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.bgMuted,
    minWidth: 56,
  },
  statValue: { fontFamily: fonts.bold, fontSize: 18 },
  statLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, marginTop: 1 },

  reactionRow: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.xs },
  reactionBtn: { flexDirection: 'row', alignItems: 'center' },
  reactionText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
