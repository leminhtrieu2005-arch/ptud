import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import {
    Alert,
    Image // Thêm Image vào đây
    ,





    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import { auth } from '../firebaseConfig';
import { NotiContext } from "./_layout";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const { unread } = useContext(NotiContext);
  const headerColor = theme === 'dark' ? '#3f2e5a' : '#764ba2';

  // Lấy thông tin user hiện tại từ Firebase
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      `${t('profile.logout')}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              router.replace('/');
            } catch {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const navigate = (path: string) => router.push(path as any);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={headerColor} />

      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileCard, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]}>
          
          {/* CẬP NHẬT PHẦN AVATAR Ở ĐÂY */}
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>

          <Text style={[styles.userName, { color: themeColors.text }]}>
            {user?.displayName || 'Người dùng'}
          </Text>
          <Text style={[styles.userEmail, { color: theme === 'dark' ? '#cbd5e1' : '#666' }]}>
            {user?.email}
          </Text>
        </View>

        {/* ... (Các phần options bên dưới giữ nguyên) ... */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]} activeOpacity={0.7} onPress={() => navigate('/chinh_sua_ho_so')}>
            <MaterialIcons name="edit" size={24} color="#764ba2" />
            <Text style={[styles.optionText, { color: themeColors.text }]}>{t('profile.edit')}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]} activeOpacity={0.7} onPress={() => navigate('/cai_dat')}>
            <MaterialIcons name="settings" size={24} color="#764ba2" />
            <Text style={[styles.optionText, { color: themeColors.text }]}>{t('profile.settings')}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]} activeOpacity={0.7} onPress={() => navigate('/doi_mat_khau')}>
            <MaterialIcons name="lock" size={24} color="#764ba2" />
            <Text style={[styles.optionText, { color: themeColors.text }]}>Đổi mật khẩu</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]} activeOpacity={0.7}>
            <MaterialIcons name="help" size={24} color="#764ba2" />
            <Text style={[styles.optionText, { color: themeColors.text }]}>{t('profile.help')}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]} activeOpacity={0.7}>
            <MaterialIcons name="info" size={24} color="#764ba2" />
            <Text style={[styles.optionText, { color: themeColors.text }]}>{t('profile.about')}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#764ba2' }]} activeOpacity={0.7} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Giữ các style cũ của bạn)
  container: { flex: 1 },
  header: { paddingVertical: 20, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
  //headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  headerTitle: {
  color: '#ffffff',
  fontSize: 18,
  //fontWeight: 'bold',
  flex: 1, // Để tiêu đề chiếm hết khoảng không gian ở giữa
  textAlign: 'center', // Căn chữ ngay chính giữa
},
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  profileCard: { borderRadius: 16, padding: 20, marginHorizontal: 15, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  
  // CẬP NHẬT STYLE AVATAR
  avatarContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#764ba2', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 15,
    overflow: 'hidden' // Để ảnh không tràn ra ngoài bo tròn
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  
  userName: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  userEmail: { fontSize: 16 },
  optionsContainer: { marginHorizontal: 15, marginBottom: 20 },
  optionItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  optionText: { flex: 1, fontSize: 16, marginLeft: 15 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 15, marginHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  logoutText: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginLeft: 10 },
});