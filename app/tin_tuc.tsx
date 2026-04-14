import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { Image, Linking, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
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

export default function TinTucScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const { unread } = useContext(NotiContext);

  // Dynamic newsData based on language
  const newsData: NewsItem[] = [
    {
      id: '1',
      category: t('news.football'),
      title: t('news.vietnamFootball'),
      description: t('news.vietnamFootballdescription'),
      source: t('news.source'),
      time: '',
      image: 'https://vff.org.vn/wp-content/uploads/2025/04/vietnam-11-1738124169420799075303.jpg',
      url: 'https://baomoi.com/bong-da-viet-nam.epi',
    },
    {
      id: '2',
      category: t('news.basketball'),
      title: t('news.basketballHot'),
      description: t('news.basketballHotdescription'),
      source: t('news.source'),
      time: '',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      url: 'https://baomoi.com/tag/b%C3%B3ng-r%E1%BB%95.epi',
    },
    {
      id: '3',
      category: t('news.tennis'),
      title: t('news.tennisTitle'),
      description: t('news.tennisTitledescription'),
      source: t('news.source'),
      time: '',
      image: 'https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=800&q=80',
      url: 'https://baomoi.com/quan-vot.epi',
    },
    {
      id: '4',
      category: t('news.racing'),
      title: t('news.f1Title'),
      description: t('news.f1Titledescription'),
      source: t('news.source'),
      time: '',
      image: 'https://img.meta.com.vn/Data/image/2021/08/23/xe-dua-f1-al.jpg',
      url: 'https://baomoi.com/tag/c%C3%B4ng-th%E1%BB%A9c-1.epi',
    },
  ];

  const handleOpenNews = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error(t('news.error'), error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />

      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>{t('news.title') || 'Tin tức thể thao'}</Text>
            <Text style={[styles.subtitle, { color: themeColors.text }]}>{t('news.subtitle') || 'Cập nhật những thông tin mới nhất'}</Text>
          </View>

          {/* TIN TỨC NỔI BẬT (HIGHLIGHT) */}
          <Pressable 
            onPress={() => handleOpenNews(newsData[0].url)} 
            style={({ pressed }) => [styles.highlightCard, pressed && styles.cardPressed]}
          >
            <Image source={{ uri: newsData[0].image }} style={styles.highlightImage} />
            <View style={[styles.highlightBody, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff' }]}>
              <View style={styles.tagRow}>
                <View style={[styles.highlightTag, { backgroundColor: theme === 'dark' ? '#38394b' : '#e8f1ff' }]}>
                  <Text style={styles.highlightTagText}>{t('news.highlight') || 'Nổi bật'}</Text>
                </View>
                <Text style={styles.highlightMeta}>{newsData[0].time}</Text>
              </View>
              <Text style={[styles.highlightTitle, { color: themeColors.text }]}>{newsData[0].title}</Text>
              <Text style={[styles.highlightDescription, { color: themeColors.text }]}>{newsData[0].description}</Text>
              <Text style={styles.highlightSource}>{newsData[0].source}</Text>
            </View>
          </Pressable>

          {/* DANH SÁCH TIN TỨC TIẾP THEO */}
          {newsData.slice(1).map((item) => (
            <Pressable 
              key={item.id} 
              onPress={() => handleOpenNews(item.url)} 
              style={({ pressed }) => [
                styles.card, 
                pressed && styles.cardPressed, 
                { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={[styles.cardContent, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: theme === 'dark' ? '#2b2c3a' : '#f0f6ff' }]}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>{item.title}</Text>
                <Text style={[styles.cardDescription, { color: themeColors.text }]}>{item.description}</Text>
                <Text style={styles.cardSource}>{item.source}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
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
  highlightCard: { 
    borderRadius: 25, 
    overflow: 'visible', 
    marginBottom: 25, 
    borderWidth: 0, 
    elevation: 6,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  cardPressed: { 
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  highlightImage: { width: '100%', height: 200, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  highlightBody: { 
    padding: 18,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  highlightTag: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  highlightTagText: { color: '#2266ff', fontSize: 12 },
  highlightMeta: { fontSize: 13, color: '#7a8490' },
  highlightTitle: { fontSize: 20, lineHeight: 26, marginBottom: 10 },
  highlightDescription: { fontSize: 15, lineHeight: 22, color: '#4f5968', marginBottom: 14 },
  highlightSource: { fontSize: 14, color: '#0a7ea4' },
  card: { 
    borderRadius: 25, 
    marginBottom: 16, 
    overflow: 'visible', 
    borderWidth: 0,
    elevation: 6,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  cardImage: { width: '100%', height: 160, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  cardContent: { 
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  categoryBadgeText: { fontSize: 12, color: '#2257d6' },
  cardTime: { fontSize: 12, color: '#7a8490' },
  cardTitle: { fontSize: 18, lineHeight: 24, marginBottom: 8 },
  cardDescription: { fontSize: 14, lineHeight: 20, color: '#4f5968', marginBottom: 10 },
  cardSource: { fontSize: 14, color: '#0a7ea4' },
});
