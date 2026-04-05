import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { ShoppingBag, CreditCard, Power, Store, Users, ArrowRight } from 'lucide-react-native';

const PortalScreen = ({ onSelectMode, onLogout, userName }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>Marahba, {userName}!</Text>
                    <Text style={styles.subtitle}>7anotak Portal Gestion</Text>
                </View>
                <TouchableOpacity onPress={onLogout} style={styles.logoutCircle}>
                    <Power color="#ef4444" size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>CHOISISSEZ UNE ACTION</Text>
                
                {/* Normal Sell Choice */}
                <TouchableOpacity 
                    style={[styles.card, styles.sellCard]} 
                    onPress={() => onSelectMode('NORMAL')}
                >
                    <View style={[styles.iconBox, styles.sellIcon]}>
                        <ShoppingBag color="#fff" size={32} />
                    </View>
                    <View style={styles.textDetails}>
                        <Text style={styles.cardTitle}>VENTE NORMALE</Text>
                        <Text style={styles.cardDesc}>Pour les clients de passage (Cash/Card)</Text>
                    </View>
                    <ArrowRight color="#cbd5e1" size={20} />
                </TouchableOpacity>

                {/* Credit Client Choice */}
                <TouchableOpacity 
                    style={[styles.card, styles.creditCard]} 
                    onPress={() => onSelectMode('CREDIT')}
                >
                    <View style={[styles.iconBox, styles.creditIcon]}>
                        <Users color="#fff" size={32} />
                    </View>
                    <View style={styles.textDetails}>
                        <Text style={styles.cardTitle}>CARNET (CREDIT)</Text>
                        <Text style={styles.cardDesc}>Trouver un client et ajouter à son compte</Text>
                    </View>
                    <ArrowRight color="#cbd5e1" size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Système 7anoti v2.0</Text>
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>EN LIGNE</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, paddingTop: Platform.OS === 'ios' ? 20 : 40 },
    welcome: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 14, color: '#64748b', fontWeight: '500', opacity: 0.8 },
    logoutCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, padding: 20, gap: 15 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 10, paddingLeft: 5 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, borderWeight: 1, borderColor: '#f1f5f9' },
    iconBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    sellCard: { borderLeftWidth: 6, borderLeftColor: '#4f46e5' },
    sellIcon: { backgroundColor: '#4f46e5' },
    creditCard: { borderLeftWidth: 6, borderLeftColor: '#0ea5e9' },
    creditIcon: { backgroundColor: '#0ea5e9' },
    textDetails: { flex: 1, marginLeft: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
    cardDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },
    footer: { padding: 25, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statsLabel: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', px: 10, py: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
    onlineText: { fontSize: 10, color: '#166534', fontWeight: 'bold' }
});

export default PortalScreen;
