import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppSettings } from "@/app/providers/AppSettingsProvider";
import { Colors } from "@/constants/theme";
import { onValue, ref, update } from "firebase/database";
import { db } from "../firebaseConfig";
import { NotiContext } from "./_layout";

export default function HomeScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const { unread, triggerNotification } = useContext(NotiContext);

  // State cảm biến và thiết bị
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [isHeaterOn, setIsHeaterOn] = useState(false);
  const [isPumpOn, setIsPumpOn] = useState(false);

  // State thiết lập
  const [tempThreshold, setTempThreshold] = useState(35);
  const [lightOnTime, setLightOnTime] = useState("18:30");
  const [lightOffTime, setLightOffTime] = useState("05:30");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // State điều khiển Picker
  const [pickerConfig, setPickerConfig] = useState({
    show: false,
    mode: "on" as "on" | "off",
  });

  const getTimeAsDate = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
  };

  useEffect(() => {
    const controlRef = ref(db, "thuan/control");
    const sensorRef = ref(db, "thuan2/sensor");
    const settingsRef = ref(db, "thuan/settings");

    const unsubscribeControl = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsHeaterOn(data.led === 1 || data.led === true);
        setIsPumpOn(data.buzzer === 1 || data.buzzer === true);
      }
    });

    const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTemperature(data.temperature ?? 0);
        setHumidity(data.humidity ?? 0);
      }
    });

    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.tempLimit) setTempThreshold(Number(data.tempLimit));
        if (data.lightOnTime) setLightOnTime(data.lightOnTime);
        if (data.lightOffTime) setLightOffTime(data.lightOffTime);
        setIsUnlocked(data.auto === 1);
      }
    });

    return () => {
      unsubscribeControl();
      unsubscribeSensor();
      unsubscribeSettings();
    };
  }, []);

  // ❌ ĐÃ XOÁ: useEffect cảnh báo nhiệt độ ở đây
  // Việc cảnh báo nhiệt độ đã được xử lý tập trung tại _layout.tsx
  // Không được xử lý tại đây để tránh thông báo bị lặp.

  const toggleDevice = async (device: string) => {
    const controlPath = ref(db, "thuan/control");
    try {
      if (device === "heater")
        await update(controlPath, { led: isHeaterOn ? 0 : 1 });
      else if (device === "pump")
        await update(controlPath, { buzzer: isPumpOn ? 0 : 1 });
    } catch (error) {
      console.error("Lỗi cập nhật Firebase:", error);
    }
  };

  const toggleUnlock = async (value: boolean) => {
    try {
      await update(ref(db, "thuan/settings"), { auto: value ? 1 : 0 });
    } catch (error) {
      console.error("Lỗi unlock:", error);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setPickerConfig({ ...pickerConfig, show: false });
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;
      if (pickerConfig.mode === "on") setLightOnTime(timeStr);
      else setLightOffTime(timeStr);
    }
  };

  const updateThresholds = async () => {
    try {
      await update(ref(db, "thuan/settings"), {
        tempLimit: tempThreshold,
        lightOnTime: lightOnTime,
        lightOffTime: lightOffTime,
      });
      // ✅ Truyền type riêng biệt để không bị chặn nhầm bởi logic dedup
      triggerNotification("✅ Đã lưu cài đặt thành công!", "SAVE_SUCCESS");
    } catch (error) {
      triggerNotification("❌ Không thể lưu dữ liệu.", "SAVE_ERROR");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme === "dark" ? "#1f1f29" : "#764ba2"}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ĐIỀU KHIỂN THIẾT BỊ */}
        <View
          style={[
            styles.sectionWrapper,
            { backgroundColor: theme === "dark" ? "#252530" : "#f0f2f5" },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t('home.active')}
          </Text>
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.card,
                isHeaterOn && styles.cardActive,
                {
                  backgroundColor: isHeaterOn
                    ? (theme === "dark" ? "#2a3f2a" : "#f4fbf4")
                    : (theme === "dark" ? "#1f1f29" : "#ffffff"),
                },
              ]}
              onPress={() => toggleDevice("heater")}
            >
              <Text style={styles.icon}>💡</Text>
              <Text style={[styles.cardLabel, { color: themeColors.text }]}>
                {t('home.light')}
              </Text>
              <Text style={[
                styles.cardStatus,
                {
                  color: isHeaterOn
                    ? "#4CAF50"
                    : (theme === "dark" ? "#ffffff" : "#ff3b30")
                }
              ]}>
                {isHeaterOn ? t('home.on') : t('home.off')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                isPumpOn && styles.cardActive,
                {
                  backgroundColor: isPumpOn
                    ? (theme === "dark" ? "#2a3f2a" : "#f4fbf4")
                    : (theme === "dark" ? "#1f1f29" : "#ffffff"),
                },
              ]}
              onPress={() => toggleDevice("pump")}
            >
              <Text style={styles.icon}>🔔</Text>
              <Text style={[styles.cardLabel, { color: themeColors.text }]}>
                {t('home.alarm')}
              </Text>
              <Text style={[
                styles.cardStatus,
                {
                  color: isPumpOn
                    ? "#4CAF50"
                    : (theme === "dark" ? "#ffffff" : "#ff3b30")
                }
              ]}>
                {isPumpOn ? t('home.on') : t('home.off')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff" },
              ]}
              onPress={() => router.push("/mo_cua")}
            >
              <Text style={styles.icon}>🪟</Text>
              <Text style={[styles.cardLabel, { color: themeColors.text }]}>
                {t('home.door')}
              </Text>
              <Text style={styles.cardStatus}>Truy cập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff" },
              ]}
              onPress={() => router.push("/slot" as any)}
            >
              <Text style={styles.icon}>🚗</Text>
              <Text style={[styles.cardLabel, { color: themeColors.text }]}>
                {t('home.parking')}
              </Text>
              <Text style={styles.cardStatus}>Kiểm tra</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* THÔNG SỐ CẢM BIẾN */}
        <View
          style={[
            styles.sectionWrapper,
            { backgroundColor: theme === "dark" ? "#252530" : "#f0f2f5" },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t('home.sensors')}
          </Text>
          <View style={styles.gridContainer}>
            <View
              style={[
                styles.card,
                { backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff" },
              ]}
            >
              <Text style={styles.icon}>🌡️</Text>
              <Text style={[styles.cardLabel, { color: themeColors.text }]}>
                {t('home.temp')}
              </Text>
              <Text
                style={[
                  styles.cardValue,
                  {
                    color: temperature > tempThreshold ? "#FF5252" : "#4A90E2",
                  },
                ]}
              >
                {temperature}{t('home.unitTemp')}
              </Text>
            </View>
            <View
              style={[
                styles.card,
                { backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff" },
              ]}
            >
              <Text style={styles.icon}>💧</Text>
              <Text style={[styles.cardLabel, { color: themeColors.text }]}>
                {t('home.humi')}
              </Text>
              <Text style={[styles.cardValue, { color: "#4CAF50" }]}>
                {humidity}{t('home.unitHumi')}
              </Text>
            </View>
          </View>
        </View>

        {/* THIẾT LẬP HỆ THỐNG */}
        <View
          style={[
            styles.sectionWrapper,
            { backgroundColor: theme === "dark" ? "#252530" : "#f0f2f5" },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: themeColors.text, marginBottom: 0 },
              ]}
            >
              {t('home.settings')}
            </Text>
            <Switch value={isUnlocked} onValueChange={toggleUnlock} />
          </View>

          <View
            style={[styles.settingsInside, { opacity: isUnlocked ? 1 : 0.5 }]}
          >
            <View style={styles.settingRowColumn}>
              <View style={styles.rowLabel}>
                <MaterialIcons name="thermostat" size={24} color="#764ba2" />
                <Text style={[styles.settingText, { color: themeColors.text }]}>
                  {t('home.tempTitle')}: {tempThreshold}°C
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={20}
                maximumValue={60}
                step={1}
                value={tempThreshold}
                onValueChange={setTempThreshold}
                disabled={!isUnlocked}
                minimumTrackTintColor="#764ba2"
                maximumTrackTintColor="#ccc"
                thumbTintColor={!isUnlocked ? "#999" : "#764ba2"}
              />
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                isUnlocked && setPickerConfig({ show: true, mode: "on" })
              }
              disabled={!isUnlocked}
            >
              <MaterialIcons name="wb-sunny" size={24} color="#FFB300" />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                {t('home.timeOnTitle')}
              </Text>
              <View style={styles.timeValueBox}>
                <Text style={styles.timeValueText}>{lightOnTime}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                isUnlocked && setPickerConfig({ show: true, mode: "off" })
              }
              disabled={!isUnlocked}
            >
              <MaterialIcons name="nights-stay" size={24} color="#5C6BC0" />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                {t('home.timeOffTitle')}
              </Text>
              <View style={styles.timeValueBox}>
                <Text style={styles.timeValueText}>{lightOffTime}</Text>
              </View>
            </TouchableOpacity>

            {pickerConfig.show && (
              <View style={styles.pickerContainer}>
                {Platform.OS === "ios" && (
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity
                      onPress={() =>
                        setPickerConfig({ ...pickerConfig, show: false })
                      }
                    >
                      <Text style={styles.okBtnText}>Xong</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  value={getTimeAsDate(
                    pickerConfig.mode === "on" ? lightOnTime : lightOffTime,
                  )}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              </View>
            )}

            <TouchableOpacity
              onPress={updateThresholds}
              style={[styles.saveBtn, !isUnlocked && { backgroundColor: "#ccc" }]}
              disabled={!isUnlocked}
            >
              <MaterialIcons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.saveBtnText}> {t('home.btnUpdate')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 15, paddingBottom: 40 },
  sectionWrapper: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    paddingLeft: 5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  cardActive: { borderColor: "#4CAF50", borderWidth: 2 },
  icon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: "bold" },
  cardStatus: { fontSize: 14, fontWeight: "bold", color: "#888" },
  statusOn: { color: "#4CAF50" },
  settingsInside: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 15,
    padding: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  settingRowColumn: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  rowLabel: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  settingText: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: "600" },
  timeValueBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#764ba2",
  },
  timeValueText: { fontWeight: "bold", color: "#764ba2", fontSize: 16 },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingBottom: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  pickerHeader: {
    alignItems: "flex-end",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  okBtnText: { color: "#007AFF", fontWeight: "bold", fontSize: 18 },
  saveBtn: {
    backgroundColor: "#764ba2",
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
