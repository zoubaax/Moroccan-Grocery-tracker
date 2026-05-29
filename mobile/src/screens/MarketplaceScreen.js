import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, Alert, Animated, Image, Easing, Dimensions, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShoppingBag, Plus, Minus, Tag, ChevronRight, Store, ArrowRight, X, ScanBarcode, ArrowLeft, XCircle } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';
import { getCategoryMeta } from '../services/categoryCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 32 - 16) / 2; // 16px padding on sides, 16px gap

const MarketplaceScreen = ({ user, apiUrl, onBack, onGoToPania }) => {
    const { language, t, flexDir, flexDirNatural, tAlign, isRTL } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [pantry, setPantry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    // Synchronous lock to prevent double-calls before React state re-renders
    const pendingRef = useRef(new Set());
    
    // Animations for cart panel
    const cartAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible

    const loadData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [productsRes, categoriesRes, pantryRes] = await Promise.all([
                axios.get(`${apiUrl}/products`, config),
                axios.get(`${apiUrl}/categories`, config),
                axios.get(`${apiUrl}/pantry/my`, config),
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setPantry(deduplicatePantry(pantryRes.data));
        } catch (err) {
            console.warn(err);
            Alert.alert(t('common.error'), t('login.errorNetwork'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Merge duplicate pantry rows for the same product into one entry
    const deduplicatePantry = (pantryData) => {
        if (!pantryData?.items) return pantryData;
        const merged = [];
        for (const item of pantryData.items) {
            const pid = item.product?.id;
            const existing = merged.find(m => m.product?.id == pid);
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                merged.push({ ...item });
            }
        }
        return { ...pantryData, items: merged };
    };

    const totalPantryItems = pantry?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const totalAmount = pantry?.items?.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0) || 0;

    useEffect(() => {
        if (totalPantryItems > 0) {
            Animated.spring(cartAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 4 }).start();
        } else {
            Animated.timing(cartAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
        }
    }, [totalPantryItems]);

    const allCategories = useMemo(
        () => [{ id: 'ALL', name: 'ALL' }, ...categories],
        [categories]
    );

    const getCategoryLabel = (cat) => {
        const meta = getCategoryMeta(cat.id, cat.name);
        if (meta.i18nKey) return t(meta.i18nKey);
        return cat.name;
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCat = selectedCategory === 'ALL' || (p.category && p.category.id === selectedCategory);
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    const addToPantry = async (productId) => {
        const key = `add_${productId}`;
        if (pendingRef.current.has(key)) return; // synchronous guard
        pendingRef.current.add(key);
        setActionLoadingId(productId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${apiUrl}/pantry/add`, { productId, quantity: 1 }, config);
            const pantryRes = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(deduplicatePantry(pantryRes.data));
        } catch (err) {
            Alert.alert(t('common.error'), t('marketplace.addError'));
        } finally {
            pendingRef.current.delete(key);
            setActionLoadingId(null);
        }
    };

    const updateQuantity = async (itemId, newQty) => {
        const key = `upd_${itemId}`;
        if (pendingRef.current.has(key)) return; // synchronous guard
        pendingRef.current.add(key);
        setActionLoadingId(itemId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${apiUrl}/pantry/update/${itemId}?quantity=${newQty}`, {}, config);
            const pantryRes = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(deduplicatePantry(pantryRes.data));
        } catch (err) {
            Alert.alert(t('common.error'), t('marketplace.qtyError'));
        } finally {
            pendingRef.current.delete(key);
            setActionLoadingId(null);
        }
    };

    const clearPantry = async () => {
        const key = 'clear';
        if (pendingRef.current.has(key)) return;
        pendingRef.current.add(key);
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${apiUrl}/pantry/clear`, config);
            const pantryRes = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(deduplicatePantry(pantryRes.data));
        } catch (err) {
            console.error(err);
        } finally {
            pendingRef.current.delete(key);
            setIsLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        const key = `remove_${itemId}`;
        if (pendingRef.current.has(key)) return;
        pendingRef.current.add(key);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${apiUrl}/pantry/remove/${itemId}`, config);
            const pantryRes = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(deduplicatePantry(pantryRes.data));
        } catch (err) {
            Alert.alert(t('common.error'), t('marketplace.qtyError'));
        } finally {
            pendingRef.current.delete(key);
        }
    };

    const getPantryItemInfo = (productId) => {
        if (!pantry || !pantry.items) return null;
        return pantry.items.find(item => item.product?.id == productId);
    };

    const renderProductItem = ({ item }) => {
        const itemInfo = getPantryItemInfo(item.id);
        const qty = itemInfo ? itemInfo.quantity : 0;
        const isActionLoading = actionLoadingId === item.id || (itemInfo && actionLoadingId === itemInfo.id);

        return (
            <TouchableOpacity 
                style={[styles.productCard, qty > 0 && styles.productCardActive]} 
                onPress={() => qty > 0 ? updateQuantity(itemInfo.id, qty + 1) : addToPantry(item.id)}
                activeOpacity={0.7}
                disabled={isActionLoading}
            >
                <View style={styles.productIconWrap}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                    ) : (
                        <Tag size={32} color={qty > 0 ? '#1a365d' : '#86a0cd'} />
                    )}
                    {qty > 0 && (
                        <View style={styles.qtyBadge}>
                            <Text style={styles.qtyBadgeText}>{qty}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price?.toFixed(2)} DH</Text>
                
                {isActionLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="small" color="#1a365d" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderCategoryChip = (cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
            <TouchableOpacity 
                key={cat.id} 
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
            >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                    {getCategoryLabel(cat)}
                </Text>
            </TouchableOpacity>
        );
    };

    const cartPanelTranslateY = cartAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0] // slide up from bottom
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                    <ArrowLeft size={28} color="#002045" style={isRTL ? { transform: [{ scaleX: -1 }] } : null} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>7anoti</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { flexDirection: flexDir }]}>
                    <Search color="#74777f" size={20} />
                    <TextInput
                        style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                        placeholder={language === 'fr' ? "Rechercher des produits..." : "البحث عن المنتجات..."}
                        placeholderTextColor="#74777f"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <XCircle size={20} color="#74777f" />
                        </TouchableOpacity>
                    ) : (
                        <ScanBarcode size={20} color="#002045" />
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={[styles.catScrollContent, { flexDirection: flexDir }]}>
                    {allCategories.map(renderCategoryChip)}
                </ScrollView>
            </View>

            <View style={[styles.sectionHeader, { flexDirection: flexDir }]}>
                <Text style={styles.sectionTitle}>{language === 'fr' ? "Produits Populaires" : "المنتجات الشائعة"}</Text>
            </View>

            {isLoading && products.length === 0 ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#002045" />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderProductItem}
                    numColumns={2}
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={{ gap: 16, flexDirection: flexDirNatural }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Store size={48} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>{language === 'fr' ? "Aucun produit trouvé" : "لم يتم العثور على منتجات"}</Text>
                        </View>
                    )}
                />
            )}

            <Animated.View style={[styles.checkoutPanel, { transform: [{ translateY: cartPanelTranslateY }] }]}>
                <View style={styles.checkoutPanelInner}>
                    <View style={styles.cartPreviewList}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.cartPreviewContent, { flexDirection: flexDirNatural }]}>
                            {pantry?.items?.map(item => (
                                <View key={item.id} style={[styles.cartPreviewItem, { flexDirection: flexDirNatural }]}>
                                    <View style={styles.cartPreviewIconBox}>
                                        {item.product.imageUrl ? (
                                            <Image source={{ uri: item.product.imageUrl }} style={styles.cartPreviewImg} />
                                        ) : (
                                            <ShoppingBag size={14} color="#a14009" />
                                        )}
                                    </View>
                                    <View style={{ marginLeft: 6 }}>
                                        <Text style={styles.cartPreviewQty}>{item.quantity}x</Text>
                                        <Text style={styles.cartPreviewName} numberOfLines={1}>{item.product.name}</Text>
                                    </View>
                                    <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => removeItem(item.id)}>
                                        <X size={14} color="#ba1a1a" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {(!pantry?.items || pantry.items.length === 0) && (
                                <Text style={styles.cartPreviewEmpty}>{language === 'fr' ? "Scannez ou appuyez sur les produits pour ajouter" : "امسح أو انقر لإضافة المنتجات"}</Text>
                            )}
                        </ScrollView>
                    </View>

                    <View style={styles.checkoutSummary}>
                        <View style={[styles.checkoutSummaryRow, { flexDirection: flexDir }]}>
                            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                <Text style={styles.totalLabel}>{language === 'fr' ? 'MONTANT TOTAL' : 'المبلغ الإجمالي'}</Text>
                                <View style={[styles.totalAmountRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <Text style={styles.totalAmount}>{totalAmount.toFixed(2)}</Text>
                                    <Text style={styles.totalCurrency}> DH</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.clearBtn, { flexDirection: flexDir }]} onPress={clearPantry}>
                                <Text style={styles.clearBtnText}>{language === 'fr' ? 'Vider' : 'مسح'}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.checkoutBtn, { flexDirection: flexDir }]} onPress={onGoToPania}>
                            <ShoppingBag size={24} color="#fff" />
                            <Text style={styles.checkoutBtnText}>{language === 'fr' ? 'Aller à Ma Pania' : 'الذهاب إلى سلتي'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },
    header: { minHeight: 70, paddingTop: 10, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    iconBtn: { padding: 12 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#a14009' },
    
    searchSection: { paddingHorizontal: 16, paddingBottom: 12 },
    searchBar: { height: 56, backgroundColor: '#ffffff', borderRadius: 16, alignItems: 'center', paddingHorizontal: 16, borderWidth: 2, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 16, color: '#1a1c1e', fontWeight: '500', marginHorizontal: 12 },
    
    catScroll: { marginHorizontal: -16 },
    catScrollContent: { paddingHorizontal: 16, gap: 8 },
    catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e3e2e6' },
    catChipActive: { backgroundColor: '#1a365d', borderColor: '#1a365d' },
    catChipText: { fontSize: 14, fontWeight: '600', color: '#43474e' },
    catChipTextActive: { color: '#ffffff' },

    sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#002045' },

    gridContent: { paddingHorizontal: 16, paddingBottom: 240, gap: 16 },
    productCard: { width: PRODUCT_CARD_WIDTH, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e3e2e6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: 'center' },
    productCardActive: { borderColor: '#adc7f7', backgroundColor: '#f1f0f4' },
    productIconWrap: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#efedf1', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    productImage: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
    productName: { fontSize: 13, color: '#1a1c1e', textAlign: 'center', marginBottom: 4, fontWeight: '500' },
    productPrice: { fontSize: 16, fontWeight: '700', color: '#002045' },
    
    qtyBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#10b981', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    qtyBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    checkoutPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 16, zIndex: 50 },
    checkoutPanelInner: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, shadowColor: '#002045', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
    cartPreviewList: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', paddingVertical: 12 },
    cartPreviewContent: { paddingHorizontal: 16, gap: 12, alignItems: 'center' },
    cartPreviewItem: { backgroundColor: '#f1f0f4', borderRadius: 20, padding: 6, paddingRight: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    cartPreviewIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffdbcd', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    cartPreviewImg: { width: '100%', height: '100%' },
    cartPreviewQty: { fontSize: 10, fontWeight: '800', color: '#1a1c1e' },
    cartPreviewName: { fontSize: 12, fontWeight: '600', color: '#1a1c1e', maxWidth: 80 },
    cartPreviewEmpty: { fontSize: 14, color: '#74777f', fontStyle: 'italic', paddingVertical: 8 },

    checkoutSummary: { padding: 16 },
    checkoutSummaryRow: { justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
    totalLabel: { fontSize: 11, fontWeight: '700', color: '#43474e', letterSpacing: 1, marginBottom: 2 },
    totalAmountRow: { alignItems: 'baseline' },
    totalAmount: { fontSize: 32, fontWeight: '700', color: '#002045', lineHeight: 36 },
    totalCurrency: { fontSize: 16, color: '#002045' },
    
    clearBtn: { alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 },
    clearBtnText: { fontSize: 14, fontWeight: '600', color: '#ba1a1a' },

    checkoutBtn: { height: 56, backgroundColor: '#a14009', borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#a14009', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    checkoutBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyTitle: { fontSize: 16, color: '#64748b', marginTop: 12, fontWeight: '600' }
});

export default MarketplaceScreen;
