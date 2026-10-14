import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, radius } from '../theme';

// ── Sport highlights cycling on the hero ─────────────────────────────────────
const HIGHLIGHTS = [
  { emoji: '🏸', sport: 'Badminton', name: 'Priya S.', action: 'Won district finals' },
  { emoji: '⚽', sport: 'Football', name: 'Arjun R.', action: 'Hat-trick vs FC Tigers' },
  { emoji: '🏊', sport: 'Swimming', name: 'Kavya M.', action: 'New personal best 🏆' },
  { emoji: '🎾', sport: 'Tennis', name: 'Rahul D.', action: 'State championship run' },
  { emoji: '🏏', sport: 'Cricket', name: 'Suresh K.', action: 'Century at club level' },
];

const ACCENT_COLORS = ['#fb923c', '#22c55e', '#38bdf8', '#f59e0b', '#a3e635'];

function HeroCard({ highlight, accent, opacity, translateY }) {
  return (
    <Animated.View style={[styles.heroCard, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.heroCardLeft, { backgroundColor: accent + '22' }]}>
        <Text style={styles.heroEmoji}>{highlight.emoji}</Text>
      </View>
      <View style={styles.heroCardBody}>
        <Text style={styles.heroCardName}>{highlight.name}</Text>
        <Text style={styles.heroCardAction}>{highlight.action}</Text>
        <Text style={[styles.heroCardSport, { color: accent }]}>{highlight.sport}</Text>
      </View>
    </Animated.View>
  );
}

// ── Decorative floating dots ──────────────────────────────────────────────────
function FloatDot({ style, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  return (
    <Animated.View
      style={[style, { width: 8, height: 8, borderRadius: 4, backgroundColor: color, opacity: 0.4, transform: [{ translateY: ty }] }]}
    />
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cycling highlight index
  const [idx, setIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setIdx((prev) => (prev + 1) % HIGHLIGHTS.length);
        slideAnim.setValue(10);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const highlight = HIGHLIGHTS[idx];
  const accent = ACCENT_COLORS[idx];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* Background gradient */}
      <LinearGradient
        colors={['#0a0d14', '#0f1322', '#0a0d14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative dots */}
      <FloatDot style={{ position: 'absolute', top: 90, left: 32 }} color="#fb923c" />
      <FloatDot style={{ position: 'absolute', top: 140, right: 48 }} color="#22c55e" />
      <FloatDot style={{ position: 'absolute', top: 200, left: 80 }} color="#38bdf8" />

      <View style={styles.container}>

        {/* ── Top: Logo + tagline ── */}
        <View style={styles.topSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>S</Text>
            </View>
            <Text style={styles.appName}>Sportfolio</Text>
          </View>
          <Text style={styles.tagline}>Your sports identity, one place.</Text>
        </View>

        {/* ── Middle: Hero headline + live activity card ── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Track. Connect.{'\n'}
            <Text style={{ color: accent }}>Shine.</Text>
          </Text>
          <Text style={styles.heroSub}>
            Join athletes building their sports profile — one match at a time.
          </Text>

          {/* Live activity preview card */}
          <View style={styles.liveWrap}>
            <View style={styles.livePill}>
              <View style={[styles.liveDot, { backgroundColor: accent }]} />
              <Text style={styles.liveText}>Live on Sportfolio</Text>
            </View>
            <HeroCard
              highlight={highlight}
              accent={accent}
              opacity={fadeAnim}
              translateY={slideAnim}
            />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { value: '12K+', label: 'Athletes' },
              { value: '48K+', label: 'Matches' },
              { value: '200+', label: 'Clubs' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Bottom: Sign in ── */}
        <View style={styles.bottomSection}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.btnDisabled]}
            onPress={handleGoogle}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a1a" />
            ) : (
              <View style={styles.googleBtnInner}>
                {/* Google G icon */}
                <View style={styles.googleIconWrap}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing you agree to our{' '}
            <Text style={{ color: colors.accent }}>Terms</Text>
            {' '}and{' '}
            <Text style={{ color: colors.accent }}>Privacy Policy</Text>
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    justifyContent: 'space-between',
  },

  // ── Top
  topSection: { alignItems: 'flex-start' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  logoMark: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#fb923c',
    alignItems: 'center', justifyContent: 'center',
  },
  logoMarkText: { fontFamily: fonts.extraBold, fontSize: 18, color: '#fff' },
  appName: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.textPrimary, letterSpacing: -0.5 },
  tagline: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  // ── Hero
  heroSection: { flex: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  heroTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 38,
    color: colors.textPrimary,
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  // ── Live card
  liveWrap: {
    marginBottom: spacing.xl,
  },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: spacing.md,
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
  },
  liveText: {
    fontFamily: fonts.semiBold, fontSize: 11,
    color: colors.textMuted, letterSpacing: 0.4,
  },
  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#11141f',
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: '#1e293b',
    padding: spacing.md,
  },
  heroCardLeft: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 24 },
  heroCardBody: { flex: 1 },
  heroCardName: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textPrimary },
  heroCardAction: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  heroCardSport: { fontFamily: fonts.semiBold, fontSize: 10, marginTop: 4, letterSpacing: 0.3 },

  // ── Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#11141f',
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: '#1e293b',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.textPrimary, letterSpacing: -0.5 },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // ── Bottom
  bottomSection: {},
  errorText: {
    fontFamily: fonts.regular, fontSize: 13, color: colors.error,
    marginBottom: spacing.md, textAlign: 'center',
  },
  googleBtn: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    height: 56,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  googleBtnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  googleIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#4285F4',
    alignItems: 'center', justifyContent: 'center',
  },
  googleG: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
  googleBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#1a1a1a' },

  terms: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 18,
  },
});
