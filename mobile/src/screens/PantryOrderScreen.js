import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Image } from 'react-native';
import { ChevronLeft, User, Phone, CheckCircle, CreditCard, Banknote, Landmark, ShoppingBag } from 'lucide-react-native';
import axios from 'axios';
import { generateAndShareReceipt } from '../services/ReceiptService';
import { useLanguage } from '../services/LanguageContext';

const PantryOrderScreen = ({ scannedToken, token, user, onComplete, onBack }) => {
    const { t, flexDir, tAlign, isRTL, language } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [pantry, setPantry] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const resolvePantry = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/pantry/scan/${scannedToken}`, config);
            setPantry(response.data);
            
            // Default to CREDIT if the client has a valid account, otherwise CASH
            if (response.data.client) {
                setPaymentMethod('CREDIT');
            } else {
                setPaymentMethod('CASH');
            }
        } catch (err) {
            console.warn(err);
            Alert.alert(
                t('common.error'), 
                err.response?.data?.message || "Impossible de résoudre le code-barres client.",
                [{ text: "OK", onPress: onBack }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scannedToken) {
            resolvePantry();
        }
    }, [scannedToken]);

    const calculateTotal = () => {
        if (!pantry || !pantry.items) return 0;
        return pantry.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (!pantry) return;
        setIsCheckingOut(true);
        try {
            const checkoutData = {
                pantryId: pantry.id,
                paymentMethod: paymentMethod
            };
            
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/pantry/checkout`, checkoutData, config);

            const total = calculateTotal();
            const mockSale = {
                id: Math.floor(1000 + Math.random() * 9000), // Random 4-digit transaction reference for receipt
                transactionDate: new Date().toISOString(),
                paymentMethod: paymentMethod,
                totalAmount: total,
                shopOwner: {
                    name: user?.name || user?.username || "L'Épicier",
                    phone: user?.phone || "Non spécifié"
                },
                client: pantry.client ? {
                    name: pantry.client.name,
                    phone: pantry.client.phone
                } : null,
                items: pantry.items.map(item => ({
                    product: { name: item.product.name },
                    unitPrice: item.product.price,
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
            setIsCheckingOut(false);
        }
    };

    const renderItem = ({ item }) => {
        const subtotal = item.product.price * item.quantity;
        return (
            <View style={[styles.itemCard, { flexDirection: flexDir }]}>
                <View style={[styles.itemThumbWrap, isRTL ? { marginLeft: 12 } : { marginRight: 12 }]}>
                    {item.product.imageUrl ? (
                        <Image source={{ uri: item.product.imageUrl }} style={styles.productThumb} />
                    ) : (
                        <ShoppingBag size={22} color="#86a0cd" />
                    )}
                </View>
                <View style={[styles.itemInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                    <Text style={styles.itemQty}>{item.quantity} x {item.product.price?.toFixed(2)} DH</Text>
                </View>
                <Text style={styles.itemSubtotal}>{subtotal.toFixed(2)} DH</Text>
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#002045" />
                <Text style={styles.loaderText}>
                    {language === 'fr' ? "Résolution du Code-barres Pania..." : "جاري فك رمز السلة..."}
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity onPress={onBack} style={[styles.backBtn, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
                    <ChevronLeft color="#002045" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>
                    {language === 'fr' ? "COMMANDE PANIA CLIENT" : "طلب السلة للزبون"}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            {pantry && (
                <View style={{ flex: 1 }}>
                    {/* Client Info Banner */}
                    <View style={[styles.clientBanner, { flexDirection: flexDir }]}>
                        <View style={styles.avatar}>
                            <User color="#002045" size={22} />
                        </View>
                        <View style={[styles.clientInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                            <Text style={styles.clientName}>{pantry.client.name}</Text>
                            <View style={[styles.phoneRow, { flexDirection: flexDir, gap: 4 }]}>
                                <Phone size={12} color="#64748b" />
                                <Text style={styles.clientPhone}>{pantry.client.phone || "Pas de téléphone"}</Text>
                            </View>
                        </View>
                        <View style={[styles.balanceBox, pantry.client.currentBalance > 0 ? styles.boxRed : styles.boxGreen]}>
                            <Text style={styles.balanceLabel}>CARNET</Text>
                            <Text style={[styles.balanceValue, pantry.client.currentBalance > 0 ? styles.valRed : styles.valGreen]}>
                                {pantry.client.currentBalance?.toFixed(2)} DH
                            </Text>
                        </View>
                    </View>

                    {/* Items List */}
                    <FlatList 
                        data={pantry.items}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        ListHeaderComponent={() => (
                            <Text style={[styles.listHeader, { textAlign: tAlign }]}>
                                {language === 'fr' ? "ARTICLES DEMANDÉS" : "السلع المطلوبة"}
                            </Text>
                        )}
                    />

                    {/* Footer Payment & Checkout */}
                    <View style={styles.footer}>
                        <Text style={[styles.paymentHeader, { textAlign: tAlign }]}>
                            {language === 'fr' ? "MODE DE PAIEMENT" : "طريقة الدفع"}
                        </Text>
                        
                        <View style={[styles.paymentMethods, { flexDirection: flexDir }]}>
                            <TouchableOpacity 
                                style={[styles.methodBtn, paymentMethod === 'CASH' ? styles.methodBtnActive : null]}
                                onPress={() => setPaymentMethod('CASH')}
                            >
                                <Banknote color={paymentMethod === 'CASH' ? '#fff' : '#64748b'} size={20} />
                                <Text style={[styles.methodText, paymentMethod === 'CASH' ? styles.methodTextActive : null]}>
                                    {t('cart.cashLabel')}
                                </Text>
                            </TouchableOpacity>



                            <TouchableOpacity 
                                style={[styles.methodBtn, paymentMethod === 'CREDIT' ? styles.methodBtnActive : null]}
                                onPress={() => setPaymentMethod('CREDIT')}
                            >
                                <Landmark color={paymentMethod === 'CREDIT' ? '#fff' : '#64748b'} size={20} />
                                <Text style={[styles.methodText, paymentMethod === 'CREDIT' ? styles.methodTextActive : null]}>
                                    {t('cart.creditLabel')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.totalRow, { flexDirection: flexDir }]}>
                            <Text style={styles.totalLabel}>Total Commande</Text>
                            <Text style={styles.totalValue}>{calculateTotal().toFixed(2)} DH</Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.checkoutBtn} 
                            onPress={handleCheckout}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <CheckCircle color="#fff" size={20} />
                                    <Text style={styles.checkoutBtnText}>VALIDER L'ACHAT</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e3e2e6' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#faf9fd', borderWidth: 1, borderColor: '#e3e2e6' },
    title: { fontSize: 13, fontWeight: '800', color: '#002045', letterSpacing: 0.5 },

    // Loader
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
    loaderText: { fontSize: 13, fontWeight: '600', color: '#74777f' },

    // Client banner
    clientBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 14, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#e3e2e6', shadowColor: '#74777f', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#efedf1', alignItems: 'center', justifyContent: 'center' },
    clientInfo: { flex: 1 },
    clientName: { fontSize: 15, fontWeight: '800', color: '#002045', marginBottom: 3 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    clientPhone: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    balanceBox: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    boxRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    boxGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    balanceLabel: { fontSize: 8, fontWeight: '900', color: '#74777f', marginBottom: 2, letterSpacing: 0.5 },
    balanceValue: { fontSize: 13, fontWeight: '800' },
    valRed: { color: '#ef4444' },
    valGreen: { color: '#22c55e' },

    // List
    list: { paddingHorizontal: 14, paddingBottom: 20 },
    listHeader: { fontSize: 10, fontWeight: '800', color: '#74777f', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
    itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 13, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e3e2e6', shadowColor: '#74777f', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    itemThumbWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#efedf1', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    productThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '700', color: '#002045', marginBottom: 3 },
    itemQty: { fontSize: 12, color: '#74777f', fontWeight: '600' },
    itemSubtotal: { fontSize: 14, fontWeight: '800', color: '#a14009' },

    // Footer
    footer: { padding: 18, paddingBottom: 22, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e3e2e6', shadowColor: '#74777f', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 5 },
    paymentHeader: { fontSize: 10, fontWeight: '800', color: '#74777f', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
    paymentMethods: { flexDirection: 'row', gap: 8, marginBottom: 15 },
    methodBtn: { flex: 1, height: 46, borderRadius: 13, borderWidth: 1.5, borderColor: '#e3e2e6', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5, backgroundColor: '#faf9fd' },
    methodBtnActive: { backgroundColor: '#a14009', borderColor: '#a14009' },
    methodText: { fontSize: 11, fontWeight: '700', color: '#74777f' },
    methodTextActive: { color: '#fff' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e3e2e6', paddingTop: 14, marginBottom: 14 },
    totalLabel: { fontSize: 14, fontWeight: '700', color: '#002045' },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#a14009' },
    checkoutBtn: { backgroundColor: '#10b981', height: 52, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 5 },
    checkoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }
});

export default PantryOrderScreen;
