import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, radius } from '../theme';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogleSignIn() {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (e) {
      if (e.message !== 'Sign-in was cancelled.') {
        setError('Sign-in failed. Please try again.');
        console.warn('[Login] error:', e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0a0d14', '#0f1829', '#0a0d14']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoS}>S</Text>
          </View>
          <Text style={styles.logoText}>Sportfolio</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your sports{'\n'}story starts here</Text>
          <Text style={styles.heroSub}>
            Track matches · Connect with players · Build your sporting identity
          </Text>
        </View>

        {/* Sport tags */}
        <View style={styles.tags}>
          {['🏸 Badminton', '🏏 Cricket'].map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.btnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingVertical: spacing.xl },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoS: { fontFamily: fonts.bold, fontSize: 20, color: '#fff' },
  logoText: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },

  hero: { marginTop: spacing.xxl },
  heroTitle: {
    fontFamily: fonts.bold, fontSize: 36, color: colors.text,
    lineHeight: 44, marginBottom: spacing.md,
  },
  heroSub: {
    fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, lineHeight: 22,
  },

  tags: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: colors.bgCard, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  tagText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },

  cta: { gap: spacing.md },
  errorText: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, textAlign: 'center' },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: radius.md,
  },
  btnDisabled: { opacity: 0.6 },
  googleIcon: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  googleBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: '#fff' },

  terms: {
    fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted,
    textAlign: 'center', lineHeight: 16,
  },
});
