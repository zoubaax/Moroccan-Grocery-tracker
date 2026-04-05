import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Zap, Scan, Package } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ScannerScreen = ({ navigation, onScan }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#fff' }}>Démarrage du scanner...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Package size={64} color="#4f46e5" style={{ marginBottom: 20 }} />
                <Text style={styles.permissionText}>Accès Caméra Requis</Text>
                <Text style={styles.permissionSub}>Le staff doit scanner les codes-barres pour gérer l'inventaire.</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>AUTORISER LA CAMÉRA</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        onScan(data);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <X color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Produit</Text>
                <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.iconButton}>
                    <Zap color={torch ? "#fbbf24" : "#fff"} size={24} fill={torch ? "#fbbf24" : "none"} />
                </TouchableOpacity>
            </View>

            <CameraView 
                style={styles.camera} 
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                enableTorch={torch}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'code128'],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.unfocusedContainer}></View>
                    <View style={styles.middleContainer}>
                        <View style={styles.unfocusedContainer}></View>
                        <View style={styles.focusedContainer}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            {scanned && <View style={styles.scannedOverlay}><Text style={styles.scannedText}>DÉTECTÉ!</Text></View>}
                        </View>
                        <View style={styles.unfocusedContainer}></View>
                    </View>
                    <View style={styles.unfocusedContainer}>
                        <Text style={styles.instruction}>Ciblez le code-barres 7anoti</Text>
                    </View>
                </View>
            </CameraView>

            {scanned && (
                <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
                    <Scan color="#fff" size={20} />
                    <Text style={styles.rescanText}>SCANNER À NOUVEAU</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    iconButton: { padding: 10 },
    camera: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    unfocusedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    middleContainer: { height: 280, flexDirection: 'row' },
    focusedContainer: { width: 280, height: 280, borderRadius: 24, position: 'relative' },
    instruction: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, opacity: 0.8 },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#4f46e5', borderWidth: 5 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
    rescanButton: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#4f46e5', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    rescanText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    scannedOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(79, 70, 229, 0.6)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    scannedText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    permissionText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    permissionSub: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
    button: { backgroundColor: '#4f46e5', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

export default ScannerScreen;
