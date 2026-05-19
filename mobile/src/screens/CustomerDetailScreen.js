import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Alert, Keyboard, Image, Linking } from 'react-native';
import { ArrowLeft, Phone, CreditCard, Calendar, ShoppingBag, DollarSign, Receipt, Share2 } from 'lucide-react-native';
import axios from 'axios';

const CustomerDetailScreen = ({ customer, onBack, token, apiUrl }) => {
    const [currentCustomer, setCurrentCustomer] = useState(customer);
    const [transactions, setTransactions] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    const fetchHistoryAndDetails = async () => {
        setIsHistoryLoading(true);
        try {
            // 1. Fetch updated user balance/details
            const userResponse = await axios.get(`${apiUrl}/users/phone/${currentCustomer.phone || 'none'}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null); // Fallback if phone search doesn't find it directly

            if (userResponse && userResponse.data) {
                setCurrentCustomer(userResponse.data);
            }

            // 2. Fetch transaction history
            const salesResponse = await axios.get(`${apiUrl}/sales/client/${currentCustomer.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(salesResponse.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryAndDetails();
    }, []);

    const handleShareCredentials = async () => {
        if (!currentCustomer.phone) {
            Alert.alert("Erreur", "Ce client n'a pas de numéro de téléphone enregistré.");
            return;
        }

        let formattedPhone = currentCustomer.phone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '212' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.substring(1);
        }

        const message = `Salam ${currentCustomer.name} 👋\n\nVoici tes identifiants pour te connecter à l'application *7anoti* et suivre tes crédits et tes achats :\n\n📱 *Identifiant* : ${currentCustomer.phone.trim()}\n🔑 *Mot de passe* : client123`;
        const encodedMsg = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

        try {
            const supported = await Linking.canOpenURL(whatsappUrl);
            if (supported) {
                await Linking.openURL(whatsappUrl);
            } else {
                Alert.alert("Erreur", "WhatsApp n'est pas installé sur cet appareil.");
            }
        } catch (err) {
            console.error("Error opening WhatsApp:", err);
            Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp.");
        }
    };

    const handlePayment = async () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Erreur", "Veuillez entrer un montant valide supérieur à 0.");
            return;
        }

        setIsPaymentLoading(true);
        Keyboard.dismiss();
        try {
            const response = await axios.post(`${apiUrl}/users/${currentCustomer.id}/pay-credit`, amount, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Alert.alert("Succès", response.data.message || "Paiement enregistré !");
            setPaymentAmount('');
            
            // Reload details to get new balance and history
            await fetchHistoryAndDetails();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || "Échec de l'enregistrement du paiement.";
            Alert.alert("Erreur", errMsg);
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const parts = dateStr.split('T');
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].substring(0, 5);
            return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeParts}`;
        } catch (e) {
            return dateStr;
        }
    };

    const renderTransactionItem = ({ item }) => (
        <View style={styles.txnCard}>
            <View style={styles.txnHeader}>
                <View style={styles.txnIdRow}>
                    <Receipt size={14} color="#64748b" />
                    <Text style={styles.txnId}>Achat #{item.id}</Text>
                </View>
                <Text style={styles.txnDate}>{formatDate(item.transactionDate)}</Text>
            </View>
            
            {/* List of items */}
            <View style={styles.txnItems}>
                {item.items && item.items.map((saleItem, index) => (
                    <View key={index} style={styles.txnItemRow}>
                        {saleItem.product?.imageUrl ? (
                            <Image source={{ uri: saleItem.product.imageUrl }} style={styles.txnProductThumb} />
                        ) : (
                            <View style={styles.txnProductThumbPlaceholder}>
                                <ShoppingBag size={12} color="#94a3b8" />
                            </View>
                        )}
                        <View style={styles.txnProductInfo}>
                            <Text style={styles.txnItemText} numberOfLines={1}>
                                {saleItem.product?.name || 'Produit inconnu'}
                            </Text>
                            <Text style={styles.txnItemQty}>
                                {saleItem.quantity} x {saleItem.unitPrice?.toFixed(2)} DH
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.txnFooter}>
                <Text style={[styles.methodBadge, item.paymentMethod === 'CREDIT' ? styles.badgeCredit : styles.badgeCash]}>
                    {item.paymentMethod}
                </Text>
                <Text style={styles.txnTotal}>{item.totalAmount?.toFixed(2)} DH</Text>
            </View>
        </View>
    );

    const hasDebt = currentCustomer.currentBalance > 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Fiche Client</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Profile Info */}
            <View style={styles.profileCard}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>{currentCustomer.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.profileName}>{currentCustomer.name}</Text>
                <View style={styles.profilePhoneRow}>
                    <Phone size={14} color="#94a3b8" />
                    <Text style={styles.profilePhone}>{currentCustomer.phone || 'Pas de numéro'}</Text>
                </View>

                {/* Balance Badge */}
                <View style={[styles.balanceSection, hasDebt ? styles.balanceSecRed : styles.balanceSecGreen]}>
                    <Text style={[styles.balanceSecLabel, hasDebt ? styles.balanceSecLabelRed : styles.balanceSecLabelGreen]}>
                        {hasDebt ? 'DETTE ACTUELLE' : 'PAS DE DETTE'}
                    </Text>
                    <Text style={[styles.balanceSecValue, hasDebt ? styles.balanceSecValueRed : styles.balanceSecValueGreen]}>
                        {currentCustomer.currentBalance?.toFixed(2) || '0.00'} DH
                    </Text>
                </View>

                {currentCustomer.phone ? (
                    <TouchableOpacity 
                        style={styles.shareCredentialsBtn}
                        onPress={handleShareCredentials}
                    >
                        <Share2 size={16} color="#4f46e5" />
                        <Text style={styles.shareCredentialsText}>Partager les accès via WhatsApp</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Payment Section (Pay Credit) */}
            <View style={styles.paymentCard}>
                <Text style={styles.cardTitle}>Enregistrer un Remboursement</Text>
                <View style={styles.payInputRow}>
                    <TextInput 
                        style={styles.payInput}
                        placeholder="Montant payé (MAD)"
                        placeholderTextColor="#cbd5e1"
                        value={paymentAmount}
                        onChangeText={setPaymentAmount}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity 
                        style={[styles.payBtn, isPaymentLoading && styles.disabled]}
                        onPress={handlePayment}
                        disabled={isPaymentLoading}
                    >
                        {isPaymentLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.payBtnText}>Valider</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* History Title */}
            <Text style={styles.historySectionTitle}>Historique d'Achats ({transactions.length})</Text>

            {/* Purchases List */}
            <FlatList 
                data={transactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTransactionItem}
                contentContainerStyle={styles.historyList}
                refreshing={isHistoryLoading}
                onRefresh={fetchHistoryAndDetails}
                ListEmptyComponent={() => (
                    <View style={styles.emptyHistory}>
                        {isHistoryLoading ? (
                            <ActivityIndicator size="large" color="#4f46e5" />
                        ) : (
                            <>
                                <ShoppingBag size={40} color="#cbd5e1" />
                                <Text style={styles.emptyHistoryText}>Aucun achat enregistré</Text>
                            </>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', letterSpacing: 1 },
    profileCard: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 25, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
    avatarLarge: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarLargeText: { fontSize: 26, fontWeight: 'bold', color: '#4f46e5' },
    profileName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    profilePhoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 15 },
    profilePhone: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    balanceSection: { width: '100%', alignItems: 'center', paddingVertical: 12, borderRadius: 15 },
    balanceSecRed: { backgroundColor: '#fef2f2' },
    balanceSecGreen: { backgroundColor: '#f0fdf4' },
    balanceSecLabel: { fontSize: 9, fontWeight: 'black', letterSpacing: 0.5, marginBottom: 4 },
    balanceSecLabelRed: { color: '#ef4444' },
    balanceSecLabelGreen: { color: '#22c55e' },
    balanceSecValue: { fontSize: 22, fontWeight: 'bold' },
    balanceSecValueRed: { color: '#b91c1c' },
    balanceSecValueGreen: { color: '#15803d' },
    paymentCard: { backgroundColor: '#fff', marginHorizontal: 15, marginTop: 15, padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
    cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 12, letterSpacing: 0.5 },
    payInputRow: { flexDirection: 'row', gap: 12 },
    payInput: { flex: 1, height: 48, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 15, fontSize: 15, color: '#1e293b', fontWeight: '600' },
    payBtn: { height: 48, paddingHorizontal: 20, backgroundColor: '#4f46e5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    payBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    historySectionTitle: { marginHorizontal: 20, marginTop: 25, marginBottom: 12, fontSize: 13, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5 },
    historyList: { paddingHorizontal: 15, paddingBottom: 25 },
    txnCard: { backgroundColor: '#fff', padding: 15, borderRadius: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
    txnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10, marginBottom: 10 },
    txnIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    txnId: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
    txnDate: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    txnItems: { gap: 6, marginBottom: 12 },
    txnItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    txnProductThumb: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#f8fafc' },
    txnProductThumbPlaceholder: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
    txnProductInfo: { flex: 1, marginLeft: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    txnItemText: { fontSize: 13, color: '#334155', fontWeight: '500', flex: 1, marginRight: 10 },
    txnItemQty: { fontSize: 12, color: '#64748b' },
    txnFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f8fafc' },
    methodBadge: { fontSize: 9, fontWeight: 'black', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeCredit: { backgroundColor: '#fee2e2', color: '#ef4444' },
    badgeCash: { backgroundColor: '#f1f5f9', color: '#475569' },
    txnTotal: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    emptyHistory: { alignItems: 'center', marginTop: 30 },
    emptyHistoryText: { fontSize: 14, color: '#94a3b8', marginTop: 10, fontWeight: 'bold' },
    disabled: { opacity: 0.6 },
    shareCredentialsBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        marginTop: 15, 
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        backgroundColor: '#f5f3ff', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#ddd6fe' 
    },
    shareCredentialsText: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: '#4f46e5' 
    }
});

export default CustomerDetailScreen;
