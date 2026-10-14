import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Image, ScrollView, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';
import { pickImage } from '../utils/imagePicker';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function Avatar({ name, size = 40, uri }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#2d1a6e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {uri
        ? <Image source={{ uri }} style={{ width: size, height: size }} />
        : <Text style={{ fontSize: size * 0.36, fontFamily: 'Poppins_700Bold', color: colors.purple300 }}>{initials(name)}</Text>
      }
    </View>
  );
}

export default function PostScreen({ navigation }) {
  const { data } = useOnboarding();
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const canNext = caption.trim().length > 0 || imageUri != null;

  async function handlePickImage() {
    pickImage({ aspect: [4, 3], onPicked: (uri) => setImageUri(uri) });
  }

  function handleNext() {
    navigation.navigate('PostDetails', { caption, imageUri });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            style={[styles.nextBtn, canNext && styles.nextBtnActive]}
            onPress={handleNext}
            disabled={!canNext}
          >
            <Text style={[styles.nextBtnText, canNext && styles.nextBtnTextActive]}>Next →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Author */}
          <View style={styles.authorRow}>
            <Avatar name={data.name} size={44} uri={data.avatarUri} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={styles.authorName}>{data.name || 'You'}</Text>
              <Text style={styles.authorSub}>{data.city?.split(',')[0] || 'Athlete'}</Text>
            </View>
          </View>

          {/* Caption */}
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="What happened today? Share a moment…"
            placeholderTextColor={colors.textFaint}
            multiline
            maxLength={500}
            textAlignVertical="top"
            autoFocus
          />

          {/* Photo */}
          {imageUri ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImg} onPress={() => setImageUri(null)}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickImage}>
              <Ionicons name="camera-outline" size={20} color={colors.purple300} />
              <Text style={styles.photoBtnText}>Add photo</Text>
            </TouchableOpacity>
          )}

          {/* Hint */}
          <Text style={styles.hint}>
            You'll add match details on the next step
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.15)',
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.textPrimary },
  nextBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)',
  },
  nextBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  nextBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: colors.textFaint },
  nextBtnTextActive: { color: '#fff' },
  authorRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  authorName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.textPrimary },
  authorSub: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.textMuted, marginTop: 1 },
  captionInput: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontFamily: 'Poppins_400Regular', fontSize: 16, color: colors.textPrimary,
    minHeight: 120, lineHeight: 26,
  },
  imageWrap: {
    marginHorizontal: spacing.lg, marginTop: spacing.sm,
    borderRadius: radius.xl, overflow: 'hidden',
  },
  image: { width: '100%', height: 220 },
  removeImg: { position: 'absolute', top: 8, right: 8 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    paddingVertical: 12, paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)', borderStyle: 'dashed',
  },
  photoBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.purple300 },
  hint: {
    fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.textFaint,
    textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.lg,
  },
});
