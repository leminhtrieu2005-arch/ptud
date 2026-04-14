import { AppSettingsProvider, useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { off, onValue, ref, set, update } from "firebase/database";
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../firebaseConfig";

export const NotiContext = createContext<{
  logs: any[],
  unread: boolean,
  clearLogs: () => void,
  triggerNotification: (msg: string, type?: string, value?: number) => void
}>({
  logs: [],
  unread: false,
  clearLogs: () => {},
  triggerNotification: () => {}
});

const MAX_LOGS = 10;
const BANNER_DISPLAY_MS = 3500; // thời gian hiển thị mỗi banner (ms)

export default function RootLayout() {

  const lastNotiRef = useRef<{ type: string, value?: number }>({ type: "" });
  const hasInitialized = useRef(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [unread, setUnread] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");
  const slideAnim = useRef(new Animated.Value(-200)).current;

  // ✅ HÀNG ĐỢI THÔNG BÁO — hiện tuần tự, không chồng chéo
  const notiQueue = useRef<string[]>([]);
  const isShowingBanner = useRef(false);

  const pathname = usePathname();
  const segments = useSegments();
  const router = useRouter();

  const [tempLimit, setTempLimit] = useState(50);
  const prevS = useRef<{ statuses: any[], temp: number | null }>({ statuses: [], temp: null });
  const isTempOverRef = useRef(false);

  const isInsideApp = segments.length > 0 && !["login", "register", "index", ""].includes(segments[0]);
  const isInsideAppRef = useRef(isInsideApp);
  const tempLimitRef = useRef(50);
  const prevTempLimitRef = useRef<number | null>(null);

  // Đồng bộ isInsideApp vào ref để callback không bị stale
  useEffect(() => {
    isInsideAppRef.current = isInsideApp;
  }, [isInsideApp]);

  // --- HÀM HIỆN BANNER KẾ TIẾP TRONG HÀNG ĐỢI ---
  const showNextBanner = useCallback(() => {
    if (notiQueue.current.length === 0) {
      isShowingBanner.current = false;
      return;
    }

    isShowingBanner.current = true;
    const msg = notiQueue.current.shift()!;
    setBannerMsg(msg);

    slideAnim.setValue(-200);
    Animated.sequence([
      Animated.spring(slideAnim, {
        toValue: 60,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
      Animated.delay(BANNER_DISPLAY_MS),
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Sau khi banner đầu kết thúc → tự động hiện banner tiếp theo
      showNextBanner();
    });
  }, [slideAnim]);

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

  // --- 2. HÀM TRIGGER — đưa vào hàng đợi thay vì hiện thẳng ---
  const triggerNotification = useCallback((msg: string, type: string = "", value?: number) => {
    if (!isInsideAppRef.current) return;

    // 🚫 Chặn trùng theo type + value
    if (
      lastNotiRef.current.type === type &&
      lastNotiRef.current.value === value
    ) {
      return;
    }
    lastNotiRef.current = { type, value };

    update(ref(db, "thuan/settings"), { hasUnread: 1 });

    // Thêm vào cuối hàng đợi
    notiQueue.current.push(msg);

    // Nếu không đang hiện banner nào → bắt đầu ngay
    if (!isShowingBanner.current) {
      showNextBanner();
    }
  }, [showNextBanner]);

  // --- 3. LẮNG NGHE FIREBASE ---
  useEffect(() => {
    const settingsRef = ref(db, "thuan/settings");
    const sensorRef = ref(db, "thuan2/sensor");

    onValue(settingsRef, (snap) => {
      const val = snap.val()?.tempLimit;
      if (val !== undefined) {
        const rounded = Math.round(Number(val));
        prevTempLimitRef.current = tempLimitRef.current;
        setTempLimit(rounded);
        tempLimitRef.current = rounded;
      }
    });

    const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        prevS.current = {
          statuses: [
            data.sensorStatus1, data.sensorStatus2, data.sensorStatus3,
            data.sensorStatus4, data.sensorStatus5, data.sensorStatus6
          ],
          temp: Number(data.temperature)
        };
        return;
      }

      const currentTempRaw = Number(data.temperature);
      const currentTempRounded = Math.round(currentTempRaw);
      const limitRounded = tempLimitRef.current;
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const currentStatuses = [
        data.sensorStatus1, data.sensorStatus2, data.sensorStatus3,
        data.sensorStatus4, data.sensorStatus5, data.sensorStatus6
      ];

      const prevLimit = prevTempLimitRef.current;

      // ✅ CASE 1: Vượt ngưỡng lần đầu
      if (currentTempRounded > limitRounded && !isTempOverRef.current) {
        isTempOverRef.current = true;
        const msg = `⚠️ Cảnh báo nhiệt độ cao: ${currentTempRounded}°C`;
        triggerNotification(msg, "TEMP_OVER", limitRounded);
        const newLog = { id: "threshold-" + Date.now(), title: msg, time: now, type: "warning" };
        setLogs(prev => [newLog, ...prev].slice(0, MAX_LOGS));
        update(ref(db, "thuan/logs"), { [newLog.id]: newLog });
      }

      // ✅ CASE 2: Đổi ngưỡng khi đang vượt
      else if (
        prevLimit !== null &&
        prevLimit !== limitRounded &&
        currentTempRounded > limitRounded
      ) {
        const msg = `⚠️ Vượt ngưỡng mới: ${currentTempRounded}°C (Ngưỡng: ${limitRounded})`;
        triggerNotification(msg, "TEMP_NEW_THRESHOLD", limitRounded);
        const newLog = { id: "threshold-change-" + Date.now(), title: msg, time: now, type: "warning" };
        setLogs(prev => [newLog, ...prev].slice(0, MAX_LOGS));
        update(ref(db, "thuan/logs"), { [newLog.id]: newLog });
      }

      // Reset khi nhiệt độ xuống dưới ngưỡng
      if (currentTempRounded <= limitRounded) {
        isTempOverRef.current = false;
      }

      // --- LOGIC CẢNH BÁO XE ---
      if (prevS.current.statuses.length > 0) {
        currentStatuses.forEach((status, index) => {
          if (status !== prevS.current.statuses[index]) {
            const isEntry = status === 1;
            const msg = `Vị trí ${index + 1}: ${isEntry ? "Xe vào 🟢" : "Xe ra 🔴"}`;
            triggerNotification(msg, `CAR_${index + 1}`, status);
            const newLog = {
              id: "car-" + Date.now() + index,
              title: msg,
              time: now,
              type: isEntry ? "success" : "info"
            };
            setLogs(prev => [newLog, ...prev].slice(0, MAX_LOGS));
            update(ref(db, "thuan/logs"), { [newLog.id]: newLog });
          }
        });

        // Bãi xe đầy
        const occupiedCount = currentStatuses.filter(s => s === 1).length;
        const prevOccupiedCount = prevS.current.statuses.filter(s => s === 1).length;
        if (occupiedCount === 6 && prevOccupiedCount < 6) {
          const msg = `🚗 Bãi xe đã đầy (6/6 vị trí)`;
          triggerNotification(msg, "PARKING_FULL");
          const newLog = { id: "full-" + Date.now(), title: msg, time: now, type: "warning" };
          setLogs(prev => [newLog, ...prev].slice(0, MAX_LOGS));
          update(ref(db, "thuan/logs"), { [newLog.id]: newLog });
        }
      }

      prevS.current = { statuses: currentStatuses, temp: currentTempRaw };
    });

    return () => { off(settingsRef); off(sensorRef); };
  }, [tempLimit, triggerNotification]);

  // --- 4. XOÁ LOGS ---
  const clearLogs = () => {
    setLogs([]);
    set(ref(db, "thuan/logs"), null);
  };

  const contextValue = useMemo(() => ({ logs, unread, clearLogs, triggerNotification }), [logs, unread, triggerNotification]);

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
          <MaterialIcons
            name={unread ? "notifications-active" : "notifications"}
            size={24}
            color={unread ? "#FF3B30" : (pathname === '/thong_bao' ? activeColor : inactiveColor)}
          />
          <Text style={[styles.navText, { color: unread ? "#FF3B30" : (pathname === '/thong_bao' ? activeColor : inactiveColor) }]}>
            {t('nav.notifications')}
          </Text>
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
