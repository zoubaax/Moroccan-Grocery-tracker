import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { User, Lock, Eye, EyeOff, Store, ShieldCheck, Fingerprint, ScanFace } from 'lucide-react-native';
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../services/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LoginScreen = ({ onLogin }) => {
    const { t, language, changeLanguage, isRTL, tAlign, flexDir } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState('FINGERPRINT');
    const [savedCredentials, setSavedCredentials] = useState(null);

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (hasHardware && isEnrolled) {
                // Check if device supports FaceID/facial recognition
                const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
                if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                    setBiometricType('FACIAL_RECOGNITION');
                } else {
                    setBiometricType('FINGERPRINT');
                }

                const credsStr = await AsyncStorage.getItem('saved_credentials');
                if (credsStr) {
                    const parsed = JSON.parse(credsStr);
                    setSavedCredentials(parsed);
                    setIsBiometricAvailable(true);
                    
                    // Auto-trigger biometric prompt on screen load for quick entry
                    setTimeout(() => {
                        triggerBiometricAuth(parsed);
                    }, 600);
                }
            }
        } catch (e) {
            console.error("Biometrics check error:", e);
        }
    };

    const triggerBiometricAuth = async (credsToUse = savedCredentials) => {
        if (!credsToUse) return;
        try {
            const isFaceId = biometricType === 'FACIAL_RECOGNITION';
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: isFaceId ? t('login.biometricsFace') : t('login.biometricsFingerprint'),
                cancelLabel: t('common.cancel'),
                disableDeviceFallback: false,
            });

            if (result.success) {
                setEmail(credsToUse.email);
                setPassword(credsToUse.password);
                performLogin(credsToUse.email, credsToUse.password);
            }
        } catch (e) {
            console.error("Biometric authentication error:", e);
        }
    };

    const performLogin = async (loginEmail, loginPassword) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email: loginEmail, password: loginPassword });
            const allowedRoles = ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_MOUL7ANOUT', 'ROLE_CLIENT'];
            if (allowedRoles.includes(response.data.role)) {
                await AsyncStorage.setItem('saved_credentials', JSON.stringify({ email: loginEmail, password: loginPassword }));
                const loginUser = {
                    ...response.data,
                    token: response.data.token,
                    subscriptionPlan: response.data.subscriptionPlan || 'START',
                    features: response.data.features || {
                        sales: true,
                        credit: true,
                        marketplace: false,
                        aiAutomation: false,
                    },
                };
                onLogin(loginUser);
            } else {
                setError(t('login.errorUnauthorized'));
            }
        } catch (err) {
            console.error("Login Result:", err.message);
            if (!err.response) {
                setError(t('login.errorNetwork'));
            } else {
                setError(t('login.errorCredentials'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            setError(t('login.errorEmpty'));
            return;
        }
        performLogin(email, password);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Language Switcher */}
                    <View style={[styles.langSwitcherContainer, { flexDirection: flexDir }]}>
                        <TouchableOpacity 
                            style={[styles.langBtn, language === 'fr' && styles.activeLangBtn]} 
                            onPress={() => changeLanguage('fr')}
                        >
                            <Text style={styles.langEmoji}>🇫🇷</Text>
                            <Text style={[styles.langText, language === 'fr' && styles.activeLangText]}>FR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.langBtn, language === 'ar' && styles.activeLangBtn]} 
                            onPress={() => changeLanguage('ar')}
                        >
                            <Text style={styles.langEmoji}>🇲🇦</Text>
                            <Text style={[styles.langText, language === 'ar' && styles.activeLangText]}>العربية</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Store color="#a14009" size={36} />
                        </View>
                        <Text style={styles.logo}>7anoti</Text>
                        <Text style={styles.tagline}>{t('login.tagline')}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <Text style={[styles.label, { textAlign: tAlign }]}>{t('login.identifier')}</Text>
                        <View style={[styles.inputContainer, { flexDirection: flexDir }]}>
                            <User color="#94a3b8" size={20} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                            <TextInput 
                                style={[styles.input, { textAlign: tAlign }]} 
                                placeholder={t('login.identifierPlaceholder')} 
                                placeholderTextColor="#94a3b8"
                                value={email} 
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="default"
                            />
                        </View>

                        {/* Password Input */}
                        <Text style={[styles.label, { textAlign: tAlign }]}>{t('login.password')}</Text>
                        <View style={[styles.inputContainer, { flexDirection: flexDir }]}>
                            <Lock color="#94a3b8" size={20} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                            <TextInput 
                                style={[styles.input, { textAlign: tAlign }]} 
                                placeholder="••••••••" 
                                placeholderTextColor="#94a3b8"
                                secureTextEntry={!showPassword} 
                                value={password} 
                                onChangeText={setPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                {showPassword ? (
                                    <EyeOff color="#94a3b8" size={20} />
                                ) : (
                                    <Eye color="#94a3b8" size={20} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Action buttons (Submit and Biometric Icon) */}
                        <View style={[styles.actionRow, { flexDirection: flexDir }]}>
                            <TouchableOpacity 
                                style={[styles.button, { flex: 1 }, isBiometricAvailable && (isRTL ? { marginLeft: 10 } : { marginRight: 10 })]} 
                                onPress={handleLogin} 
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>{t('login.connect')}</Text>
                                )}
                            </TouchableOpacity>

                            {isBiometricAvailable && (
                                <TouchableOpacity 
                                    style={styles.biometricBtn} 
                                    onPress={() => triggerBiometricAuth()} 
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {biometricType === 'FACIAL_RECOGNITION' ? (
                                        <ScanFace color="#a14009" size={26} />
                                    ) : (
                                        <Fingerprint color="#a14009" size={26} />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={[styles.footer, { flexDirection: flexDir }]}>
                        <ShieldCheck color="#94a3b8" size={16} />
                        <Text style={styles.footerText}>{t('login.biometricsSecure')}</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' }, // Soft slate-50 background (light mode)
    keyboardView: { flex: 1 },
    content: { flex: 1, padding: 30, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e3e2e6', // soft border
        shadowColor: '#a14009',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    logo: { fontSize: 36, fontWeight: 'bold', color: '#002045', letterSpacing: -1 }, // Dark slate text
    tagline: { fontSize: 10, fontWeight: '900', color: '#a14009', letterSpacing: 2.5, marginTop: 8 },
    form: { width: '100%' },
    label: { fontSize: 10, fontWeight: '900', color: '#64748b', marginBottom: 8, letterSpacing: 1 }, // slate label
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff', // white input box
        borderWidth: 1,
        borderColor: '#e3e2e6', // soft slate border
        borderRadius: 16,
        paddingHorizontal: 15,
        marginBottom: 22,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: '100%', fontSize: 15, color: '#002045', fontWeight: '500' }, // Dark text
    eyeBtn: { padding: 6 },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    errorText: { color: '#ef4444', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
    button: { 
        height: 56, 
        backgroundColor: '#a14009', 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 10, 
        shadowColor: '#a14009', 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 15, 
        elevation: 6 
    },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    biometricBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff4ee',
        borderWidth: 1,
        borderColor: '#ffdbcd',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#a14009',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 4
    },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 40 },
    footerText: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
    langSwitcherContainer: {
        alignSelf: 'center',
        backgroundColor: '#efedf1',
        borderRadius: 20,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e3e2e6',
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 6,
    },
    activeLangBtn: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    langEmoji: {
        fontSize: 16,
    },
    langText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748b',
    },
    activeLangText: {
        color: '#002045',
    },
});

export default LoginScreen;
