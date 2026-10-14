import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import ProgressHeader from '../components/ProgressHeader';
import { CLUB_OPTIONS } from '../data/onboardingData';
import { searchClubs } from '../data/clubsData';
import { useOnboarding } from '../context/OnboardingContext';

export default function ClubScreen({ navigation }) {
  const { data, update } = useOnboarding();
  const [choice, setChoice] = useState(data.clubChoice);
  const [query, setQuery] = useState('');
  const [joinedClub, setJoinedClub] = useState(data.selectedClub);

  const results = choice === 'yes' ? searchClubs(query, data.sports) : [];

  function selectOption(optionKey) {
    setChoice(optionKey);
    if (optionKey !== 'yes') {
      // No club search needed for these — proceed immediately
      update({ clubChoice: optionKey, selectedClub: null });
      navigation.navigate('ProfileBuilder');
    }
  }

  function joinClub(club) {
    setJoinedClub(club);
  }

  function handleContinue() {
    update({ clubChoice: choice, selectedClub: joinedClub });
    navigation.navigate('ProfileBuilder');
  }

  function skip() {
    update({ clubChoice: null, selectedClub: null });
    navigation.navigate('ProfileBuilder');
  }

  return (
    <SafeAreaView style={styles.root}>
      <ProgressHeader step={5} onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.title}>Are you part of a club?</Text>
        <Text style={styles.sub}>Tap an option to continue.</Text>

        <View style={styles.options}>
          {CLUB_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.opt, choice === opt.key && styles.optSelected]}
              activeOpacity={0.7}
              onPress={() => selectOption(opt.key)}
            >
              <Ionicons
                name={opt.icon}
                size={18}
                color={choice === opt.key ? '#86efac' : colors.textMuted}
              />
              <View style={styles.optText}>
                <Text style={styles.optTitle}>{opt.title}</Text>
                <Text style={styles.optDesc}>{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {choice === 'yes' && (
          <View style={styles.searchSection}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={14} color={colors.textFaint} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search clubs near ${data.city.split(',')[0]}...`}
                placeholderTextColor={colors.textFaint}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 220 }}
              renderItem={({ item }) => {
                const isJoined = joinedClub?.id === item.id;
                return (
                  <View style={styles.clubResult}>
                    <View style={styles.clubIcon}>
                      <Text style={styles.clubIconText}>
                        {item.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubName}>{item.name}</Text>
                      <Text style={styles.clubMeta}>
                        {item.city} · {item.members} members
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.joinBtn, isJoined && styles.joinedBtn]}
                      onPress={() => joinClub(item)}
                    >
                      <Text
                        style={[
                          styles.joinBtnText,
                          isJoined && styles.joinedBtnText,
                        ]}
                      >
                        {isJoined ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.noResults}>
                  No clubs found{query ? ` for "${query}"` : ''}.
                </Text>
              }
            />
          </View>
        )}
      </View>

      <View style={styles.bottomArea}>
        {choice === 'yes' ? (
          <>
            <TouchableOpacity style={styles.nextBtn} onPress={handleContinue}>
              <Text style={styles.nextBtnText}>
                {joinedClub ? 'Continue' : 'Continue without joining'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={skip}>
            <Text style={styles.skipLink}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingTop: spacing.xxl,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgTertiary,
    padding: spacing.lg,
  },
  optSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#14532d',
  },
  optText: {
    flex: 1,
  },
  optTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  optDesc: {
    color: colors.textMuted,
    fontSize: 11,
  },
  searchSection: {
    marginTop: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  clubResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  clubIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#9a3412',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubIconText: {
    color: '#fed7aa',
    fontSize: 12,
    fontWeight: '700',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  clubMeta: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  joinBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  joinBtnText: {
    color: '#052e16',
    fontSize: 11,
    fontWeight: '700',
  },
  joinedBtn: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinedBtnText: {
    color: colors.textSecondary,
  },
  noResults: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  bottomArea: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl + 4,
    paddingTop: spacing.lg,
  },
  nextBtn: {
    backgroundColor: '#22c55e',
    borderRadius: radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#052e16',
    fontSize: 15,
    fontWeight: '700',
  },
  skipLink: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
});
