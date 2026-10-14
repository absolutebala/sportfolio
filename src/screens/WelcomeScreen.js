import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

const SPORT_BADGES = [
  { emoji: '🏸', label: 'Badminton', x: 0.08, y: 0.18 },
  { emoji: '⚽', label: 'Football', x: 0.72, y: 0.12 },
  { emoji: '🏊', label: 'Swimming', x: 0.62, y: 0.34 },
  { emoji: '🎾', label: 'Tennis', x: 0.05, y: 0.42 },
  { emoji: '🏏', label: 'Cricket', x: 0.76, y: 0.54 },
  { emoji: '🏃', label: 'Athletics', x: 0.10, y: 0.60 },
];

function FloatingBadge({ emoji, label, x, y, delay }) {
  const float = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -8, duration: 2200, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatBadge,
        { left: x * W, top: y * (H * 0.52), opacity, transform: [{ translateY: float }] },
      ]}
    >
      <Text style={styles.floatEmoji}>{emoji}</Text>
      <Text style={styles.floatLabel}>{label}</Text>
    </Animated.View>
  );
}

function AuthButton({ icon, label, onPress, variant = 'ghost' }) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.authBtn, variant === 'primary' && styles.authBtnPrimary]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.authBtnIcon}>{icon}</View>
        <Text style={[styles.authBtnLabel, variant === 'primary' && styles.authBtnLabelPrimary]}>
          {label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={variant === 'primary' ? colors.purple900 : colors.textFaint}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function WelcomeScreen({ navigation }) {
  const heroAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(sheetAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Deep purple background */}
      <View style={[StyleSheet.absoluteFill, styles.bg]} />

      {/* Glow orb */}
      <View style={styles.glowOrb} />

      {/* Floating sport badges */}
      {SPORT_BADGES.map((b, i) => (
        <FloatingBadge key={b.label} {...b} delay={i * 120} />
      ))}

      <SafeAreaView style={styles.safe}>
        {/* Brand */}
        <Animated.View
          style={[styles.brand, {
            opacity: heroAnim,
            transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
          }]}
        >
          <View style={styles.logoWrap}>
            <View style={styles.logoGrad}>
              <Text style={styles.logoLetter}>i</Text>
            </View>
          </View>
          <Text style={styles.brandName}>iSportOne</Text>
          <View style={styles.taglinePill}>
            <Text style={styles.taglineText}>THE PROFESSIONAL NETWORK FOR SPORT</Text>
          </View>
        </Animated.View>

        {/* Hero headline */}
        <Animated.View
          style={[styles.hero, {
            opacity: heroAnim,
            transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}
        >
          <Text style={styles.heroLine1}>Your Sport.</Text>
          <Text style={styles.heroLine2}>Your Legacy.</Text>
          <Text style={styles.heroAccent}>Documented Forever.</Text>
          <Text style={styles.heroCopy}>
            Build your sports passport. Connect with athletes.{'\n'}Track every match, milestone and moment.
          </Text>
        </Animated.View>

        {/* Auth sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
          <View style={styles.sheetGrad}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Get started free</Text>
            <Text style={styles.sheetSub}>Your lifelong sports passport starts here</Text>

            <View style={styles.authBtns}>
              <AuthButton
                variant="primary"
                label="Continue with Google"
                icon={<Text style={styles.googleG}>G</Text>}
                onPress={() => navigation.navigate('RoleSelection')}
              />
              <AuthButton
                label="Continue with Apple"
                icon={<Ionicons name="logo-apple" size={17} color={colors.textPrimary} />}
                onPress={() => navigation.navigate('RoleSelection')}
              />
              <AuthButton
                label="Continue with Email"
                icon={<Ionicons name="mail-outline" size={16} color={colors.purple300} />}
                onPress={() => navigation.navigate('RoleSelection')}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already a member?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('RoleSelection')}>
              <Text style={styles.signInBtnText}>Sign in →</Text>
            </TouchableOpacity>

            <Text style={styles.u16}>
              Under 16?{' '}
              <Text style={styles.u16Link}>Parent sign-up</Text>
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  bg: { backgroundColor: '#1a0a3d' },

  glowOrb: {
    position: 'absolute',
    width: W * 0.9,
    height: W * 0.9,
    borderRadius: W * 0.45,
    backgroundColor: 'rgba(124,58,237,0.15)',
    top: H * 0.05,
    left: W * 0.05,
  },

  floatBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(30,26,56,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  floatEmoji: { fontSize: 13 },
  floatLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: colors.purple200 },

  brand: { alignItems: 'center', paddingTop: spacing.xl },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6d28d9',
  },
  logoLetter: { fontFamily: 'Poppins_800ExtraBold', fontSize: 24, color: '#fff' },
  brandName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  taglinePill: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  taglineText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8,
    color: colors.purple300,
    letterSpacing: 1.2,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heroLine1: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 36,
    color: colors.textPrimary,
    lineHeight: 44,
    letterSpacing: -1,
  },
  heroLine2: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 36,
    color: colors.textPrimary,
    lineHeight: 44,
    letterSpacing: -1,
  },
  heroAccent: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 36,
    color: colors.yellow400,
    lineHeight: 44,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  heroCopy: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },

  sheet: {},
  sheetGrad: {
    backgroundColor: '#1a1535',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 48 : spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.25)',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  sheetSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  authBtns: { gap: spacing.sm, marginBottom: spacing.md },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    backgroundColor: 'rgba(124,58,237,0.06)',
    overflow: 'hidden',
  },
  authBtnPrimary: {
    backgroundColor: colors.yellow400,
    borderColor: colors.yellow400,
  },
  authBtnIcon: {
    width: 44,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  authBtnLabel: {
    flex: 1,
    paddingLeft: spacing.md,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  authBtnLabelPrimary: { color: colors.purple900 },
  googleG: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#4285F4' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  dividerText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.textFaint },

  signInBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  signInBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: colors.purple300,
  },

  u16: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: colors.textFaint,
    textAlign: 'center',
  },
  u16Link: { color: colors.purple300, fontFamily: 'Poppins_600SemiBold' },
});
