import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';
export type Language = 'vi' | 'en';

type AppSettingsContextType = {
  theme: ThemeMode;
  language: Language;
  setTheme: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  vi: {
    'nav.overview': 'Tổng quan',
    'nav.graph': 'Đồ thị',
    'nav.news': 'Tin tức',
    'nav.notifications': 'Thông báo',
    'nav.profile': 'Profile',
    'home.active': '📊 Điều khiển thiết bị',
    'home.sensors': '📈 Thông số nhiệt độ độ ẩm bãi xe',
    'home.settings': '⚙️ Thiết lập hệ thống',
    'home.title': '📊 Chủ động',
    'home.temperature': 'Nhiệt độ',
    'home.humidity': 'Độ ẩm',
    'home.temp': 'Nhiệt độ',
    'home.humi': 'Độ ẩm',
    'home.unitTemp': '°C',
    'home.unitHumi': '%',
    'home.light': 'Đèn',
    'home.alarm': 'Báo động',
    'home.door': 'Cửa ra vào',
    'home.parking': 'Bãi đậu xe',
    'home.water': 'Nước',
    'home.manage': 'Quản lý',
    'home.on': 'BẬT',
    'home.off': 'TẮT',
    'home.tempTitle': 'Ngưỡng Nhiệt',
    'home.timeOnTitle': 'Giờ mở đèn',
    'home.timeOffTitle': 'Giờ tắt đèn',
    'home.btnUpdate': 'LƯU TẤT CẢ THIẾT LẬP',
    'profile.title': '👤 Hồ sơ',
    'profile.edit': 'Chỉnh sửa hồ sơ',
    'profile.settings': 'Cài đặt',
    'profile.help': 'Trợ giúp',
    'profile.about': 'Về ứng dụng',
    'profile.logout': 'Đăng xuất',
    'graph.title': '📊 Phân Tích Lưu Lượng',
    'graph.totalLabel': 'Tổng lượt vật cản tích lũy',
    'graph.chartTitle': 'Số lần phát hiện (Mỗi 3 giây)',
    'notifications.title': '🔔 Thông báo',
    'slot.title': 'Trạng thái bãi giữ xe',
    'slot.empty': 'Trống',
    'slot.occupied': 'Có xe',
    'slot.ready': 'SẴN SÀNG',
    'slot.back': 'Quay lại',
    'register.title': 'Đăng ký tài khoản',
    'register.email': 'Email',
    'register.password': 'Mật khẩu',
    'register.submit': 'Đăng ký',
    'register.success': 'Chúc mừng! Bạn đã đăng ký thành công.',
    'register.fail': 'Đăng ký thất bại: ',
    'settings.title': '⚙️ Cài đặt',
    'settings.theme': 'Chế độ giao diện',
    'settings.themeDescription': 'Chọn giao diện sáng hoặc tối cho ứng dụng.',
    'settings.light': 'Sáng',
    'settings.dark': 'Tối',
    'settings.language': 'Ngôn ngữ',
    'settings.languageDescription': 'Chọn ngôn ngữ hiển thị cho ứng dụng.',
    'settings.vietnamese': 'Tiếng Việt',
    'settings.english': 'English',
    'settings.note': 'Lưu ý',
    'settings.noteText': 'Thiết lập này áp dụng cho toàn bộ app sau khi bạn chọn.',
    'news.title': 'Tin tức thể thao',
    'news.subtitle': 'Cập nhật các tin thể thao mới nhất từ Google News: bóng đá, bóng rổ, quần vợt và giải đấu hàng đầu.',
    'news.highlight': 'NỔI BẬT',
    'modal.title': 'Đây là modal',
    'modal.goHome': 'Về màn hình chính',
    'door.title': 'HỆ THỐNG CỬA BÃI XE',
    'door.door1': 'CỬA CHỔ XE 1',
    'door.door2': 'CỬA CHỔ XE 2',
    'door.open': 'ĐANG MỞ',
    'door.closed': 'ĐANG ĐÓNG',
    'door.openBtn': 'MỞ',
    'door.closeBtn': 'ĐÓNG',
    'door.back': 'Quay lại',
  },
  en: {
    'nav.overview': 'Overview',
    'nav.graph': 'Graph',
    'nav.news': 'News',
    'nav.notifications': 'Alerts',
    'nav.profile': 'Profile',
    'home.active': '📊 Device Control',
    'home.sensors': '📈 Temperature & Humidity Sensors',
    'home.settings': '⚙️ System Settings',
    'home.title': '📊 Dashboard',
    'home.temperature': 'Temperature',
    'home.humidity': 'Humidity',
    'home.temp': 'Temperature',
    'home.humi': 'Humidity',
    'home.unitTemp': '°C',
    'home.unitHumi': '%',
    'home.light': 'Light',
    'home.alarm': 'Alarm',
    'home.door': 'Door',
    'home.parking': 'Parking',
    'home.water': 'Water',
    'home.manage': 'Manage',
    'home.on': 'ON',
    'home.off': 'OFF',
    'home.tempTitle': 'Temperature Threshold',
    'home.timeOnTitle': 'Light On Time',
    'home.timeOffTitle': 'Light Off Time',
    'home.btnUpdate': 'SAVE ALL SETTINGS',
    'profile.title': '👤 Profile',
    'profile.edit': 'Edit Profile',
    'profile.settings': 'Settings',
    'profile.help': 'Help',
    'profile.about': 'About app',
    'profile.logout': 'Log out',
    'graph.title': '📊 Traffic Analytics',
    'graph.totalLabel': 'Total recorded obstacles',
    'graph.chartTitle': 'Detections (every 3 seconds)',
    'notifications.title': '🔔 Notifications',
    'slot.title': 'Parking Status',
    'slot.empty': 'Empty',
    'slot.occupied': 'Occupied',
    'slot.ready': 'Ready',
    'slot.back': 'Back',
    'register.title': 'Create account',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.submit': 'Sign up',
    'register.success': 'Congrats! Your account has been created.',
    'register.fail': 'Register failed: ',
    'settings.title': '⚙️ Settings',
    'settings.theme': 'Theme mode',
    'settings.themeDescription': 'Choose light or dark mode for the app.',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.language': 'Language',
    'settings.languageDescription': 'Choose app language.',
    'settings.vietnamese': 'Tiếng Việt',
    'settings.english': 'English',
    'settings.note': 'Note',
    'settings.noteText': 'These settings apply across the whole app once selected.',
    'news.title': 'Sports News',
    'news.subtitle': 'Latest sports updates from Google News: football, basketball, tennis and top events.',
    'news.highlight': 'FEATURED',
    'modal.title': 'This is a modal',
    'modal.goHome': 'Go to home screen',
    'door.title': 'PARKING GATE SYSTEM',
    'door.door1': 'PARKING GATE 1',
    'door.door2': 'PARKING GATE 2',
    'door.open': 'OPENING',
    'door.closed': 'CLOSED',
    'door.openBtn': 'OPEN',
    'door.closeBtn': 'CLOSE',
    'door.back': 'Back',
  },
};

export const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [theme, setTheme] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string) => {
    return translations[language][key] ?? translations.vi[key] ?? key;
  };

  const navigationTheme = useMemo(
    () => (theme === 'dark' ? DarkTheme : DefaultTheme),
    [theme]
  );

  return (
    <AppSettingsContext.Provider value={{ theme, language, setTheme, setLanguage, t }}>
      <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}
