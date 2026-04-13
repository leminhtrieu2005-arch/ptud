import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { Image, Linking, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NotiContext } from "./_layout";

interface NewsItem {
  id: string;
  category: string;
  title: string;
  description: string;
  source: string;
  time: string;
  image: string;
  url: string;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    category: 'Bóng đá',
    title: 'Tin tức bóng đá Việt Nam',
    description: '',
    source: 'Báo mới',
    time: '',
    image: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80',
    url: 'https://baomoi.com/bong-da-viet-nam.epi',
  },
  {
    id: '2',
    category: 'Bóng rổ',
    title: 'Bóng rổ',
    description: '',
    source: 'Báo mới',
    time: '',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    url: 'https://baomoi.com/tag/b%C3%B3ng-r%E1%BB%95.epi',
  },
  {
    id: '3',
    category: 'Quần vợt',
    title: 'Tennis',
    description: '',
    source: 'Báo mới',
    time: '',
    image: 'https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=800&q=80',
    url: 'https://baomoi.com/quan-vot.epi',
  },
  {
    id: '4',
    category: 'Đua xe',
    title: 'F1',
    description: '',
    source: 'Báo mới',
    time: '',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    url: 'https://baomoi.com/tag/c%C3%B4ng-th%E1%BB%A9c-1.epi',
  },
];

const categories = ['Bóng đá', 'Bóng rổ', 'Quần vợt', 'Đua xe', 'Cầu lông', 'Thể thao', 'Olympic'];

export default function TinTucScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = theme === 'dark' ? '#0e0e14' : '#f6f7fb';
  const { unread } = useContext(NotiContext);

  const handleOpenNews = async (url: string) => {
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors} />

      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>{t('news.title')}</ThemedText>
            <ThemedText style={styles.subtitle}>{t('news.subtitle')}</ThemedText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {categories.map((category) => (
              <View key={category} style={[styles.categoryPill, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]}>
                <ThemedText style={styles.categoryText}>{category}</ThemedText>
              </View>
            ))}
          </ScrollView>

          <Pressable onPress={() => handleOpenNews(newsData[0].url)} style={({ pressed }) => [styles.highlightCard, pressed && styles.cardPressed]}>
            <Image source={{ uri: newsData[0].image }} style={styles.highlightImage} />
            <View style={[styles.highlightBody, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff' }]}>
              <View style={styles.tagRow}>
                <View style={[styles.highlightTag, { backgroundColor: theme === 'dark' ? '#38394b' : '#e8f1ff' }]}>
                  <ThemedText type="defaultSemiBold" style={styles.highlightTagText}>{t('news.highlight')}</ThemedText>
                </View>
                <ThemedText style={styles.highlightMeta}>{newsData[0].time}</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.highlightTitle}>{newsData[0].title}</ThemedText>
              <ThemedText style={styles.highlightDescription}>{newsData[0].description}</ThemedText>
              <ThemedText type="link" style={styles.highlightSource}>{newsData[0].source}</ThemedText>
            </View>
          </Pressable>

          {newsData.slice(1).map((item) => (
            <Pressable key={item.id} onPress={() => handleOpenNews(item.url)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: theme === 'dark' ? '#2b2c3a' : '#f0f6ff' }]}>
                    <ThemedText type="defaultSemiBold" style={styles.categoryBadgeText}>{item.category}</ThemedText>
                  </View>
                  <ThemedText style={styles.cardTime}>{item.time}</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.cardDescription}>{item.description}</ThemedText>
                <ThemedText type="link" style={styles.cardSource}>{item.source}</ThemedText>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, lineHeight: 36, marginBottom: 10 },
  subtitle: { fontSize: 16, lineHeight: 24, color: '#5f6c7b' },
  categoryList: { paddingBottom: 10 },
  categoryPill: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#e6ecf3' },
  categoryText: { fontSize: 14, color: '#1d2939' },
  highlightCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#e5eaf2' },
  cardPressed: { opacity: 0.8 },
  highlightImage: { width: '100%', height: 180 },
  highlightBody: { padding: 18 },
  tagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  highlightTag: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  highlightTagText: { color: '#2266ff', fontSize: 12 },
  highlightMeta: { fontSize: 13, color: '#7a8490' },
  highlightTitle: { fontSize: 20, lineHeight: 26, marginBottom: 10 },
  highlightDescription: { fontSize: 15, lineHeight: 22, color: '#4f5968', marginBottom: 14 },
  highlightSource: { fontSize: 14, color: '#0a7ea4' },
  card: { borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e6ecf3' },
  cardImage: { width: '100%', height: 140 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  categoryBadgeText: { fontSize: 12, color: '#2257d6' },
  cardTime: { fontSize: 12, color: '#7a8490' },
  cardTitle: { fontSize: 18, lineHeight: 24, marginBottom: 8 },
  cardDescription: { fontSize: 14, lineHeight: 20, color: '#4f5968', marginBottom: 10 },
  cardSource: { fontSize: 14, color: '#0a7ea4' },
});
