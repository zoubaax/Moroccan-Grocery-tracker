import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { Trash2, Plus, Minus, CheckCircle, ShoppingBag, CreditCard, Banknote, ChevronLeft } from 'lucide-react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const SalesCartScreen = ({ cart, onUpdateCart, onClear, token, onComplete, onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

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
                items: cart.map(item => ({ barcode: item.barcode, quantity: item.quantity }))
            };
            
            await axios.post(`${API_URL}/sales/process`, saleData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert("Succès", `Vente terminée ! Total: ${total} DH`);
            onComplete();
        } catch (err) {
            console.error(err);
            Alert.alert("Erreur", err.response?.data?.message || "Échec de la transaction.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBarcode}>{item.barcode}</Text>
                <Text style={styles.itemPrice}>{item.price} DH</Text>
            </View>
            <View style={styles.itemActions}>
                <View style={styles.qtyControl}>
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
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.headerIcon}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>PANIER DE VENTE</Text>
                <TouchableOpacity onPress={onClear}>
                    <Text style={styles.clearText}>VIDER</Text>
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
                        <Text style={styles.emptyText}>Bip bip ! Scannez des produits.</Text>
                    </View>
                }
            />

            <View style={styles.footer}>
                <View style={styles.paymentSection}>
                    <TouchableOpacity 
                        onPress={() => setPaymentMethod('CASH')}
                        style={[styles.payBtn, paymentMethod === 'CASH' && styles.payBtnActive]}
                    >
                        <Banknote size={20} color={paymentMethod === 'CASH' ? '#fff' : '#94a3b8'} />
                        <Text style={[styles.payText, paymentMethod === 'CASH' && styles.payTextActive]}>CASH</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setPaymentMethod('CARD')}
                        style={[styles.payBtn, paymentMethod === 'CARD' && styles.payBtnActive]}
                    >
                        <CreditCard size={20} color={paymentMethod === 'CARD' ? '#fff' : '#94a3b8'} />
                        <Text style={[styles.payText, paymentMethod === 'CARD' && styles.payTextActive]}>CARTE</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL À PAYER</Text>
                    <Text style={styles.totalValue}>{total.toFixed(2)} DH</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.checkoutBtn, (cart.length === 0 || isLoading) && styles.disabled]} 
                    onPress={handleCheckout}
                    disabled={cart.length === 0 || isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <CheckCircle size={22} color="#fff" />
                            <Text style={styles.checkoutText}>VALIDER LA VENTE</Text>
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
    payText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
    payTextActive: { color: '#fff' },
    checkoutBtn: { height: 60, backgroundColor: '#1e293b', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    checkoutText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
    disabled: { opacity: 0.5 }
});

export default SalesCartScreen;
