import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Keyboard, Linking } from 'react-native';
import { ArrowLeft, User, Phone, Save } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const CustomerCreateScreen = ({ onBack, onSuccess, token, apiUrl }) => {
    const { t, language, isRTL, flexDir, tAlign } = useLanguage();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('customerCreate.errorEmpty'));
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

                const message = language === 'fr' 
                    ? `Salam ${name.trim()} 👋\n\nVoici tes identifiants pour te connecter à l'application *7anoti* et suivre tes crédits et tes achats :\n\n📱 *Identifiant* : ${phone.trim()}\n🔑 *Mot de passe* : client123`
                    : `سلام ${name.trim()} 👋\n\nإليك بيانات الاتصال الخاصة بك للولوج إلى تطبيق *حانوتي* ومتابعة ديونك ومشترياتك:\n\n📱 *المعرف*: ${phone.trim()}\n🔑 *كلمة المرور*: client123`;
                const encodedMsg = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

                Alert.alert(
                    t('common.success'),
                    language === 'fr' ? `Le client ${name.trim()} a été créé avec succès !` : `تم إنشاء حساب الزبون ${name.trim()} بنجاح!`,
                    [
                        {
                            text: language === 'fr' ? "Partager via WhatsApp" : "مشاركة عبر واتساب",
                            onPress: async () => {
                                try {
                                    const supported = await Linking.canOpenURL(whatsappUrl);
                                    if (supported) {
                                        await Linking.openURL(whatsappUrl);
                                    } else {
                                        Alert.alert(t('common.error'), language === 'fr' ? "WhatsApp n'est pas installé sur cet appareil." : "واتساب غير مثبت على هذا الجهاز.");
                                    }
                                } catch (err) {
                                    console.error("Error opening WhatsApp:", err);
                                } finally {
                                    onSuccess();
                                }
                            }
                        },
                        {
                            text: language === 'fr' ? "Terminer" : "إنهاء",
                            onPress: () => onSuccess()
                        }
                    ]
                );
            } else {
                Alert.alert(t('common.success'), language === 'fr' ? `Le client ${name.trim()} a été créé avec succès !` : `تم إنشاء حساب الزبون ${name.trim()} بنجاح!`);
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || t('customerCreate.errorNetwork');
            Alert.alert(t('common.error'), errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity onPress={onBack} style={[styles.backBtn, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('customerCreate.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.form}>
                <Text style={[styles.label, { textAlign: tAlign }]}>{t('customerCreate.name')} *</Text>
                <View style={[styles.inputRow, { flexDirection: flexDir }]}>
                    <User size={20} color="#94a3b8" style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <TextInput 
                        style={[styles.input, { textAlign: tAlign }]}
                        placeholder={t('customerCreate.namePlaceholder')}
                        placeholderTextColor="#cbd5e1"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <Text style={[styles.label, { marginTop: 25, textAlign: tAlign }]}>{t('customerCreate.phone')}</Text>
                <View style={[styles.inputRow, { flexDirection: flexDir }]}>
                    <Phone size={20} color="#94a3b8" style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <TextInput 
                        style={[styles.input, { textAlign: tAlign }]}
                        placeholder={t('customerCreate.phonePlaceholder')}
                        placeholderTextColor="#cbd5e1"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, isLoading && styles.disabled, { flexDirection: flexDir }]}
                    onPress={handleCreate}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.saveText}>{t('customerCreate.submit')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, borderBottomWidth: 1, borderBottomColor: '#e3e2e6' },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 13, fontWeight: 'bold', color: '#002045', letterSpacing: 1 },
    form: { padding: 25 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#74777f', letterSpacing: 0.5, marginBottom: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e3e2e6', borderRadius: 12, paddingHorizontal: 15, height: 50 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#002045', fontWeight: '500' },
    saveBtn: { marginTop: 40, height: 55, backgroundColor: '#a14009', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#a14009', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
    saveText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
    disabled: { opacity: 0.6 }
});

export default CustomerCreateScreen;
