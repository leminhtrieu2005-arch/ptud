import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NotiContext } from "./_layout";

export default function NotificationScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const { logs, unread, clearLogs } = useContext(NotiContext);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#3f2e5a' : '#764ba2' }]}>
        <Text style={styles.headerTitle}>Lịch sử hệ thống</Text>
        <Pressable onPress={clearLogs} style={styles.clearButton}>
          <MaterialIcons name="delete-sweep" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={60} color="#ccc" />
            <Text style={{ color: '#888', marginTop: 10 }}>Chưa có thông báo nào</Text>
          </View>
        ) : (
          logs.map((item) => (
            <View key={item.id} style={[
              styles.card, 
              { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff' }, 
              item.type === 'warning' && styles.warningCard
            ]}>
              <View style={styles.row}>
                <MaterialIcons 
                  name={item.type === 'warning' ? "warning" : "check-circle"} 
                  size={24} 
                  color={item.type === 'warning' ? "#FF5252" : "#4CAF50"} 
                  style={{ marginRight: 12 }} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: item.type === 'warning' ? "#FF5252" : themeColors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  clearButton: { padding: 5 },
  content: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 15, padding: 18, marginBottom: 12, elevation: 3 },
  warningCard: { borderLeftWidth: 6, borderLeftColor: '#FF5252' },
  title: { fontSize: 15, fontWeight: '700' },
  time: { fontSize: 12, color: '#888', marginTop: 5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
});