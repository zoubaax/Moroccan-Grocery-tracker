import React, { createContext, useState, useContext, useEffect } from 'react';
import { I18nManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState('fr');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load persisted language on start
        const loadLanguage = async () => {
            try {
                const saved = await AsyncStorage.getItem('app_language');
                if (saved === 'fr' || saved === 'ar') {
                    setLanguageState(saved);
                    
                    // Verify if RTL direction is in sync with the saved language
                    const shouldBeRTL = saved === 'ar';
                    if (I18nManager.isRTL !== shouldBeRTL) {
                        I18nManager.forceRTL(shouldBeRTL);
                        // Let React Native apply native updates on next reload
                    }
                }
            } catch (e) {
                console.warn('Failed to load language setting', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadLanguage();
    }, []);

    const changeLanguage = async (newLang) => {
        if (newLang !== 'fr' && newLang !== 'ar') return;
        try {
            await AsyncStorage.setItem('app_language', newLang);
            setLanguageState(newLang);
            
            const shouldBeRTL = newLang === 'ar';
            const wasRTL = I18nManager.isRTL;
            
            I18nManager.forceRTL(shouldBeRTL);
            I18nManager.allowRTL(shouldBeRTL);

            // If RTL state changed, show alert since RN needs native restart to adjust flex layouts fully
            if (wasRTL !== shouldBeRTL) {
                const title = translations[newLang].login.restartAlertTitle;
                const msg = translations[newLang].login.restartAlertMsg;
                const ok = newLang === 'ar' ? 'موافق' : 'OK';
                
                Alert.alert(title, msg, [{ text: ok }]);
            }
        } catch (e) {
            console.error('Failed to save language setting', e);
        }
    };

    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = translations[language];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Fallback to key split name if not found
                return key;
            }
        }
        
        if (typeof value !== 'string') return key;
        
        let result = value;
        Object.keys(params).forEach(p => {
            result = result.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
        });
        return result;
    };

    const isRTL = language === 'ar';
    // When I18nManager.isRTL is active, native layout mirrors `row`; use row-reverse only as a manual fallback before restart.
    const flexDir = isRTL ? (I18nManager.isRTL ? 'row' : 'row-reverse') : 'row';

    const value = {
        language,
        changeLanguage,
        t,
        isRTL,
        tAlign: isRTL ? 'right' : 'left',
        flexDir,
        /** Use for cards/lists with fixed child order (image → info → action); keeps the same visual layout in FR and AR. */
        flexDirNatural: 'row',
        flexDirOpposite: isRTL ? 'row' : 'row-reverse',
        writingDirection: isRTL ? 'rtl' : 'ltr',
        alignItems: isRTL ? 'flex-end' : 'flex-start',
        isLoaded
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
