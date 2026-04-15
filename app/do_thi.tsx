import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { db } from '../firebaseConfig';

import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import { NotiContext } from "./_layout";

export default function GraphScreen() {
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const router = useRouter();
  const { unread } = useContext(NotiContext);

  // State cho biến đếm trong 15 giây
  const [countIn, setCountIn] = useState(0);    // Số xe vào (rising edge)
  const [countOut, setCountOut] = useState(0);  // Số xe ra (falling edge)

  // Lịch sử đếm qua các khoảng 15 giây (7 mẫu)
  const [countHistoryIn, setCountHistoryIn] = useState<number[]>(new Array(7).fill(0));
  const [countHistoryOut, setCountHistoryOut] = useState<number[]>(new Array(7).fill(0));
  const [labels, setLabels] = useState<string[]>(new Array(7).fill(''));

  // State để theo dõi giá trị trước đó của sensor
  const [prevS1, setPrevS1] = useState<number | null>(null);
  const [prevS2, setPrevS2] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset biến đếm khi component mount
  useEffect(() => {
    setCountIn(0);
    setCountOut(0);
  }, []);

  useEffect(() => {
    const sensorRef = ref(db, 'thuan2/sensor');

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const s1 = Number(data.sensorStatus1) || 0;
        const s2 = Number(data.sensorStatus2) || 0;

        // Lần đầu tiên: khởi tạo giá trị cảm biến mà không đếm
        if (!isInitialized) {
          setPrevS1(s1);
          setPrevS2(s2);
          setIsInitialized(true);
          return;
        }

        // Lần sau: đếm khi có sự thay đổi (edge detection)
        // Đếm số xe vào khi sensor chuyển từ 0 lên 1 (rising edge)
        if ((s1 === 1 && prevS1 === 0) || (s2 === 1 && prevS2 === 0)) {
          setCountIn(prev => prev + 1);
        }
        
        // Đếm số xe ra khi sensor chuyển từ 1 xuống 0 (falling edge)
        if ((s1 === 0 && prevS1 === 1) || (s2 === 0 && prevS2 === 1)) {
          setCountOut(prev => prev + 1);
        }

        setPrevS1(s1);
        setPrevS2(s2);
      }
    });

    return () => unsubscribe();
  }, [isInitialized, prevS1, prevS2]);

  // Reset đếm và cập nhật lịch sử mỗi 15 giây
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        //second: '2-digit' 
      });

      // Cập nhật lịch sử
      setCountHistoryIn(prev => [...prev.slice(1), countIn]);
      setCountHistoryOut(prev => [...prev.slice(1), countOut]);
      setLabels(prev => [...prev.slice(1), timeStr]);

      // Reset đếm
      setCountIn(0);
      setCountOut(0);
    }, 10000); // 15 giây

    return () => clearInterval(interval);
  }, [countIn, countOut]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: countHistoryIn,
        color: (opacity = 1) => `rgba(255, 69, 58, ${opacity})`, 
        strokeWidth: 3,
      },
      {
        data: countHistoryOut,
        color: (opacity = 1) => `rgba(10, 132, 255, ${opacity})`, 
        strokeWidth: 3,
      },
    ],
    legend: [t('graph.legendIn'), t('graph.legendOut')] 
  };

  // Tính toán max value để điều chỉnh trục Y
  const maxValue = Math.max(...countHistoryIn, ...countHistoryOut, 0);
  const yAxisMax = maxValue < 10 ? 10 : 20;
  const yAxisSegments = maxValue < 10 ? 5 : 10; // 5 segments cho 0-10, 10 segments cho 0-20

  // Tạo chartData với max value để force scale
  const chartDataWithMax = {
    ...chartData,
    datasets: [
      ...chartData.datasets,
      {
        data: [yAxisMax], // Thêm data point ẩn để set max Y
        color: () => 'transparent', // Ẩn dataset này
      }
    ]
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#3f2e5a' : '#764ba2' }]}> 
        <Text style={styles.headerTitle}>{t('home.graph')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.chartContainer, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <Text style={[styles.chartTitle, { color: themeColors.text }]}>
            {t('graph.chartTitle')}
          </Text>
          
          <LineChart
            data={chartDataWithMax}
            width={Dimensions.get('window').width - 40} 
            height={300} // Tăng chiều cao một chút để hiển thị số trục Y rõ hơn
            chartConfig={{
              backgroundColor: theme === 'dark' ? '#1c1c1e' : '#ffffff',
              backgroundGradientFrom: theme === 'dark' ? '#1c1c1e' : '#ffffff',
              backgroundGradientTo: theme === 'dark' ? '#1c1c1e' : '#ffffff',
              decimalPlaces: 0, // Không hiển thị số thập phân
              color: (opacity = 1) => (theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
              labelColor: (opacity = 1) => theme === 'dark' ? '#aaa' : '#444',
              style: { borderRadius: 16 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: theme === 'dark' ? "#fff" : "#eee" },
              propsForBackgroundLines: { stroke: theme === 'dark' ? '#444' : '#e0e0e0', strokeDasharray: '' },
              // Căn giữa biểu đồ bằng cách chỉnh padding phải
              paddingRight: 55,
              // Đảm bảo số trên trục Y là số nguyên
              formatYLabel: (yValue) => Math.round(Number(yValue)).toString(),
            }}
            bezier
            fromZero={true}
            segments={yAxisSegments}
            yAxisInterval={1}
            withHorizontalLines={true}
            withVerticalLabels={true}
            style={styles.chartStyle}
          />
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
           <View style={styles.infoRow}>
             <MaterialIcons name="lens" size={12} color="rgba(255, 69, 58, 1)" />
             <Text style={[styles.infoText, {color: themeColors.text}]}> {t('graph.carsIn')} {countIn}</Text>
           </View>
           <View style={styles.infoRow}>
             <MaterialIcons name="lens" size={12} color="rgba(10, 132, 255, 1)" />
             <Text style={[styles.infoText, {color: themeColors.text}]}> {t('graph.carsOut')} {countOut}</Text>
           </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 20, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  content: { padding: 15, paddingBottom: 120 },
  chartContainer: { 
    padding: 15, 
    borderRadius: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    alignItems: 'center' 
  },
  chartTitle: { fontSize: 15, fontWeight: '600', marginBottom: 15 },
  chartStyle: { 
    borderRadius: 15, 
    marginVertical: 10,
    alignSelf: 'center'
  },
  infoCard: { marginTop: 20, padding: 20, borderRadius: 15, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { fontSize: 14, fontWeight: '500' },
});
