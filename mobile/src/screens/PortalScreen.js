import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, SafeAreaView, Platform, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { ShoppingBag, Power, Users, ArrowRight, TrendingUp, DollarSign, BarChart2, Store, Bot, Lock, RefreshCw } from 'lucide-react-native';
import { useLanguage } from '../services/LanguageContext';
import UpgradeModal from '../components/UpgradeModal';

const AnimatedTouchable = ({ onPress, style, children }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    return (
        <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
            <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const PortalScreen = ({ onSelectMode, onLogout, onRefreshPlan, userName, features, subscriptionPlan }) => {
    const { t, isRTL, flexDir, tAlign, language } = useLanguage();
    const [upgradeTarget, setUpgradeTarget] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const f = features || { sales: true, credit: true, marketplace: false, aiAutomation: false };
    const plan = subscriptionPlan || 'START';

    const showMarketplaceCard = plan === 'START';
    const showAiCard = plan !== 'ULTIMATE';

    const openOrUpgrade = (enabled, targetPlan, mode) => {
        if (enabled) { onSelectMode(mode); } else { setUpgradeTarget(targetPlan); }
    };

    const handleRefresh = async () => {
        if (!onRefreshPlan || isRefreshing) return;
        setIsRefreshing(true);
        await onRefreshPlan();
        setIsRefreshing(false);
    };

    const dummyProgress = 0.75;

    const renderGridCard = ({ enabled, targetPlan, mode, iconBg, iconColor, Icon, titleKey, descKey, lockLabelKey, fullWidth = false }) => (
        <AnimatedTouchable
            style={[styles.gridCard, fullWidth && styles.gridCardFull, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}
            onPress={() => openOrUpgrade(enabled, targetPlan, mode)}
        >
            <View style={[styles.gridIconBox, { backgroundColor: enabled ? iconBg : '#f4f3f7' }]}>
                {enabled ? <Icon color={iconColor} size={26} /> : <Lock color="#94a3b8" size={22} />}
            </View>
            <Text style={[styles.gridCardTitle, { textAlign: tAlign }]}>{t(titleKey)}</Text>
            <Text style={[styles.gridCardDesc, { textAlign: tAlign }]} numberOfLines={2}>
                {enabled ? t(descKey) : t(lockLabelKey)}
            </Text>
            <View style={[styles.gridCardFooter, { flexDirection: flexDir }]}>
                <Text style={[styles.gridCardActionText, { color: enabled ? iconColor : '#94a3b8' }]}>
                    {enabled ? (language === 'fr' ? 'Ouvrir' : 'فتح') : (language === 'fr' ? 'Upgrade' : 'ترقية')}
                </Text>
                <ArrowRight color={enabled ? iconColor : '#94a3b8'} size={13} style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
            </View>
        </AnimatedTouchable>
    );

    return (
        <>
            <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerBanner}>
                    <SafeAreaView>
                        <View style={[styles.headerTop, { flexDirection: flexDir }]}>
                            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }}>
                                <Text style={[styles.greeting, { textAlign: tAlign }]}>{t('portal.greeting', { name: userName })}</Text>
                                <Text style={[styles.headerSubtitle, { textAlign: tAlign }]}>{t('portal.subtitle')}</Text>
                                <View style={[styles.planBadgeRow, { flexDirection: flexDir }]}>
                                    <View style={[styles.planBadge]}>
                                        <Text style={styles.planBadgeText}>
                                            {t('subscription.planLabel', { plan: t(`subscription.plan.${plan.toLowerCase()}`) })}
                                        </Text>
                                    </View>
                                    {/* Plan Refresh Button */}
                                    <TouchableOpacity
                                        onPress={handleRefresh}
                                        style={styles.refreshPlanBtn}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        disabled={isRefreshing}
                                    >
                                        {isRefreshing
                                            ? <ActivityIndicator size={12} color="rgba(255,255,255,0.8)" />
                                            : <RefreshCw color="rgba(255,255,255,0.8)" size={12} />
                                        }
                                        <Text style={styles.refreshPlanText}>
                                            {language === 'fr' ? 'Actualiser plan' : 'تحديث الخطة'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                                <Power color="#ef4444" size={18} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Dashboard Card */}
                <View style={styles.dashboardWrapper}>
                    <View style={styles.dashboardCard}>
                        <View style={[styles.dashboardHeaderRow, { flexDirection: flexDir }]}>
                            <Text style={[styles.dashboardTitle, { textAlign: tAlign }]}>{t('portal.dailySummary')}</Text>
                            <Text style={styles.goalText}>
                                {language === 'fr' ? 'Objectif: 2000 DH' : 'الهدف: 2000 درهم'}
                            </Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${dummyProgress * 100}%` }]} />
                            </View>
                            <Text style={styles.progressPercent}>{Math.round(dummyProgress * 100)}%</Text>
                        </View>
                        <View style={[styles.metricsRow, { flexDirection: flexDir }]}>
                            <View style={[styles.metricItem, { flexDirection: flexDir }]}>
                                <View style={[styles.metricIconBox, { backgroundColor: '#eef2ff' }]}>
                                    <TrendingUp color="#002045" size={18} />
                                </View>
                                <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                    <Text style={[styles.metricValue, { textAlign: tAlign }]}>1,450.00 DH</Text>
                                    <Text style={[styles.metricLabel, { textAlign: tAlign }]}>{t('portal.estimatedSales')}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={[styles.metricItem, { flexDirection: flexDir }]}>
                                <View style={[styles.metricIconBox, { backgroundColor: '#fef2f2' }]}>
                                    <DollarSign color="#ef4444" size={18} />
                                </View>
                                <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                    <Text style={[styles.metricValue, { textAlign: tAlign }]}>850.00 DH</Text>
                                    <Text style={[styles.metricLabel, { textAlign: tAlign }]}>{t('portal.currentCredit')}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* All Cards Grid */}
                <View style={styles.content}>
                    <Text style={[styles.sectionTitle, { textAlign: tAlign }]}>{t('portal.commercialManagement')}</Text>

                    <View style={[styles.gridContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                        {/* Caisse */}
                        {renderGridCard({
                            enabled: true, targetPlan: 'START', mode: 'NORMAL',
                            iconBg: '#fff4ee', iconColor: '#a14009', Icon: ShoppingBag,
                            titleKey: 'portal.caisseTitle', descKey: 'portal.caisseDesc', lockLabelKey: 'subscription.lockSales',
                        })}

                        {/* Crédits */}
                        {renderGridCard({
                            enabled: true, targetPlan: 'START', mode: 'CREDIT',
                            iconBg: '#eef2ff', iconColor: '#002045', Icon: Users,
                            titleKey: 'portal.creditTitle', descKey: 'portal.creditDesc', lockLabelKey: 'subscription.lockCredit',
                        })}

                        {/* Statistiques */}
                        {renderGridCard({
                            enabled: true, targetPlan: 'START', mode: 'STATS',
                            iconBg: '#f0fdf4', iconColor: '#10b981', Icon: BarChart2,
                            titleKey: 'portal.statsTitle', descKey: 'portal.statsDesc', lockLabelKey: 'subscription.lockSales',
                        })}

                        {/* Marketplace */}
                        {showMarketplaceCard && renderGridCard({
                            enabled: f.marketplace, targetPlan: 'PRO', mode: 'MARKETPLACE',
                            iconBg: '#fdf4ff', iconColor: '#c026d3', Icon: Store,
                            titleKey: 'portal.marketplaceTitle', descKey: 'portal.marketplaceDesc', lockLabelKey: 'subscription.lockMarketplace',
                        })}

                        {/* AI Automation — full width if it's alone on a row */}
                        {showAiCard && renderGridCard({
                            enabled: false, targetPlan: 'ULTIMATE', mode: 'AI',
                            iconBg: '#fffbeb', iconColor: '#f59e0b', Icon: Bot,
                            titleKey: 'portal.aiTitle', descKey: 'portal.aiDesc', lockLabelKey: 'subscription.lockAi',
                            fullWidth: !showMarketplaceCard, // full width only when Marketplace is hidden
                        })}
                    </View>
                </View>

                <View style={[styles.footer, { flexDirection: flexDir }]}>
                    <Text style={styles.appVersion}>{t('portal.version')}</Text>
                    <View style={[styles.statusBadge, { flexDirection: flexDir }]}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{t('portal.online')}</Text>
                    </View>
                </View>
            </ScrollView>

            <UpgradeModal
                visible={!!upgradeTarget}
                onClose={() => setUpgradeTarget(null)}
                targetPlan={upgradeTarget}
                currentPlan={plan}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },
    headerBanner: {
        backgroundColor: '#002045',
        paddingBottom: 50,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
    },
    headerTop: { justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: '500' },
    planBadgeRow: { marginTop: 10, alignItems: 'center', gap: 10 },
    planBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    planBadgeText: { color: '#e0e7ff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    refreshPlanBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    refreshPlanText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
    logoutBtn: {
        width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    dashboardWrapper: { paddingHorizontal: 20, marginTop: -30, marginBottom: 15 },
    dashboardCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 20,
        shadowColor: '#002045', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 20,
        elevation: 8, borderWidth: 1, borderColor: '#e3e2e6',
    },
    dashboardHeaderRow: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    dashboardTitle: { fontSize: 10, fontWeight: '900', color: '#74777f', letterSpacing: 1.5 },
    goalText: { fontSize: 10, fontWeight: 'bold', color: '#a14009' },
    progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    progressTrack: { flex: 1, height: 6, backgroundColor: '#efedf1', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#a14009', borderRadius: 3 },
    progressPercent: { fontSize: 11, fontWeight: '800', color: '#a14009' },
    metricsRow: { alignItems: 'center', justifyContent: 'space-between' },
    metricItem: { flex: 1, alignItems: 'center', gap: 12 },
    metricIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    metricValue: { fontSize: 16, fontWeight: 'bold', color: '#002045' },
    metricLabel: { fontSize: 11, color: '#74777f', fontWeight: '500', marginTop: 1 },
    divider: { width: 1, height: 35, backgroundColor: '#e3e2e6', marginHorizontal: 15 },
    content: { paddingHorizontal: 20, paddingBottom: 30 },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: '#74777f', letterSpacing: 1.5, marginBottom: 15, paddingLeft: 4 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
    gridCard: {
        width: '47.5%', backgroundColor: '#fff', borderRadius: 24, padding: 20,
        borderWidth: 1, borderColor: '#e3e2e6',
        shadowColor: '#002045', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4
    },
    gridCardFull: { width: '100%' },
    gridIconBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    gridCardTitle: { fontSize: 15, fontWeight: '900', color: '#002045', marginBottom: 5 },
    gridCardDesc: { fontSize: 11, color: '#74777f', lineHeight: 16 },
    gridCardFooter: { marginTop: 14, alignItems: 'center', gap: 4 },
    gridCardActionText: { fontSize: 11, fontWeight: 'bold' },
    footer: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 20 },
    appVersion: { fontSize: 11, color: '#74777f', fontWeight: 'bold' },
    statusBadge: { alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
    statusText: { fontSize: 10, color: '#166534', fontWeight: 'bold' },
});

export default PortalScreen;
