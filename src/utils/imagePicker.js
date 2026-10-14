import * as ImagePicker from 'expo-image-picker';

export async function pickImage({ aspect = [4, 3], quality = 0.8 } = {}) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access photos was denied.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect,
    quality,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function takePhoto({ aspect = [4, 3], quality = 0.8 } = {}) {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access camera was denied.');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect,
    quality,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}
