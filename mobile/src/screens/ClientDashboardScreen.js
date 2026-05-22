import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Alert, Image, Linking, RefreshControl } from 'react-native';
import { Phone, MessageCircle, Receipt, LogOut, Calendar, ShoppingBag, CreditCard, DollarSign, ShieldAlert, CheckCircle2, User, Share2, ShoppingCart, Barcode } from 'lucide-react-native';
import axios from 'axios';
import { generateAndShareReceipt } from '../services/ReceiptService';
import { useLanguage } from '../services/LanguageContext';

const ClientDashboardScreen = ({ user, apiUrl, onLogout, onGoToShop, onGoToPania, onGoToBarcode }) => {
    const marketplaceEnabled = user?.features?.marketplace === true;
    const { t, language, changeLanguage, isRTL, tAlign, flexDir } = useLanguage();
    const [profile, setProfile] = useState(user);
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            // 1. Fetch latest profile containing balance
            const profileResponse = await axios.get(`${apiUrl}/users/me`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (profileResponse.data) {
                setProfile(profileResponse.data);
            }

            // 2. Fetch purchase history
            const purchasesResponse = await axios.get(`${apiUrl}/sales/my-purchases`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (purchasesResponse.data) {
                setPurchases(purchasesResponse.data);
            }
        } catch (err) {
            console.error("Error fetching client dashboard data:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const parts = dateStr.split('T');
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].substring(0, 5);
            return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeParts}`;
        } catch (e) {
            return dateStr;
        }
    };

    const handleGenerateReceipt = async (transaction) => {
        const receiptData = {
            ...transaction,
            client: profile
        };
        await generateAndShareReceipt(receiptData);
    };

    // Get shopkeeper contact info from transaction history or default to generic number
    const getShopkeeperContact = () => {
        if (purchases && purchases.length > 0) {
            const firstSale = purchases.find(p => p.shopOwner && p.shopOwner.phone);
            if (firstSale) {
                return {
                    name: firstSale.shopOwner.name || "Moul Hanout",
                    phone: firstSale.shopOwner.phone
                };
            }
        }
        return {
            name: "Moul Hanout",
            phone: "0612345678" // Default fallback
        };
    };

    const shopkeeper = getShopkeeperContact();

    const handleCall = () => {
        Linking.openURL(`tel:${shopkeeper.phone}`);
    };

    const handleWhatsApp = () => {
        let formatted = shopkeeper.phone.trim();
        if (formatted.startsWith('0')) {
            formatted = '212' + formatted.substring(1);
        } else if (formatted.startsWith('+')) {
            formatted = formatted.substring(1);
        }
        const text = encodeURIComponent(t('clientDashboard.waMessage', { name: shopkeeper.name }));
        Linking.openURL(`https://wa.me/${formatted}?text=${text}`);
    };

    const renderPurchaseItem = ({ item }) => (
        <View style={styles.purchaseCard}>
            <View style={[styles.cardHeader, { flexDirection: flexDir }]}>
                <View style={[styles.txnIdRow, { flexDirection: flexDir }]}>
                    <Receipt size={16} color="#6366f1" />
                    <Text style={styles.txnId}>{t('clientDashboard.purchaseNumber', { id: item.id })}</Text>
                </View>
                <View style={[styles.txnIdRow, { flexDirection: flexDir, gap: 10 }]}>
                    <Text style={styles.txnDate}>{formatDate(item.transactionDate)}</Text>
                    <TouchableOpacity 
                        onPress={() => handleGenerateReceipt(item)}
                        style={styles.txnPrintBtn}
                    >
                        <Share2 size={12} color="#4f46e5" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* List of items */}
            <View style={styles.txnItems}>
                {item.items && item.items.map((saleItem, index) => (
                    <View key={index} style={[styles.txnItemRow, { flexDirection: flexDir }]}>
                        {saleItem.product?.imageUrl ? (
                            <Image source={{ uri: saleItem.product.imageUrl }} style={styles.productThumb} />
                        ) : (
                            <View style={styles.productThumbPlaceholder}>
                                <ShoppingBag size={12} color="#94a3b8" />
                            </View>
                        )}
                        <View style={[styles.productInfo, { flexDirection: flexDir, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }]}>
                            <Text style={[styles.productName, { textAlign: tAlign }]} numberOfLines={1}>
                                {saleItem.product?.name || t('clientDashboard.productUnknown')}
                            </Text>
                            <Text style={styles.productQtyPrice}>
                                {saleItem.quantity} x {saleItem.unitPrice?.toFixed(2)} DH
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={[styles.cardFooter, { flexDirection: flexDir }]}>
                <Text style={[styles.paymentMethod, item.paymentMethod === 'CREDIT' ? styles.badgeCredit : styles.badgeCash]}>
                    {item.paymentMethod === 'CREDIT' ? t('clientDashboard.paymentMethodCredit') : t('clientDashboard.paymentMethodCash')}
                </Text>
                <Text style={styles.totalText}>{item.totalAmount?.toFixed(2)} DH</Text>
            </View>
        </View>
    );

    const hasDebt = profile.currentBalance > 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <View style={[styles.headerTitleRow, { flexDirection: flexDir }]}>
                    <User size={20} color="#4f46e5" />
                    <Text style={styles.headerTitle}>{t('clientDashboard.title')}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => changeLanguage(language === 'fr' ? 'ar' : 'fr')} style={styles.langHeaderBtn}>
                        <Text style={{ fontSize: 16 }}>{language === 'fr' ? '🇲🇦' : '🇫🇷'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                        <LogOut size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={purchases}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPurchaseItem}
                    contentContainerStyle={styles.scrollList}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#4f46e5']} />
                    }
                    ListHeaderComponent={() => (
                        <View>
                            {/* Greeting */}
                            <Text style={[styles.greetingText, { textAlign: tAlign }]}>{t('clientDashboard.greeting', { name: profile.name })}</Text>
                            <Text style={[styles.subGreetingText, { textAlign: tAlign }]}>{t('clientDashboard.subgreeting')}</Text>

                            {/* Balance Card */}
                            <View style={[styles.balanceCard, hasDebt ? styles.balanceCardRed : styles.balanceCardGreen]}>
                                <View style={[styles.balanceHeader, { flexDirection: flexDir }]}>
                                    {hasDebt ? (
                                        <ShieldAlert size={24} color="#b91c1c" />
                                    ) : (
                                        <CheckCircle2 size={24} color="#15803d" />
                                    )}
                                    <Text style={[styles.balanceLabel, hasDebt ? styles.balanceLabelRed : styles.balanceLabelGreen, { textAlign: tAlign }]}>
                                        {hasDebt ? t('clientDashboard.balanceDue') : t('clientDashboard.balanceOk')}
                                    </Text>
                                </View>
                                <Text style={[styles.balanceAmount, hasDebt ? styles.balanceAmountRed : styles.balanceAmountGreen, { textAlign: tAlign }]}>
                                    {profile.currentBalance?.toFixed(2) || '0.00'} DH
                                </Text>
                                <Text style={[styles.balanceDesc, hasDebt ? styles.balanceDescRed : styles.balanceDescGreen, { textAlign: tAlign }]}>
                                    {hasDebt 
                                        ? t('clientDashboard.balanceDescDue') 
                                        : t('clientDashboard.balanceDescOk')}
                                </Text>
                            </View>

                            {/* Quick Actions Grid — only shown when shopkeeper has marketplace (PRO/ULTIMATE) */}
                            {marketplaceEnabled && (
                                <>
                                    <Text style={[styles.sectionTitle, { textAlign: tAlign }]}>
                                        {language === 'fr' ? "MON ESPACE PANIA" : "فضاء السلة الخاص بي"}
                                    </Text>
                                    <View style={[styles.actionGrid, { flexDirection: flexDir }]}>
                                        <TouchableOpacity style={styles.actionGridCard} onPress={onGoToShop}>
                                            <View style={[styles.actionIconBox, { backgroundColor: '#e0e7ff' }]}>
                                                <ShoppingBag size={22} color="#4f46e5" />
                                            </View>
                                            <Text style={styles.actionCardTitle}>
                                                {language === 'fr' ? "Boutique 7anoti" : "المتجر الرقمي"}
                                            </Text>
                                            <Text style={styles.actionCardDesc}>
                                                {language === 'fr' ? "Parcourir le catalogue" : "تصفح واطلب السلع"}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.actionGridCard} onPress={onGoToPania}>
                                            <View style={[styles.actionIconBox, { backgroundColor: '#d1fae5' }]}>
                                                <ShoppingCart size={22} color="#059669" />
                                            </View>
                                            <Text style={styles.actionCardTitle}>
                                                {language === 'fr' ? "Ma Pania" : "سلتي 🧺"}
                                            </Text>
                                            <Text style={styles.actionCardDesc}>
                                                {language === 'fr' ? "Gérer mes achats" : "قائمة مشترياتي"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity style={[styles.barcodeShortcutCard, { flexDirection: flexDir }]} onPress={onGoToBarcode}>
                                        <View style={[styles.barcodeIconBox, { backgroundColor: '#fffbeb' }]}>
                                            <Barcode size={22} color="#d97706" />
                                        </View>
                                        <View style={[styles.barcodeTextColumn, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0, flex: 1 }]}>
                                            <Text style={styles.barcodeShortcutTitle}>
                                                {language === 'fr' ? "Mon Code-barres Actif" : "الرمز الشريطي للطلب"}
                                            </Text>
                                            <Text style={styles.barcodeShortcutDesc}>
                                                {language === 'fr' ? "Faites scanner pour payer chez l'épicier" : "امسح الرمز للدفع بسرعة"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Contact Shopkeeper Card */}
                            <View style={[styles.contactCard, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={[styles.contactTitle, { textAlign: tAlign }]}>{t('clientDashboard.contactTitle')}</Text>
                                <Text style={[styles.contactSub, { textAlign: tAlign }]}>{shopkeeper.name} ({shopkeeper.phone})</Text>
                                <View style={[styles.contactButtons, { flexDirection: flexDir }]}>
                                    <TouchableOpacity style={[styles.contactBtn, styles.callBtn, { flexDirection: flexDir }]} onPress={handleCall}>
                                        <Phone size={18} color="#4f46e5" />
                                        <Text style={styles.callBtnText}>{t('clientDashboard.contactCall')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.contactBtn, styles.waBtn, { flexDirection: flexDir }]} onPress={handleWhatsApp}>
                                        <MessageCircle size={18} color="#22c55e" />
                                        <Text style={styles.waBtnText}>{t('clientDashboard.contactWa')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* History Section Title */}
                            <Text style={[styles.sectionTitle, { textAlign: tAlign }]}>{t('clientDashboard.historyTitle', { count: purchases.length })}</Text>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyHistory}>
                            <ShoppingBag size={48} color="#cbd5e1" />
                            <Text style={styles.emptyHistoryText}>{t('clientDashboard.emptyHistory')}</Text>
                            <Text style={styles.emptyHistorySub}>{t('clientDashboard.emptyHistorySub')}</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    logoutBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#fef2f2' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scrollList: { paddingHorizontal: 20, paddingBottom: 30 },
    greetingText: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginTop: 25 },
    subGreetingText: { fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 20 },
    balanceCard: { padding: 22, borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    balanceCardRed: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fee2e2' },
    balanceCardGreen: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#dcfce7' },
    balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    balanceLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
    balanceLabelRed: { color: '#ef4444' },
    balanceLabelGreen: { color: '#22c55e' },
    balanceAmount: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
    balanceAmountRed: { color: '#b91c1c' },
    balanceAmountGreen: { color: '#15803d' },
    balanceDesc: { fontSize: 12, lineHeight: 18 },
    balanceDescRed: { color: '#ef4444' },
    balanceDescGreen: { color: '#16a34a' },
    contactCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 25 },
    contactTitle: { fontSize: 13, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase' },
    contactSub: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginTop: 4, marginBottom: 15 },
    contactButtons: { flexDirection: 'row', gap: 12 },
    contactBtn: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1 },
    callBtn: { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' },
    callBtnText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 14 },
    waBtn: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    waBtnText: { color: '#16a34a', fontWeight: 'bold', fontSize: 14 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 15, marginTop: 10 },
    actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    actionGridCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', padding: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 5, elevation: 1 },
    actionIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    actionCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', marginBottom: 4, textAlign: 'center' },
    actionCardDesc: { fontSize: 10, color: '#64748b', textAlign: 'center', fontWeight: '500' },
    barcodeShortcutCard: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 5, elevation: 1 },
    barcodeIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    barcodeTextColumn: { flex: 1 },
    barcodeShortcutTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
    barcodeShortcutDesc: { fontSize: 11, color: '#64748b', fontWeight: '500' },
    purchaseCard: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', padding: 18, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 5, elevation: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12, marginBottom: 12 },
    txnIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    txnId: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
    txnDate: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    txnItems: { gap: 10, marginBottom: 15 },
    txnItemRow: { flexDirection: 'row', alignItems: 'center' },
    productThumb: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f8fafc' },
    productThumbPlaceholder: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
    productInfo: { flex: 1, marginLeft: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productName: { fontSize: 14, fontWeight: '600', color: '#334155', flex: 1, marginRight: 10 },
    productQtyPrice: { fontSize: 12, color: '#64748b' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    paymentMethod: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeCredit: { backgroundColor: '#fee2e2', color: '#ef4444' },
    badgeCash: { backgroundColor: '#f1f5f9', color: '#475569' },
    totalText: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    emptyHistory: { alignItems: 'center', paddingVertical: 40 },
    emptyHistoryText: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginTop: 12 },
    emptyHistorySub: { fontSize: 12, color: '#94a3b8', marginTop: 4, textAlign: 'center' },
    txnPrintBtn: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#f5f3ff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd6fe'
    },
    langHeaderBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    }
});

export default ClientDashboardScreen;
