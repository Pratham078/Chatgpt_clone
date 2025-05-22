import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export async function requestMediaLibraryPermissions() {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  }
  return true;
}

export async function checkAndRequestPermissions() {
  const hasPermission = await requestMediaLibraryPermissions();
  return hasPermission;
} 