import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Image, Linking, RefreshControl, Dimensions } from 'react-native';
import { Phone, MessageCircle, LogOut, ShoppingBag, ShoppingCart, Barcode, Menu, Download, Clock, History, Receipt } from 'lucide-react-native';
import axios from 'axios';
import { generateAndShareReceipt } from '../services/ReceiptService';
import { useLanguage } from '../services/LanguageContext';

const { width } = Dimensions.get('window');

const ClientDashboardScreen = ({ user, apiUrl, onLogout, onGoToShop, onGoToPania, onGoToBarcode }) => {
    const marketplaceEnabled = user?.features?.marketplace === true;
    const { t, language, changeLanguage, isRTL, tAlign, flexDir } = useLanguage();
    const [profile, setProfile] = useState(user);
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const profileResponse = await axios.get(`${apiUrl}/users/me`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (profileResponse.data) {
                setProfile(profileResponse.data);
            }

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
            phone: "0612345678"
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

    const renderPurchaseItem = ({ item }) => {
        const firstItemName = item.items && item.items.length > 0 ? item.items[0].product?.name : t('clientDashboard.productUnknown');
        const itemNameDisplay = item.items?.length > 1 ? `${firstItemName} + ${item.items.length - 1} ${t('clientDashboard.more') || 'more'}` : firstItemName;
        const firstItemImg = item.items && item.items.length > 0 ? item.items[0].product?.imageUrl : null;
        
        return (
            <TouchableOpacity style={[styles.txnCard, { flexDirection: flexDir }]} onPress={() => handleGenerateReceipt(item)}>
                <View style={styles.txnImgContainer}>
                    {firstItemImg ? (
                        <Image source={{ uri: firstItemImg }} style={styles.txnImg} />
                    ) : (
                        <View style={styles.txnImgPlaceholder}>
                            <ShoppingBag size={20} color="#64748b" />
                        </View>
                    )}
                </View>
                <View style={[styles.txnInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={styles.txnTitle} numberOfLines={1}>{itemNameDisplay || "Order"}</Text>
                    <Text style={styles.txnDate}>{formatDate(item.transactionDate)}</Text>
                </View>
                <View style={styles.txnAmounts}>
                    <Text style={styles.txnPrice}>{item.totalAmount?.toFixed(2)} DH</Text>
                    <Text style={[styles.txnBadge, item.paymentMethod === 'CREDIT' ? styles.badgeCredit : styles.badgeCash]}>
                        {item.paymentMethod === 'CREDIT' ? 'CREDIT' : 'CASH'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return language === 'fr' ? "Bonjour," : "صباح الخير،";
        if (hour < 18) return language === 'fr' ? "Bonsoir," : "مساء الخير،";
        return language === 'fr' ? "Bonsoir," : "ليلة سعيدة،";
    };

    const lastTxn = purchases.length > 0 ? purchases[0] : null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.appBar, { flexDirection: flexDir }]}>
                <View style={[styles.appBarLeft, { flexDirection: flexDir }]}>
                    <TouchableOpacity>
                        <Menu size={24} color="#002045" />
                    </TouchableOpacity>
                    <Text style={[styles.appBarTitle, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>7anoti</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => changeLanguage(language === 'fr' ? 'ar' : 'fr')} style={styles.iconBtn}>
                        <Text style={{ fontSize: 16 }}>{language === 'fr' ? '🇲🇦' : '🇫🇷'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onLogout} style={styles.iconBtn}>
                        <LogOut size={20} color="#ba1a1a" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#002045" />
                </View>
            ) : (
                <FlatList
                    data={purchases}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPurchaseItem}
                    contentContainerStyle={styles.scrollList}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#002045" />}
                    ListHeaderComponent={() => (
                        <View>
                            <View style={[styles.welcomeSection, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={styles.welcomeGreeting}>{getGreeting()}</Text>
                                <Text style={styles.welcomeName}>{profile.name || t('clientDashboard.title')}</Text>
                            </View>

                            <View style={styles.heroCard}>
                                <Text style={[styles.heroLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                                    {language === 'fr' ? 'VOTRE SOLDE ACTUEL' : 'الرصيد الحالي'}
                                </Text>
                                <View style={[styles.heroAmountRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <Text style={styles.heroAmount}>{profile.currentBalance?.toFixed(2) || '0.00'}</Text>
                                    <Text style={styles.heroCurrency}>DH</Text>
                                </View>
                                {profile.currentBalance > 0 && (
                                    <View style={[styles.heroPill, { alignSelf: isRTL ? 'flex-end' : 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <Clock size={16} color="#fff" />
                                        <Text style={styles.heroPillText}>{language === 'fr' ? 'À payer bientôt' : 'يجب الدفع قريباً'}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={[styles.bentoGrid, { flexDirection: flexDir }]}>
                                <View style={styles.bentoCard}>
                                    <Receipt size={24} color="#002045" />
                                    <View style={{ marginTop: 'auto', alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                        <Text style={styles.bentoLabel}>{language === 'fr' ? 'Dernier achat' : 'آخر معاملة'}</Text>
                                        <Text style={styles.bentoValue}>{lastTxn ? lastTxn.totalAmount?.toFixed(2) : '0.00'} DH</Text>
                                    </View>
                                </View>
                                <View style={styles.bentoCard}>
                                    <History size={24} color="#a14009" />
                                    <View style={{ marginTop: 'auto', alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                        <Text style={styles.bentoLabel}>{language === 'fr' ? 'Total visites' : 'إجمالي الزيارات'}</Text>
                                        <Text style={styles.bentoValue}>{purchases.length}</Text>
                                    </View>
                                </View>
                            </View>

                            {marketplaceEnabled && (
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={[styles.sectionTitle, { textAlign: tAlign }]}>
                                        {language === 'fr' ? 'MON ESPACE PANIA' : 'فضاء السلة الخاص بي'}
                                    </Text>
                                    <View style={[styles.actionGrid, { flexDirection: flexDir }]}>
                                        <TouchableOpacity style={styles.actionGridCard} onPress={onGoToShop}>
                                            <View style={[styles.actionIconBox, { backgroundColor: '#e0e7ff' }]}>
                                                <ShoppingBag size={22} color="#4f46e5" />
                                            </View>
                                            <Text style={styles.actionCardTitle}>{language === 'fr' ? 'Boutique' : 'المتجر'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionGridCard} onPress={onGoToPania}>
                                            <View style={[styles.actionIconBox, { backgroundColor: '#d1fae5' }]}>
                                                <ShoppingCart size={22} color="#059669" />
                                            </View>
                                            <Text style={styles.actionCardTitle}>{language === 'fr' ? 'Ma Pania' : 'سلتي'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={[styles.barcodeShortcutCard, { flexDirection: flexDir }]} onPress={onGoToBarcode}>
                                        <View style={[styles.barcodeIconBox, { backgroundColor: '#fffbeb' }]}>
                                            <Barcode size={22} color="#d97706" />
                                        </View>
                                        <View style={[styles.barcodeTextColumn, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                                            <Text style={styles.barcodeShortcutTitle}>{language === 'fr' ? 'Mon Code-barres' : 'الرمز الشريطي'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={[styles.footerActions, { flexDirection: flexDir }]}>
                                <TouchableOpacity style={[styles.btnOutline, { flexDirection: flexDir }]} onPress={handleCall}>
                                    <Phone size={20} color="#002045" />
                                    <Text style={styles.btnOutlineText}>{language === 'fr' ? 'Appeler' : 'اتصل'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnPrimary, { flexDirection: flexDir }]} onPress={handleWhatsApp}>
                                    <MessageCircle size={20} color="#fff" />
                                    <Text style={styles.btnPrimaryText}>{language === 'fr' ? 'WhatsApp' : 'واتساب'}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.sectionHeader, { flexDirection: flexDir }]}>
                                <Text style={styles.sectionTitle}>
                                    {language === 'fr' ? 'Achats Récents' : 'المشتريات الأخيرة'}
                                </Text>
                                <TouchableOpacity>
                                    <Text style={styles.sectionLink}>{language === 'fr' ? 'Voir tout' : 'عرض الكل'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyHistory}>
                            <History size={40} color="#c4c6cf" />
                            <Text style={styles.emptyText}>{t('clientDashboard.emptyHistory')}</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },
    appBar: { height: 64, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: 'rgba(250, 249, 253, 0.9)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    appBarLeft: { alignItems: 'center' },
    appBarTitle: { fontSize: 20, fontWeight: '700', color: '#a14009' },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f0f4', alignItems: 'center', justifyContent: 'center' },
    scrollList: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
    welcomeSection: { marginBottom: 24 },
    welcomeGreeting: { fontSize: 16, color: '#43474e', marginBottom: 4 },
    welcomeName: { fontSize: 28, fontWeight: '700', color: '#002045' },
    heroCard: { backgroundColor: '#002045', borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden', shadowColor: '#002045', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
    heroLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 8 },
    heroAmountRow: { alignItems: 'baseline', marginBottom: 16, gap: 8 },
    heroAmount: { fontSize: 40, fontWeight: '800', color: '#ffffff' },
    heroCurrency: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
    heroPill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    heroPillText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
    bentoGrid: { gap: 16, marginBottom: 32 },
    bentoCard: { flex: 1, backgroundColor: '#f4f3f7', borderRadius: 20, padding: 16, height: 120, borderWidth: 1, borderColor: '#e3e2e6' },
    bentoLabel: { fontSize: 12, color: '#43474e', marginBottom: 4 },
    bentoValue: { fontSize: 18, fontWeight: '700', color: '#002045' },
    sectionHeader: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#002045' },
    sectionLink: { fontSize: 14, fontWeight: '600', color: '#a14009' },
    txnCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e3e2e6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    txnImgContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#efedf1', overflow: 'hidden' },
    txnImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    txnImgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    txnInfo: { flex: 1, marginHorizontal: 12 },
    txnTitle: { fontSize: 16, fontWeight: '600', color: '#002045', marginBottom: 4 },
    txnDate: { fontSize: 12, color: '#74777f' },
    txnAmounts: { alignItems: 'flex-end' },
    txnPrice: { fontSize: 16, fontWeight: '700', color: '#002045', marginBottom: 4 },
    txnBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
    badgeCredit: { backgroundColor: '#ffdad6', color: '#ba1a1a' },
    badgeCash: { backgroundColor: '#d6e3ff', color: '#002045' },
    footerActions: { gap: 12, marginBottom: 32 },
    btnOutline: { flex: 1, height: 56, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#002045', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    btnOutlineText: { fontSize: 14, fontWeight: '600', color: '#002045' },
    btnPrimary: { flex: 1, height: 56, backgroundColor: '#25D366', borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    btnPrimaryText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
    emptyHistory: { alignItems: 'center', paddingTop: 40 },
    emptyText: { fontSize: 14, color: '#74777f', marginTop: 16 },
    actionGrid: { gap: 12, marginBottom: 16 },
    actionGridCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e3e2e6', padding: 16, alignItems: 'center' },
    actionIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#002045', textAlign: 'center' },
    barcodeShortcutCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e3e2e6', padding: 16, alignItems: 'center' },
    barcodeIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    barcodeTextColumn: { flex: 1 },
    barcodeShortcutTitle: { fontSize: 14, fontWeight: 'bold', color: '#002045' }
});

export default ClientDashboardScreen;
