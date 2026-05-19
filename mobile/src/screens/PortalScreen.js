import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';
import { ShoppingBag, Power, Users, ArrowRight, TrendingUp, DollarSign, BarChart2 } from 'lucide-react-native';

const PortalScreen = ({ onSelectMode, onLogout, userName }) => {
    return (
        <ScrollView style={styles.container} bounces={false}>
            {/* Header Banner */}
            <View style={styles.headerBanner}>
                <SafeAreaView>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>Salam, {userName} 👋</Text>
                            <Text style={styles.headerSubtitle}>Propriétaire de commerce</Text>
                        </View>
                        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                            <Power color="#ef4444" size={18} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {/* Metrics Dashboard (Floating Card) */}
            <View style={styles.dashboardWrapper}>
                <View style={styles.dashboardCard}>
                    <Text style={styles.dashboardTitle}>RÉSUMÉ DU JOUR</Text>
                    <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                            <View style={[styles.metricIconBox, { backgroundColor: '#eef2ff' }]}>
                                <TrendingUp color="#4f46e5" size={18} />
                            </View>
                            <View>
                                <Text style={styles.metricValue}>1,450.00 DH</Text>
                                <Text style={styles.metricLabel}>Ventes Estimées</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.metricItem}>
                            <View style={[styles.metricIconBox, { backgroundColor: '#fef2f2' }]}>
                                <DollarSign color="#ef4444" size={18} />
                            </View>
                            <View>
                                <Text style={styles.metricValue}>850.00 DH</Text>
                                <Text style={styles.metricLabel}>Crédit En Cours</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Actions Grid */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>GESTION COMMERCIALE</Text>

                {/* Vente Normale Card */}
                <TouchableOpacity 
                    style={[styles.actionCard, styles.sellCard]} 
                    onPress={() => onSelectMode('NORMAL')}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.actionIconBox}>
                            <ShoppingBag color="#fff" size={28} />
                        </View>
                        <View style={styles.cardTextDetails}>
                            <Text style={styles.actionCardTitle}>VENTE NORMALE</Text>
                            <Text style={styles.actionCardDesc}>Lancer le scanner pour encaisser un client rapidement (Cash / Carte)</Text>
                        </View>
                    </View>
                    <View style={styles.arrowCircle}>
                        <ArrowRight color="#4f46e5" size={20} />
                    </View>
                </TouchableOpacity>

                {/* Credit Card */}
                <TouchableOpacity 
                    style={[styles.actionCard, styles.creditCard]} 
                    onPress={() => onSelectMode('CREDIT')}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.actionIconBox}>
                            <Users color="#fff" size={28} />
                        </View>
                        <View style={styles.cardTextDetails}>
                            <Text style={styles.actionCardTitle}>CARNET DE CRÉDITS</Text>
                            <Text style={styles.actionCardDesc}>Gérer les comptes clients, enregistrer les dettes et remboursements</Text>
                        </View>
                    </View>
                    <View style={styles.arrowCircle}>
                        <ArrowRight color="#0ea5e9" size={20} />
                    </View>
                </TouchableOpacity>

                {/* Statistics Card */}
                <TouchableOpacity 
                    style={[styles.actionCard, styles.statsCardAction]} 
                    onPress={() => onSelectMode('STATS')}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.actionIconBox}>
                            <BarChart2 color="#fff" size={28} />
                        </View>
                        <View style={styles.cardTextDetails}>
                            <Text style={styles.actionCardTitle}>STATISTIQUES & VENTES</Text>
                            <Text style={styles.actionCardDesc}>Consulter le journal de ventes, les revenus et les produits vendus</Text>
                        </View>
                    </View>
                    <View style={styles.arrowCircle}>
                        <ArrowRight color="#10b981" size={20} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.appVersion}>7anoti v2.0 • Propulsé par Cloud</Text>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>EN LIGNE</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerBanner: {
        backgroundColor: '#1e1b4b', // Deep indigo
        paddingBottom: 50,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#a5b4fc',
        marginTop: 2,
        fontWeight: '500',
    },
    logoutBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    dashboardWrapper: {
        paddingHorizontal: 20,
        marginTop: -30, // Pulls the card up over the curved header
        marginBottom: 25,
    },
    dashboardCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#1e1b4b',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    dashboardTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94a3b8',
        letterSpacing: 1.5,
        marginBottom: 15,
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metricIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    metricLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 1,
    },
    divider: {
        width: 1,
        height: 35,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 15,
    },
    content: {
        paddingHorizontal: 20,
        gap: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
        letterSpacing: 1.5,
        marginBottom: 5,
        paddingLeft: 4,
    },
    actionCard: {
        borderRadius: 28,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    sellCard: {
        backgroundColor: '#4f46e5',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
    },
    creditCard: {
        backgroundColor: '#0ea5e9',
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
    },
    statsCardAction: {
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionIconBox: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    cardTextDetails: {
        flex: 1,
        paddingRight: 10,
    },
    actionCardTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    actionCardDesc: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
        lineHeight: 18,
    },
    arrowCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 35,
        marginTop: 20,
    },
    appVersion: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    statusText: {
        fontSize: 10,
        color: '#166534',
        fontWeight: 'bold',
    },
});

export default PortalScreen;
