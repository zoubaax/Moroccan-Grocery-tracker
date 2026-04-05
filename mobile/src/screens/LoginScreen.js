import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LoginScreen = ({ navigation, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.logo}>7anoti</Text>
                    <Text style={styles.tagline}>7ANOTI MOBILE SUITE</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>IDENTIFIANT (EMAIL/PHONE)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Email ou +212..." 
                        value={email} 
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>MOT DE PASSE</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••••••" 
                        secureTextEntry 
                        value={password} 
                        onChangeText={setPassword}
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SE CONNECTER</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, padding: 30, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 50 },
    logo: { fontSize: 40, fontWeight: 'bold', color: '#4f46e5', letterSpacing: -1 },
    tagline: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 2, marginTop: 5 },
    form: { width: '100%' },
    label: { fontSize: 11, fontWeight: 'bold', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 },
    input: { height: 55, backgroundColor: '#f8fafc', borderWith: 1, borderColor: '#f1f5f9', borderRadius: 15, paddingHorizontal: 20, marginBottom: 20, fontSize: 16, color: '#1e293b' },
    button: { height: 55, backgroundColor: '#4f46e5', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    error: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' }
});

export default LoginScreen;
