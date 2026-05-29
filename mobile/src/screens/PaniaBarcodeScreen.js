import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Alert, Animated, Easing, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, Clock, Info, CheckCircle2, QrCode } from 'lucide-react-native';
import { Barcode } from 'expo-barcode-generator';
import axios from 'axios';
import { useLanguage } from '../services/LanguageContext';

const PaniaBarcodeScreen = ({ user, apiUrl, onBack }) => {
    const { flexDir, tAlign, isRTL, language } = useLanguage();
    const [barcodeToken, setBarcodeToken] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [progress, setProgress] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef(null);
    const totalDuration = useRef(300);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.015, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const fetchBarcode = async () => {
        setIsLoading(true);
        setBarcodeToken(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.get(`${apiUrl}/pantry/barcode`, config);
            setBarcodeToken(response.data.barcodeToken);
            const expires = new Date(response.data.expiresAt);
            setExpiresAt(expires);
            const now = new Date();
            totalDuration.current = Math.max(1, Math.floor((expires.getTime() - now.getTime()) / 1000));
            fadeAnim.setValue(0);
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]).start();
        } catch (err) {
            console.warn(err);
            Alert.alert('Erreur', "Impossible de générer le code-barres");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBarcode();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    useEffect(() => {
        if (!expiresAt) return;
        if (timerRef.current) clearInterval(timerRef.current);

        const updateTimer = () => {
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft('00:00');
                setProgress(0);
                clearInterval(timerRef.current);
                fetchBarcode();
                return;
            }
            const remainSec = Math.floor(diff / 1000);
            setProgress(remainSec / totalDuration.current);
            const m = Math.floor(remainSec / 60);
            const s = remainSec % 60;
            setTimeLeft(`${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`);
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
        return () => clearInterval(timerRef.current);
    }, [expiresAt]);

    const isUrgent = progress <= 0.2;
    const progressColor = progress > 0.5 ? '#10b981' : progress > 0.2 ? '#e06b3b' : '#ba1a1a';
    const progressBgColor = isUrgent ? '#fff4f4' : progress > 0.5 ? '#f0fdf4' : '#fffbeb';
    const progressBorderColor = isUrgent ? '#ffd6d6' : progress > 0.5 ? '#bbf7d0' : '#fef3c7';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: flexDir }]}>
                <TouchableOpacity onPress={onBack} style={styles.headerIconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ArrowLeft color="#002045" size={24} style={isRTL ? { transform: [{ scaleX: -1 }] } : null} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>
                        {language === 'fr' ? 'Mon Code-barres' : 'رمزي الشريطي'}
                    </Text>
                    <Text style={styles.headerSub}>Pania · 7anoti</Text>
                </View>
                <TouchableOpacity onPress={fetchBarcode} style={styles.headerIconBtn} disabled={isLoading} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#002045" />
                    ) : (
                        <RefreshCw color="#002045" size={20} />
                    )}
                </TouchableOpacity>
            </View>

            {isLoading && !barcodeToken ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#002045" />
                    <Text style={styles.loaderText}>
                        {language === 'fr' ? 'Génération en cours...' : 'جاري الإنشاء...'}
                    </Text>
                </View>
            ) : barcodeToken ? (
                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    {/* Status badge */}
                    <View style={[styles.statusBadge, { backgroundColor: progressBgColor, borderColor: progressBorderColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: progressColor }]} />
                        <Text style={[styles.statusText, { color: progressColor }]}>
                            {isUrgent
                                ? (language === 'fr' ? 'Expire bientôt — Actualisez' : 'تنتهي قريبًا — جدّد')
                                : (language === 'fr' ? 'Actif · Prêt à scanner' : 'نشط · جاهز للمسح')}
                        </Text>
                    </View>

                    {/* Main Barcode Card */}
                    <Animated.View style={[styles.barcodeCard, { transform: [{ scale: pulseAnim }] }]}>
                        {/* Top stripe */}
                        <View style={styles.cardStripe} />

                        {/* Card dots */}
                        <View style={[styles.cardDotsRow, { flexDirection: flexDir }]}>
                            <View style={[styles.cardDot, { backgroundColor: '#ba1a1a' }]} />
                            <View style={[styles.cardDot, { backgroundColor: '#e06b3b' }]} />
                            <View style={[styles.cardDot, { backgroundColor: '#10b981' }]} />
                            <View style={{ flex: 1 }} />
                            <Text style={styles.cardBrand}>7ANOTI</Text>
                        </View>

                        {/* Barcode */}
                        <View style={styles.barcodeWrapper}>
                            <Barcode
                                value={barcodeToken}
                                options={{
                                    format: 'CODE128',
                                    lineColor: '#002045',
                                    background: '#ffffff',
                                    height: 100,
                                    width: 1.3,
                                    displayValue: false,
                                    margin: 16,
                                }}
                            />
                        </View>

                        {/* Token */}
                        <View style={[styles.tokenRow, { flexDirection: flexDir }]}>
                            {barcodeToken.split('').map((char, i) => (
                                <Text key={i} style={[styles.tokenChar, char === '-' && styles.tokenDash]}>
                                    {char}
                                </Text>
                            ))}
                        </View>

                        {/* Tear line */}
                        <View style={styles.tearLine}>
                            <View style={styles.tearCircleLeft} />
                            <View style={styles.tearDash} />
                            <View style={styles.tearCircleRight} />
                        </View>

                        {/* Timer */}
                        <View style={[styles.timerRow, { flexDirection: flexDir }]}>
                            <View style={[styles.timerLeft, { flexDirection: flexDir }]}>
                                <Clock size={15} color="#74777f" />
                                <Text style={styles.timerLabel}>
                                    {language === 'fr' ? 'Expire dans' : 'ينتهي خلال'}
                                </Text>
                            </View>
                            <View style={[styles.timerPill, { borderColor: progressColor, backgroundColor: progressBgColor }]}>
                                <Text style={[styles.timerValue, { color: progressColor }]}>{timeLeft}</Text>
                            </View>
                        </View>

                        {/* Progress */}
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: progressColor }]} />
                        </View>
                    </Animated.View>

                    {/* How to use */}
                    <View style={[styles.infoCard, { flexDirection: flexDir }]}>
                        <View style={styles.infoIconBox}>
                            <Info size={18} color="#002045" />
                        </View>
                        <Text style={[styles.infoText, { textAlign: tAlign }]}>
                            {language === 'fr'
                                ? 'Présentez ce code-barres à votre épicier. Il le scannera pour voir vos articles et valider la commande directement.'
                                : 'اعرض هذا الرمز الشريطي على بقّالك. سيمسحه لرؤية طلباتك وتسجيلها في دفتره.'}
                        </Text>
                    </View>

                    {/* Steps */}
                    <View style={styles.stepsCard}>
                        <Text style={[styles.stepsTitle, { textAlign: tAlign }]}>
                            {language === 'fr' ? 'Comment ça marche ?' : 'كيف يعمل؟'}
                        </Text>
                        {[
                            { n: 1, fr: 'Ouvrez cette page chez l\'épicier', ar: 'افتح cette الصفحة عند البقال' },
                            { n: 2, fr: 'Il scanne le code-barres', ar: 'يمسح الرمز الشريطي' },
                            { n: 3, fr: 'Il prépare et enregistre votre commande', ar: 'يُحضّر ويُسجّل طلبك' },
                        ].map((step) => (
                            <View key={step.n} style={[styles.stepRow, { flexDirection: flexDir }]}>
                                <View style={styles.stepBullet}>
                                    <Text style={styles.stepBulletText}>{step.n}</Text>
                                </View>
                                <Text style={[styles.stepText, { textAlign: tAlign }]}>
                                    {language === 'fr' ? step.fr : step.ar}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Refresh */}
                    <TouchableOpacity style={[styles.refreshBtn, { flexDirection: flexDir }]} onPress={fetchBarcode} disabled={isLoading}>
                        <RefreshCw color="#fff" size={16} />
                        <Text style={styles.refreshBtnText}>
                            {language === 'fr' ? 'Générer un nouveau code' : 'إنشاء رمز جديد'}
                        </Text>
                    </TouchableOpacity>
                </Animated.ScrollView>
            ) : (
                <View style={styles.errorContainer}>
                    <Text style={{ fontSize: 48 }}>⚠️</Text>
                    <Text style={styles.errorTitle}>
                        {language === 'fr' ? 'Impossible de générer le code-barres' : 'تعذّر إنشاء الرمز الشريطي'}
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchBarcode}>
                        <Text style={styles.retryBtnText}>
                            {language === 'fr' ? 'Réessayer' : 'حاول مجددًا'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fd' },

    // Header
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
    headerIconBtn: { padding: 10, width: 44, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#002045' },
    headerSub: { fontSize: 11, color: '#74777f', fontWeight: '500', marginTop: 2 },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText: { color: '#74777f', fontSize: 13, fontWeight: '500' },

    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, alignItems: 'center' },

    // Status badge
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginBottom: 18 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: '700' },

    // Barcode card
    barcodeCard: { width: '100%', backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', shadowColor: '#002045', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8, marginBottom: 20, borderWidth: 1, borderColor: '#e3e2e6' },
    cardStripe: { height: 4, backgroundColor: '#002045' },
    cardDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f4f3f7' },
    cardDot: { width: 8, height: 8, borderRadius: 4 },
    cardBrand: { fontSize: 11, fontWeight: '900', color: '#002045', letterSpacing: 2 },

    barcodeWrapper: { paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff', width: '100%' },

    tokenRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 16, gap: 1 },
    tokenChar: { fontSize: 20, fontWeight: '800', color: '#002045', letterSpacing: 4, fontVariant: ['tabular-nums'] },
    tokenDash: { color: '#a14009' },

    tearLine: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 },
    tearCircleLeft: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#faf9fd', marginLeft: -12, borderWidth: 1, borderColor: '#e3e2e6' },
    tearDash: { flex: 1, height: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: '#e3e2e6' },
    tearCircleRight: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#faf9fd', marginRight: -12, borderWidth: 1, borderColor: '#e3e2e6' },

    timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },
    timerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timerLabel: { fontSize: 13, color: '#74777f', fontWeight: '600' },
    timerPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
    timerValue: { fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },

    progressBg: { height: 4, backgroundColor: '#efedf1', marginHorizontal: 18, marginBottom: 18, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },

    // Info card
    infoCard: { width: '100%', flexDirection: 'row', backgroundColor: '#efedf1', borderRadius: 16, padding: 16, gap: 12, alignItems: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: '#e3e2e6' },
    infoIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1, borderColor: '#e3e2e6' },
    infoText: { flex: 1, fontSize: 13, color: '#43474e', lineHeight: 19, fontWeight: '500' },

    // Steps
    stepsCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e3e2e6', gap: 12, shadowColor: '#002045', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    stepsTitle: { fontSize: 12, fontWeight: '800', color: '#74777f', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepBullet: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#002045', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    stepBulletText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    stepText: { flex: 1, fontSize: 13, color: '#43474e', fontWeight: '500', lineHeight: 18 },

    refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 16, width: '100%', backgroundColor: '#a14009', shadowColor: '#a14009', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
    refreshBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
    errorTitle: { fontSize: 16, fontWeight: '700', color: '#74777f', textAlign: 'center' },
    retryBtn: { backgroundColor: '#a14009', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14, marginTop: 4 },
    retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default PaniaBarcodeScreen;
