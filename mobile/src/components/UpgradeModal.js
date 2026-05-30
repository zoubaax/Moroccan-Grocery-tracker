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
                        <View style={[styles.headerIcon, { backgroundColor: '#fff4ee' }]}>
                            <Lock color="#a14009" size={20} />
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
    overlay: { flex: 1, backgroundColor: 'rgba(0, 32, 69, 0.55)', justifyContent: 'center', padding: 20 },
    sheet: { backgroundColor: '#fff', borderRadius: 24, padding: 20, maxHeight: '88%' },
    header: { alignItems: 'flex-start', gap: 12, marginBottom: 16 },
    headerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 17, fontWeight: '800', color: '#002045' },
    sub: { fontSize: 13, color: '#74777f', marginTop: 4, lineHeight: 18 },
    planCard: { borderWidth: 1, borderColor: '#e3e2e6', borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: '#faf9fd' },
    planCardTarget: { borderColor: '#a14009', backgroundColor: '#fff4ee' },
    planCardCurrent: { borderColor: '#10b981' },
    planName: { fontSize: 14, fontWeight: '800', color: '#002045', marginBottom: 8 },
    featureRow: { alignItems: 'center', gap: 8, marginBottom: 4 },
    featureText: { fontSize: 12, color: '#74777f', fontWeight: '500' },
    contactBtn: { marginTop: 12, backgroundColor: '#a14009', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    contactBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default UpgradeModal;
