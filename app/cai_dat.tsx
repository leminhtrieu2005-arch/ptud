import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
  const { theme, language, setTheme, setLanguage, t } = useAppSettings();
  const themeColors = Colors[theme];
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}> 
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme === 'dark' ? '#3f2e5a' : '#764ba2'} 
      />

      {/* HEADER CÓ NÚT BACK */}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#3f2e5a' : '#764ba2' }]}> 
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        
        {/* View này để giữ tiêu đề ở giữa (cân bằng với nút back) */}
        <View style={{ width: 34 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* SECTION: GIAO DIỆN */}
        <View style={[styles.sectionCard, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff' }]}> 
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.theme')}</Text>
          <Text style={[styles.sectionDescription, { color: theme === 'dark' ? '#cbd5e1' : '#666' }]}>
            {t('settings.themeDescription')}
          </Text>

          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[styles.choiceButton, theme === 'light' ? styles.choiceButtonActive : null]}
              onPress={() => setTheme('light')}
            >
              <MaterialIcons name="light-mode" size={22} color={theme === 'light' ? '#fff' : '#4A90E2'} />
              <Text style={[styles.choiceText, theme === 'light' ? styles.choiceTextActive : null]}>
                {t('settings.light')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceButton, theme === 'dark' ? styles.choiceButtonActive : null]}
              onPress={() => setTheme('dark')}
            >
              <MaterialIcons name="dark-mode" size={22} color={theme === 'dark' ? '#fff' : '#4A90E2'} />
              <Text style={[styles.choiceText, theme === 'dark' ? styles.choiceTextActive : null]}>
                {t('settings.dark')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION: NGÔN NGỮ */}
        <View style={[styles.sectionCard, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff' }]}> 
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.language')}</Text>
          <Text style={[styles.sectionDescription, { color: theme === 'dark' ? '#cbd5e1' : '#666' }]}>
            {t('settings.languageDescription')}
          </Text>

          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[styles.choiceButton, language === 'vi' ? styles.choiceButtonActive : null]}
              onPress={() => setLanguage('vi')}
            >
              <MaterialIcons name="language" size={22} color={language === 'vi' ? '#fff' : '#4A90E2'} />
              <Text style={[styles.choiceText, language === 'vi' ? styles.choiceTextActive : null]}>
                {t('settings.vietnamese')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceButton, language === 'en' ? styles.choiceButtonActive : null]}
              onPress={() => setLanguage('en')}
            >
              <MaterialIcons name="language" size={22} color={language === 'en' ? '#fff' : '#4A90E2'} />
              <Text style={[styles.choiceText, language === 'en' ? styles.choiceTextActive : null]}>
                {t('settings.english')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD THÔNG TIN THÊM */}
        <View style={[styles.infoCard, { backgroundColor: theme === 'dark' ? '#252533' : '#ffffff' }]}> 
          <Text style={[styles.infoTitle, { color: themeColors.text }]}>{t('settings.note')}</Text>
          <Text style={[styles.infoText, { color: theme === 'dark' ? '#cbd5e1' : '#5f6c7b' }]}>
            {t('settings.noteText')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  backButton: {
    padding: 5,
    width: 34,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  choiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  choiceButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  choiceText: {
    fontSize: 15,
    color: '#4A90E2',
    fontWeight: '600',
  },
  choiceTextActive: {
    color: '#ffffff',
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});