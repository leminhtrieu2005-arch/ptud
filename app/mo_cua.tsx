import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { db } from "../firebaseConfig";
import { useAppSettings } from "./providers/AppSettingsProvider";

export default function MoCuaScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const controlPath = "thuan/control";

  // Khai báo State với tên mới cho khớp với logic hệ thống
  const [deviceStates, setDeviceStates] = useState({
    servoOn1: false, // Tương ứng button2
    serverOn2: false, // Tương ứng button3
  });

  useEffect(() => {
    const controlRef = ref(db, controlPath);
    const unsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeviceStates({
          // Chuyển đổi dữ liệu từ Firebase (button2, button3) sang State
          servoOn1: data.button1 === 1 || data.button1 === true,
          serverOn2: data.button2 === 1 || data.button2 === true,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Hàm điều khiển gửi giá trị 0/1 lên Firebase
  const controlDevice = async (key: string, value: number) => {
    try {
      await update(ref(db, controlPath), { [key]: value });
    } catch (error) {
      console.error(`Lỗi cập nhật ${key}:`, error);
    }
  };

  // Component giao diện cho từng cụm điều khiển
  const DoorControl = ({
    label,
    apiKey,
    status,
  }: {
    label: string;
    apiKey: string;
    status: boolean;
  }) => (
    <View style={styles(theme).content}>
      <Text style={styles(theme).subTitle}>{label}</Text>

      <View
        style={[
          styles(theme).statusBox,
          status ? styles(theme).statusOpen : styles(theme).statusClosed,
        ]}
      >
        <MaterialIcons
          name={status ? "sensor-door" : "door-front"}
          size={60}
          color={status ? "#4CAF50" : "#F44336"}
        />
        <Text
          style={[styles(theme).statusText, { color: status ? "#2E7D32" : "#C62828" }]}
        >
          {status ? t('door.open') : t('door.closed')}
        </Text>
      </View>

      <View style={styles(theme).buttonWrapper}>
        <TouchableOpacity
          style={[styles(theme).btn, styles(theme).btnOpen, status && styles(theme).btnDisabled]}
          onPress={() => controlDevice(apiKey, 1)}
          disabled={status}
        >
          <Text style={styles(theme).btnText}>{t('door.openBtn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles(theme).btn, styles(theme).btnClose, !status && styles(theme).btnDisabled]}
          onPress={() => controlDevice(apiKey, 0)}
          disabled={!status}
        >
          <Text style={styles(theme).btnText}>{t('door.closeBtn')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Component giao di?n cho các c?a r?ng (3,4,5,6)
  const EmptyDoor = ({ label }: { label: string }) => (
    <View style={styles(theme).content}>
      <Text style={styles(theme).subTitle}>{label}</Text>

      <View
        style={[
          styles(theme).statusBox,
          styles(theme).statusEmpty,
        ]}
      >
        <MaterialIcons
          name="door-sliding"
          size={60}
          color="#999"
        />
        <Text
          style={[styles(theme).statusText, { color: "#666" }]}
        >
          {t('door.notConnected')}
        </Text>
      </View>

      <View style={styles(theme).buttonWrapper}>
        <TouchableOpacity
          style={[styles(theme).btn, styles(theme).btnDisabled]}
          disabled={true}
        >
          <Text style={styles(theme).btnText}>{t('door.openBtn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles(theme).btn, styles(theme).btnDisabled]}
          disabled={true}
        >
          <Text style={styles(theme).btnText}>{t('door.closeBtn')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles(theme).container}>
      {/* Nút Quay lại */}
      <View
        style={[
          styles(theme).header,
          { backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff" },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles(theme).backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={styles(theme).title}>{t('door.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Điều khiển Cửa 1 - Sử dụng button2 */}
        <DoorControl
          label={t('door.door1')}
          apiKey="button1"
          status={deviceStates.servoOn1}
        />

        <View style={styles(theme).divider} />

        {/* Điều khiển Cửa 2 - Sử dụng button3 */}
        <DoorControl
          label={t('door.door2')}
          apiKey="button2"
          status={deviceStates.serverOn2}
        />

        <View style={styles(theme).divider} />

        {/* Cửa 3 - Rỗng */}
        <EmptyDoor label={t('door.door3')} />

        <View style={styles(theme).divider} />

        {/* Cửa 4 - Rỗng */}
        <EmptyDoor label={t('door.door4')} />

        <View style={styles(theme).divider} />

        {/* Cửa 5 - Rỗng */}
        <EmptyDoor label={t('door.door5')} />

        <View style={styles(theme).divider} />

        {/* Cửa 6 - Rỗng */}
        <EmptyDoor label={t('door.door6')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors[theme].background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 2,
  },
  backButton: { flexDirection: "row", padding: 20, alignItems: "center" },
  backText: { fontSize: 16, fontWeight: "600", color: Colors[theme].text },
  content: { alignItems: "center", paddingHorizontal: 30, marginBottom: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors[theme].text,
    textAlign: "left",
    marginBottom: 2,
    flex: 1,  
    marginLeft: 15,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors[theme].text,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  statusBox: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff',
    elevation: 3,
  },
  statusOpen: { borderLeftWidth: 5, borderLeftColor: "#4CAF50" },
  statusClosed: { borderLeftWidth: 5, borderLeftColor: "#F44336" },
  statusEmpty: { borderLeftWidth: 5, borderLeftColor: "#999" },
  statusText: { marginTop: 10, fontSize: 16, fontWeight: "bold" },
  buttonWrapper: { flexDirection: "row", width: "100%", gap: 15 },
  btn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  btnOpen: { backgroundColor: "#4CAF50" },
  btnClose: { backgroundColor: "#F44336" },
  btnDisabled: { opacity: 0.3 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  divider: {
    height: 1,
    backgroundColor: theme === 'dark' ? '#333' : '#DDD',
    marginHorizontal: 30,
    marginVertical: 30,
  },
});
