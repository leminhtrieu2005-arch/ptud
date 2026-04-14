import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const headerColor = theme === 'dark' ? '#3f2e5a' : '#764ba2';

  // State
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      await uploadImage(uri);
    }
  };

  // Upload ảnh lên Firebase Storage
  const uploadImage = async (uri: string) => {
  if (!auth.currentUser) return;

  setUploading(true);
  try {
    const formData = new FormData();
    
    // Lấy tên file
    const filename = uri.split('/').pop() || 'avatar.jpg';
    
    formData.append('image', {
      uri: uri,
      name: filename,
      type: 'image/jpeg',   // hoặc 'image/png'
    } as any);

    const response = await fetch('https://api.imgbb.com/1/upload?key=9e019a82ee535acdbbf710be53115b7c', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.status === 200) {
      const imageUrl = result.data.url;        // link ảnh
      const deleteUrl = result.data.delete_url; // (tùy chọn)

      // Cập nhật vào Firebase Auth
      await updateProfile(auth.currentUser, { photoURL: imageUrl });
      
      setPhotoURL(imageUrl);
      Alert.alert(t('common.success'), t('editProfile.avatarSuccess'));
    } else {
      Alert.alert(t('common.error'), t('editProfile.uploadError'));
    }
  } catch (error) {
    console.error(error);
    Alert.alert(t('common.error'), t('editProfile.uploadFailed'));
  } finally {
    setUploading(false);
  }
};

  // Cập nhật tên
  const handleUpdate = async () => {
    if (!displayName.trim()) {
      Alert.alert(t('common.error'), t('editProfile.nameRequired'));
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        Alert.alert(t('common.success'), t('editProfile.updateSuccess'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('editProfile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfile.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} disabled={uploading}>
              <View style={styles.avatarCircle}>
                {photoURL ? (
                  <Image source={{ uri: photoURL }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitial}>
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>{t('editProfile.uploading')}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
              <MaterialIcons name="photo-camera" size={20} color="#764ba2" />
              <Text style={styles.changePhotoText}>{t('editProfile.changePhoto')}</Text>
            </TouchableOpacity>

            <Text style={[styles.emailHint, { color: theme === 'dark' ? '#aaa' : '#666' }]}>
              {auth.currentUser?.email}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={[styles.inputLabel, { color: themeColors.text }]}>{t('editProfile.fullName')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff' }]}>
              <MaterialIcons name="person-outline" size={20} color="#764ba2" />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('editProfile.namePlaceholder')}
                placeholderTextColor="#888"
              />
            </View>

            <Text style={[styles.noteText, { color: theme === 'dark' ? '#888' : '#999' }]}>
              {t('editProfile.note')}
            </Text>
          </View>

          {/* Nút Lưu */}
          <TouchableOpacity
            style={[styles.saveButton, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? t('editProfile.saving') : t('editProfile.saveButton')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { padding: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20, alignItems: 'center' },

  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#764ba2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitial: { color: '#fff', fontSize: 48, fontWeight: 'bold' },

  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: { color: '#fff', fontSize: 14 },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: '#764ba2',
    fontWeight: '600',
    marginLeft: 6,
  },

  emailHint: { fontSize: 14, marginTop: 8 },
  formContainer: { width: '100%', marginBottom: 30 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginLeft: 5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  noteText: { fontSize: 12, marginTop: 10, marginLeft: 5, fontStyle: 'italic' },
  saveButton: {
    width: '100%',
    backgroundColor: '#764ba2',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
