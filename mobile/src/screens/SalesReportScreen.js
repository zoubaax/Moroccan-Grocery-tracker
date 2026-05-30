import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, FlatList, 
    ActivityIndicator, SafeAreaView, Image, ScrollView, Animated, StatusBar
} from 'react-native';
import { ChevronLeft, BarChart2, TrendingUp, ShoppingBag, CreditCard, Banknote, Calendar, Info } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const SalesReportScreen = ({ token, apiUrl, onBack }) => {
    const { t, language, isRTL, flexDir, tAlign } = useLanguage();
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('day'); // 'day', 'week', 'month'

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/sales/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data || [];
            data.sort((a, b) => new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0));
            setSales(data);
            
            // Trigger animation on successful load
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true
            }).start();
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

    const totalRevenue = stats.totalRevenue || 1; // avoid division by 0
    const cashPercent = (stats.cashAmount / totalRevenue) * 100;
    const cardPercent = (stats.cardAmount / totalRevenue) * 100;
    const creditPercent = (stats.creditAmount / totalRevenue) * 100;

    // Helper to calculate daily trend for the last 7 days
    const getDailyTrendData = () => {
        const days = [];
        const now = new Date();
        
        // Let's create an array for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            days.push({
                dateString: d.toDateString(),
                label: d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-MA', { weekday: 'short' }),
                amount: 0
            });
        }

        sales.forEach(sale => {
            if (!sale.transactionDate) return;
            const saleDateStr = new Date(sale.transactionDate).toDateString();
            const dayObj = days.find(d => d.dateString === saleDateStr);
            if (dayObj) {
                dayObj.amount += sale.totalAmount || 0;
            }
        });

        const maxAmount = Math.max(...days.map(d => d.amount), 100); // base scale of 100
        return days.map(d => ({
            ...d,
            percent: (d.amount / maxAmount) * 100
        }));
    };

    const trendData = getDailyTrendData();

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
                    <Text style={[
                        styles.methodBadge, 
                        item.paymentMethod === 'CREDIT' ? styles.badgeCredit : item.paymentMethod === 'CARD' ? styles.badgeCard : styles.badgeCash
                    ]}>
                        {item.paymentMethod === 'CASH' ? t('salesReport.cash').toUpperCase() : item.paymentMethod === 'CARD' ? t('salesReport.card').toUpperCase() : t('salesReport.credit').toUpperCase()}
                    </Text>
                    <Text style={styles.saleTotal}>{item.totalAmount?.toFixed(2)} DH</Text>
                </View>
            </View>

            {item.paymentMethod === 'CREDIT' && item.client && (
                <View style={[styles.clientBadge, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={styles.clientBadgeText}>{t('salesReport.clientLabel', { name: item.client.name })}</Text>
                </View>
            )}

            <View style={styles.itemsList}>
                {item.items && item.items.map((saleItem, index) => (
                    <View key={index} style={[styles.productRow, { flexDirection: flexDir }]}>
                        {saleItem.product?.imageUrl ? (
                            <Image source={{ uri: saleItem.product.imageUrl }} style={styles.productThumb} />
                        ) : (
                            <View style={styles.productThumbPlaceholder}>
                                <ShoppingBag size={12} color="#74777f" />
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
            <StatusBar barStyle="light-content" backgroundColor="#002045" />
            
            {/* Header Banner */}
            <View style={styles.headerBanner}>
                <View style={[styles.headerTop, { flexDirection: flexDir }]}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#fff" style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('salesReport.headerTitle')}</Text>
                    <TouchableOpacity onPress={fetchSales} style={styles.refreshBtn}>
                        <Text style={styles.refreshText}>{t('salesReport.refreshText')}</Text>
                    </TouchableOpacity>
                </View>
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

            {/* Scrollable dashboard elements */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Stats Dashboard Card */}
                <View style={styles.statsCard}>
                    <View style={[styles.revenueBlock, { flexDirection: flexDir }]}>
                        <View style={styles.trendingIconBox}>
                            <TrendingUp color="#10b981" size={24} style={isRTL && { transform: [{ scaleX: -1 }] }} />
                        </View>
                        <View style={[styles.revenueInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.revenueLabel}>{t('salesReport.revenueLabel', { count: filteredSales.length })}</Text>
                            <Text style={styles.revenueValue}>{stats.totalRevenue.toFixed(2)} MAD</Text>
                        </View>
                    </View>

                    {/* Breakdown */}
                    <View style={[styles.breakdownRow, { flexDirection: flexDir }]}>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.breakdownIconBox, { backgroundColor: '#f1f5f9' }]}>
                                <Banknote size={16} color="#475569" />
                            </View>
                            <Text style={styles.breakdownVal}>{stats.cashAmount.toFixed(0)} DH</Text>
                            <Text style={styles.breakdownLbl}>{t('salesReport.cash')}</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.breakdownIconBox, { backgroundColor: '#eef2ff' }]}>
                                <CreditCard size={16} color="#6366f1" />
                            </View>
                            <Text style={styles.breakdownVal}>{stats.cardAmount.toFixed(0)} DH</Text>
                            <Text style={styles.breakdownLbl}>{t('salesReport.card')}</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.breakdownIconBox, { backgroundColor: '#fee2e2' }]}>
                                <Calendar size={16} color="#f43f5e" />
                            </View>
                            <Text style={styles.breakdownVal}>{stats.creditAmount.toFixed(0)} DH</Text>
                            <Text style={styles.breakdownLbl}>{t('salesReport.credit')}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Proportional Custom Distribution Bar Chart */}
                    <Text style={[styles.chartSectionTitle, { textAlign: tAlign }]}>
                        {language === 'fr' ? 'RÉPARTITION DES PAIEMENTS' : 'توزيع طرق الدفع'}
                    </Text>
                    <View style={styles.distBar}>
                        {cashPercent > 0 && <View style={[styles.distSegment, { width: `${cashPercent}%`, backgroundColor: '#475569' }]} />}
                        {cardPercent > 0 && <View style={[styles.distSegment, { width: `${cardPercent}%`, backgroundColor: '#6366f1' }]} />}
                        {creditPercent > 0 && <View style={[styles.distSegment, { width: `${creditPercent}%`, backgroundColor: '#f43f5e' }]} />}
                        {totalRevenue <= 0 && <View style={[styles.distSegment, { width: '100%', backgroundColor: '#e3e2e6' }]} />}
                    </View>

                    {/* Proportions Key */}
                    <View style={[styles.keyRow, { flexDirection: flexDir }]}>
                        <View style={[styles.keyItem, { flexDirection: flexDir }]}>
                            <View style={[styles.keyColor, { backgroundColor: '#475569' }]} />
                            <Text style={styles.keyLabel}>{t('salesReport.cash')} ({totalRevenue > 1 ? cashPercent.toFixed(0) : 0}%)</Text>
                        </View>
                        <View style={[styles.keyItem, { flexDirection: flexDir }]}>
                            <View style={[styles.keyColor, { backgroundColor: '#6366f1' }]} />
                            <Text style={styles.keyLabel}>{t('salesReport.card')} ({totalRevenue > 1 ? cardPercent.toFixed(0) : 0}%)</Text>
                        </View>
                        <View style={[styles.keyItem, { flexDirection: flexDir }]}>
                            <View style={[styles.keyColor, { backgroundColor: '#f43f5e' }]} />
                            <Text style={styles.keyLabel}>{t('salesReport.credit')} ({totalRevenue > 1 ? creditPercent.toFixed(0) : 0}%)</Text>
                        </View>
                    </View>
                </View>

                {/* Custom Weekly Bar Chart Trend */}
                <View style={styles.chartCard}>
                    <View style={[styles.chartHeader, { flexDirection: flexDir }]}>
                        <BarChart2 size={20} color="#002045" />
                        <Text style={styles.chartTitle}>
                            {language === 'fr' ? 'Tendance de ventes (7 derniers jours)' : 'مؤشر المبيعات (آخر 7 أيام)'}
                        </Text>
                    </View>
                    
                    <View style={styles.barChartContainer}>
                        {trendData.map((d, index) => (
                            <View key={index} style={styles.barCol}>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, { height: `${Math.max(d.percent, 4)}%` }]} />
                                </View>
                                <Text style={styles.barAmountText} numberOfLines={1}>
                                    {d.amount > 0 ? `${d.amount.toFixed(0)}` : '-'}
                                </Text>
                                <Text style={styles.barLabel}>{d.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Sales List Section Header */}
                <Text style={[styles.sectionLabel, { textAlign: tAlign, marginHorizontal: 20, marginBottom: 12, marginTop: 24 }]}>
                    {language === 'fr' ? 'HISTORIQUE DÉTAILLÉ' : 'سجل العمليات المفصل'}
                </Text>

                {/* Sales List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#002045" />
                    </View>
                ) : filteredSales.length > 0 ? (
                    <View style={{ paddingHorizontal: 15 }}>
                        {filteredSales.map((item) => (
                            <View key={item.id}>
                                {renderSaleItem({ item })}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <ShoppingBag size={48} color="#c4c6cf" />
                        <Text style={styles.emptyText}>{t('salesReport.emptyHistory')}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },
    
    // Header Banner
    headerBanner: {
        backgroundColor: '#002045',
        paddingBottom: 14,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: { 
        height: 56, 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16 
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    refreshBtn: { 
        paddingVertical: 6, 
        paddingHorizontal: 12, 
        borderRadius: 10, 
        backgroundColor: 'rgba(255, 255, 255, 0.15)' 
    },
    refreshText: { fontSize: 11, fontWeight: '800', color: '#fff' },

    // Tabs Container
    tabsContainer: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        marginHorizontal: 16, 
        marginTop: -1, 
        borderRadius: 16, 
        padding: 4,
        shadowColor: '#002045',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 16
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabActive: { backgroundColor: '#002045' },
    tabText: { fontSize: 12, fontWeight: '700', color: '#74777f' },
    tabTextActive: { color: '#fff' },

    // Stats Card
    statsCard: { 
        backgroundColor: '#fff', 
        marginHorizontal: 16, 
        borderRadius: 20, 
        padding: 16, 
        borderWidth: 1,
        borderColor: '#e3e2e6',
        shadowColor: '#002045', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.02, 
        shadowRadius: 8, 
        elevation: 2 
    },
    revenueBlock: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    trendingIconBox: { 
        width: 44, 
        height: 44, 
        borderRadius: 12, 
        backgroundColor: '#f0fdf4', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    revenueInfo: { flex: 1 },
    revenueLabel: { fontSize: 9, fontWeight: '900', color: '#74777f', letterSpacing: 1.5 },
    revenueValue: { fontSize: 24, fontWeight: '900', color: '#002045', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#efedf1', marginVertical: 16 },
    
    // Breakdown
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 4 },
    breakdownItem: { alignItems: 'center', gap: 6 },
    breakdownIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    breakdownVal: { fontSize: 13, fontWeight: '900', color: '#002045' },
    breakdownLbl: { fontSize: 10, color: '#74777f', fontWeight: '700' },
    
    // Proportional Custom Distribution Bar Chart
    chartSectionTitle: { fontSize: 9, fontWeight: '900', color: '#74777f', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
    distBar: { 
        height: 12, 
        borderRadius: 6, 
        backgroundColor: '#faf9fd', 
        flexDirection: 'row', 
        overflow: 'hidden',
        marginBottom: 10 
    },
    distSegment: { height: '100%' },
    
    // Proportions Key
    keyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', paddingHorizontal: 4 },
    keyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    keyColor: { width: 8, height: 8, borderRadius: 4 },
    keyLabel: { fontSize: 10, fontWeight: '600', color: '#74777f' },

    // Custom Trend Bar Chart Card
    chartCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e3e2e6',
        shadowColor: '#002045',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2
    },
    chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
    chartTitle: { fontSize: 12, fontWeight: '800', color: '#002045' },
    barChartContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        height: 120, 
        paddingTop: 10,
        paddingHorizontal: 4
    },
    barCol: { alignItems: 'center', flex: 1 },
    barTrack: { 
        height: 80, 
        width: 14, 
        backgroundColor: '#faf9fd', 
        borderRadius: 7, 
        overflow: 'hidden', 
        justifyContent: 'flex-end' 
    },
    barFill: { 
        width: '100%', 
        backgroundColor: '#002045', 
        borderRadius: 7 
    },
    barAmountText: { fontSize: 8, fontWeight: '800', color: '#74777f', marginTop: 4, marginBottom: 2 },
    barLabel: { fontSize: 9, fontWeight: '700', color: '#74777f', textTransform: 'capitalize' },

    sectionLabel: { fontSize: 10, fontWeight: '900', color: '#74777f', letterSpacing: 1.5 },

    // List & Cards
    saleCard: { 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 18, 
        marginBottom: 12, 
        borderWidth: 1, 
        borderColor: '#e3e2e6',
        shadowColor: '#002045', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.02, 
        shadowRadius: 5, 
        elevation: 1 
    },
    saleHeader: { justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#efedf1', paddingBottom: 10 },
    saleId: { fontSize: 13, fontWeight: '800', color: '#002045' },
    saleTime: { fontSize: 11, color: '#74777f', fontWeight: '500', marginTop: 2 },
    saleHeaderRight: { alignItems: 'flex-end', gap: 4 },
    saleTotal: { fontSize: 15, fontWeight: '800', color: '#10b981' },
    methodBadge: { fontSize: 8, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
    badgeCredit: { backgroundColor: '#fee2e2', color: '#f43f5e' },
    badgeCash: { backgroundColor: '#f1f5f9', color: '#475569' },
    badgeCard: { backgroundColor: '#eef2ff', color: '#6366f1' },
    clientBadge: { alignSelf: 'flex-start', backgroundColor: '#fff4ee', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 8 },
    clientBadgeText: { fontSize: 10, fontWeight: '800', color: '#a14009' },
    itemsList: { marginTop: 12, gap: 8 },
    productRow: { alignItems: 'center' },
    productThumb: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#faf9fd' },
    productThumbPlaceholder: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#faf9fd', alignItems: 'center', justifyContent: 'center' },
    productInfo: { flex: 1, marginLeft: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productName: { fontSize: 13, fontWeight: '600', color: '#002045', flex: 1, marginRight: 10 },
    productQtyPrice: { fontSize: 11, color: '#74777f' },
    loadingContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 10 },
    emptyText: { fontSize: 14, color: '#74777f', fontWeight: '700', textAlign: 'center' }
});

export default SalesReportScreen;
