import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, ActivityIndicator, Alert, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Plus, Minus, Trash2, Barcode as BarcodeIcon, Tag, Package } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const PaniaScreen = ({ user, apiUrl, onBack, onGoToBarcode }) => {
    const { t, flexDir, flexDirNatural, tAlign, isRTL, language } = useLanguage();
    const [pantry, setPantry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const fetchPantry = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(response.data);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]).start();
        } catch (err) {
            console.warn(err);
            Alert.alert(t('common.error'), "Impossible de charger la Pania");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPantry(); }, []);

    const updateQuantity = async (itemId, newQty) => {
        setActionLoadingId(itemId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${apiUrl}/pantry/update/${itemId}?quantity=${newQty}`, {}, config);
            const response = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(response.data);
        } catch (err) {
            Alert.alert(t('common.error'), "Erreur de modification");
        } finally {
            setActionLoadingId(null);
        }
    };

    const removeItem = async (itemId) => {
        setActionLoadingId(itemId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${apiUrl}/pantry/remove/${itemId}`, config);
            const response = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(response.data);
        } catch (err) {
            Alert.alert(t('common.error'), "Erreur de suppression");
        } finally {
            setActionLoadingId(null);
        }
    };

    const clearPantry = () => {
        Alert.alert(
            language === 'fr' ? "Vider la Pania" : "تفريغ السلة",
            language === 'fr' ? "Retirer tous les articles ?" : "هل تريد إزالة جميع السلع؟",
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: language === 'fr' ? "Vider" : "تفريغ",
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const config = { headers: { Authorization: `Bearer ${user.token}` } };
                            await axios.delete(`${apiUrl}/pantry/clear`, config);
                            setPantry({ ...pantry, items: [] });
                        } catch (err) { console.warn(err); }
                        finally { setIsLoading(false); }
                    }
                }
            ]
        );
    };

    const total = pantry?.items?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;
    const itemsCount = pantry?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    const renderItem = ({ item }) => {
        const subtotal = item.product.price * item.quantity;
        const isActionLoading = actionLoadingId === item.id;

        return (
            <View style={[styles.itemCard, { flexDirection: flexDir }]}>
                <View style={styles.itemAccentBar} />

                <View style={styles.itemInner}>
                    <View style={[styles.itemRow, { flexDirection: flexDirNatural }]}>
                        <View style={styles.itemIconBox}>
                            <Package size={18} color="#6366f1" />
                        </View>
                        <View style={[styles.itemInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }]}>
                            <Text style={[styles.itemName, { textAlign: tAlign }]} numberOfLines={1}>
                                {item.product.name}
                            </Text>
                            <Text style={[styles.itemUnitPrice, { textAlign: tAlign }]}>
                                {item.product.price?.toFixed(2)} DH / u
                            </Text>
                        </View>

                        {/* Qty Controls */}
                        {isActionLoading ? (
                            <ActivityIndicator size="small" color="#6366f1" style={{ width: 88 }} />
                        ) : (
                            <View style={[styles.qtyControl, { flexDirection: flexDir }]}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={!!actionLoadingId}
                                >
                                    <Minus color="#6366f1" size={13} />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity
                                    style={[styles.qtyBtn, styles.qtyBtnActive]}
                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={!!actionLoadingId}
                                >
                                    <Plus color="#fff" size={13} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Footer: delete + subtotal */}
                    <View style={[styles.itemFooter, { flexDirection: flexDir }]}>
                        <TouchableOpacity
                            onPress={() => removeItem(item.id)}
                            style={[styles.removeBtn, { flexDirection: flexDir }]}
                            disabled={!!actionLoadingId}
                        >
                            <Trash2 size={12} color="#ef4444" />
                            <Text style={styles.removeBtnText}>{language === 'fr' ? 'Retirer' : 'حذف'}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.subtotal, { textAlign: tAlign }]}>{subtotal.toFixed(2)} DH</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>
                        {language === 'fr' ? 'Ma Pania 🧺' : 'سلتي 🧺'}
                    </Text>
                    {itemsCount > 0 && (
                        <Text style={styles.headerSub}>{itemsCount} {language === 'fr' ? 'articles' : 'سلعة'}</Text>
                    )}
                </View>

                <TouchableOpacity
                    onPress={onBack}
                    style={[styles.headerBackBtn, isRTL ? styles.headerBackBtnRtl : styles.headerBackBtnLtr]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={t('common.back')}
                >
                    <Text style={styles.headerBackArrow}>{isRTL ? '→' : '←'}</Text>
                </TouchableOpacity>

                {pantry?.items?.length > 0 && (
                    <TouchableOpacity
                        onPress={clearPantry}
                        style={[styles.headerActionBtn, isRTL ? styles.headerActionBtnRtl : styles.headerActionBtnLtr]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <View style={styles.headerActionBtnInner}>
                            <Trash2 color="#ef4444" size={17} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {/* Accent line */}
            <View style={styles.topAccent} />

            {isLoading && !pantry ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loaderText}>{language === 'fr' ? 'Chargement...' : 'جاري التحميل...'}</Text>
                </View>
            ) : pantry?.items?.length > 0 ? (
                <>
                    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <FlatList
                            data={pantry.items}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        />
                    </Animated.View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={[styles.summaryRow, { flexDirection: flexDir }]}>
                            <Text style={[styles.summaryLabel, { textAlign: tAlign }]}>{language === 'fr' ? 'Articles' : 'السلع'}</Text>
                            <View style={styles.summaryBadge}>
                                <Text style={styles.summaryBadgeText}>{itemsCount}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={[styles.summaryRow, { flexDirection: flexDir }]}>
                            <Text style={[styles.totalLabel, { textAlign: tAlign }]}>{language === 'fr' ? 'Total Estimé' : 'التقدير الإجمالي'}</Text>
                            <Text style={[styles.totalValue, { textAlign: tAlign }]}>{total.toFixed(2)} DH</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.barcodeBtn, { flexDirection: flexDir }]}
                            onPress={onGoToBarcode}
                            activeOpacity={0.85}
                        >
                            <View style={styles.barcodeBtnIconBox}>
                                <BarcodeIcon color="#fff" size={18} />
                            </View>
                            <Text style={styles.barcodeBtnText}>
                                {language === 'fr' ? 'Générer mon Code-barres' : 'إنشاء الرمز الشريطي'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <ShoppingBag size={42} color="#6366f1" />
                    </View>
                    <Text style={[styles.emptyTitle, { textAlign: tAlign }]}>
                        {language === 'fr' ? 'Votre Pania est vide' : 'سلتك فارغة حاليًا'}
                    </Text>
                    <Text style={[styles.emptySub, { textAlign: tAlign }]}>
                        {language === 'fr' ? 'Ajoutez des articles depuis la boutique' : 'أضف بعض السلع من المتجر أولاً'}
                    </Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={onBack}>
                        <Text style={styles.emptyBtnText}>
                            {language === 'fr' ? 'Aller à la boutique' : 'الذهاب للمتجر'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },

    header: {
        position: 'relative',
        minHeight: 56,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 64,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    headerSub: { fontSize: 11, color: '#94a3b8', fontWeight: '500', marginTop: 1 },
    headerBackBtn: {
        position: 'absolute',
        top: 10,
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        zIndex: 2,
    },
    headerBackBtnLtr: { left: 18 },
    headerBackBtnRtl: { right: 18 },
    headerBackArrow: { fontSize: 24, color: '#1e293b', fontWeight: '700', lineHeight: 28 },
    headerActionBtn: { position: 'absolute', top: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    headerActionBtnLtr: { right: 18 },
    headerActionBtnRtl: { left: 18 },
    headerActionBtnInner: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },

    topAccent: { height: 3, backgroundColor: '#6366f1' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },

    list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },

    // Item card
    itemCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
    itemAccentBar: { width: 4, backgroundColor: '#6366f1' },
    itemInner: { flex: 1, paddingHorizontal: 12, paddingVertical: 11 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    itemIconBox: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
    itemUnitPrice: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },

    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f8fafc', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: '#e2e8f0' },
    qtyBtn: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
    qtyBtnActive: { backgroundColor: '#6366f1' },
    qtyText: { fontSize: 13, fontWeight: '800', color: '#0f172a', minWidth: 22, textAlign: 'center' },

    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    removeBtn: { alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
    removeBtnText: { color: '#ef4444', fontSize: 11, fontWeight: '600' },
    subtotal: { fontSize: 15, fontWeight: '800', color: '#6366f1' },

    // Footer
    footer: { backgroundColor: '#fff', padding: 18, paddingBottom: 22, borderTopWidth: 1, borderTopColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 5 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    summaryLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    summaryBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    summaryBadgeText: { color: '#6366f1', fontSize: 13, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
    totalLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#6366f1' },

    barcodeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 15, marginTop: 14, backgroundColor: '#6366f1', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 5 },
    barcodeBtnIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    barcodeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },

    // Empty
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 14 },
    emptyIconBg: { width: 90, height: 90, borderRadius: 28, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#c7d2fe', marginBottom: 4 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    emptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },
    emptyBtn: { backgroundColor: '#6366f1', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14, marginTop: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
    emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default PaniaScreen;
