import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';

export default function RegisterScreen() {
  const { theme, t } = useAppSettings();
  const themeColors = Colors[theme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert(t('register.title'), t('register.success'));
    } catch (error: any) {
      Alert.alert(t('register.title'), `${t('register.fail')}${error?.message ?? ''}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}> 
      <Text style={[styles.title, { color: themeColors.text }]}>{t('register.title')}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff', color: themeColors.text }]}
        placeholder={t('register.email')}
        placeholderTextColor={theme === 'dark' ? '#8b95a1' : '#999'}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#fff', color: themeColors.text }]}
        placeholder={t('register.password')}
        placeholderTextColor={theme === 'dark' ? '#8b95a1' : '#999'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: '#0288d1' }]} onPress={handleRegister}>
        <Text style={styles.buttonText}>{t('register.submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  button: { padding: 15, borderRadius: 5 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
