import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import { ChevronLeft, BarChart2, TrendingUp, ShoppingBag, CreditCard, Banknote, Calendar } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const SalesReportScreen = ({ token, apiUrl, onBack }) => {
    const { t, isRTL, flexDir, tAlign } = useLanguage();
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('day'); // 'day', 'week', 'month'

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/sales/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Reverse so latest is first
            const data = response.data || [];
            data.sort((a, b) => new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0));
            setSales(data);
        } catch (err) {
            console.error("Error fetching sales history:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    // Filter logic
    const getFilteredSales = () => {
        const now = new Date();
        return sales.filter(sale => {
            if (!sale.transactionDate) return false;
            const txnDate = new Date(sale.transactionDate);
            const diffTime = Math.abs(now - txnDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (selectedTab === 'day') {
                return txnDate.toDateString() === now.toDateString();
            } else if (selectedTab === 'week') {
                return diffDays <= 7;
            } else if (selectedTab === 'month') {
                return diffDays <= 30;
            }
            return true;
        });
    };

    const filteredSales = getFilteredSales();

    // Stats calculations
    const stats = filteredSales.reduce((acc, sale) => {
        const amt = sale.totalAmount || 0;
        acc.totalRevenue += amt;
        acc.totalTxns += 1;

        if (sale.paymentMethod === 'CASH') {
            acc.cashAmount += amt;
        } else if (sale.paymentMethod === 'CARD') {
            acc.cardAmount += amt;
        } else if (sale.paymentMethod === 'CREDIT') {
            acc.creditAmount += amt;
        }
        return acc;
    }, { totalRevenue: 0, totalTxns: 0, cashAmount: 0, cardAmount: 0, creditAmount: 0 });

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

    const renderSaleItem = ({ item }) => (
        <View style={styles.saleCard}>
            <View style={[styles.saleHeader, { flexDirection: flexDir }]}>
                <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                    <Text style={styles.saleId}>{t('salesReport.saleNumber', { id: item.id })}</Text>
                    <Text style={styles.saleTime}>{formatDate(item.transactionDate)}</Text>
                </View>
                <View style={[styles.saleHeaderRight, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                    <Text style={[styles.methodBadge, item.paymentMethod === 'CREDIT' ? styles.badgeCredit : item.paymentMethod === 'CARD' ? styles.badgeCard : styles.badgeCash]}>
                        {item.paymentMethod === 'CASH' ? t('salesReport.cash').toUpperCase() : item.paymentMethod === 'CARD' ? t('salesReport.card').toUpperCase() : t('salesReport.credit').toUpperCase()}
                    </Text>
                    <Text style={styles.saleTotal}>{item.totalAmount?.toFixed(2)} DH</Text>
                </View>
            </View>

            {/* Client tag if credit */}
            {item.paymentMethod === 'CREDIT' && item.client && (
                <View style={[styles.clientBadge, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={styles.clientBadgeText}>{t('salesReport.clientLabel', { name: item.client.name })}</Text>
                </View>
            )}

            {/* Products List */}
            <View style={styles.itemsList}>
                {item.items && item.items.map((saleItem, index) => (
                    <View key={index} style={[styles.productRow, { flexDirection: flexDir }]}>
                        {saleItem.product?.imageUrl ? (
                            <Image source={{ uri: saleItem.product.imageUrl }} style={styles.productThumb} />
                        ) : (
                            <View style={styles.productThumbPlaceholder}>
                                <ShoppingBag size={12} color="#94a3b8" />
                            </View>
                        )}
                        <View style={[styles.productInfo, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0, flexDirection: flexDir, alignItems: 'center', justifyContent: 'space-between' }]}>
                            <Text style={[styles.productName, { textAlign: tAlign }]} numberOfLines={1}>
                                {saleItem.product?.name || t('salesReport.productUnknown')}
                            </Text>
                            <Text style={styles.productQtyPrice}>
                                {saleItem.quantity} x {saleItem.unitPrice?.toFixed(2)} DH
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity onPress={onBack} style={[styles.backBtn, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('salesReport.headerTitle')}</Text>
                <TouchableOpacity onPress={fetchSales} style={styles.refreshBtn}>
                    <Text style={styles.refreshText}>{t('salesReport.refreshText')}</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabsContainer, { flexDirection: flexDir }]}>
                <TouchableOpacity 
                    onPress={() => setSelectedTab('day')}
                    style={[styles.tab, selectedTab === 'day' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, selectedTab === 'day' && styles.tabTextActive]}>{t('salesReport.tabToday')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setSelectedTab('week')}
                    style={[styles.tab, selectedTab === 'week' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, selectedTab === 'week' && styles.tabTextActive]}>{t('salesReport.tabWeek')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setSelectedTab('month')}
                    style={[styles.tab, selectedTab === 'month' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, selectedTab === 'month' && styles.tabTextActive]}>{t('salesReport.tabMonth')}</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Dashboard */}
            <View style={styles.statsCard}>
                <View style={[styles.revenueBlock, { flexDirection: flexDir }]}>
                    <TrendingUp color="#10b981" size={24} style={isRTL && { transform: [{ scaleX: -1 }] }} />
                    <View style={[styles.revenueInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                        <Text style={styles.revenueLabel}>{t('salesReport.revenueLabel', { count: filteredSales.length })}</Text>
                        <Text style={styles.revenueValue}>{stats.totalRevenue.toFixed(2)} MAD</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Breakdown */}
                <View style={[styles.breakdownRow, { flexDirection: flexDir }]}>
                    <View style={styles.breakdownItem}>
                        <Banknote size={16} color="#475569" />
                        <Text style={styles.breakdownVal}>{stats.cashAmount.toFixed(0)} DH</Text>
                        <Text style={styles.breakdownLbl}>{t('salesReport.cash')}</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                        <CreditCard size={16} color="#6366f1" />
                        <Text style={styles.breakdownVal}>{stats.cardAmount.toFixed(0)} DH</Text>
                        <Text style={styles.breakdownLbl}>{t('salesReport.card')}</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                        <Calendar size={16} color="#f43f5e" />
                        <Text style={styles.breakdownVal}>{stats.creditAmount.toFixed(0)} DH</Text>
                        <Text style={styles.breakdownLbl}>{t('salesReport.credit')}</Text>
                    </View>
                </View>
            </View>

            {/* Sales List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <FlatList 
                    data={filteredSales}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSaleItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <ShoppingBag size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>{t('salesReport.emptyHistory')}</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e3e2e6' },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 13, fontWeight: 'bold', color: '#002045', letterSpacing: 1 },
    refreshBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e3e2e6' },
    refreshText: { fontSize: 12, fontWeight: 'bold', color: '#74777f' },
    tabsContainer: { flexDirection: 'row', backgroundColor: '#e3e2e6', marginHorizontal: 15, marginTop: 15, borderRadius: 12, padding: 4 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: '#fff' },
    tabText: { fontSize: 13, fontWeight: 'bold', color: '#74777f' },
    tabTextActive: { color: '#002045' },
    statsCard: { backgroundColor: '#fff', marginHorizontal: 15, marginTop: 15, borderRadius: 20, padding: 18, shadowColor: '#002045', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    revenueBlock: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    revenueInfo: { flex: 1 },
    revenueLabel: { fontSize: 9, fontWeight: '900', color: '#74777f', letterSpacing: 1 },
    revenueValue: { fontSize: 24, fontWeight: 'bold', color: '#002045', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#e3e2e6', marginVertical: 10 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 4 },
    breakdownItem: { alignItems: 'center', gap: 4 },
    breakdownVal: { fontSize: 13, fontWeight: 'bold', color: '#002045' },
    breakdownLbl: { fontSize: 10, color: '#74777f', fontWeight: 'bold' },
    list: { padding: 15, paddingBottom: 30 },
    saleCard: { backgroundColor: '#fff', padding: 15, borderRadius: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
    saleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e3e2e6', paddingBottom: 10 },
    saleId: { fontSize: 13, fontWeight: 'bold', color: '#002045' },
    saleTime: { fontSize: 11, color: '#74777f', fontWeight: '500', marginTop: 2 },
    saleHeaderRight: { alignItems: 'flex-end', gap: 4 },
    saleTotal: { fontSize: 15, fontWeight: 'bold', color: '#10b981' },
    methodBadge: { fontSize: 9, fontWeight: 'black', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeCredit: { backgroundColor: '#fee2e2', color: '#ef4444' },
    badgeCash: { backgroundColor: '#e3e2e6', color: '#475569' },
    badgeCard: { backgroundColor: '#eef2ff', color: '#6366f1' },
    clientBadge: { alignSelf: 'flex-start', backgroundColor: '#fff4ee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
    clientBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#a14009' },
    itemsList: { marginTop: 12, gap: 8 },
    productRow: { flexDirection: 'row', alignItems: 'center' },
    productThumb: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#faf9fd' },
    productThumbPlaceholder: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#faf9fd', alignItems: 'center', justifyContent: 'center' },
    productInfo: { flex: 1, marginLeft: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productName: { fontSize: 13, fontWeight: '500', color: '#002045', flex: 1, marginRight: 10 },
    productQtyPrice: { fontSize: 12, color: '#74777f' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 10 },
    emptyText: { fontSize: 14, color: '#74777f', fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 40 }
});

export default SalesReportScreen;
