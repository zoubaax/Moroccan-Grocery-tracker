import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, Image, ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Trash2, Plus, Minus, CheckCircle, ShoppingBag,
    Banknote, ChevronLeft, Users, BookOpen, ArrowLeft, X
} from 'lucide-react-native';
import axios from 'axios';
import { generateAndShareReceipt } from '../services/ReceiptService';
import { useLanguage } from '../services/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SalesCartScreen = ({ cart, onUpdateCart, onClear, token, user, onComplete, onBack, selectedCustomer, onChooseCustomer }) => {
    const { t, isRTL, flexDir, tAlign } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(selectedCustomer ? 'CREDIT' : 'CASH');

    useEffect(() => {
        if (selectedCustomer) {
            setPaymentMethod('CREDIT');
        }
    }, [selectedCustomer]);

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQty = (id, delta) => {
        const newCart = cart.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        });
        onUpdateCart(newCart);
    };

    const removeItem = (id) => {
        onUpdateCart(cart.filter(i => i.id !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsLoading(true);
        try {
            const saleData = {
                paymentMethod,
                items: cart.map(item => ({ barcode: item.barcode, quantity: item.quantity })),
                customerId: selectedCustomer?.id
            };

            await axios.post(`${API_URL}/sales/process`, saleData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const mockSale = {
                id: Math.floor(1000 + Math.random() * 9000),
                transactionDate: new Date().toISOString(),
                paymentMethod: paymentMethod,
                totalAmount: total,
                shopOwner: {
                    name: user?.name || user?.username || "L'Épicier",
                    phone: user?.phone || "Non spécifié"
                },
                client: selectedCustomer ? {
                    name: selectedCustomer.name,
                    phone: selectedCustomer.phone
                } : null,
                items: cart.map(item => ({
                    product: { name: item.name },
                    unitPrice: item.price,
                    quantity: item.quantity
                }))
            };

            Alert.alert(
                t('common.success'),
                t('cart.checkoutSuccess', { total: total.toFixed(2) }),
                [
                    {
                        text: t('cart.receiptBtn'),
                        onPress: async () => {
                            await generateAndShareReceipt(mockSale);
                            onComplete();
                        }
                    },
                    {
                        text: t('cart.completeBtn'),
                        onPress: () => onComplete()
                    }
                ]
            );
        } catch (err) {
            console.error(err);
            Alert.alert(t('common.error'), err.response?.data?.message || t('cart.checkoutError'));
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemThumbWrap}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.productThumb} />
                ) : (
                    <ShoppingBag size={22} color="#86a0cd" />
                )}
            </View>
            <View style={[styles.itemInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.itemName, { textAlign: tAlign }]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemBarcode}>{item.barcode}</Text>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} DH</Text>
            </View>
            <View style={styles.itemActions}>
                <View style={[styles.qtyControl, { flexDirection: flexDir }]}>
                    <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                        <Minus size={14} color="#002045" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtnFill}>
                        <Plus size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                    <Trash2 size={16} color="#ba1a1a" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.headerIconBtn}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <ArrowLeft size={26} color="#002045" style={isRTL ? { transform: [{ scaleX: -1 }] } : null} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>7anoti</Text>
                <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                    <Text style={styles.clearText}>{t('cart.clearText')}</Text>
                </TouchableOpacity>
            </View>

            {/* Cart items list */}
            <FlatList
                data={cart}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={[styles.listSectionHeader, { flexDirection: flexDir }]}>
                        <Text style={styles.listSectionTitle}>{t('cart.checkoutTitle')}</Text>
                        {cart.length > 0 && (
                            <Text style={styles.listSectionCount}>{cart.length} articles</Text>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={styles.emptyIconBox}>
                            <ShoppingBag size={40} color="#86a0cd" />
                        </View>
                        <Text style={styles.emptyText}>{t('cart.emptyText')}</Text>
                    </View>
                }
            />

            {/* Sticky Bottom Panel */}
            <View style={styles.bottomPanel}>
                {/* Customer banner */}
                {selectedCustomer && (
                    <View style={[styles.customerBanner, { flexDirection: flexDir }]}>
                        <View style={[styles.customerBannerLeft, { flexDirection: flexDir }]}>
                            <View style={styles.customerAvatarBox}>
                                <Users size={14} color="#a14009" />
                            </View>
                            <Text style={styles.customerBannerText} numberOfLines={1}>{selectedCustomer.name}</Text>
                        </View>
                        <TouchableOpacity onPress={onChooseCustomer} style={styles.changeBtn}>
                            <Text style={styles.changeBtnText}>{t('cart.changeText')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Payment method selector */}
                <View style={[styles.paymentRow, { flexDirection: flexDir }]}>
                    <TouchableOpacity
                        onPress={() => setPaymentMethod('CASH')}
                        style={[styles.payBtn, paymentMethod === 'CASH' && styles.payBtnActiveCash, { flexDirection: flexDir }]}
                    >
                        <Banknote size={20} color={paymentMethod === 'CASH' ? '#002713' : '#43474e'} />
                        <Text style={[styles.payBtnText, paymentMethod === 'CASH' && styles.payBtnTextActiveCash]}>{t('cart.cashLabel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            if (!selectedCustomer) {
                                onChooseCustomer();
                            } else {
                                setPaymentMethod('CREDIT');
                            }
                        }}
                        style={[styles.payBtn, paymentMethod === 'CREDIT' && styles.payBtnActiveCarnet, { flexDirection: flexDir }]}
                    >
                        <BookOpen size={20} color={paymentMethod === 'CREDIT' ? '#fff' : '#43474e'} />
                        <Text style={[styles.payBtnText, paymentMethod === 'CREDIT' && styles.payBtnTextActiveCarnet]}>{t('cart.creditLabel')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Total & Checkout */}
                <View style={[styles.totalRow, { flexDirection: flexDir }]}>
                    <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                        <Text style={styles.totalLabel}>{t('cart.total')?.toUpperCase()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
                            <Text style={styles.totalCurrency}> DH</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutBtn, (cart.length === 0 || isLoading) && styles.disabled]}
                        onPress={handleCheckout}
                        disabled={cart.length === 0 || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <CheckCircle size={22} color="#fff" />
                                <Text style={styles.checkoutText}>{t('cart.checkoutBtn')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
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
    headerIconBtn: { padding: 10 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#a14009' },
    clearBtn: { padding: 8 },
    clearText: { fontSize: 13, fontWeight: '700', color: '#ba1a1a' },

    list: { paddingHorizontal: 16, paddingBottom: 16 },
    listSectionHeader: { paddingTop: 20, paddingBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
    listSectionTitle: { fontSize: 20, fontWeight: '700', color: '#002045' },
    listSectionCount: { fontSize: 13, color: '#74777f', fontWeight: '600' },

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
    },
    productThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    itemInfo: { flex: 1, marginHorizontal: 12 },
    itemName: { fontSize: 14, fontWeight: '700', color: '#1a1c1e', marginBottom: 2 },
    itemBarcode: { fontSize: 10, color: '#74777f', fontWeight: '500', marginBottom: 4 },
    itemPrice: { fontSize: 15, fontWeight: '800', color: '#002045' },

    itemActions: { alignItems: 'flex-end', gap: 8 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f3f7', borderRadius: 10, padding: 3, gap: 2 },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#efedf1', alignItems: 'center', justifyContent: 'center' },
    qtyBtnFill: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#002045', alignItems: 'center', justifyContent: 'center' },
    qtyText: { fontSize: 14, fontWeight: '800', color: '#1a1c1e', minWidth: 22, textAlign: 'center' },
    deleteBtn: { padding: 6 },

    empty: { alignItems: 'center', marginTop: 80, gap: 12 },
    emptyIconBox: { width: 88, height: 88, borderRadius: 28, backgroundColor: '#efedf1', alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 15, color: '#74777f', fontWeight: '600' },

    bottomPanel: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 16,
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

    customerBanner: {
        backgroundColor: '#fff4ee',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffdbcd',
    },
    customerBannerLeft: { alignItems: 'center', gap: 8, flex: 1 },
    customerAvatarBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#ffdbcd', alignItems: 'center', justifyContent: 'center' },
    customerBannerText: { fontSize: 13, fontWeight: '700', color: '#6a2500', flex: 1 },
    changeBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#ffdbcd' },
    changeBtnText: { fontSize: 11, fontWeight: '700', color: '#a14009' },

    paymentRow: { gap: 12 },
    payBtn: {
        flex: 1,
        height: 52,
        backgroundColor: '#f4f3f7',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#e3e2e6',
    },
    payBtnActiveCash: { backgroundColor: '#91f8b8', borderColor: '#91f8b8' },
    payBtnActiveCarnet: { backgroundColor: '#a14009', borderColor: '#a14009' },
    payBtnText: { fontSize: 13, fontWeight: '700', color: '#43474e' },
    payBtnTextActiveCash: { color: '#002713' },
    payBtnTextActiveCarnet: { color: '#fff' },

    totalRow: { justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 11, fontWeight: '700', color: '#43474e', letterSpacing: 1, marginBottom: 2 },
    totalValue: { fontSize: 34, fontWeight: '800', color: '#002045', lineHeight: 38 },
    totalCurrency: { fontSize: 16, color: '#002045', fontWeight: '600' },

    checkoutBtn: {
        height: 56,
        backgroundColor: '#002045',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 24,
        shadowColor: '#002045',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    disabled: { opacity: 0.5 },
});

export default SalesCartScreen;
