import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppSettings } from "@/app/providers/AppSettingsProvider";
import { Colors } from "@/constants/theme";
import { db } from "../firebaseConfig";

export default function SlotScreen() {
  const router = useRouter();
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const TOTAL_SLOTS = 6;

  // Khởi tạo 6 vị trí ban đầu - slot 3,4,5,6 có giá trị mặc định là false (trống)
  const [slots, setSlots] = useState([
    { id: 1, isOccupied: false },
    { id: 2, isOccupied: false },
    { id: 3, isOccupied: true }, // Giá trị mặc định - không đọc từ Firebase
    { id: 4, isOccupied: true }, // Giá trị mặc định - không đọc từ Firebase
    { id: 5, isOccupied: true }, // Giá trị mặc định - không đọc từ Firebase
    { id: 6, isOccupied: true }, // Giá trị mặc định - không đọc từ Firebase
  ]);

  useEffect(() => {
    console.log("Setting up Firebase listeners for 2 sensors only...");

    // Mảng để lưu các hàm unsubscribe nhằm cleanup sau này
    const unsubscribes: (() => void)[] = [];

    // Chỉ đọc sensorStatus1 và sensorStatus2 từ Firebase
    for (let i = 1; i <= 2; i++) {
      const sensorRef = ref(db, `thuan2/sensor/sensorStatus${i}`);

      const unsubscribe = onValue(
        sensorRef,
        (snapshot) => {
          const value = snapshot.val();
          console.log(`Sensor ${i} data received:`, value);

          setSlots((prevSlots) => {
            const newSlots = [...prevSlots];
            // Tìm slot tương ứng theo index (i-1)
            if (newSlots[i - 1]) {
              newSlots[i - 1].isOccupied = value === 1;
            }
            return newSlots;
          });
        },
        (error) => {
          console.error(`Error reading sensor ${i} data:`, error);
        },
      );

      unsubscribes.push(unsubscribe);
    }

    // Cleanup: Chạy tất cả các hàm unsubscribe khi component bị unmount
    return () => {
      console.log("Cleaning up Firebase listeners");
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const occupiedCount = slots.filter((s) => s.isOccupied).length;
  const emptyCount = TOTAL_SLOTS - occupiedCount;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme === "dark" ? "#1f1f29" : "#f0f2f5"}
      />

      <View
        style={[
          styles.header,
          { backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff" },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={20}
            color={themeColors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t("slot.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View
            style={[
              styles.summaryCard,
              {
                borderLeftColor: "#4CAF50",
                backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff",
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: themeColors.text }]}>
              {t("slot.empty")}
            </Text>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
              {emptyCount}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                borderLeftColor: "#F44336",
                backgroundColor: theme === "dark" ? "#1f1f29" : "#ffffff",
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: themeColors.text }]}>
              {t("slot.occupied")}
            </Text>
            <Text style={[styles.summaryValue, { color: "#F44336" }]}>
              {occupiedCount}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          {t("slot.title")}
        </Text>

        {/* Grid Slots */}
        <View style={styles.gridContainer}>
          {slots.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.slotBox,
                {
                  backgroundColor: slot.isOccupied
                    ? theme === "dark"
                      ? "#3d2726"
                      : "#fff1f0"
                    : theme === "dark"
                      ? "#243425"
                      : "#f4fff4",
                  borderColor: slot.isOccupied ? "#F44336" : "#4CAF50",
                },
              ]}
            >
              <Text
                style={[
                  styles.slotId,
                  { color: slot.isOccupied ? "#F44336" : "#4CAF50" },
                ]}
              >
                {t("slot.slot")} {slot.id}
              </Text>

              <View style={styles.statusIcon}>
                <MaterialIcons
                  name={
                    slot.isOccupied
                      ? "directions-car"
                      : "radio-button-unchecked"
                  }
                  size={40}
                  color={slot.isOccupied ? "#F44336" : "#4CAF50"}
                />
              </View>

              <Text
                style={[
                  styles.statusText,
                  { color: slot.isOccupied ? "#F44336" : "#4CAF50" },
                ]}
              >
                {slot.isOccupied ? t("slot.occupied") : t("slot.ready")}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 2,
  },
  backButton: { padding: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: { flex: 1, padding: 15 },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    width: "48%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    borderLeftWidth: 5,
  },
  summaryLabel: { fontSize: 13, fontWeight: "bold", marginBottom: 5 },
  summaryValue: { fontSize: 26, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    marginLeft: 5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  slotBox: {
    width: "48%",
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1.5,
    elevation: 2,
  },
  slotId: { fontSize: 11, fontWeight: "bold", marginBottom: 5 },
  statusIcon: { marginVertical: 8 },
  statusText: { fontSize: 12, fontWeight: "bold" },
});
