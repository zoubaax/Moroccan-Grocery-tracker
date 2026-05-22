import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, Alert, Animated, Image, Easing, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShoppingBag, Plus, Minus, Tag, ChevronRight, Store } from 'lucide-react-native';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';
import { getCategoryMeta } from '../services/categoryCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CATEGORY_CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 10) / 2;

const MarketplaceScreen = ({ user, apiUrl, onBack, onGoToPania }) => {
    const { language, t, flexDir, flexDirNatural, tAlign, isRTL } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [pantry, setPantry] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const cartAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const browseMode = selectedCategory === null;

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

    const allCategories = useMemo(
        () => [{ id: 'ALL', name: 'ALL' }, ...categories],
        [categories]
    );

    const getCategoryLabel = (cat) => {
        const meta = getCategoryMeta(cat.id, cat.name);
        if (meta.i18nKey) return t(meta.i18nKey);
        return cat.name;
    };

    const formatProductCount = (count) => {
        if (language === 'fr' && count <= 1) {
            return t('marketplace.productCountOne', { count });
        }
        return t('marketplace.productCount', { count });
    };

    const getProductCount = (catId) => {
        if (catId === 'ALL') return products.length;
        return products.filter(p => p.category && p.category.id === catId).length;
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return allCategories;
        const q = searchQuery.toLowerCase();
        return allCategories.filter(c => getCategoryLabel(c).toLowerCase().includes(q));
    }, [allCategories, searchQuery, language, t]);

    const filteredProducts = useMemo(() => {
        if (browseMode) return [];
        return products.filter(p => {
            const matchesCat = selectedCategory === 'ALL' || (p.category && p.category.id === selectedCategory);
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery, browseMode]);

    const activeCategory = useMemo(
        () => allCategories.find(c => c.id === selectedCategory),
        [allCategories, selectedCategory]
    );

    const activeCategoryName = activeCategory ? getCategoryLabel(activeCategory) : '';
    const activeMeta = activeCategory ? getCategoryMeta(activeCategory.id, activeCategory.name) : null;
    const ActiveCategoryIcon = activeMeta?.icon;

    const selectCategory = (id) => {
        setSelectedCategory(id);
        setSearchQuery('');
        fadeAnim.setValue(0);
        slideAnim.setValue(16);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    };

    const backToCategories = () => {
        setSelectedCategory(null);
        setSearchQuery('');
    };

    const addToPantry = async (productId) => {
        setActionLoadingId(productId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${apiUrl}/pantry/add`, { productId, quantity: 1 }, config);
            const pantryRes = await axios.get(`${apiUrl}/pantry/my`, config);
            setPantry(pantryRes.data);
        } catch (err) {
            Alert.alert(t('common.error'), t('marketplace.addError'));
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
            Alert.alert(t('common.error'), t('marketplace.qtyError'));
        } finally {
            setActionLoadingId(null);
        }
    };

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
            <View style={[styles.productCard, inCart && styles.productCardActive, { flexDirection: flexDirNatural }]}>
                <View style={styles.productImageBox}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                    ) : (
                        <View style={[styles.productImagePlaceholder, inCart && styles.productImagePlaceholderActive]}>
                            <Tag color={inCart ? '#6366f1' : '#94a3b8'} size={22} />
                        </View>
                    )}
                    {qty > 0 && (
                        <View style={[styles.productBadge, isRTL ? styles.productBadgeRTL : null]}>
                            <Text style={styles.productBadgeText}>{qty}</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.productInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                    <Text style={[styles.productCategory, { textAlign: tAlign }]} numberOfLines={1}>
                        {item.category ? getCategoryLabel(item.category) : t('marketplace.catGeneral')}
                    </Text>
                    <Text style={[styles.productName, { textAlign: tAlign }]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={[styles.productPrice, { textAlign: tAlign }]}>{item.price?.toFixed(2)} DH</Text>
                </View>

                <View style={[styles.actionBox, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
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

    const renderCategoryCard = (cat) => {
        const meta = getCategoryMeta(cat.id, cat.name);
        const Icon = meta.icon;
        const count = getProductCount(cat.id);

        return (
            <TouchableOpacity
                key={cat.id.toString()}
                style={[styles.categoryCard, { width: CATEGORY_CARD_WIDTH, borderColor: meta.color + '55' }]}
                onPress={() => selectCategory(cat.id)}
                activeOpacity={0.85}
            >
                <View style={[styles.categoryIconWrap, { backgroundColor: meta.color + '20' }]}>
                    <Icon color={meta.color} size={28} strokeWidth={2} />
                </View>
                <Text style={[styles.categoryCardName, { textAlign: tAlign }]} numberOfLines={2}>
                    {getCategoryLabel(cat)}
                </Text>
                <Text style={[styles.categoryCardCount, { textAlign: tAlign }]}>
                    {formatProductCount(count)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('marketplace.title')}</Text>
                <TouchableOpacity
                    onPress={browseMode ? onBack : backToCategories}
                    style={[styles.headerBackBtn, isRTL ? styles.headerBackBtnRtl : styles.headerBackBtnLtr]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={t('common.back')}
                >
                    <Text style={styles.headerBackArrow}>{isRTL ? '→' : '←'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.topAccent} />

            <View style={styles.searchWrapper}>
                <View style={[styles.searchBar, { flexDirection: flexDir }]}>
                    <Search color="#94a3b8" size={16} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <TextInput
                        style={[styles.searchInput, { textAlign: tAlign }]}
                        placeholder={browseMode ? t('marketplace.searchBrowse') : t('marketplace.searchProducts')}
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

            {isLoading && products.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loaderText}>{t('marketplace.loading')}</Text>
                </View>
            ) : browseMode ? (
                <Animated.ScrollView
                    style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={styles.browseContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[styles.sectionTitle, { textAlign: tAlign }]}>{t('marketplace.categoriesTitle')}</Text>
                    <Text style={[styles.sectionSub, { textAlign: tAlign }]}>{t('marketplace.categoriesSub')}</Text>

                    <View style={styles.categoryGrid}>
                        {filteredCategories.map(renderCategoryCard)}
                    </View>

                    {filteredCategories.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>{t('marketplace.noCategory')}</Text>
                        </View>
                    )}
                </Animated.ScrollView>
            ) : (
                <>
                    <View style={[styles.activeCategoryBar, { flexDirection: flexDir }]}>
                        <View style={[styles.activeCategoryLeft, { flexDirection: flexDir }]}>
                            {activeMeta && ActiveCategoryIcon && (
                                <View style={[styles.activeCategoryIcon, { backgroundColor: activeMeta.color + '20' }]}>
                                    <ActiveCategoryIcon color={activeMeta.color} size={16} strokeWidth={2.5} />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.activeCategoryName, { textAlign: tAlign }]} numberOfLines={1}>
                                    {activeCategoryName}
                                </Text>
                                <Text style={[styles.activeCategoryCount, { textAlign: tAlign }]}>
                                    {formatProductCount(filteredProducts.length)}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={backToCategories} style={styles.changeCategoryBtn} activeOpacity={0.8}>
                            <Text style={styles.changeCategoryText}>{t('marketplace.changeCategory')}</Text>
                        </TouchableOpacity>
                    </View>

                    <Animated.FlatList
                        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
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
                                <Text style={styles.emptyTitle}>{t('marketplace.noProducts')}</Text>
                                <Text style={styles.emptySub}>{t('marketplace.noProductsSub')}</Text>
                            </View>
                        )}
                    />
                </>
            )}

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
                            <Text style={styles.cartLabel}>{t('marketplace.myPania')}</Text>
                            <Text style={styles.cartSub}>{t('marketplace.viewSelection')}</Text>
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

    header: {
        position: 'relative',
        minHeight: 56,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 64,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
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

    topAccent: { height: 3, backgroundColor: '#6366f1' },

    searchWrapper: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#e2e8f0' },
    searchInput: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
    clearSearch: { color: '#cbd5e1', fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },

    browseContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 100 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
    sectionSub: { fontSize: 13, color: '#94a3b8', fontWeight: '500', marginBottom: 18, lineHeight: 20 },

    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1.5,
        minHeight: 128,
        alignItems: 'center',
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    categoryIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10, alignSelf: 'center' },
    categoryCardName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4, lineHeight: 18 },
    categoryCardCount: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },

    activeCategoryBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    activeCategoryLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 8 },
    activeCategoryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    activeCategoryName: { fontSize: 15, fontWeight: '700', color: '#0f172a', flexShrink: 1 },
    activeCategoryCount: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    changeCategoryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' },
    changeCategoryText: { fontSize: 12, fontWeight: '700', color: '#6366f1' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
    listContent: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 10, gap: 9 },

    productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
    productCardActive: { borderColor: '#c7d2fe', backgroundColor: '#fafbff' },

    productImageBox: { width: 58, height: 58, borderRadius: 14, overflow: 'visible', alignItems: 'center', justifyContent: 'center' },
    productImagePlaceholder: { width: 58, height: 58, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    productImagePlaceholderActive: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' },
    productImage: { width: 58, height: 58, borderRadius: 14 },
    productBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#10b981', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#f8fafc' },
    productBadgeRTL: { right: undefined, left: -5 },
    productBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

    productInfo: { flex: 1 },
    productCategory: { fontSize: 9, fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    productName: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4, lineHeight: 18 },
    productPrice: { fontSize: 14, fontWeight: '800', color: '#10b981' },

    actionBox: { minWidth: 76 },
    addBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f8fafc', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: '#e2e8f0' },
    qtyBtn: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
    qtyBtnFill: { backgroundColor: '#6366f1' },
    qtyText: { fontSize: 13, fontWeight: '800', color: '#0f172a', minWidth: 18, textAlign: 'center' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 10, paddingHorizontal: 20 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e7ff', marginBottom: 4 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: '#64748b', textAlign: 'center' },
    emptySub: { fontSize: 12, color: '#cbd5e1', fontWeight: '500', textAlign: 'center' },

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
