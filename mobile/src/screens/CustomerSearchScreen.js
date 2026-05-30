import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, 
    ActivityIndicator, SafeAreaView, Platform, Keyboard, KeyboardAvoidingView, 
    StatusBar
} from 'react-native';
import { Search, User, Phone, ChevronRight, ArrowLeft, UserPlus, DollarSign, Users, AlertTriangle } from 'lucide-react-native';
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

    // Calculate Summary Stats
    const totalOutstanding = allCustomers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
    const debtorsCount = allCustomers.filter(c => (c.currentBalance || 0) > 0).length;

    const renderItem = ({ item }) => {
        const balance = item.currentBalance || 0;
        const hasDebt = balance > 0;
        
        // Color coding matching Detail Screen
        const debtColor = balance === 0 ? '#15803d' : balance <= 500 ? '#d97706' : '#b91c1c';
        const debtBg = balance === 0 ? '#f0fdf4' : balance <= 500 ? '#fffbeb' : '#fef2f2';
        const debtLabel = balance === 0
            ? (language === 'fr' ? 'À JOUR' : 'بدون ديون')
            : balance <= 500
            ? (language === 'fr' ? 'ATTENTION' : 'تنبيه')
            : (language === 'fr' ? 'EN RETARD' : 'متأخر');

        return (
            <TouchableOpacity 
                style={[styles.resultItem, { flexDirection: flexDir }]} 
                onPress={() => {
                    Keyboard.dismiss();
                    onSelect(item);
                }}
                activeOpacity={0.7}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                
                <View style={[styles.info, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                    <Text style={[styles.name, { textAlign: tAlign }]} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.phoneRow, { flexDirection: flexDir, gap: 4 }]}>
                        <Phone size={11} color="#74777f" />
                        <Text style={[styles.phone, { textAlign: tAlign }]}>
                            {item.phone ? item.phone : (language === 'fr' ? 'Pas de numéro' : 'لا يوجد رقم')}
                        </Text>
                    </View>
                </View>
                
                <View style={[styles.balanceBadge, { backgroundColor: debtBg, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }]}>
                    <Text style={[styles.balanceLabel, { color: debtColor }]}>{debtLabel}</Text>
                    <Text style={[styles.balanceValue, { color: debtColor }]}>
                        {balance.toFixed(2)} DH
                    </Text>
                </View>
                
                <View style={isRTL ? { transform: [{ rotate: '180deg' }] } : null}>
                    <ChevronRight color="#c4c6cf" size={18} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#002045" />
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.headerTop, { flexDirection: flexDir }]}>
                        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                            <ArrowLeft color="#fff" size={22} style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {mode === 'select' ? t('customerSearch.title') : t('customerSearch.titleManage')}
                        </Text>
                        <TouchableOpacity onPress={onAddCustomer} style={styles.addBtn}>
                            <UserPlus color="#fff" size={22} />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats Overlay (only when managing credit) */}
                    {mode === 'manage' && (
                        <View style={[styles.statsRow, { flexDirection: flexDir }]}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#fee2e2' }]}>
                                    <DollarSign size={16} color="#ef4444" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>{language === 'fr' ? 'Crédits Totaux' : 'إجمالي الديون'}</Text>
                                    <Text style={styles.statValue}>{totalOutstanding.toFixed(2)} DH</Text>
                                </View>
                            </View>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: '#fff4ee' }]}>
                                    <Users size={16} color="#a14009" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>{language === 'fr' ? 'Clients Débiteurs' : 'العملاء المدينين'}</Text>
                                    <Text style={styles.statValue}>{debtorsCount} {language === 'fr' ? 'clients' : 'عملاء'}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { flexDirection: flexDir }]}>
                    <Search color="#74777f" size={18} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <TextInput 
                        style={[styles.input, { textAlign: tAlign }]}
                        placeholder={t('customerSearch.placeholder')}
                        placeholderTextColor="#c4c6cf"
                        value={query}
                        onChangeText={handleSearch}
                    />
                    {isLoading && <ActivityIndicator style={styles.loader} color="#a14009" />}
                </View>

                {/* Customer List */}
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
                        <Text style={[styles.listHeader, { textAlign: tAlign, paddingHorizontal: 4 }]}>
                            {language === 'fr' ? `RÉSULTATS TROUVÉS (${filteredCustomers.length})` : `النتائج الموجودة (${filteredCustomers.length})`}
                        </Text>
                    ) : null}
                    ListEmptyComponent={() => (
                        <View style={styles.empty}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#a14009" />
                            ) : (
                                <>
                                    <View style={styles.emptyIconContainer}>
                                        <User size={36} color="#c4c6cf" />
                                    </View>
                                    <Text style={styles.emptyText}>{t('customerSearch.empty')}</Text>
                                    <Text style={styles.emptySub}>{t('customerSearch.emptySub')}</Text>
                                    <TouchableOpacity style={styles.createBtn} onPress={onAddCustomer}>
                                        <Text style={styles.createBtnText}>
                                            {language === 'fr' ? 'Ajouter un client' : 'إضافة زبون'}
                                        </Text>
                                    </TouchableOpacity>
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
    container: { flex: 1, backgroundColor: '#faf9fd' },
    
    // Header Banner
    header: { 
        backgroundColor: '#002045', 
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: { 
        height: 56, 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16 
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    
    // Stats Summary Row
    statsRow: { 
        paddingHorizontal: 16, 
        marginTop: 12, 
        gap: 10,
    },
    statCard: { 
        flex: 1, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 14, 
        padding: 10, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)'
    },
    statIconBox: { 
        width: 32, 
        height: 32, 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    statLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: 2 },
    statValue: { fontSize: 12, fontWeight: '800', color: '#fff' },

    // Search Container
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        marginHorizontal: 16, 
        marginTop: 16, 
        marginBottom: 8,
        borderRadius: 16, 
        paddingHorizontal: 16, 
        height: 52, 
        borderWidth: 1, 
        borderColor: '#e3e2e6',
        shadowColor: '#002045',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2
    },
    input: { flex: 1, fontSize: 14, color: '#002045', fontWeight: '600' },
    loader: { marginLeft: 10 },
    
    // List & Items
    list: { padding: 16, paddingBottom: 40 },
    listHeader: { fontSize: 10, fontWeight: '800', color: '#74777f', letterSpacing: 1.5, marginBottom: 12 },
    resultItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff',
        padding: 14, 
        borderRadius: 16, 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: '#e3e2e6',
        shadowColor: '#002045',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1
    },
    avatar: { 
        width: 44, 
        height: 44, 
        borderRadius: 12, 
        backgroundColor: '#fff4ee', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffdbcd'
    },
    avatarText: { fontSize: 16, fontWeight: '900', color: '#a14009' },
    info: { flex: 1 },
    name: { fontSize: 14, fontWeight: '800', color: '#002045', marginBottom: 4 },
    phoneRow: { flexDirection: 'row', alignItems: 'center' },
    phone: { fontSize: 11, color: '#74777f', fontWeight: '500' },
    
    // Balance Badges matching Fiche Client
    balanceBadge: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 10, 
        alignItems: 'center', 
        minWidth: 100 
    },
    balanceLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 1 },
    balanceValue: { fontSize: 12, fontWeight: '800' },
    
    // Empty State
    empty: { marginTop: 60, alignItems: 'center', paddingHorizontal: 30 },
    emptyIconContainer: { 
        width: 72, 
        height: 72, 
        borderRadius: 24, 
        backgroundColor: '#fff', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e3e2e6',
        marginBottom: 16
    },
    emptyText: { fontSize: 16, fontWeight: '800', color: '#002045', marginBottom: 6, textAlign: 'center' },
    emptySub: { fontSize: 12, color: '#74777f', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
    createBtn: { 
        backgroundColor: '#002045', 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        borderRadius: 14 
    },
    createBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' }
});

export default CustomerSearchScreen;
