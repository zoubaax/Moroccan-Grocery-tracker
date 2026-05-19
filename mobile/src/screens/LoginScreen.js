import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { User, Lock, Eye, EyeOff, Store, ShieldCheck } from 'lucide-react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const allowedRoles = ['ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_MOUL7ANOUT'];
            if (allowedRoles.includes(response.data.role)) {
                onLogin(response.data);
            } else {
                setError('Accès non autorisé pour ce rôle.');
            }
        } catch (err) {
            console.error("Login Result:", err.message);
            if (!err.response) {
                setError('Erreur réseau (vérifiez le serveur).');
            } else {
                setError('Identifiants incorrects.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Store color="#4f46e5" size={36} />
                        </View>
                        <Text style={styles.logo}>7anoti</Text>
                        <Text style={styles.tagline}>GESTION DE COMMERCE MOBILE</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <Text style={styles.label}>IDENTIFIANT (EMAIL)</Text>
                        <View style={styles.inputContainer}>
                            <User color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="nom@7anotk.ma" 
                                placeholderTextColor="#94a3b8"
                                value={email} 
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password Input */}
                        <Text style={styles.label}>MOT DE PASSE</Text>
                        <View style={styles.inputContainer}>
                            <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
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

                        {/* Login Button */}
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={handleLogin} 
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>SE CONNECTER</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ShieldCheck color="#94a3b8" size={16} />
                        <Text style={styles.footerText}>Connexion sécurisée SSL/TLS</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, // Soft slate-50 background (light mode)
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
        borderColor: '#e2e8f0', // soft border
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    logo: { fontSize: 36, fontWeight: 'bold', color: '#1e293b', letterSpacing: -1 }, // Dark slate text
    tagline: { fontSize: 10, fontWeight: '900', color: '#4f46e5', letterSpacing: 2.5, marginTop: 8 },
    form: { width: '100%' },
    label: { fontSize: 10, fontWeight: '900', color: '#64748b', marginBottom: 8, letterSpacing: 1 }, // slate label
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff', // white input box
        borderWidth: 1,
        borderColor: '#e2e8f0', // soft slate border
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
    input: { flex: 1, height: '100%', fontSize: 15, color: '#1e293b', fontWeight: '500' }, // Dark text
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
        backgroundColor: '#4f46e5', 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 10, 
        shadowColor: '#4f46e5', 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 15, 
        elevation: 6 
    },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 40 },
    footerText: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' }
});

export default LoginScreen;
