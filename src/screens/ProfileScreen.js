import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';
import { SPORTS } from '../data/onboardingData';
import { pickImage } from '../utils/imagePicker';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'discover', icon: 'compass-outline', label: 'Discover' },
  { key: 'post', icon: 'add-circle-outline', label: 'Post' },
  { key: 'clubs', icon: 'people-outline', label: 'Clubs' },
  { key: 'profile', icon: 'person-outline', label: 'Profile' },
];

function initials(name) {
  if (!name) return '??';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

function timeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MOMENT_GAP = 8;
const MOMENT_MARGIN = 16;
const MOMENT_TILE_SIZE =
  (SCREEN_WIDTH - MOMENT_MARGIN * 2 - MOMENT_GAP * 2) / 3;

export default function ProfileScreen({ navigation }) {
  const { data, update, addMoment: addMomentToList } = useOnboarding();
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [bioDraft, setBioDraft] = useState(data.bio);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(data.name);

  const level = data.level || 'recreational';
  const primarySportKey = data.sports[0] || 'badminton';
  const primarySport = SPORTS.find((s) => s.key === primarySportKey);

  const matches = data.activities.length;
  const wins = data.activities.filter((a) => a.result === 'win').length;
  const bestSessions = data.activities.filter((a) => a.isBest).length;

  function saveBio() {
    update({ bio: bioDraft.trim() });
    setBioModalOpen(false);
  }

  function saveName() {
    if (nameDraft.trim().length > 0) {
      update({ name: nameDraft.trim() });
    }
    setNameModalOpen(false);
  }

  function editAvatar() {
    pickImage({
      aspect: [1, 1],
      onPicked: (uri) => update({ avatarUri: uri }),
    });
  }

  function editCover() {
    pickImage({
      aspect: [16, 9],
      onPicked: (uri) => update({ coverUri: uri }),
    });
  }

  function addMoment() {
    pickImage({
      aspect: [4, 5],
      onPicked: (uri) => {
        addMomentToList({ id: Date.now().toString(), uri, date: new Date() });
      },
    });
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>MY PROFILE</Text>
          <View style={styles.topbarIcons}>
            <Ionicons name="share-outline" size={18} color={colors.textMuted} />
            <Ionicons name="settings-outline" size={18} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.hero}>
          {data.coverUri && (
            <Image source={{ uri: data.coverUri }} style={styles.coverImage} resizeMode="cover" />
          )}
          <TouchableOpacity style={styles.coverEdit} onPress={editCover}>
            <Ionicons name="camera-outline" size={13} color="#fed7aa" />
          </TouchableOpacity>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {data.avatarUri ? (
                <Image source={{ uri: data.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>{initials(data.name)}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.avatarEdit} onPress={editAvatar}>
              <Ionicons name="pencil" size={11} color="#431407" />
            </TouchableOpacity>
          </View>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>
              {primarySport?.label || 'Sport'}
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.pnameRow}>
            <View>
              <Text style={styles.pname}>{data.name || 'Your name'}</Text>
              <Text style={styles.pmeta}>
                {level === 'competitive' ? 'Competitive' : 'Recreational'} ·{' '}
                {data.city.split(',')[0]}, {data.city.split(',')[1]?.trim() || 'India'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setNameDraft(data.name);
                setNameModalOpen(true);
              }}
              hitSlop={8}
            >
              <Ionicons name="pencil" size={14} color={colors.textFaint} />
            </TouchableOpacity>
          </View>

          <View style={styles.bioRow}>
            <Text style={styles.bioText}>
              {data.bio || 'Add a short bio so other players know a bit about you.'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setBioDraft(data.bio);
                setBioModalOpen(true);
              }}
              hitSlop={8}
            >
              <Ionicons name="pencil" size={13} color={colors.textFaint} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{bestSessions}</Text>
              <Text style={styles.statLabel}>Best sessions</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>FAVOURITE SPORTS</Text>
        <View style={styles.favRow}>
          {data.sports.length === 0 && (
            <Text style={styles.emptyInlineText}>No sports added yet</Text>
          )}
          {data.sports.map((key) => {
            const s = SPORTS.find((sp) => sp.key === key);
            if (!s) return null;
            return (
              <View key={key} style={styles.favChip}>
                <Ionicons name={s.icon} size={13} color="#fed7aa" />
                <Text style={styles.favChipText}>{s.label}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        {data.activities.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedText}>
              Your activity log is empty.{'\n'}Play a match and log it to build your
              passport.
            </Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {data.activities.map((a, i) => (
              <View key={i} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityIcon,
                    a.result === 'win' && { backgroundColor: '#14532d' },
                    a.result === 'loss' && { backgroundColor: '#450a0a' },
                  ]}
                >
                  <Ionicons
                    name={
                      a.result === 'win'
                        ? 'trophy'
                        : a.result === 'loss'
                        ? 'close'
                        : 'remove'
                    }
                    size={14}
                    color={
                      a.result === 'win'
                        ? '#86efac'
                        : a.result === 'loss'
                        ? '#fca5a5'
                        : '#cbd5e1'
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText}>
                    {a.result === 'win'
                      ? 'Won'
                      : a.result === 'loss'
                      ? 'Lost'
                      : 'Drew'}{' '}
                    {a.opponent ? `vs ${a.opponent}` : 'a match'}
                    {a.isBest ? ' ⭐ Best session' : ''}
                  </Text>
                  {a.notes ? (
                    <Text style={styles.activityNotes}>{a.notes}</Text>
                  ) : null}
                </View>
                <Text style={styles.activityTime}>{timeAgo(a.date)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.momentsHeaderRow}>
          <Text style={[styles.sectionTitle, { marginHorizontal: 0 }]}>MOMENTS</Text>
          {data.moments.length > 0 && (
            <TouchableOpacity onPress={addMoment} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={18} color="#fb923c" />
            </TouchableOpacity>
          )}
        </View>

        {data.moments.length === 0 ? (
          <View style={styles.emptyMoments}>
            <Ionicons name="camera-outline" size={22} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>No moments yet</Text>
            <Text style={styles.emptySub}>Photos from your games will show up here</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={addMoment}>
              <Text style={styles.emptyBtnText}>Add a moment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.momentsGrid}>
            {data.moments.map((m) => (
              <Image key={m.id} source={{ uri: m.uri }} style={styles.momentTile} resizeMode="cover" />
            ))}
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating action button — log a match */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('LogActivity')}
      >
        <Ionicons name="add" size={24} color="#431407" />
      </TouchableOpacity>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => (
          <View key={item.key} style={styles.navItem}>
            <Ionicons
              name={item.icon}
              size={19}
              color={item.key === 'profile' ? '#fb923c' : colors.textFaint}
            />
            <Text
              style={[
                styles.navLabel,
                item.key === 'profile' && { color: '#fb923c' },
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Bio edit modal */}
      <Modal visible={bioModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={() => setBioModalOpen(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit bio</Text>
            <TextInput
              style={styles.modalInput}
              value={bioDraft}
              onChangeText={setBioDraft}
              multiline
              maxLength={120}
              placeholder="Tell other players a bit about yourself..."
              placeholderTextColor={colors.textFaint}
              autoFocus
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBioModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveBio}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={nameModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={() => setNameModalOpen(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit name</Text>
            <TextInput
              style={styles.modalInputSingle}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Your full name"
              placeholderTextColor={colors.textFaint}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveName}
              autoCapitalize="words"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setNameModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveName}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 6,
  },
  topbarTitle: { color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },
  topbarIcons: { flexDirection: 'row', gap: spacing.lg },
  hero: {
    height: 78,
    backgroundColor: '#7c2d12',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    overflow: 'visible',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  coverEdit: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: { marginBottom: -22, zIndex: 10, elevation: 10 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgPrimary,
    borderWidth: 3,
    borderColor: '#fb923c',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { color: '#fb923c', fontSize: 20, fontWeight: '700' },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fb923c',
    borderWidth: 2,
    borderColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  sportBadge: {
    backgroundColor: '#9a3412',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
    marginBottom: 6,
  },
  sportBadgeText: { color: '#fed7aa', fontSize: 10, fontWeight: '600' },
  profileCard: {
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    paddingTop: 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pnameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  pname: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  pmeta: { color: colors.textSecondary, fontSize: 12 },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  bioText: { flex: 1, color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, backgroundColor: '#7c2d12', borderRadius: radius.lg, paddingVertical: 10, alignItems: 'center' },
  statNum: { color: '#fed7aa', fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  statLabel: { color: '#fb923c', fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  momentsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  momentTile: {
    width: MOMENT_TILE_SIZE,
    height: MOMENT_TILE_SIZE,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCard,
  },
  favRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginHorizontal: spacing.lg },
  favChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7c2d12',
    borderRadius: radius.md,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  favChipText: { color: '#fed7aa', fontSize: 12, fontWeight: '600' },
  emptyInlineText: { color: colors.textFaint, fontSize: 12 },
  activityList: { marginHorizontal: spacing.lg, gap: spacing.sm },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  activityNotes: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  activityTime: { color: colors.textFaint, fontSize: 10 },
  emptyFeed: { marginHorizontal: spacing.lg, paddingVertical: spacing.lg },
  emptyFeedText: { color: colors.textFaint, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  emptyMoments: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: spacing.sm, marginBottom: 3 },
  emptySub: { color: colors.textMuted, fontSize: 11, marginBottom: spacing.md, textAlign: 'center' },
  emptyBtn: { backgroundColor: '#fb923c', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.sm },
  emptyBtnText: { color: '#431407', fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 86,
    right: 18,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fb923c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: colors.bgTertiary,
    backgroundColor: colors.bgPrimary,
  },
  navItem: { alignItems: 'center', gap: 3 },
  navLabel: { fontSize: 9, color: colors.textFaint },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  doneLink: {
    color: '#fb923c',
    fontSize: 12,
    fontWeight: '700',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalInputSingle: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    color: colors.textPrimary,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.lg,
    backgroundColor: '#fb923c',
    alignItems: 'center',
  },
  modalSaveText: { color: '#431407', fontSize: 13, fontWeight: '700' },
});
