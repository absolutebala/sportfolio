import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, radius } from '../theme';

const SPORT_ICON = { badminton: '🏸', cricket: '🏏' };

function ClubCard({ club }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        {club.logo_url
          ? <Image source={{ uri: club.logo_url }} style={styles.clubLogo} />
          : <View style={styles.clubLogoPlaceholder}>
              <Text style={styles.clubLogoInitial}>{(club.name ?? 'C')[0].toUpperCase()}</Text>
            </View>
        }
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.clubName}>{club.name}</Text>
          {club.verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
        </View>
        {club.description ? (
          <Text style={styles.clubDesc} numberOfLines={2}>{club.description}</Text>
        ) : null}
        <View style={styles.sportTags}>
          {(club.sports ?? []).map(s => (
            <Text key={s} style={styles.sportTag}>{SPORT_ICON[s] ?? '🏅'} {s}</Text>
          ))}
        </View>
        <Text style={styles.memberCount}>{club.member_count ?? 0} members</Text>
      </View>
    </View>
  );
}

export default function ClubsScreen() {
  const navigation = useNavigation();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClubs = useCallback(async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.warn('[Clubs] fetch error:', error.message);
    setClubs(data ?? []);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchClubs().finally(() => setLoading(false));
  }, [fetchClubs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClubs();
    setRefreshing(false);
  }, [fetchClubs]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clubs</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateClub')}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ClubCard club={item} />}
          contentContainerStyle={clubs.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏟️</Text>
              <Text style={styles.emptyTitle}>No clubs yet</Text>
              <Text style={styles.emptySub}>Be the first to create one!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.text },
  createBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: colors.primary, borderRadius: radius.full,
  },
  createBtnText: { fontFamily: fonts.semiBold, fontSize: 13, color: '#fff' },

  list: { padding: spacing.md, gap: spacing.md },
  emptyContainer: { flex: 1 },

  card: {
    flexDirection: 'row', gap: spacing.md, padding: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  cardLeft: {},
  clubLogo: { width: 52, height: 52, borderRadius: radius.md },
  clubLogoPlaceholder: {
    width: 52, height: 52, borderRadius: radius.md,
    backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center',
  },
  clubLogoInitial: { fontFamily: fonts.bold, fontSize: 22, color: colors.primary },

  cardBody: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clubName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, flex: 1 },
  verifiedBadge: {
    fontFamily: fonts.medium, fontSize: 10, color: colors.badminton,
    backgroundColor: colors.badminton + '22', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full,
  },
  clubDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  sportTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  sportTag: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  memberCount: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
