import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, SafeAreaView, Alert, Keyboard, Image, Linking,
    Animated, Modal, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { ArrowLeft, Phone, Share2, Bot, ShoppingBag, Receipt, X, DollarSign, TrendingUp, Package } from 'lucide-react-native';
import axios from 'axios';
import { generateAndShareReceipt } from '../services/ReceiptService';
import { useLanguage } from '../services/LanguageContext';

const CustomerDetailScreen = ({ customer, onBack, token, apiUrl, features }) => {
    const { t, language, isRTL, flexDir, tAlign } = useLanguage();
    const aiEnabled = features?.aiAutomation !== false;
    const [currentCustomer, setCurrentCustomer] = useState(customer);
    const [transactions, setTransactions] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [isReminderLoading, setIsReminderLoading] = useState(false);
    const [isCallLoading, setIsCallLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'history' | 'actions'
    const [showPayModal, setShowPayModal] = useState(false);

    const tabAnim = useRef(new Animated.Value(0)).current;

    const fetchHistoryAndDetails = async () => {
        setIsHistoryLoading(true);
        try {
            const userResponse = await axios.get(`${apiUrl}/users/phone/${currentCustomer.phone || 'none'}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);
            if (userResponse?.data) setCurrentCustomer(userResponse.data);

            const salesResponse = await axios.get(`${apiUrl}/sales/client/${currentCustomer.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(salesResponse.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    useEffect(() => { fetchHistoryAndDetails(); }, []);

    const handleSendAIReminder = async (type = 'whatsapp') => {
        if (!aiEnabled) { Alert.alert(t('common.error'), t('subscription.aiBlocked')); return; }
        if (!currentCustomer.phone) { Alert.alert(t('common.error'), t('customerDetail.errorNoPhone')); return; }

        let formattedPhone = currentCustomer.phone.trim();
        if (formattedPhone.startsWith('0')) formattedPhone = '212' + formattedPhone.substring(1);
        else if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

        const webhookUrl = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;
        if (!webhookUrl) { Alert.alert(t('common.error'), t('customerDetail.errorWebhook')); return; }

        if (type === 'whatsapp') setIsReminderLoading(true);
        else setIsCallLoading(true);

        try {
            await axios.post(webhookUrl, {
                type, clientName: currentCustomer.name,
                clientPhone: formattedPhone, amount: currentCustomer.currentBalance,
                daysOverdue: 15, shopName: "Épicerie 7anoti"
            });
            Alert.alert(t('common.success'), type === 'whatsapp' ? t('customerDetail.aiReminderSuccess') : t('customerDetail.aiReminderCallSuccess'));
        } catch (err) {
            Alert.alert(t('common.error'), t('customerDetail.aiReminderLaunchError'));
        } finally {
            setIsReminderLoading(false);
            setIsCallLoading(false);
        }
    };

    const handleShareCredentials = async () => {
        if (!currentCustomer.phone) { Alert.alert(t('common.error'), t('customerDetail.errorNoPhoneSaved')); return; }
        let formattedPhone = currentCustomer.phone.trim();
        if (formattedPhone.startsWith('0')) formattedPhone = '212' + formattedPhone.substring(1);
        else if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);
        const message = t('customerDetail.whatsappMsg', { name: currentCustomer.name, phone: currentCustomer.phone.trim() });
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        try {
            if (await Linking.canOpenURL(whatsappUrl)) await Linking.openURL(whatsappUrl);
            else Alert.alert(t('common.error'), t('customerDetail.whatsappNotInstalled'));
        } catch { Alert.alert(t('common.error'), t('customerDetail.whatsappOpenError')); }
    };

    const handlePayment = async () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) { Alert.alert(t('common.error'), t('customerDetail.payAmountError')); return; }
        setIsPaymentLoading(true);
        Keyboard.dismiss();
        try {
            const response = await axios.post(`${apiUrl}/users/${currentCustomer.id}/pay-credit`, amount, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            Alert.alert(t('common.success'), response.data.message || t('customerDetail.paySuccess'));
            setPaymentAmount('');
            setShowPayModal(false);
            await fetchHistoryAndDetails();
        } catch (err) {
            Alert.alert(t('common.error'), err.response?.data?.message || t('customerDetail.payError'));
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const [date, time] = dateStr.split('T');
            const [y, m, d] = date.split('-');
            return `${d}/${m}/${y} ${time.substring(0, 5)}`;
        } catch { return dateStr; }
    };

    const handleGenerateReceipt = async (transaction) => {
        await generateAndShareReceipt({ ...transaction, client: currentCustomer });
    };

    // Debt color coding
    const balance = currentCustomer.currentBalance || 0;
    const debtColor = balance === 0 ? '#15803d' : balance <= 500 ? '#d97706' : '#b91c1c';
    const debtBg = balance === 0 ? '#f0fdf4' : balance <= 500 ? '#fffbeb' : '#fef2f2';
    const debtLabel = balance === 0
        ? (language === 'fr' ? 'À JOUR' : 'بدون ديون')
        : balance <= 500
        ? (language === 'fr' ? 'ATTENTION' : 'تنبيه')
        : (language === 'fr' ? 'EN RETARD' : 'متأخر');

    // Stats
    const totalSpent = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalOrders = transactions.length;
    const creditOrders = transactions.filter(t => t.paymentMethod === 'CREDIT').length;

    const tabs = [
        { key: 'summary', label: language === 'fr' ? 'Résumé' : 'ملخص' },
        { key: 'history', label: language === 'fr' ? 'Historique' : 'السجل' },
        { key: 'actions', label: language === 'fr' ? 'Actions' : 'الإجراءات' },
    ];

    const renderTransactionItem = ({ item, index }) => (
        <View style={[styles.timelineRow, isRTL && { flexDirection: 'row-reverse' }]}>
            {/* Timeline line */}
            <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { backgroundColor: item.paymentMethod === 'CREDIT' ? '#ef4444' : '#10b981' }]} />
                {index < transactions.length - 1 && <View style={styles.timelineLine} />}
            </View>

            {/* Card */}
            <View style={[styles.txnCard, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                <View style={[styles.txnHeader, { flexDirection: flexDir }]}>
                    <View style={[styles.txnIdRow, { flexDirection: flexDir }]}>
                        <Receipt size={13} color="#74777f" />
                        <Text style={styles.txnId}>{t('clientDashboard.purchaseNumber', { id: item.id })}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.txnDate}>{formatDate(item.transactionDate)}</Text>
                        <TouchableOpacity onPress={() => handleGenerateReceipt(item)} style={styles.txnPrintBtn}>
                            <Share2 size={11} color="#a14009" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.txnItems}>
                    {item.items?.map((saleItem, i) => (
                        <View key={i} style={[styles.txnItemRow, { flexDirection: flexDir }]}>
                            {saleItem.product?.imageUrl ? (
                                <Image source={{ uri: saleItem.product.imageUrl }} style={styles.txnProductThumb} />
                            ) : (
                                <View style={styles.txnProductThumbPlaceholder}>
                                    <ShoppingBag size={11} color="#74777f" />
                                </View>
                            )}
                            <View style={[styles.txnProductInfo, { flexDirection: flexDir, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                                <Text style={[styles.txnItemText, { textAlign: tAlign }]} numberOfLines={1}>
                                    {saleItem.product?.name || t('clientDashboard.productUnknown')}
                                </Text>
                                <Text style={styles.txnItemQty}>{saleItem.quantity} × {saleItem.unitPrice?.toFixed(2)} DH</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={[styles.txnFooter, { flexDirection: flexDir }]}>
                    <Text style={[styles.methodBadge, item.paymentMethod === 'CREDIT' ? styles.badgeCredit : styles.badgeCash]}>
                        {item.paymentMethod === 'CREDIT' ? t('clientDashboard.paymentMethodCredit') : t('clientDashboard.paymentMethodCash')}
                    </Text>
                    <Text style={styles.txnTotal}>{item.totalAmount?.toFixed(2)} DH</Text>
                </View>
            </View>
        </View>
    );

    const renderSummaryTab = () => (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            {/* Stats Row */}
            <View style={[styles.statsRow, { flexDirection: flexDir }]}>
                <View style={styles.statCard}>
                    <TrendingUp size={18} color="#a14009" />
                    <Text style={styles.statValue}>{totalSpent.toFixed(0)} DH</Text>
                    <Text style={styles.statLabel}>{language === 'fr' ? 'Total Achats' : 'إجمالي'}</Text>
                </View>
                <View style={styles.statCard}>
                    <Package size={18} color="#002045" />
                    <Text style={styles.statValue}>{totalOrders}</Text>
                    <Text style={styles.statLabel}>{language === 'fr' ? 'Commandes' : 'طلبات'}</Text>
                </View>
                <View style={styles.statCard}>
                    <DollarSign size={18} color="#ef4444" />
                    <Text style={styles.statValue}>{creditOrders}</Text>
                    <Text style={styles.statLabel}>{language === 'fr' ? 'À crédit' : 'بالدين'}</Text>
                </View>
            </View>

            {/* Recent Transactions Preview */}
            <Text style={[styles.sectionLabel, { textAlign: tAlign, marginHorizontal: 20, marginBottom: 12, marginTop: 20 }]}>
                {language === 'fr' ? 'DERNIÈRES TRANSACTIONS' : 'آخر المعاملات'}
            </Text>
            {isHistoryLoading ? (
                <ActivityIndicator color="#a14009" style={{ marginTop: 30 }} />
            ) : transactions.slice(0, 3).map((item, index) => (
                <View key={item.id} style={{ paddingHorizontal: 20 }}>
                    {renderTransactionItem({ item, index })}
                </View>
            ))}
            {transactions.length > 3 && (
                <TouchableOpacity onPress={() => setActiveTab('history')} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>
                        {language === 'fr' ? `Voir les ${transactions.length - 3} autres` : `عرض ${transactions.length - 3} المزيد`}
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );

    const renderHistoryTab = () => (
        <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
                <View style={{ paddingHorizontal: 20 }}>
                    {renderTransactionItem({ item, index })}
                </View>
            )}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
            refreshing={isHistoryLoading}
            onRefresh={fetchHistoryAndDetails}
            ListEmptyComponent={() => (
                <View style={styles.emptyHistory}>
                    {isHistoryLoading
                        ? <ActivityIndicator size="large" color="#a14009" />
                        : <>
                            <ShoppingBag size={44} color="#e3e2e6" />
                            <Text style={styles.emptyHistoryText}>{t('clientDashboard.emptyHistory')}</Text>
                        </>
                    }
                </View>
            )}
        />
    );

    const renderActionsTab = () => (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 60 }}>
            {/* Share Credentials */}
            <TouchableOpacity style={styles.actionCard} onPress={handleShareCredentials} disabled={!currentCustomer.phone}>
                <View style={[styles.actionIconBox, { backgroundColor: '#fff4ee' }]}>
                    <Share2 size={22} color="#a14009" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.actionCardTitle}>{t('customerDetail.grantAppAccess')}</Text>
                    <Text style={styles.actionCardDesc}>{language === 'fr' ? 'Envoyer accès app client via WhatsApp' : 'إرسال بيانات الدخول للتطبيق'}</Text>
                </View>
            </TouchableOpacity>

            {/* AI WhatsApp Reminder */}
            <TouchableOpacity
                style={[styles.actionCard, !aiEnabled && { opacity: 0.5 }]}
                onPress={() => handleSendAIReminder('whatsapp')}
                disabled={isReminderLoading || !currentCustomer.phone}
            >
                <View style={[styles.actionIconBox, { backgroundColor: '#fef2f2' }]}>
                    {isReminderLoading ? <ActivityIndicator size="small" color="#ef4444" /> : <Bot size={22} color="#ef4444" />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.actionCardTitle}>{t('customerDetail.whatsappAi')}</Text>
                    <Text style={styles.actionCardDesc}>{language === 'fr' ? 'Rappel automatique IA via WhatsApp' : 'تذكير تلقائي بالذكاء الاصطناعي'}</Text>
                </View>
                {!aiEnabled && <Text style={styles.lockedBadge}>ULTIMATE</Text>}
            </TouchableOpacity>

            {/* AI Call Reminder */}
            <TouchableOpacity
                style={[styles.actionCard, !aiEnabled && { opacity: 0.5 }]}
                onPress={() => handleSendAIReminder('call')}
                disabled={isCallLoading || !currentCustomer.phone}
            >
                <View style={[styles.actionIconBox, { backgroundColor: '#f0fdf4' }]}>
                    {isCallLoading ? <ActivityIndicator size="small" color="#10b981" /> : <Phone size={22} color="#10b981" />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.actionCardTitle}>{t('customerDetail.callAi')}</Text>
                    <Text style={styles.actionCardDesc}>{language === 'fr' ? 'Appel automatique de rappel IA' : 'مكالمة تذكير تلقائية'}</Text>
                </View>
                {!aiEnabled && <Text style={styles.lockedBadge}>ULTIMATE</Text>}
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <View style={[styles.heroTop, { flexDirection: flexDir }]}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <ArrowLeft color="#fff" size={22} style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
                    </TouchableOpacity>
                    <Text style={styles.heroScreenTitle}>{t('customerDetail.title')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Profile */}
                <View style={styles.heroProfile}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>{currentCustomer.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.profileName}>{currentCustomer.name}</Text>
                    {currentCustomer.phone && (
                        <View style={[styles.profilePhoneRow, { flexDirection: flexDir }]}>
                            <Phone size={12} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.profilePhone}>{currentCustomer.phone}</Text>
                        </View>
                    )}

                    {/* Debt Badge */}
                    <View style={[styles.debtBadge, { backgroundColor: debtBg }]}>
                        <Text style={[styles.debtLabel, { color: debtColor }]}>{debtLabel}</Text>
                        <Text style={[styles.debtAmount, { color: debtColor }]}>
                            {balance.toFixed(2)} DH
                        </Text>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabsContainer, { flexDirection: flexDir }]}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <View style={{ flex: 1 }}>
                {activeTab === 'summary' && renderSummaryTab()}
                {activeTab === 'history' && renderHistoryTab()}
                {activeTab === 'actions' && renderActionsTab()}
            </View>

            {/* Floating Payment Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={[styles.fab, { flexDirection: flexDir }]} onPress={() => setShowPayModal(true)}>
                    <DollarSign color="#fff" size={20} />
                    <Text style={styles.fabText}>
                        {language === 'fr' ? 'Enregistrer paiement' : 'تسجيل دفع'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Payment Modal */}
            <Modal visible={showPayModal} transparent animationType="slide" onRequestClose={() => setShowPayModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPayModal(false)} />
                    <View style={styles.paySheet}>
                        <View style={[styles.paySheetHeader, { flexDirection: flexDir }]}>
                            <View>
                                <Text style={styles.paySheetTitle}>
                                    {language === 'fr' ? 'Enregistrer un paiement' : 'تسجيل دفع'}
                                </Text>
                                <Text style={styles.paySheetSub}>
                                    {currentCustomer.name} · {balance.toFixed(2)} DH {language === 'fr' ? 'restant' : 'متبقي'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowPayModal(false)} style={styles.closeBtn}>
                                <X color="#74777f" size={20} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.payInput, { textAlign: tAlign }]}
                            placeholder={t('customerDetail.payPlaceholder')}
                            placeholderTextColor="#c4c6cf"
                            value={paymentAmount}
                            onChangeText={setPaymentAmount}
                            keyboardType="numeric"
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.payBtn, isPaymentLoading && { opacity: 0.6 }]}
                            onPress={handlePayment}
                            disabled={isPaymentLoading}
                        >
                            {isPaymentLoading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.payBtnText}>{t('customerDetail.validateBtn')}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },

    // Hero Banner
    heroBanner: {
        backgroundColor: '#002045',
        paddingBottom: 28,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    heroTop: { height: 56, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    heroScreenTitle: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
    heroProfile: { alignItems: 'center', paddingBottom: 4 },
    avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    avatarLargeText: { fontSize: 28, fontWeight: '900', color: '#fff' },
    profileName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
    profilePhoneRow: { alignItems: 'center', gap: 5, marginBottom: 14 },
    profilePhone: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    debtBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, alignItems: 'center', minWidth: 160 },
    debtLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 2 },
    debtAmount: { fontSize: 24, fontWeight: '900' },

    // Tabs
    tabsContainer: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: -1, borderRadius: 16, padding: 4, flexDirection: 'row', gap: 4, shadowColor: '#002045', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, marginBottom: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabActive: { backgroundColor: '#002045' },
    tabText: { fontSize: 12, fontWeight: '700', color: '#74777f' },
    tabTextActive: { color: '#fff' },

    // Stats Row
    statsRow: { paddingHorizontal: 20, gap: 12, marginTop: 16 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e3e2e6', gap: 6 },
    statValue: { fontSize: 15, fontWeight: '900', color: '#002045' },
    statLabel: { fontSize: 10, fontWeight: '700', color: '#74777f', textAlign: 'center' },

    sectionLabel: { fontSize: 10, fontWeight: '900', color: '#74777f', letterSpacing: 1.5 },

    // Timeline
    timelineRow: { flexDirection: 'row', marginBottom: 16 },
    timelineCol: { alignItems: 'center', width: 20 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e3e2e6', marginTop: 4 },
    txnCard: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#e3e2e6', shadowColor: '#002045', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    txnHeader: { justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#efedf1', paddingBottom: 8, marginBottom: 10 },
    txnIdRow: { alignItems: 'center', gap: 5 },
    txnId: { fontSize: 12, fontWeight: '700', color: '#002045' },
    txnDate: { fontSize: 10, color: '#74777f', fontWeight: '500' },
    txnPrintBtn: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#fff4ee', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffdbcd' },
    txnItems: { gap: 6, marginBottom: 10 },
    txnItemRow: { alignItems: 'center', marginBottom: 4 },
    txnProductThumb: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#faf9fd' },
    txnProductThumbPlaceholder: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#faf9fd', alignItems: 'center', justifyContent: 'center' },
    txnProductInfo: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
    txnItemText: { fontSize: 12, color: '#002045', fontWeight: '500', flex: 1, marginRight: 8 },
    txnItemQty: { fontSize: 11, color: '#74777f' },
    txnFooter: { justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#efedf1' },
    methodBadge: { fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
    badgeCredit: { backgroundColor: '#fee2e2', color: '#b91c1c' },
    badgeCash: { backgroundColor: '#f0fdf4', color: '#15803d' },
    txnTotal: { fontSize: 14, fontWeight: '800', color: '#002045' },

    seeAllBtn: { marginHorizontal: 20, marginTop: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e3e2e6' },
    seeAllText: { fontSize: 13, fontWeight: '700', color: '#a14009' },

    emptyHistory: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyHistoryText: { fontSize: 14, color: '#74777f', fontWeight: '700' },

    // Actions Tab
    actionCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#e3e2e6', shadowColor: '#002045', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    actionIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    actionCardTitle: { fontSize: 14, fontWeight: '800', color: '#002045', marginBottom: 3 },
    actionCardDesc: { fontSize: 11, color: '#74777f', lineHeight: 16 },
    lockedBadge: { fontSize: 8, fontWeight: '900', color: '#a14009', backgroundColor: '#fff4ee', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#ffdbcd' },

    // Floating Payment Button
    fabContainer: { position: 'absolute', bottom: 24, left: 20, right: 20 },
    fab: { backgroundColor: '#10b981', height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
    fabText: { color: '#fff', fontSize: 15, fontWeight: '800' },

    // Payment Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,32,69,0.4)' },
    paySheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
    paySheetHeader: { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    paySheetTitle: { fontSize: 18, fontWeight: '900', color: '#002045' },
    paySheetSub: { fontSize: 12, color: '#74777f', marginTop: 3, fontWeight: '500' },
    closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#faf9fd', alignItems: 'center', justifyContent: 'center' },
    payInput: { height: 56, borderWidth: 1.5, borderColor: '#e3e2e6', borderRadius: 16, paddingHorizontal: 18, fontSize: 18, color: '#002045', fontWeight: '700', marginBottom: 16, backgroundColor: '#faf9fd' },
    payBtn: { height: 56, backgroundColor: '#10b981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
    payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default CustomerDetailScreen;
