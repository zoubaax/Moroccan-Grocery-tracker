import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar, TouchableOpacity, Text, Alert } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductForm from './src/screens/ProductForm';
import SalesCartScreen from './src/screens/SalesCartScreen';
import PortalScreen from './src/screens/PortalScreen';
import CustomerSearchScreen from './src/screens/CustomerSearchScreen';
import CustomerCreateScreen from './src/screens/CustomerCreateScreen';
import CustomerDetailScreen from './src/screens/CustomerDetailScreen';
import SalesReportScreen from './src/screens/SalesReportScreen';
import ClientDashboardScreen from './src/screens/ClientDashboardScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import PaniaScreen from './src/screens/PaniaScreen';
import PaniaBarcodeScreen from './src/screens/PaniaBarcodeScreen';
import PantryOrderScreen from './src/screens/PantryOrderScreen';
import * as SplashScreen from 'expo-splash-screen';
import { ArrowLeft, ShoppingCart, User } from 'lucide-react-native';
import axios from 'axios';
import { LanguageProvider, useLanguage } from './src/services/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { t, isRTL, flexDir, tAlign, isLoaded: languageLoaded } = useLanguage();
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // Staff flow states
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [scannedToken, setScannedToken] = useState(null);
  
  // Sales flow states
  const [salesCart, setSalesCart] = useState([]);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null);
  const [saleMode, setSaleMode] = useState('NORMAL'); // 'NORMAL' or 'CREDIT'
  
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'ROLE_MOUL7ANOUT') {
        setCurrentScreen('portal');
    } else if (userData.role === 'ROLE_CLIENT') {
        setCurrentScreen('client_dashboard');
    } else {
        setCurrentScreen('scanner');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    setSalesCart([]);
    setSelectedCustomer(null);
  };

  const handleRefreshPlan = async () => {
    if (!user?.token) return;
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.data) {
        setUser(prev => ({
          ...prev,
          features: response.data.features,
          subscriptionPlan: response.data.subscriptionPlan,
        }));
      }
    } catch (err) {
      console.warn('Plan refresh failed:', err);
    }
  };

  const handleSelectPortalMode = (mode) => {
      const features = user?.features || { sales: true, credit: true, marketplace: false, aiAutomation: false };

      if (mode === 'MARKETPLACE' && !features.marketplace) {
          Alert.alert(t('common.error'), t('subscription.marketplaceBlocked'));
          return;
      }
      if (mode === 'AI' && !features.aiAutomation) {
          Alert.alert(t('common.error'), t('subscription.aiBlocked'));
          return;
      }

      setSaleMode(mode === 'AI' ? 'CREDIT' : (mode === 'MARKETPLACE' ? 'NORMAL' : mode));
      if (mode === 'CREDIT' || mode === 'AI') {
          setCurrentScreen('customer_search');
      } else if (mode === 'STATS') {
          setCurrentScreen('sales_report');
      } else {
          setSelectedCustomer(null);
          setCurrentScreen('scanner');
      }
  };

  const handleCustomerSelect = (customer) => {
      if (saleMode === 'CREDIT') {
          setSelectedCustomerProfile(customer);
          setCurrentScreen('customer_detail');
      } else {
          setSelectedCustomer(customer);
          setCurrentScreen('cart');
      }
  };

  const handleScan = async (barcode) => {
    if (barcode && barcode.startsWith('PAN-')) {
        if (user?.role === 'ROLE_MOUL7ANOUT' && !user?.features?.marketplace) {
            Alert.alert(t('common.error'), t('subscription.marketplaceBlocked'));
            return;
        }
        setScannedToken(barcode);
        setCurrentScreen('pantry_order');
        return;
    }

    if (user?.role === 'ROLE_MOUL7ANOUT') {
        try {
            const response = await axios.get(`${API_URL}/products/barcode/${barcode}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const product = response.data;
            if (product) {
                setSalesCart(prev => {
                    const existing = prev.find(item => item.id === product.id);
                    if (existing) {
                        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
                    }
                    return [...prev, { ...product, quantity: 1 }];
                });
                setLastAddedProduct(product.name);
                setTimeout(() => setLastAddedProduct(null), 2500);
            }
        } catch (err) {
            Alert.alert("Erreur", "Produit non trouvé dans 7anoti.");
        }
    } else {
        setScannedBarcode(barcode);
        setCurrentScreen('form');
    }
  };

  const handleComplete = () => {
    setScannedBarcode(null);
    setScannedToken(null);
    setSalesCart([]);
    setSelectedCustomer(null);
    setSaleMode('NORMAL');
    if (user?.role === 'ROLE_MOUL7ANOUT') {
        setCurrentScreen('portal');
    } else {
        setCurrentScreen('scanner');
    }
  };

  const renderHeader = (titleKey, onBack) => (
    <View style={[styles.appHeader, { flexDirection: flexDir }]}>
      <TouchableOpacity onPress={onBack} style={[styles.backButton, isRTL ? { transform: [{ rotate: '180deg' }] } : null]}>
        <ArrowLeft color="#1e293b" size={24} />
      </TouchableOpacity>
      <Text style={[styles.appTitle, { textAlign: tAlign }]}>{t(titleKey)}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (!appIsReady || !languageLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={currentScreen === 'scanner' ? 'light-content' : 'dark-content'} />
      
      {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}

      {currentScreen === 'portal' && (
          <PortalScreen 
            userName={user?.username || user?.name || 'Moul 7anout'}
            onSelectMode={handleSelectPortalMode}
            onLogout={handleLogout}
            onRefreshPlan={handleRefreshPlan}
            features={user?.features}
            subscriptionPlan={user?.subscriptionPlan}
          />
      )}

      {currentScreen === 'customer_search' && (
          <CustomerSearchScreen 
            token={user?.token}
            apiUrl={API_URL}
            mode={saleMode === 'CREDIT' ? 'manage' : 'select'}
            onSelect={handleCustomerSelect}
            onAddCustomer={() => setCurrentScreen('customer_create')}
            onBack={() => {
                if (saleMode === 'CREDIT') {
                    setCurrentScreen('portal');
                } else {
                    setCurrentScreen('cart');
                }
            }}
          />
      )}

      {currentScreen === 'customer_create' && (
          <CustomerCreateScreen 
            token={user?.token}
            apiUrl={API_URL}
            onBack={() => setCurrentScreen('customer_search')}
            onSuccess={() => setCurrentScreen('customer_search')}
          />
      )}

      {currentScreen === 'customer_detail' && (
          <CustomerDetailScreen 
            customer={selectedCustomerProfile}
            token={user?.token}
            apiUrl={API_URL}
            features={user?.features}
            onBack={() => setCurrentScreen('customer_search')}
          />
      )}

      {currentScreen === 'sales_report' && (
          <SalesReportScreen 
            token={user?.token}
            apiUrl={API_URL}
            onBack={() => setCurrentScreen('portal')}
          />
      )}

      {currentScreen === 'client_dashboard' && (
          <ClientDashboardScreen 
            user={user}
            apiUrl={API_URL}
            onLogout={handleLogout}
            onGoToShop={() => user?.features?.marketplace && setCurrentScreen('marketplace')}
            onGoToPania={() => user?.features?.marketplace && setCurrentScreen('pania')}
            onGoToBarcode={() => user?.features?.marketplace && setCurrentScreen('pania_barcode')}
          />
      )}

      {currentScreen === 'marketplace' && (
          <MarketplaceScreen 
            user={user}
            apiUrl={API_URL}
            onBack={() => setCurrentScreen('client_dashboard')}
            onGoToPania={() => setCurrentScreen('pania')}
          />
      )}

      {currentScreen === 'pania' && (
          <PaniaScreen 
            user={user}
            apiUrl={API_URL}
            onBack={() => setCurrentScreen('client_dashboard')}
            onGoToBarcode={() => setCurrentScreen('pania_barcode')}
          />
      )}

      {currentScreen === 'pania_barcode' && (
          <PaniaBarcodeScreen 
            user={user}
            apiUrl={API_URL}
            onBack={() => setCurrentScreen('pania')}
          />
      )}

      {currentScreen === 'pantry_order' && (
          <PantryOrderScreen 
            scannedToken={scannedToken}
            token={user?.token}
            user={user}
            onComplete={handleComplete}
            onBack={() => {
                setScannedToken(null);
                setCurrentScreen('scanner');
            }}
          />
      )}
      
      {currentScreen === 'scanner' && (
        <>
            <ScannerScreen 
              navigation={{ 
                goBack: () => {
                  if (user?.role === 'ROLE_MOUL7ANOUT') {
                    setCurrentScreen('portal');
                  } else {
                    handleLogout();
                  }
                } 
              }} 
              onScan={handleScan}
              continuous={user?.role === 'ROLE_MOUL7ANOUT'}
              lastAdded={lastAddedProduct}
            />
            {user?.role === 'ROLE_MOUL7ANOUT' && (
                <View style={styles.scannerOverlay}>
                    {selectedCustomer && (
                        <View style={[styles.customerBanner, { flexDirection: flexDir }]}>
                            <User color="#fff" size={16} />
                            <Text style={styles.customerBannerText}>{t('scanner.scannerOverlayCredit', { name: selectedCustomer.name })}</Text>
                        </View>
                    )}
                    <TouchableOpacity 
                        style={[styles.floatingCart, { flexDirection: flexDir }]} 
                        onPress={() => setCurrentScreen('cart')}
                    >
                        <ShoppingCart color="#fff" size={24} />
                        {salesCart.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{salesCart.length}</Text></View>}
                        <Text style={styles.floatingCartText}>{t('scanner.scannerOverlayCart')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
      )}

      {currentScreen === 'form' && (
        <SafeAreaView style={{ flex: 1 }}>
          {renderHeader('productForm.title', () => setCurrentScreen('scanner'))}
          <ProductForm 
            barcode={scannedBarcode} 
            token={user?.token}
            onComplete={handleComplete} 
          />
        </SafeAreaView>
      )}
      {currentScreen === 'cart' && (
        <SalesCartScreen 
            cart={salesCart}
            token={user?.token}
            user={user}
            selectedCustomer={selectedCustomer}
            onUpdateCart={setSalesCart}
            onClear={() => setSalesCart([])}
            onComplete={handleComplete}
            onBack={() => setCurrentScreen('scanner')}
            onChooseCustomer={() => {
                setSaleMode('NORMAL');
                setCurrentScreen('customer_search');
            }}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appHeader: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', letterSpacing: 1 },
  scannerOverlay: { position: 'absolute', bottom: 40, right: 20, left: 20, gap: 10 },
  floatingCart: { backgroundColor: '#a14009', height: 65, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#a14009', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  floatingCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  badge: { position: 'absolute', top: -10, left: '50%', marginLeft: -35, backgroundColor: '#ef4444', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  customerBanner: { backgroundColor: '#ef4444', alignSelf: 'center', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  customerBannerText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
