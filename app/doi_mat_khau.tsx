import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAppSettings } from '@/app/providers/AppSettingsProvider';
import { Colors } from '@/constants/theme';
import { auth } from '../firebaseConfig';

// --- 1. ĐƯA COMPONENT INPUT RA NGOÀI ĐỂ KHÔNG BỊ MẤT FOCUS ---
const InputField = ({
    label,
    value,
    onChange,
    secureTextEntry = false,
    placeholder = '',
    theme,
    themeColors,
}: {
    label: string;
    value: string;
    onChange: (text: string) => void;
    secureTextEntry?: boolean;
    placeholder?: string;
    theme: string;
    themeColors: any;
}) => (
    <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: themeColors.text }]}>{label}</Text>
        <TextInput
            style={[
                styles.input,
                {
                    backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff',
                    color: themeColors.text,
                    borderColor: theme === 'dark' ? '#333' : '#ddd',
                },
            ]}
            value={value}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            placeholder={placeholder}
            placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
        />
    </View>
);

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { theme, t } = useAppSettings();
    const themeColors = Colors[theme];
    const headerColor = theme === 'dark' ? '#3f2e5a' : '#764ba2';

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = form;
        const user = auth.currentUser;

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t('common.error'), t('changePassword.allFieldsRequired'));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('common.error'), t('changePassword.passwordMismatch'));
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(t('common.error'), t('changePassword.passwordTooShort'));
            return;
        }

        if (!user || !user.email) {
            Alert.alert(t('common.error'), t('changePassword.userNotFound'));
            return;
        }

        setLoading(true);

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            Alert.alert(t('common.success'), t('changePassword.success'), [
                {
                    text: 'OK',
                    onPress: () => {
                        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        router.back();
                    },
                },
            ]);
        } catch (error: any) {
            let errorMessage = t('changePassword.changeError');
            if (error.code === 'auth/wrong-password') {
                errorMessage = t('changePassword.wrongPassword');
            } else if (error.code === 'auth/weak-password') {
                errorMessage = t('changePassword.weakPassword');
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = t('changePassword.recentLoginRequired');
            }
            Alert.alert(t('common.error'), errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={headerColor} />

            <View style={[styles.header, { backgroundColor: headerColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('changePassword.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1f1f29' : '#ffffff' }]}>
                    <Text style={[styles.description, { color: themeColors.text }]}>
                        {t('changePassword.description')}
                    </Text>

                    <InputField
                        label={t('changePassword.currentPassword')}
                        value={form.currentPassword}
                        onChange={(text) => setForm({ ...form, currentPassword: text })}
                        secureTextEntry
                        placeholder={t('changePassword.currentPasswordPlaceholder')}
                        theme={theme}
                        themeColors={themeColors}
                    />

                    <InputField
                        label={t('changePassword.newPassword')}
                        value={form.newPassword}
                        onChange={(text) => setForm({ ...form, newPassword: text })}
                        secureTextEntry
                        placeholder={t('changePassword.newPasswordPlaceholder')}
                        theme={theme}
                        themeColors={themeColors}
                    />

                    <InputField
                        label={t('changePassword.confirmPassword')}
                        value={form.confirmPassword}
                        onChange={(text) => setForm({ ...form, confirmPassword: text })}
                        secureTextEntry
                        placeholder={t('changePassword.confirmPasswordPlaceholder')}
                        theme={theme}
                        themeColors={themeColors}
                    />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: headerColor }]}
                        activeOpacity={0.7}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? t('changePassword.processing') : t('changePassword.button')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- STYLES GIỮ NGUYÊN ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
    },
    backButton: { padding: 5 },
    headerTitle: {
        flex: 1,
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollArea: { flex: 1 },
    scrollContent: { paddingBottom: 20 },
    card: {
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    inputContainer: { marginBottom: 15 },
    inputLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
