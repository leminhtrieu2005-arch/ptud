import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { NotiContext } from "./_layout";

/* ===== TYPE ===== */
type LogItem = {
  id: string;
  title: string;
  time: string;
  type: "warning" | "success" | "info";
};

export default function NotificationScreen() {
  const { theme } = useAppSettings();
  const themeColors = Colors[theme];

  const { logs, clearLogs } = useContext(NotiContext);

  /* ===== ICON STYLE ===== */
  const getStatusStyle = (type: LogItem["type"]) => {
    switch (type) {
      case "warning":
        return { icon: "warning" as const, color: "#FF5252" };
      case "success":
        return { icon: "directions-car" as const, color: "#4CAF50" };
      case "info":
        return { icon: "exit-to-app" as const, color: "#2196F3" };
      default:
        return { icon: "notifications" as const, color: "#764ba2" };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme === "dark" ? "#3f2e5a" : "#764ba2" }
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>Lịch sử hệ thống</Text>
          <Text style={styles.headerSubtitle}>Tối đa 10 thông báo mới nhất</Text>
        </View>

        <Pressable onPress={clearLogs} style={styles.clearButton}>
          <MaterialIcons name="delete-sweep" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="notifications-none"
              size={80}
              color={theme === "dark" ? "#444" : "#ccc"}
            />
            <Text style={{ color: "#888", marginTop: 15, fontSize: 16 }}>
              Chưa có thông báo nào
            </Text>
          </View>
        ) : (
          logs.map((item) => {
            const status = getStatusStyle(item.type);

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      theme === "dark" ? "#1f1f29" : "#fff",
                    borderLeftColor: status.color
                  }
                ]}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: status.color + "15" }
                    ]}
                  >
                    <MaterialIcons
                      name={status.icon}
                      size={24}
                      color={status.color}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: themeColors.text }]}>
                      {item.title}
                    </Text>

                    <View style={styles.footerRow}>
                      <MaterialIcons name="access-time" size={14} color="#888" />
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8
  },

  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2
  },

  clearButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12
  },

  content: { padding: 16, paddingBottom: 100 },

  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 6
  },

  iconBox: {
    padding: 10,
    borderRadius: 14,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center"
  },

  title: { fontSize: 15, fontWeight: "700", lineHeight: 20 },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },

  time: { fontSize: 12, color: "#888", marginLeft: 5 },

  row: { flexDirection: "row", alignItems: "center" },

  emptyContainer: {
    alignItems: "center",
    marginTop: 150
  }
});
