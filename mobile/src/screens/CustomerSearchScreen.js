import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Platform, Keyboard } from 'react-native';
import { Search, User, Phone, CheckCircle2, ChevronRight, ArrowLeft, UserPlus } from 'lucide-react-native';
import axios from 'axios';

const CustomerSearchScreen = ({ onSelect, onBack, token, apiUrl }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (val) => {
        setQuery(val);
        if (val.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            // Search by phone or name (assuming backend supports it or filter clients)
            const response = await axios.get(`${apiUrl}/users/clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filtered = response.data.filter(u => 
                u.name.toLowerCase().includes(val.toLowerCase()) || 
                (u.phone && u.phone.includes(val))
            );
            setResults(filtered);
        } catch (err) {
            console.warn(err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.resultItem} 
            onPress={() => {
                Keyboard.dismiss();
                onSelect(item);
            }}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.phoneRow}>
                    <Phone size={12} color="#94a3b8" />
                    <Text style={styles.phone}>{item.phone || 'Pas de numéro'}</Text>
                </View>
            </View>
            <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>DETTE</Text>
                <Text style={styles.balanceValue}>{item.currentBalance?.toFixed(2) || '0.00'}</Text>
            </View>
            <ChevronRight color="#cbd5e1" size={20} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>CHOISIR LE CLIENT</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.searchContainer}>
                <Search color="#94a3b8" size={18} style={styles.searchIcon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Chercher par nom ou téléphone..."
                    placeholderTextColor="#94a3b8"
                    value={query}
                    onChangeText={handleSearch}
                    autoFocus
                />
                {isLoading && <ActivityIndicator style={styles.loader} color="#4f46e5" />}
            </View>

            <FlatList 
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={() => query.length >= 3 && results.length > 0 ? (
                    <Text style={styles.listHeader}>RESULTATS TROUVÉS ({results.length})</Text>
                ) : null}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        {query.length < 3 ? (
                            <>
                                <Search size={48} color="#f1f5f9" />
                                <Text style={styles.emptyText}>Tapez au moins 3 caractères</Text>
                            </>
                        ) : (
                            <>
                                <UserPlus size={48} color="#f1f5f9" />
                                <Text style={styles.emptyText}>Aucun client trouvé</Text>
                                <Text style={styles.emptySub}>Vérifiez l'orthographe ou le numéro</Text>
                            </>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', letterSpacing: 1 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', margin: 15, borderRadius: 15, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#f1f5f9' },
    searchIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    loader: { marginLeft: 10 },
    list: { padding: 15 },
    listHeader: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1, marginBottom: 15 },
    resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#4f46e5' },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    phone: { fontSize: 13, color: '#64748b' },
    balanceBox: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center', marginRight: 10 },
    balanceLabel: { fontSize: 8, fontWeight: 'black', color: '#ef4444', marginBottom: 2 },
    balanceValue: { fontSize: 14, fontWeight: 'bold', color: '#b91c1c' },
    empty: { marginTop: 100, alignItems: 'center' },
    emptyText: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: '#94a3b8' },
    emptySub: { marginTop: 5, fontSize: 13, color: '#cbd5e1' }
});

export default CustomerSearchScreen;
