import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Platform, Keyboard, KeyboardAvoidingView } from 'react-native';
import { Search, User, Phone, CheckCircle2, ChevronRight, ArrowLeft, UserPlus } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const CustomerSearchScreen = ({ onSelect, onBack, onAddCustomer, token, apiUrl, mode }) => {
    const { t, language, isRTL, flexDir, tAlign } = useLanguage();
    const [query, setQuery] = useState('');
    const [allCustomers, setAllCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/users/clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sort by name
            const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
            setAllCustomers(sorted);
            setFilteredCustomers(sorted);
        } catch (err) {
            console.warn(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = (val) => {
        setQuery(val);
        if (!val) {
            setFilteredCustomers(allCustomers);
            return;
        }
        const filtered = allCustomers.filter(u => 
            u.name.toLowerCase().includes(val.toLowerCase()) || 
            (u.phone && u.phone.includes(val))
        );
        setFilteredCustomers(filtered);
    };

    const renderItem = ({ item }) => {
        const hasDebt = item.currentBalance > 0;
        return (
            <TouchableOpacity 
                style={[styles.resultItem, { flexDirection: flexDir }]} 
                onPress={() => {
                    Keyboard.dismiss();
                    onSelect(item);
                }}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={[styles.info, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 15, marginRight: isRTL ? 15 : 0 }]}>
                    <Text style={[styles.name, { textAlign: tAlign }]}>{item.name}</Text>
                    <View style={[styles.phoneRow, { flexDirection: flexDir, gap: 4 }]}>
                        <Phone size={12} color="#94a3b8" />
                        <Text style={[styles.phone, { textAlign: tAlign }]}>
                            {item.phone ? t('customerSearch.phone', { phone: item.phone }) : (language === 'fr' ? 'Pas de numéro' : 'لا يوجد رقم')}
                        </Text>
                    </View>
                </View>
                <View style={[styles.balanceBox, hasDebt ? styles.balanceBoxRed : styles.balanceBoxGreen]}>
                    <Text style={[styles.balanceLabel, hasDebt ? styles.balanceLabelRed : styles.balanceLabelGreen]}>
                        {hasDebt ? t('customerDetail.typeDebt') : (language === 'fr' ? 'SOLDE' : 'رصيد')}
                    </Text>
                    <Text style={[styles.balanceValue, hasDebt ? styles.balanceValueRed : styles.balanceValueGreen]}>
                        {item.currentBalance?.toFixed(2) || '0.00'} DH
                    </Text>
                </View>
                <View style={isRTL ? { transform: [{ rotate: '180deg' }] } : null}>
                    <ChevronRight color="#cbd5e1" size={20} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.header, { flexDirection: flexDir }]}>
                    <TouchableOpacity onPress={onBack} style={[styles.backBtn, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
                        <ArrowLeft color="#1e293b" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {mode === 'select' ? t('customerSearch.title') : t('customerSearch.titleManage')}
                    </Text>
                    <TouchableOpacity onPress={onAddCustomer} style={styles.addBtn}>
                        <UserPlus color="#4f46e5" size={24} />
                    </TouchableOpacity>
                </View>

            <View style={[styles.searchContainer, { flexDirection: flexDir }]}>
                <Search color="#94a3b8" size={18} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                <TextInput 
                    style={[styles.input, { textAlign: tAlign }]}
                    placeholder={t('customerSearch.placeholder')}
                    placeholderTextColor="#94a3b8"
                    value={query}
                    onChangeText={handleSearch}
                />
                {isLoading && <ActivityIndicator style={styles.loader} color="#4f46e5" />}
            </View>

            <FlatList 
                data={filteredCustomers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshing={isLoading}
                onRefresh={fetchCustomers}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListHeaderComponent={() => query.length > 0 && filteredCustomers.length > 0 ? (
                    <Text style={[styles.listHeader, { textAlign: tAlign }]}>
                        {language === 'fr' ? `RÉSULTATS TROUVÉS (${filteredCustomers.length})` : `النتائج الموجودة (${filteredCustomers.length})`}
                    </Text>
                ) : null}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#4f46e5" />
                        ) : (
                            <>
                                <UserPlus size={48} color="#f1f5f9" />
                                <Text style={styles.emptyText}>{t('customerSearch.empty')}</Text>
                                <Text style={styles.emptySub}>{t('customerSearch.emptySub')}</Text>
                            </>
                        )}
                    </View>
                )}
            />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, borderBottomWidth: 1, borderBottomColor: '#e3e2e6' },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 13, fontWeight: 'bold', color: '#002045', letterSpacing: 1 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#faf9fd', margin: 15, borderRadius: 15, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#e3e2e6' },
    searchIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#002045', fontWeight: '500' },
    loader: { marginLeft: 10 },
    list: { padding: 15 },
    listHeader: { fontSize: 10, fontWeight: 'bold', color: '#74777f', letterSpacing: 1, marginBottom: 15 },
    resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#faf9fd' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff4ee', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#a14009' },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#002045', marginBottom: 4 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    phone: { fontSize: 13, color: '#74777f' },
    balanceBox: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignItems: 'center', marginRight: 10, minWidth: 90 },
    balanceBoxRed: { backgroundColor: '#fef2f2' },
    balanceBoxGreen: { backgroundColor: '#f0fdf4' },
    balanceLabel: { fontSize: 8, fontWeight: 'black', marginBottom: 2 },
    balanceLabelRed: { color: '#ef4444' },
    balanceLabelGreen: { color: '#22c55e' },
    balanceValue: { fontSize: 13, fontWeight: 'bold' },
    balanceValueRed: { color: '#b91c1c' },
    balanceValueGreen: { color: '#15803d' },
    empty: { marginTop: 100, alignItems: 'center' },
    emptyText: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: '#74777f' },
    emptySub: { marginTop: 5, fontSize: 13, color: '#cbd5e1' }
});

export default CustomerSearchScreen;
