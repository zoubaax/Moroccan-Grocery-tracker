import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar, TouchableOpacity, Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductForm from './src/screens/ProductForm';
import * as SplashScreen from 'expo-splash-screen';
import { ChevronLeft } from 'lucide-react-native';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [scannedBarcode, setScannedBarcode] = useState(null);
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
    setCurrentScreen('scanner');
  };

  const handleScan = (barcode) => {
    setScannedBarcode(barcode);
    setCurrentScreen('form');
  };

  const handleComplete = () => {
    setScannedBarcode(null);
    setCurrentScreen('scanner');
  };

  const renderHeader = (title) => (
    <View style={styles.appHeader}>
      <TouchableOpacity onPress={() => setCurrentScreen('scanner')} style={styles.backButton}>
        <ChevronLeft color="#1e293b" size={24} />
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
      
      {currentScreen === 'scanner' && (
        <ScannerScreen 
          navigation={{ goBack: () => setCurrentScreen('login') }} 
          onScan={handleScan}
        />
      )}

      {currentScreen === 'form' && (
        <SafeAreaView style={{ flex: 1 }}>
          {renderHeader('AJOUTER AU STOCK')}
          <ProductForm 
            barcode={scannedBarcode} 
            token={user?.token}
            onComplete={handleComplete} 
          />
        </SafeAreaView>
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
});
