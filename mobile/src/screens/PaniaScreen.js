import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, ActivityIndicator, Alert, Animated, Easing, Image, SafeAreaView
} from 'react-native';
import { ShoppingBag, Plus, Minus, Trash2, Barcode as BarcodeIcon, ArrowLeft, Tag } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const PaniaScreen = ({ user, apiUrl, onBack, onGoToBarcode }) => {
    const { t, flexDir, flexDirNatural, tAlign, isRTL, language } = useLanguage();
    const [pantry, setPantry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    const fetchPantry = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(response.data);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
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
            <View style={styles.itemCard}>
                {/* Product thumb */}
                <View style={styles.itemThumbWrap}>
                    {item.product.imageUrl ? (
                        <Image source={{ uri: item.product.imageUrl }} style={styles.itemThumb} />
                    ) : (
                        <Tag size={24} color="#86a0cd" />
                    )}
                </View>

                {/* Info */}
                <View style={[styles.itemInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.itemName, { textAlign: tAlign }]} numberOfLines={1}>
                        {item.product.name}
                    </Text>
                    <Text style={styles.itemUnitPrice}>
                        {item.product.price?.toFixed(2)} DH / u
                    </Text>
                    <Text style={styles.itemSubtotal}>{subtotal.toFixed(2)} DH</Text>
                </View>

                {/* Controls */}
                <View style={styles.itemControls}>
                    {isActionLoading ? (
                        <ActivityIndicator size="small" color="#002045" style={{ width: 90 }} />
                    ) : (
                        <>
                            <View style={[styles.qtyControl, { flexDirection: flexDir }]}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={!!actionLoadingId}
                                >
                                    <Minus color="#002045" size={13} />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity
                                    style={styles.qtyBtnFill}
                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={!!actionLoadingId}
                                >
                                    <Plus color="#fff" size={13} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => removeItem(item.id)}
                                disabled={!!actionLoadingId}
                            >
                                <Trash2 size={15} color="#ba1a1a" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.headerIconBtn}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <ArrowLeft size={26} color="#002045" style={isRTL ? { transform: [{ scaleX: -1 }] } : null} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>
                        {language === 'fr' ? 'Ma Pania 🧺' : 'سلتي 🧺'}
                    </Text>
                    {itemsCount > 0 && (
                        <Text style={styles.headerSub}>{itemsCount} {language === 'fr' ? 'articles' : 'سلعة'}</Text>
                    )}
                </View>
                {pantry?.items?.length > 0 ? (
                    <TouchableOpacity
                        onPress={clearPantry}
                        style={styles.clearIconBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Trash2 color="#ba1a1a" size={20} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 44 }} />
                )}
            </View>

            {isLoading && !pantry ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#002045" />
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
                            ListHeaderComponent={
                                <View style={[styles.listHeader, { flexDirection: flexDir }]}>
                                    <Text style={styles.listTitle}>{language === 'fr' ? 'Vos Articles' : 'سلعك'}</Text>
                                    <Text style={styles.listCount}>{pantry.items.length} {language === 'fr' ? 'produits' : 'منتج'}</Text>
                                </View>
                            }
                        />
                    </Animated.View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {/* Summary row */}
                        <View style={[styles.summaryRow, { flexDirection: flexDir }]}>
                            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                <Text style={styles.totalLabel}>{language === 'fr' ? 'TOTAL ESTIMÉ' : 'التقدير الإجمالي'}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
                                    <Text style={styles.totalCurrency}> DH</Text>
                                </View>
                            </View>
                            <View style={[styles.articlesBadge, { flexDirection: flexDir }]}>
                                <ShoppingBag size={14} color="#002045" />
                                <Text style={styles.articlesBadgeText}>{itemsCount}</Text>
                            </View>
                        </View>

                        {/* Barcode button */}
                        <TouchableOpacity
                            style={[styles.barcodeBtn, { flexDirection: flexDir }]}
                            onPress={onGoToBarcode}
                            activeOpacity={0.85}
                        >
                            <View style={styles.barcodeBtnIconBox}>
                                <BarcodeIcon color="#fff" size={20} />
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
                        <ShoppingBag size={44} color="#86a0cd" />
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
    container: { flex: 1, backgroundColor: '#faf9fd' },

    header: {
        height: 70,
        paddingTop: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e3e2e6',
    },
    headerIconBtn: { padding: 10, width: 44, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#002045' },
    headerSub: { fontSize: 11, color: '#74777f', fontWeight: '500', marginTop: 2 },
    clearIconBtn: { padding: 10, width: 44, alignItems: 'center' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText: { color: '#74777f', fontSize: 13, fontWeight: '500' },

    list: { paddingHorizontal: 16, paddingBottom: 16 },
    listHeader: { paddingTop: 20, paddingBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
    listTitle: { fontSize: 20, fontWeight: '700', color: '#002045' },
    listCount: { fontSize: 13, color: '#74777f', fontWeight: '600' },

    // Item card
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e3e2e6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    itemThumbWrap: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#efedf1',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
    },
    itemThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    itemInfo: { flex: 1, marginHorizontal: 12 },
    itemName: { fontSize: 14, fontWeight: '700', color: '#1a1c1e', marginBottom: 2 },
    itemUnitPrice: { fontSize: 11, color: '#74777f', fontWeight: '500', marginBottom: 4 },
    itemSubtotal: { fontSize: 15, fontWeight: '800', color: '#002045' },

    itemControls: { alignItems: 'center', gap: 8 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f3f7', borderRadius: 10, padding: 3, gap: 2 },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#efedf1', alignItems: 'center', justifyContent: 'center' },
    qtyBtnFill: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#002045', alignItems: 'center', justifyContent: 'center' },
    qtyText: { fontSize: 13, fontWeight: '800', color: '#1a1c1e', minWidth: 22, textAlign: 'center' },
    removeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff4f4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffd6d6' },

    // Footer
    footer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        paddingBottom: 28,
        borderWidth: 1,
        borderColor: '#e3e2e6',
        shadowColor: '#002045',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 12,
        gap: 16,
    },
    summaryRow: { justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 11, fontWeight: '700', color: '#43474e', letterSpacing: 1, marginBottom: 2 },
    totalValue: { fontSize: 34, fontWeight: '800', color: '#002045', lineHeight: 38 },
    totalCurrency: { fontSize: 16, color: '#002045', fontWeight: '600' },
    articlesBadge: { backgroundColor: '#efedf1', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#e3e2e6' },
    articlesBadgeText: { fontSize: 16, fontWeight: '800', color: '#002045' },

    barcodeBtn: {
        height: 56,
        backgroundColor: '#a14009',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#a14009',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    barcodeBtnIconBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    barcodeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Empty
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 14 },
    emptyIconBg: { width: 96, height: 96, borderRadius: 30, backgroundColor: '#efedf1', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e3e2e6', marginBottom: 4 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1a1c1e' },
    emptySub: { fontSize: 13, color: '#74777f', textAlign: 'center', lineHeight: 20 },
    emptyBtn: {
        backgroundColor: '#a14009',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 4,
        shadowColor: '#a14009',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default PaniaScreen;
