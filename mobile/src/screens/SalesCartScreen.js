import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Image } from 'react-native';
import { Trash2, Plus, Minus, CheckCircle, ShoppingBag, CreditCard, Banknote, ChevronLeft, Smartphone, Users } from 'lucide-react-native';
import axios from 'axios';
import { generateAndShareReceipt } from '../services/ReceiptService';
import { useLanguage } from '../services/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
                id: Math.floor(1000 + Math.random() * 9000), // Random 4-digit transaction reference for receipt
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
        <View style={[styles.itemCard, { flexDirection: flexDir }]}>
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productThumb} />
            ) : (
                <View style={styles.productThumbPlaceholder}>
                    <ShoppingBag size={20} color="#94a3b8" />
                </View>
            )}
            <View style={[styles.itemInfo, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.itemName, { textAlign: tAlign }]} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemBarcode}>{item.barcode}</Text>
                <Text style={styles.itemPrice}>{item.price} DH</Text>
            </View>
            <View style={[styles.itemActions, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                <View style={[styles.qtyControl, { flexDirection: flexDir }]}>
                    <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                        <Minus size={16} color="#4f46e5" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                        <Plus size={16} color="#4f46e5" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity onPress={onBack} style={[styles.headerIcon, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('cart.checkoutTitle')}</Text>
                <TouchableOpacity onPress={onClear}>
                    <Text style={styles.clearText}>{t('cart.clearText')}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={cart}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ShoppingBag size={64} color="#e2e8f0" />
                        <Text style={styles.emptyText}>{t('cart.emptyText')}</Text>
                    </View>
                }
            />

            <View style={styles.footer}>
                {selectedCustomer && (
                    <View style={[styles.customerCartBanner, { flexDirection: flexDir }]}>
                        <View style={[styles.customerCartBannerInfo, { flexDirection: flexDir, gap: 8 }]}>
                            <Users size={16} color="#4f46e5" />
                            <Text style={styles.customerCartBannerText}>{t('cart.customerLabel', { name: selectedCustomer.name })}</Text>
                        </View>
                        <TouchableOpacity onPress={onChooseCustomer} style={styles.changeCustomerBtn}>
                            <Text style={styles.changeCustomerText}>{t('cart.changeText')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.paymentSection, { flexDirection: flexDir }]}>
                    <TouchableOpacity 
                        onPress={() => setPaymentMethod('CASH')}
                        style={[styles.payBtn, paymentMethod === 'CASH' && styles.payBtnActive, { flexDirection: flexDir }]}
                    >
                        <Banknote size={20} color={paymentMethod === 'CASH' ? '#fff' : '#94a3b8'} />
                        <Text style={[styles.payText, paymentMethod === 'CASH' && styles.payTextActive]}>{t('cart.cashLabel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setPaymentMethod('CARD')}
                        style={[styles.payBtn, paymentMethod === 'CARD' && styles.payBtnActive, { flexDirection: flexDir }]}
                    >
                        <CreditCard size={20} color={paymentMethod === 'CARD' ? '#fff' : '#94a3b8'} />
                        <Text style={[styles.payText, paymentMethod === 'CARD' && styles.payTextActive]}>{t('cart.cardLabel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => {
                            if (!selectedCustomer) {
                                onChooseCustomer();
                            } else {
                                setPaymentMethod('CREDIT');
                            }
                        }}
                        style={[styles.payBtn, paymentMethod === 'CREDIT' && styles.payBtnCreditActive, { flexDirection: flexDir }]}
                    >
                        <Users size={20} color={paymentMethod === 'CREDIT' ? '#fff' : '#94a3b8'} />
                        <Text style={[styles.payText, paymentMethod === 'CREDIT' && styles.payTextActive]}>{t('cart.creditLabel')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.totalRow, { flexDirection: flexDir }]}>
                    <Text style={styles.totalLabel}>{t('cart.total')}</Text>
                    <Text style={styles.totalValue}>{total.toFixed(2)} DH</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.checkoutBtn, (cart.length === 0 || isLoading) && styles.disabled, { flexDirection: flexDir }]} 
                    onPress={handleCheckout}
                    disabled={cart.length === 0 || isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <CheckCircle size={22} color="#fff" />
                            <Text style={styles.checkoutText}>{t('cart.checkoutBtn')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', letterSpacing: 1 },
    clearText: { fontSize: 13, fontWeight: 'bold', color: '#ef4444' },
    list: { padding: 15 },
    itemCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    itemName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    itemBarcode: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginTop: 2 },
    itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#4f46e5', marginTop: 5 },
    itemInfo: { flex: 1, marginLeft: 12, marginRight: 10 },
    productThumb: { width: 55, height: 55, borderRadius: 12, backgroundColor: '#f8fafc' },
    productThumbPlaceholder: { width: 55, height: 55, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
    itemActions: { alignItems: 'flex-end', gap: 10 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4 },
    qtyBtn: { padding: 5 },
    qtyText: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginHorizontal: 10 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginTop: 10 },
    footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    totalLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    paymentSection: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    payBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9' },
    payBtnActive: { backgroundColor: '#4f46e5' },
    payBtnCreditActive: { backgroundColor: '#ef4444' },
    payText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
    payTextActive: { color: '#fff' },
    checkoutBtn: { height: 60, backgroundColor: '#1e293b', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    checkoutText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
    disabled: { opacity: 0.5 },
    customerCartBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f2ff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, marginBottom: 15 },
    customerCartBannerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    customerCartBannerText: { fontSize: 13, fontWeight: 'bold', color: '#4f46e5' },
    changeCustomerBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e7ff' },
    changeCustomerText: { fontSize: 11, fontWeight: 'bold', color: '#4f46e5' }
});

export default SalesCartScreen;
