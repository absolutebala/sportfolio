import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, radius } from '../theme';

export default function LoginScreen({ navigation }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // RootNavigator auto-navigates on auth state change
    } catch (e) {
      setError(e.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>iS</Text>
          </View>
          <Text style={styles.appName}>iSportOne</Text>
          <Text style={styles.tagline}>Your sports identity, one place.</Text>
        </View>

        {/* Hero text */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Connect with athletes.{'\n'}Track your journey.</Text>
          <Text style={styles.heroSub}>Join thousands of athletes building their sports profile.</Text>
        </View>

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Google Sign In */}
        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.btnDisabled]}
          onPress={handleGoogle}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={{ color: colors.accent }}>Terms</Text> and{' '}
          <Text style={{ color: colors.accent }}>Privacy Policy</Text>.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },

  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: { fontFamily: fonts.bold, fontSize: 28, color: '#fff' },
  appName: { fontFamily: fonts.bold, fontSize: 24, color: colors.textPrimary },
  tagline: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 4 },

  hero: { flex: 1, justifyContent: 'center', paddingBottom: spacing.xxl },
  heroTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  heroSub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    height: 56,
    marginBottom: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  googleIcon: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center', justifyContent: 'center',
  },
  googleIconText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
  googleBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#1a1a1a' },

  terms: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 18,
  },
});
