import { AppSettingsProvider, useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { off, onValue, ref, set, update } from "firebase/database";
import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../firebaseConfig";

export const NotiContext = createContext<{ logs: any[], unread: boolean, clearLogs: () => void }>({ 
  logs: [], 
  unread: false,
  clearLogs: () => {}
});

export default function RootLayout() {
  const [logs, setLogs] = useState<any[]>([]);
  const [unread, setUnread] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");
  const slideAnim = useRef(new Animated.Value(-200)).current; 
  
  const pathname = usePathname();
  const segments = useSegments(); 
  const router = useRouter(); 
  
  const [tempLimit, setTempLimit] = useState(50);
  const prevS = useRef<{statuses: any[], temp: number | null}>({ statuses: [], temp: null });

  const isInsideApp = segments.length > 0 && !["login", "register", "index", ""].includes(segments[0]);

  // --- 1. QUẢN LÝ DẤU CHẤM ĐỎ ---
  useEffect(() => {
    const unreadRef = ref(db, "thuan/settings/hasUnread");
    const unsubscribeUnread = onValue(unreadRef, (snapshot) => {
      setUnread(snapshot.val() === 1);
    });
    
    if (pathname === "/thong_bao") {
      update(ref(db, "thuan/settings"), { hasUnread: 0 });
    }

    return () => off(unreadRef);
  }, [pathname]);

  // --- 2. HÀM HIỆN BANNER ---
  const triggerNotification = (msg: string) => {
    if (!isInsideApp) return;
    setBannerMsg(msg);
    update(ref(db, "thuan/settings"), { hasUnread: 1 });
    
    slideAnim.setValue(-200);
    Animated.sequence([
      Animated.spring(slideAnim, { toValue: 60, useNativeDriver: true, bounciness: 10 }),
      Animated.delay(3000),
      Animated.timing(slideAnim, { toValue: -200, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  // --- 3. LẮNG NGHE FIREBASE ---
  useEffect(() => {
    const settingsRef = ref(db, "thuan/settings");
    const sensorRef = ref(db, "thuan2/sensor");

    // Lấy ngưỡng nhiệt độ cài đặt
    onValue(settingsRef, (snap) => {
      const val = snap.val()?.tempLimit;
      if (val !== undefined) setTempLimit(Math.round(Number(val)));
    });

    const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const currentTempRaw = Number(data.temperature);
      const currentTempRounded = Math.round(currentTempRaw);
      const limitRounded = Math.round(tempLimit);
      
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const currentStatuses = [
        data.sensorStatus1, data.sensorStatus2, data.sensorStatus3, 
        data.sensorStatus4, data.sensorStatus5, data.sensorStatus6
      ];

      // --- LOGIC SO SÁNH NHIỆT ĐỘ (ĐÃ SỬA) ---
      // Nếu là lần đầu load (null), coi như prevTemp bằng currentTemp để không báo ảo
      const prevTempRaw = prevS.current.temp ?? currentTempRaw;
      const prevTempRounded = Math.round(prevTempRaw);

      // Chỉ báo khi: Hiện tại > Ngưỡng VÀ Trước đó <= Ngưỡng
      if (currentTempRounded > limitRounded && prevTempRounded <= limitRounded) {
        const msg = `⚠️ Cảnh báo nhiệt độ cao: ${currentTempRounded}°C`;
        triggerNotification(msg);
        const newLog = { id: "threshold-"+Date.now(), title: msg, time: now, type: "warning" };
        setLogs(prev => [newLog, ...prev]);
        update(ref(db, "thuan/logs"), { [newLog.id]: newLog });
      }

      // --- LOGIC CẢNH BÁO XE ---
      if (prevS.current.temp !== null) {
        currentStatuses.forEach((status, index) => {
          if (status !== prevS.current.statuses[index]) {
            const isEntry = status === 1;
            const msg = `Vị trí ${index + 1}: ${isEntry ? "Xe vào" : "Xe ra"}`;
            triggerNotification(msg);
            const newLog = { id: "car-"+Date.now()+index, title: msg, time: now, type: isEntry ? "success" : "info" };
            setLogs(prev => [newLog, ...prev]);
            update(ref(db, "thuan/logs"), { [newLog.id]: newLog });
          }
        });

        // Bãi xe đầy
        const occupiedCount = currentStatuses.filter(s => s === 1).length;
        const prevOccupiedCount = prevS.current.statuses.filter(s => s === 1).length;
        if (occupiedCount === 6 && prevOccupiedCount < 6) {
          const msg = `🚗 Bãi xe đã đầy (6/6 vị trí)`;
          triggerNotification(msg);
          const newLog = { id: "full-"+Date.now(), title: msg, time: now, type: "warning" };
          setLogs(prev => [newLog, ...prev]);
          update(ref(db, "thuan/logs"), { [newLog.id]: newLog });
        }
      }

      // Cập nhật Ref cho lần so sánh kế tiếp
      prevS.current = { statuses: currentStatuses, temp: currentTempRaw };
    });

    return () => { off(settingsRef); off(sensorRef); };
  }, [tempLimit, isInsideApp]);

  // --- 4. LOAD LOGS FROM FIREBASE ---
  useEffect(() => {
    const logsRef = ref(db, "thuan/logs");
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.values(data).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setLogs(logsArray);
      } else {
        setLogs([]);
      }
    });
    return () => off(logsRef);
  }, []);

  const clearLogs = () => {
    setLogs([]);
    set(ref(db, "thuan/logs"), null);
  };

  const contextValue = useMemo(() => ({ logs, unread, clearLogs }), [logs, unread]);

  const BottomNav = ({ unread }: { unread: boolean }) => {
    const { theme, t } = useAppSettings();
    const themeColors = Colors[theme];
    const pathname = usePathname();
    const router = useRouter();

    const activeColor = themeColors.tabIconSelected;
    const inactiveColor = themeColors.tabIconDefault;
    const backgroundColor = themeColors.background;
    const borderColor = theme === 'dark' ? '#333' : '#e0e0e0';

    return (
      <View style={[styles.bottomNav, { backgroundColor, borderTopColor: borderColor }]}> 
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <MaterialIcons name="dashboard" size={24} color={pathname === '/home' ? activeColor : inactiveColor} />
          <Text style={[styles.navText, { color: pathname === '/home' ? activeColor : inactiveColor }]}>{t('nav.overview')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/do_thi')}>
          <MaterialIcons name="insert-chart" size={24} color={pathname === '/do_thi' ? activeColor : inactiveColor} />
          <Text style={[styles.navText, { color: pathname === '/do_thi' ? activeColor : inactiveColor }]}>{t('nav.graph')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tin_tuc')}>
          <MaterialIcons name="article" size={24} color={pathname === '/tin_tuc' ? activeColor : inactiveColor} />
          <Text style={[styles.navText, { color: pathname === '/tin_tuc' ? activeColor : inactiveColor }]}>{t('nav.news')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/thong_bao')}>
          <MaterialIcons name={unread ? "notifications-active" : "notifications"} size={24} color={unread ? "#FF3B30" : (pathname === '/thong_bao' ? activeColor : inactiveColor)} />
          <Text style={[styles.navText, { color: unread ? "#FF3B30" : (pathname === '/thong_bao' ? activeColor : inactiveColor) }]}>{t('nav.notifications')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <MaterialIcons name="person" size={24} color={pathname === '/profile' ? activeColor : inactiveColor} />
          <Text style={[styles.navText, { color: pathname === '/profile' ? activeColor : inactiveColor }]}>{t('nav.profile')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <NotiContext.Provider value={contextValue}>
      <AppSettingsProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            animationDuration: 300,
            presentation: 'card'
          }} />
          
          <Animated.View style={[styles.notiBanner, { transform: [{ translateY: slideAnim }] }]}>
            <SafeAreaView style={styles.notiContent}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="notifications-active" size={24} color="#4834d4" />
              </View>
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.notiTitle}>HỆ THỐNG GIÁM SÁT</Text>
                <Text style={styles.notiText} numberOfLines={2}>{bannerMsg}</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
          <StatusBar style="auto" />
          {isInsideApp && <BottomNav unread={unread} />}
        </View>
      </AppSettingsProvider>
    </NotiContext.Provider>
  );
}

const styles = StyleSheet.create({
  notiBanner: { 
    position: 'absolute', 
    top: 0, 
    left: 10, 
    right: 10, 
    backgroundColor: '#4834d4', 
    borderRadius: 22, 
    padding: 16, 
    elevation: 20, 
    zIndex: 10000 
  },
  notiContent: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { 
    backgroundColor: 'white', 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  notiTitle: { color: 'rgba(255,255,255,0.8)', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  notiText: { color: 'white', fontWeight: '700', fontSize: 15, marginTop: 3 },
  bottomNav: {
    flexDirection: 'row',
    height: 75,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#ffffff',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { fontSize: 10, marginTop: 4, color: '#888' },
});