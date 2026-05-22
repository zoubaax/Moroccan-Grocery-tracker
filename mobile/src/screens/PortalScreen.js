import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';
import { ShoppingBag, Power, Users, ArrowRight, TrendingUp, DollarSign, BarChart2, Store, Bot, Lock } from 'lucide-react-native';
import { useLanguage } from '../services/LanguageContext';
import UpgradeModal from '../components/UpgradeModal';

const PortalScreen = ({ onSelectMode, onLogout, userName, features, subscriptionPlan }) => {
    const { t, isRTL, flexDir, tAlign } = useLanguage();
    const [upgradeTarget, setUpgradeTarget] = useState(null);

    const f = features || { sales: true, credit: true, marketplace: false, aiAutomation: false };
    const plan = subscriptionPlan || 'START';

    // Visibility rules:
    // Marketplace card: show for START only (locked) — PRO & ULTIMATE access it via scanner detours from Vente normale.
    // AI card: show for START & PRO (locked) — ULTIMATE accesses it inside Carnet de crédits (CustomerDetailScreen).
    const showMarketplaceCard = plan === 'START';
    const showAiCard = plan !== 'ULTIMATE';

    const openOrUpgrade = (enabled, targetPlan, mode) => {
        if (enabled) {
            onSelectMode(mode);
        } else {
            setUpgradeTarget(targetPlan);
        }
    };

    const renderActionCard = ({
        enabled,
        targetPlan,
        mode,
        cardStyle,
        arrowColor,
        Icon,
        titleKey,
        descKey,
        lockLabelKey,
    }) => (
        <TouchableOpacity
            style={[styles.actionCard, cardStyle, { flexDirection: flexDir }, !enabled && styles.actionCardLocked]}
            onPress={() => openOrUpgrade(enabled, targetPlan, mode)}
            activeOpacity={0.9}
        >
            <View style={[styles.cardContent, { flexDirection: flexDir }]}>
                <View style={[styles.actionIconBox, !enabled && styles.actionIconBoxLocked]}>
                    {enabled ? <Icon color="#fff" size={28} /> : <Lock color="rgba(255,255,255,0.9)" size={22} />}
                </View>
                <View style={[styles.cardTextDetails, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.actionCardTitle, { textAlign: tAlign }]}>{t(titleKey)}</Text>
                    <Text style={[styles.actionCardDesc, { textAlign: tAlign }]}>
                        {enabled ? t(descKey) : t(lockLabelKey)}
                    </Text>
                </View>
            </View>
            <View style={[styles.arrowCircle, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
                {enabled ? <ArrowRight color={arrowColor} size={20} /> : <Lock color="#94a3b8" size={16} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <ScrollView style={styles.container} bounces={false}>
                <View style={styles.headerBanner}>
                    <SafeAreaView>
                        <View style={[styles.headerTop, { flexDirection: flexDir }]}>
                            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                <Text style={[styles.greeting, { textAlign: tAlign }]}>{t('portal.greeting', { name: userName })}</Text>
                                <Text style={[styles.headerSubtitle, { textAlign: tAlign }]}>{t('portal.subtitle')}</Text>
                                <View style={[styles.planBadge, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                                    <Text style={styles.planBadgeText}>
                                        {t('subscription.planLabel', { plan: t(`subscription.plan.${plan.toLowerCase()}`) })}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                                <Power color="#ef4444" size={18} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.dashboardWrapper}>
                    <View style={styles.dashboardCard}>
                        <Text style={[styles.dashboardTitle, { textAlign: tAlign }]}>{t('portal.dailySummary')}</Text>
                        <View style={[styles.metricsRow, { flexDirection: flexDir }]}>
                            <View style={[styles.metricItem, { flexDirection: flexDir }]}>
                                <View style={[styles.metricIconBox, { backgroundColor: '#eef2ff' }]}>
                                    <TrendingUp color="#4f46e5" size={18} />
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

                <View style={styles.content}>
                    <Text style={[styles.sectionTitle, { textAlign: tAlign }]}>{t('portal.commercialManagement')}</Text>

                    {/* Vente normale — always visible, always unlocked */}
                    {renderActionCard({
                        enabled: true,
                        targetPlan: 'START',
                        mode: 'NORMAL',
                        cardStyle: styles.sellCard,
                        arrowColor: '#4f46e5',
                        Icon: ShoppingBag,
                        titleKey: 'portal.caisseTitle',
                        descKey: 'portal.caisseDesc',
                        lockLabelKey: 'subscription.lockSales',
                    })}

                    {/* Carnet de crédits — always visible, always unlocked */}
                    {renderActionCard({
                        enabled: true,
                        targetPlan: 'START',
                        mode: 'CREDIT',
                        cardStyle: styles.creditCard,
                        arrowColor: '#0ea5e9',
                        Icon: Users,
                        titleKey: 'portal.creditTitle',
                        descKey: 'portal.creditDesc',
                        lockLabelKey: 'subscription.lockCredit',
                    })}

                    {/* Marketplace — shown for START (locked) and PRO (unlocked). Hidden for ULTIMATE (accessible via scanner). */}
                    {showMarketplaceCard && renderActionCard({
                        enabled: f.marketplace,
                        targetPlan: 'PRO',
                        mode: 'MARKETPLACE',
                        cardStyle: styles.marketplaceCard,
                        arrowColor: '#8b5cf6',
                        Icon: Store,
                        titleKey: 'portal.marketplaceTitle',
                        descKey: 'portal.marketplaceDesc',
                        lockLabelKey: 'subscription.lockMarketplace',
                    })}

                    {/* AI Automation — shown for START only (locked, for marketing). PRO & ULTIMATE don't see this card.
                        ULTIMATE accesses AI inside CustomerDetailScreen (Carnet de crédits flow). */}
                    {showAiCard && renderActionCard({
                        enabled: false,
                        targetPlan: 'ULTIMATE',
                        mode: 'AI',
                        cardStyle: styles.aiCard,
                        arrowColor: '#f59e0b',
                        Icon: Bot,
                        titleKey: 'portal.aiTitle',
                        descKey: 'portal.aiDesc',
                        lockLabelKey: 'subscription.lockAi',
                    })}

                    {/* Statistiques — always visible, always unlocked */}
                    {renderActionCard({
                        enabled: true,
                        targetPlan: 'START',
                        mode: 'STATS',
                        cardStyle: styles.statsCardAction,
                        arrowColor: '#10b981',
                        Icon: BarChart2,
                        titleKey: 'portal.statsTitle',
                        descKey: 'portal.statsDesc',
                        lockLabelKey: 'subscription.lockSales',
                    })}
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
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerBanner: {
        backgroundColor: '#1e1b4b',
        paddingBottom: 50,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 13, color: '#a5b4fc', marginTop: 2, fontWeight: '500' },
    planBadge: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    planBadgeText: { color: '#e0e7ff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    logoutBtn: {
        width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    dashboardWrapper: { paddingHorizontal: 20, marginTop: -30, marginBottom: 25 },
    dashboardCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 20,
        shadowColor: '#1e1b4b', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20,
        elevation: 8, borderWidth: 1, borderColor: '#f1f5f9',
    },
    dashboardTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 15 },
    metricsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    metricItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    metricIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    metricValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    metricLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 1 },
    divider: { width: 1, height: 35, backgroundColor: '#e2e8f0', marginHorizontal: 15 },
    content: { paddingHorizontal: 20, gap: 20, paddingBottom: 20 },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1.5, marginBottom: 5, paddingLeft: 4 },
    actionCard: {
        borderRadius: 28, padding: 24, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
    },
    actionCardLocked: { opacity: 0.88 },
    sellCard: { backgroundColor: '#4f46e5', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 25, elevation: 10 },
    creditCard: { backgroundColor: '#0ea5e9', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 25, elevation: 10 },
    marketplaceCard: { backgroundColor: '#7c3aed', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 25, elevation: 10 },
    aiCard: { backgroundColor: '#d97706', shadowColor: '#d97706', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 25, elevation: 10 },
    statsCardAction: { backgroundColor: '#10b981', shadowColor: '#10b981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 25, elevation: 10 },
    cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
    actionIconBox: {
        width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    actionIconBoxLocked: { backgroundColor: 'rgba(0,0,0,0.15)' },
    cardTextDetails: { flex: 1, paddingRight: 10 },
    actionCardTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
    actionCardDesc: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4, lineHeight: 18 },
    arrowCircle: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 20 },
    appVersion: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
    statusText: { fontSize: 10, color: '#166534', fontWeight: 'bold' },
});

export default PortalScreen;
