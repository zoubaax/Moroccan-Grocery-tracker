import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Keyboard, Linking } from 'react-native';
import { ArrowLeft, User, Phone, Save } from 'lucide-react-native';
import axios from 'axios';

const CustomerCreateScreen = ({ onBack, onSuccess, token, apiUrl }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert("Erreur", "Le nom du client est requis.");
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        // Generate unique email to satisfy backend unique constraints
        const cleanedName = name.trim().replace(/\s+/g, '').toLowerCase();
        const randomNum = Math.floor(Math.random() * 10000);
        const generatedEmail = phone ? `${phone}@client.ma` : `${cleanedName}${randomNum}@client.ma`;
        
        try {
            const signupData = {
                name: name.trim(),
                email: generatedEmail,
                phone: phone.trim(),
                password: 'client123', // password for login
                role: 'client'
            };

            await axios.post(`${apiUrl}/auth/register`, signupData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (phone.trim()) {
                let formattedPhone = phone.trim();
                if (formattedPhone.startsWith('0')) {
                    formattedPhone = '212' + formattedPhone.substring(1);
                } else if (formattedPhone.startsWith('+')) {
                    formattedPhone = formattedPhone.substring(1);
                }

                const message = `Salam ${name.trim()} 👋\n\nVoici tes identifiants pour te connecter à l'application *7anoti* et suivre tes crédits et tes achats :\n\n📱 *Identifiant* : ${phone.trim()}\n🔑 *Mot de passe* : client123`;
                const encodedMsg = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

                Alert.alert(
                    "Succès",
                    `Le client ${name.trim()} a été créé avec succès !`,
                    [
                        {
                            text: "Partager via WhatsApp",
                            onPress: async () => {
                                try {
                                    const supported = await Linking.canOpenURL(whatsappUrl);
                                    if (supported) {
                                        await Linking.openURL(whatsappUrl);
                                    } else {
                                        Alert.alert("Erreur", "WhatsApp n'est pas installé sur cet appareil.");
                                    }
                                } catch (err) {
                                    console.error("Error opening WhatsApp:", err);
                                } finally {
                                    onSuccess();
                                }
                            }
                        },
                        {
                            text: "Terminer",
                            onPress: () => onSuccess()
                        }
                    ]
                );
            } else {
                Alert.alert("Succès", `Client ${name.trim()} créé avec succès !`);
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || "Échec de l'enregistrement du client.";
            Alert.alert("Erreur", errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>NOUVEAU CLIENT</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Nom Complet *</Text>
                <View style={styles.inputRow}>
                    <User size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput 
                        style={styles.input}
                        placeholder="Ex: Ahmed Alaoui"
                        placeholderTextColor="#cbd5e1"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <Text style={[styles.label, { marginTop: 25 }]}>Téléphone (Optionnel)</Text>
                <View style={styles.inputRow}>
                    <Phone size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput 
                        style={styles.input}
                        placeholder="Ex: 0612345678"
                        placeholderTextColor="#cbd5e1"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, isLoading && styles.disabled]}
                    onPress={handleCreate}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.saveText}>ENREGISTRER LE CLIENT</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', letterSpacing: 1 },
    form: { padding: 25 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5, marginBottom: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 15, height: 50 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    saveBtn: { marginTop: 40, height: 55, backgroundColor: '#4f46e5', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
    saveText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
    disabled: { opacity: 0.6 }
});

export default CustomerCreateScreen;
