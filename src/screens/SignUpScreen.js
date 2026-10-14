import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, radius } from '../theme';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false); // email confirmation sent

  async function handleSignUp() {
    if (!email.trim()) { setError('Enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setError('');
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password);
      setDone(true);
    } catch (e) {
      setError(e.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Email confirmation sent state ──────────────────────────────────────────
  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.doneWrap}>
          <View style={[styles.logoBox, { backgroundColor: '#22c55e' }]}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.doneTitle}>Check your email</Text>
          <Text style={styles.doneSub}>
            We sent a confirmation link to{'\n'}
            <Text style={{ color: colors.accent }}>{email}</Text>
          </Text>
          <Text style={styles.doneHint}>
            Once confirmed, come back and sign in.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>iS</Text>
            </View>
            <Text style={styles.appName}>Join iSportOne</Text>
            <Text style={styles.tagline}>Build your sports profile in 2 minutes.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textFaint}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.textFaint}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  placeholderTextColor={colors.textFaint}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Sign up button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Create Account</Text>
              }
            </TouchableOpacity>

            <Text style={styles.terms}>
              By signing up you agree to our{' '}
              <Text style={{ color: colors.accent }}>Terms</Text> and{' '}
              <Text style={{ color: colors.accent }}>Privacy Policy</Text>.
            </Text>
          </View>

          {/* Already have account */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={{ color: colors.accent, fontFamily: fonts.semiBold }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { flexGrow: 1, padding: spacing.xl },

  backBtn: { marginBottom: spacing.lg, alignSelf: 'flex-start', padding: 4 },

  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: { fontFamily: fonts.bold, fontSize: 24, color: '#fff' },
  appName: { fontFamily: fonts.bold, fontSize: 22, color: colors.textPrimary },
  tagline: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 4 },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.textPrimary, marginBottom: spacing.xl },

  fieldGroup: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textMuted, marginBottom: 6, letterSpacing: 0.5 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: { padding: 4 },

  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },

  terms: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 18,
  },

  loginLink: { alignItems: 'center', marginTop: spacing.xl },
  loginLinkText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },

  // Done state
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  doneTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.md },
  doneSub: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.md },
  doneHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xxl },
});
