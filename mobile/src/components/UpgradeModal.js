import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Lock, Check } from 'lucide-react-native';
import { useLanguage } from '../services/LanguageContext';

const UpgradeModal = ({ visible, onClose, targetPlan, currentPlan }) => {
    const { t, tAlign, isRTL, flexDir } = useLanguage();

    const plans = [
        { code: 'START', key: 'start', features: ['sales', 'credit'] },
        { code: 'PRO', key: 'pro', features: ['sales', 'credit', 'marketplace'] },
        { code: 'ULTIMATE', key: 'ultimate', features: ['sales', 'credit', 'marketplace', 'ai'] },
    ];

    const hasFeature = (plan, feature) => plan.features.includes(feature);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={[styles.header, { flexDirection: flexDir }]}>
                        <View style={[styles.headerIcon, { backgroundColor: '#eef2ff' }]}>
                            <Lock color="#6366f1" size={20} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { textAlign: tAlign }]}>
                                {t('subscription.upgradeTitle', { plan: targetPlan })}
                            </Text>
                            <Text style={[styles.sub, { textAlign: tAlign }]}>
                                {t('subscription.upgradeSub')}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <X color="#94a3b8" size={22} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {plans.map((plan) => {
                            const isCurrent = currentPlan === plan.code;
                            const isTarget = targetPlan === plan.code;
                            return (
                                <View
                                    key={plan.code}
                                    style={[
                                        styles.planCard,
                                        isTarget && styles.planCardTarget,
                                        isCurrent && styles.planCardCurrent,
                                    ]}
                                >
                                    <Text style={[styles.planName, { textAlign: tAlign }]}>
                                        {t(`subscription.plan.${plan.key}`)}
                                        {isCurrent ? ` (${t('subscription.current')})` : ''}
                                    </Text>
                                    {['sales', 'credit', 'marketplace', 'ai'].map((f) => (
                                        <View key={f} style={[styles.featureRow, { flexDirection: flexDir }]}>
                                            {hasFeature(plan, f) ? (
                                                <Check color="#10b981" size={14} />
                                            ) : (
                                                <X color="#cbd5e1" size={14} />
                                            )}
                                            <Text style={[styles.featureText, { textAlign: tAlign }]}>
                                                {t(`subscription.feature.${f}`)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity style={styles.contactBtn} onPress={onClose} activeOpacity={0.85}>
                        <Text style={styles.contactBtnText}>{t('subscription.contactAdmin')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', padding: 20 },
    sheet: { backgroundColor: '#fff', borderRadius: 24, padding: 20, maxHeight: '88%' },
    header: { alignItems: 'flex-start', gap: 12, marginBottom: 16 },
    headerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
    sub: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
    planCard: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: '#f8fafc' },
    planCardTarget: { borderColor: '#6366f1', backgroundColor: '#fafbff' },
    planCardCurrent: { borderColor: '#10b981' },
    planName: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
    featureRow: { alignItems: 'center', gap: 8, marginBottom: 4 },
    featureText: { fontSize: 12, color: '#475569', fontWeight: '500' },
    contactBtn: { marginTop: 12, backgroundColor: '#6366f1', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    contactBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default UpgradeModal;
