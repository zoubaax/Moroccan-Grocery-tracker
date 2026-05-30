import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Zap, Scan, Package, CheckCircle } from 'lucide-react-native';
import { useLanguage } from '../services/LanguageContext';

const { width } = Dimensions.get('window');

const ScannerScreen = ({ navigation, onScan, continuous = false, lastAdded = null }) => {
    const { t, isRTL, flexDir } = useLanguage();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const isScanning = React.useRef(false);

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned || isScanning.current) return;
        
        isScanning.current = true;
        setScanned(true);
        onScan(data);

        // If in continuous mode (POS), auto-reset scan after 2s
        if (continuous) {
            setTimeout(() => {
                setScanned(false);
                isScanning.current = false;
            }, 2000); // Increased a bit for safety
        }
    };

    if (!permission) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color="#4f46e5" size="large" />
                <Text style={{ color: '#fff', marginTop: 10 }}>{t('scanner.initText')}</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Package size={64} color="#4f46e5" style={{ marginBottom: 20 }} />
                <Text style={styles.permissionText}>{t('scanner.permissionTitle')}</Text>
                <Text style={styles.permissionSub}>{t('scanner.permissionDesc')}</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>{t('scanner.permissionBtn')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{continuous ? t('scanner.headerContinuous') : t('scanner.headerSingle')}</Text>
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
                    {/* Feedback Toast */}
                    {lastAdded && (
                        <View style={[styles.toast, { flexDirection: flexDir }]}>
                            <CheckCircle size={18} color="#10b981" />
                            <Text style={styles.toastText}>{lastAdded}</Text>
                        </View>
                    )}

                    <View style={styles.unfocusedContainer}></View>
                    <View style={[styles.middleContainer, { flexDirection: flexDir }]}>
                        <View style={styles.unfocusedContainer}></View>
                        <View style={styles.focusedContainer}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            {scanned && (
                                <View style={styles.scannedOverlay}>
                                    <Text style={styles.scannedText}>{t('scanner.scannedOverlay')}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.unfocusedContainer}></View>
                    </View>
                    <View style={styles.unfocusedContainer}>
                        <Text style={styles.instruction}>{t('scanner.instructionText')}</Text>
                    </View>
                </View>
            </CameraView>

            {scanned && (
                <TouchableOpacity style={[styles.rescanButton, { flexDirection: flexDir }]} onPress={() => setScanned(false)}>
                    <Scan color="#fff" size={20} />
                    <Text style={styles.rescanText}>{t('scanner.rescanBtn')}</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#002045' },
    header: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    iconButton: { padding: 10 },
    camera: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    unfocusedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    middleContainer: { height: 280, flexDirection: 'row' },
    focusedContainer: { width: 280, height: 280, borderRadius: 24, position: 'relative' },
    instruction: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, opacity: 0.8 },
    toast: { position: 'absolute', top: 30, left: 20, right: 20, backgroundColor: '#fff', padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
    toastText: { color: '#002045', fontWeight: 'bold', fontSize: 15 },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#a14009', borderWidth: 5 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
    rescanButton: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#a14009', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    rescanText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    scannedOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(161, 64, 9, 0.6)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    scannedText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    permissionText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    permissionSub: { color: '#74777f', fontSize: 14, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
    button: { backgroundColor: '#a14009', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

export default ScannerScreen;
