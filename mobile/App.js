import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar, TouchableOpacity, Text, Alert } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductForm from './src/screens/ProductForm';
import SalesCartScreen from './src/screens/SalesCartScreen';
import PortalScreen from './src/screens/PortalScreen';
import CustomerSearchScreen from './src/screens/CustomerSearchScreen';
import * as SplashScreen from 'expo-splash-screen';
import { ArrowLeft, ShoppingCart, Power, User } from 'lucide-react-native';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // Staff flow states
  const [scannedBarcode, setScannedBarcode] = useState(null);
  
  // Sales flow states
  const [salesCart, setSalesCart] = useState([]);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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

  const handleSelectPortalMode = (mode) => {
      setSaleMode(mode);
      if (mode === 'CREDIT') {
          setCurrentScreen('customer_search');
      } else {
          setSelectedCustomer(null);
          setCurrentScreen('scanner');
      }
  };

  const handleCustomerSelect = (customer) => {
      setSelectedCustomer(customer);
      setCurrentScreen('scanner');
  };

  const handleScan = async (barcode) => {
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
    setSalesCart([]);
    setSelectedCustomer(null);
    setSaleMode('NORMAL');
    setCurrentScreen('portal');
  };

  const renderHeader = (title, onBack) => (
    <View style={styles.appHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeft color="#1e293b" size={24} />
      </TouchableOpacity>
      <Text style={styles.appTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (!appIsReady) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={currentScreen === 'scanner' ? 'light-content' : 'dark-content'} />
      
      {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}

      {currentScreen === 'portal' && (
          <PortalScreen 
            userName={user?.username || user?.name || 'Moul 7anout'}
            onSelectMode={handleSelectPortalMode}
            onLogout={handleLogout}
          />
      )}

      {currentScreen === 'customer_search' && (
          <CustomerSearchScreen 
            token={user?.token}
            apiUrl={API_URL}
            onSelect={handleCustomerSelect}
            onBack={() => setCurrentScreen('portal')}
          />
      )}
      
      {currentScreen === 'scanner' && (
        <>
            <ScannerScreen 
              navigation={{ goBack: () => setCurrentScreen(user?.role === 'ROLE_MOUL7ANOUT' ? 'portal' : 'login') }} 
              onScan={handleScan}
              continuous={user?.role === 'ROLE_MOUL7ANOUT'}
              lastAdded={lastAddedProduct}
            />
            {user?.role === 'ROLE_MOUL7ANOUT' && (
                <View style={styles.scannerOverlay}>
                    {selectedCustomer && (
                        <View style={styles.customerBanner}>
                            <User color="#fff" size={16} />
                            <Text style={styles.customerBannerText}>CREDIT: {selectedCustomer.name}</Text>
                        </View>
                    )}
                    <TouchableOpacity 
                        style={styles.floatingCart} 
                        onPress={() => setCurrentScreen('cart')}
                    >
                        <ShoppingCart color="#fff" size={24} />
                        {salesCart.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{salesCart.length}</Text></View>}
                        <Text style={styles.floatingCartText}>PANIER</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity 
              onPress={handleLogout} 
              style={[styles.logoutBtn, { top: Platform.OS === 'ios' ? 60 : 40 }]}
            >
              <Power color="#fff" size={20} />
            </TouchableOpacity>
        </>
      )}

      {currentScreen === 'form' && (
        <SafeAreaView style={{ flex: 1 }}>
          {renderHeader('AJOUTER AU STOCK', () => setCurrentScreen('scanner'))}
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
            selectedCustomer={selectedCustomer}
            onUpdateCart={setSalesCart}
            onClear={() => setSalesCart([])}
            onComplete={handleComplete}
            onBack={() => setCurrentScreen('scanner')}
        />
      )}
    </View>
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
  floatingCart: { backgroundColor: '#4f46e5', height: 65, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  floatingCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  badge: { position: 'absolute', top: -10, left: '50%', marginLeft: -35, backgroundColor: '#ef4444', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  logoutBtn: { position: 'absolute', right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  customerBanner: { backgroundColor: '#ef4444', alignSelf: 'center', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  customerBannerText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
