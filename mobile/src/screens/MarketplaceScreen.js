import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, Alert, Animated, Image, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShoppingBag, Plus, Minus, Tag, ArrowLeft, ChevronRight, Store } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const MarketplaceScreen = ({ user, apiUrl, onBack, onGoToPania }) => {
    const { language, t, flexDir, tAlign, isRTL } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [pantry, setPantry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const cartAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

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
            setPantry(pantryRes.data);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]).start();
        } catch (err) {
            console.warn(err);
            Alert.alert(t('common.error'), t('login.errorNetwork'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const prevCount = useRef(0);
    const totalPantryItems = pantry?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    useEffect(() => {
        if (totalPantryItems !== prevCount.current && totalPantryItems > 0) {
            Animated.sequence([
                Animated.spring(cartAnim, { toValue: 1.08, useNativeDriver: true, speed: 20 }),
                Animated.spring(cartAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
            ]).start();
            prevCount.current = totalPantryItems;
        }
    }, [totalPantryItems]);

    const addToPantry = async (productId) => {
        setActionLoadingId(productId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${apiUrl}/pantry/add`, { productId, quantity: 1 }, config);
            const pantryRes = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(pantryRes.data);
        } catch (err) {
            Alert.alert(t('common.error'), "Impossible d'ajouter à la Pania");
        } finally {
            setActionLoadingId(null);
        }
    };

    const updateQuantity = async (itemId, newQty) => {
        setActionLoadingId(itemId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${apiUrl}/pantry/update/${itemId}?quantity=${newQty}`, {}, config);
            const pantryRes = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(pantryRes.data);
        } catch (err) {
            Alert.alert(t('common.error'), "Impossible de modifier la quantité");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCat = selectedCategory === 'ALL' || (p.category && p.category.id === selectedCategory);
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesSearch;
    });

    const getPantryItemInfo = (productId) => {
        if (!pantry || !pantry.items) return null;
        return pantry.items.find(item => item.product.id === productId);
    };

    const renderProductItem = ({ item }) => {
        const itemInfo = getPantryItemInfo(item.id);
        const qty = itemInfo ? itemInfo.quantity : 0;
        const isActionLoading = actionLoadingId === item.id || (itemInfo && actionLoadingId === itemInfo.id);
        const inCart = qty > 0;

        return (
            <View style={[styles.productCard, inCart && styles.productCardActive, { flexDirection: flexDir }]}>
                {/* Image / Icon */}
                <View style={styles.productImageBox}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                    ) : (
                        <View style={[styles.productImagePlaceholder, inCart && styles.productImagePlaceholderActive]}>
                            <Tag color={inCart ? '#6366f1' : '#94a3b8'} size={22} />
                        </View>
                    )}
                    {qty > 0 && (
                        <View style={styles.productBadge}>
                            <Text style={styles.productBadgeText}>{qty}</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={[styles.productInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                    <Text style={styles.productCategory} numberOfLines={1}>
                        {item.category ? item.category.name : 'Général'}
                    </Text>
                    <Text style={[styles.productName, { textAlign: tAlign }]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.productPrice}>{item.price?.toFixed(2)} DH</Text>
                </View>

                {/* Action */}
                <View style={styles.actionBox}>
                    {isActionLoading ? (
                        <ActivityIndicator size="small" color="#6366f1" style={{ width: 80 }} />
                    ) : qty > 0 ? (
                        <View style={[styles.qtyControl, { flexDirection: flexDir }]}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => updateQuantity(itemInfo.id, qty - 1)}
                            >
                                <Minus color="#6366f1" size={12} />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{qty}</Text>
                            <TouchableOpacity
                                style={[styles.qtyBtn, styles.qtyBtnFill]}
                                onPress={() => updateQuantity(itemInfo.id, qty + 1)}
                            >
                                <Plus color="#fff" size={12} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addBtn} onPress={() => addToPantry(item.id)} activeOpacity={0.8}>
                            <Plus color="#fff" size={16} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const allCategories = [{ id: 'ALL', name: language === 'fr' ? 'Tout' : 'الكل' }, ...categories];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <View style={styles.headerBtnInner}>
                        <Text style={styles.backArrow}>{'←'}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>7anoti Shop</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Accent line */}
            <View style={styles.topAccent} />

            {/* Search */}
            <View style={styles.searchWrapper}>
                <View style={[styles.searchBar, { flexDirection: flexDir }]}>
                    <Search color="#94a3b8" size={16} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <TextInput
                        style={[styles.searchInput, { textAlign: tAlign }]}
                        placeholder={language === 'fr' ? 'Rechercher un produit...' : 'ابحث عن منتج...'}
                        placeholderTextColor="#cbd5e1"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.clearSearch}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Categories */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={allCategories}
                keyExtractor={(item) => item.id.toString()}
                style={styles.categoriesRow}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.catPill, selectedCategory === item.id && styles.catPillActive]}
                        onPress={() => setSelectedCategory(item.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.catPillText, selectedCategory === item.id && styles.catPillTextActive]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Products */}
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loaderText}>{language === 'fr' ? 'Chargement...' : 'جاري التحميل...'}</Text>
                </View>
            ) : (
                <Animated.FlatList
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProductItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={isLoading}
                    onRefresh={loadData}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBox}>
                                <Store size={38} color="#c7d2fe" />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {language === 'fr' ? 'Aucun produit trouvé' : 'لم يتم العثور على منتجات'}
                            </Text>
                            <Text style={styles.emptySub}>
                                {language === 'fr' ? 'Essayez une autre recherche' : 'جرّب بحثًا آخر'}
                            </Text>
                        </View>
                    )}
                />
            )}

            {/* Floating Cart */}
            {totalPantryItems > 0 && (
                <Animated.View style={[styles.floatingCart, { transform: [{ scale: cartAnim }] }]}>
                    <TouchableOpacity
                        style={[styles.floatingCartBtn, { flexDirection: flexDir }]}
                        onPress={onGoToPania}
                        activeOpacity={0.9}
                    >
                        <View style={styles.cartIconBox}>
                            <ShoppingBag color="#fff" size={20} />
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{totalPantryItems}</Text>
                            </View>
                        </View>
                        <View style={[styles.cartTextBox, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.cartLabel}>
                                {language === 'fr' ? 'Ma Pania 🧺' : 'سلتي 🧺'}
                            </Text>
                            <Text style={styles.cartSub}>
                                {language === 'fr' ? 'Voir la sélection' : 'عرض الاختيار'}
                            </Text>
                        </View>
                        <ChevronRight color="rgba(255,255,255,0.7)" size={18} style={isRTL ? { transform: [{ scaleX: -1 }] } : null} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerBtnInner: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#e2e8f0' },
    backArrow: { fontSize: 20, color: '#1e293b', fontWeight: '600', lineHeight: 24 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', textAlign: 'center', flex: 1 },

    topAccent: { height: 3, backgroundColor: '#6366f1' },

    // Search
    searchWrapper: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
    searchInput: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
    clearSearch: { color: '#cbd5e1', fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },

    // Categories
    categoriesRow: { maxHeight: 44, marginBottom: 8 },
    catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', height: 34, alignItems: 'center', justifyContent: 'center' },
    catPillActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
    catPillText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    catPillTextActive: { color: '#fff' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
    listContent: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8, gap: 9 },

    // Product card
    productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
    productCardActive: { borderColor: '#c7d2fe', backgroundColor: '#fafbff' },

    productImageBox: { width: 58, height: 58, borderRadius: 14, overflow: 'visible', alignItems: 'center', justifyContent: 'center' },
    productImagePlaceholder: { width: 58, height: 58, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    productImagePlaceholderActive: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' },
    productImage: { width: 58, height: 58, borderRadius: 14 },
    productBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#10b981', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#f8fafc' },
    productBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

    productInfo: { flex: 1 },
    productCategory: { fontSize: 9, fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    productName: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4, lineHeight: 18 },
    productPrice: { fontSize: 14, fontWeight: '800', color: '#10b981' },

    actionBox: { minWidth: 76, alignItems: 'flex-end' },
    addBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f8fafc', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: '#e2e8f0' },
    qtyBtn: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
    qtyBtnFill: { backgroundColor: '#6366f1' },
    qtyText: { fontSize: 13, fontWeight: '800', color: '#0f172a', minWidth: 18, textAlign: 'center' },

    // Empty
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 70, gap: 10 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e7ff', marginBottom: 4 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: '#64748b' },
    emptySub: { fontSize: 12, color: '#cbd5e1', fontWeight: '500' },

    // Floating Cart
    floatingCart: { position: 'absolute', bottom: 24, left: 16, right: 16 },
    floatingCartBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4f46e5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 13, gap: 12, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
    cartIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    cartBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#10b981', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#4f46e5' },
    cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    cartTextBox: { flex: 1 },
    cartLabel: { color: '#fff', fontSize: 14, fontWeight: '800' },
    cartSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '500', marginTop: 1 },
});

export default MarketplaceScreen;
