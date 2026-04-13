import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { auth, firestore } from '../firebaseConfig';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const resetForm = () => {
    setForm({ email: '', password: '', fullName: '' });
    setIsRegister(false);
  };

  // ===== LISTEN AUTH =====
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        // Nếu đã đăng nhập, chuyển đến home
        router.replace('/home');
      }
    });
  }, [router]);

  // ===== HANDLE AUTH =====
  const handleAuth = async () => {
    const { email, password, fullName } = form;

    if (!email || !password || (isRegister && !fullName)) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(user, { displayName: fullName });

        await setDoc(doc(firestore, "users", user.uid), {
          uid: user.uid,
          fullName,
          email,
          createdAt: serverTimestamp()
        });

        await signOut(auth);
        resetForm();
        Alert.alert("Thành công", "Đã tạo tài khoản! Vui lòng đăng nhập lại.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Đăng nhập thành công, onAuthStateChanged sẽ handle navigation
      }
    } catch (e: any) {
      Alert.alert("Thất bại", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
        <Animatable.Text animation="fadeInDown" style={styles.headerTitle}>
          BÃI XE THÔNG MINH
        </Animatable.Text>

        <Image
          source={{ uri: 'https://png.pngtree.com/element_our/20200702/ourlarge/pngtree-parking-icon-image_2291263.jpg' }}
          style={styles.parkingLogo}
        />

        <Text style={styles.headerSubtitle}>Quản lý bãi xe hiệu quả</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Animatable.View animation="fadeInUp" style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập"}
          </Text>

          {isRegister && (
            <Input label="Họ tên" value={form.fullName} onChange={(v: string) => setForm({ ...form, fullName: v })} />
          )}

          <Input label="Email" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
          <Input
            label="Mật khẩu"
            secure
            value={form.password}
            showPassword={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
            onChange={(v: string) => setForm({ ...form, password: v })}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#667eea" />
          ) : (
            <TouchableOpacity style={styles.mainBtn} onPress={handleAuth}>
              <Text style={styles.mainBtnText}>
                {isRegister ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
            <Text style={styles.toggleAuthText}>
              {isRegister ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

// ===== INPUT COMPONENT =====
const Input = ({ label, value, onChange, secure = false, showPassword = false, onToggleShow }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, secure ? styles.inputWithToggle : null]}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure && !showPassword}
        autoCapitalize="none"
      />
      {secure && (
        <TouchableOpacity style={styles.passwordToggle} onPress={onToggleShow}>
          <Text style={styles.passwordToggleText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ===== STYLE =====
const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#f0f2f5' },

  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 15 },

  parkingLogo: {
    width: 120, height: 120, borderRadius: 40,
    borderWidth: 3, borderColor: '#fff', marginBottom: 15,
  },

  headerSubtitle: { color: '#fff' },
  formContainer: { padding: 20 },

  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  formTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

  inputWrapper: { marginBottom: 15 },
  inputLabel: { marginBottom: 5 },

  inputRow: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 10,
    padding: 10,
    paddingRight: 60,
  },
  inputWithToggle: {
    paddingRight: 70,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  passwordToggleText: {
    color: '#667eea',
    fontWeight: '700',
  },

  mainBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },

  mainBtnText: { color: '#fff', fontWeight: 'bold' },

  toggleAuthText: { marginTop: 15, textAlign: 'center' },
});