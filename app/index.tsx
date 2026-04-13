import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

export default function IntroScreen() {
  const router = useRouter();

  // Hiệu ứng xe chạy ngang
  const carAnimation = {
    from: { left: -150 },
    to: { left: width + 50 },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 1600);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.screenContainer}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradientBg}>
        <Animatable.View animation="fadeIn" duration={800} style={styles.content}>
          <Text style={styles.title}>BÃI XE THÔNG MINH</Text>
          <Text style={styles.subtitle}>Quản lý bãi xe hiệu quả và tiện lợi</Text>
        </Animatable.View>

        <Animatable.Image
          animation={carAnimation}
          duration={1500}
          iterationCount={1}
          easing="linear"
          source={{ uri: 'https://cdn-icons-png.flaticon.com/128/15167/15167409.png' }}
          style={styles.carLogo}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  gradientBg: { flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  content: { alignItems: 'center', width: '100%', paddingHorizontal: 20, marginBottom: 50 },
  carLogo: {
    width: 150,
    height: 100,
    position: 'absolute',
    bottom: '30%',
    resizeMode: 'contain',
  },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#fff', textAlign: 'center' },
});