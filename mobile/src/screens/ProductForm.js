import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Package, Tag, DollarSign, List, Barcode, Check, Camera, Image as ImageIcon, ChevronDown, X } from 'lucide-react-native';
import { useLanguage } from '../services/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ProductForm = ({ barcode, token, onComplete }) => {
    const { t, isRTL, flexDir, tAlign } = useLanguage();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCategories, setIsFetchingCategories] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsFetchingCategories(true);
        try {
            const response = await axios.get(`${API_URL}/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCategories(response.data);
            if (response.data.length > 0) {
                setCategory(response.data[0].name);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setIsFetchingCategories(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!name || !price || !quantity || !category) {
            alert(t('productForm.errorEmpty'));
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('barcode', barcode);
            formData.append('price', price);
            formData.append('stockQuantity', quantity);
            formData.append('category', category);

            if (image) {
                const uriParts = image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                
                formData.append('image', {
                    uri: image.uri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            await axios.post(`${API_URL}/products`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            alert(t('productForm.success'));
            onComplete();
        } catch (error) {
            console.error("Upload Error:", error.response?.data || error.message);
            alert(t('productForm.errorSave'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
                <View style={styles.card}>
                    {/* Media Section */}
                    <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Camera color="#94a3b8" size={32} />
                                <Text style={styles.imageLabel}>{t('productForm.addPhoto')}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={[styles.header, { flexDirection: flexDir }]}>
                        <View style={styles.barcodeIcon}>
                            <Barcode color="#4f46e5" size={24} />
                        </View>
                        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                            <Text style={styles.headerTitle}>{t('productForm.barcodeDetected')}</Text>
                            <Text style={styles.barcodeText}>{barcode}</Text>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={[styles.label, { textAlign: tAlign }]}>{t('productForm.name')}</Text>
                            <TextInput 
                                style={[styles.input, { textAlign: tAlign }]} 
                                placeholder={t('productForm.placeholderName')} 
                                value={name} 
                                onChangeText={setName} 
                                returnKeyType="next"
                            />
                        </View>

                        <View style={[styles.row, { flexDirection: flexDir }]}>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={[styles.label, { textAlign: tAlign }]}>{t('productForm.priceLabel')}</Text>
                                <TextInput 
                                    style={[styles.input, { textAlign: tAlign }]} 
                                    placeholder="0.00" 
                                    keyboardType="numeric" 
                                    value={price} 
                                    onChangeText={setPrice} 
                                />
                            </View>
                            <View style={[styles.field, { flex: 1, marginLeft: isRTL ? 0 : 15, marginRight: isRTL ? 15 : 0 }]}>
                                <Text style={[styles.label, { textAlign: tAlign }]}>{t('productForm.qtyLabel')}</Text>
                                <TextInput 
                                    style={[styles.input, { textAlign: tAlign }]} 
                                    placeholder="0" 
                                    keyboardType="numeric" 
                                    value={quantity} 
                                    onChangeText={setQuantity} 
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { textAlign: tAlign }]}>{t('productForm.categoryLabel')}</Text>
                            <TouchableOpacity 
                                style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]} 
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <Text style={{ color: isFetchingCategories ? '#94a3b8' : '#1e293b', fontWeight: 'bold' }}>
                                    {isFetchingCategories ? 'Loading...' : (category || 'Select Category')}
                                </Text>
                                <ChevronDown color="#64748b" size={20} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.submitButton, { flexDirection: flexDir }]} onPress={handleSubmit} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Check color="#fff" size={20} />
                                    <Text style={styles.submitText}>{t('productForm.submitText')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Category Selection Modal */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.modalHeader, { flexDirection: flexDir }]}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <X color="#64748b" size={24} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.categoryList}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryItem,
                                        category === cat.name && styles.categoryItemSelected,
                                        { flexDirection: flexDir }
                                    ]}
                                    onPress={() => {
                                        setCategory(cat.name);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <Tag 
                                        color={category === cat.name ? '#4f46e5' : '#94a3b8'} 
                                        size={20} 
                                        style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
                                    />
                                    <Text style={[
                                        styles.categoryName,
                                        category === cat.name && styles.categoryNameSelected
                                    ]}>
                                        {cat.name}
                                    </Text>
                                    {category === cat.name && (
                                        <Check color="#4f46e5" size={20} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e3e2e6', padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 32, padding: 25, shadowColor: '#74777f', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5, overflow: 'hidden' },
    imageSelector: { height: 160, backgroundColor: '#faf9fd', borderRadius: 24, marginBottom: 25, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e3e2e6', overflow: 'hidden' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imageLabel: { fontSize: 10, fontWeight: 'bold', color: '#74777f', marginTop: 10, letterSpacing: 1 },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e3e2e6' },
    barcodeIcon: { width: 50, height: 50, backgroundColor: '#fff4ee', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 10, fontWeight: 'bold', color: '#74777f', letterSpacing: 1.5 },
    barcodeText: { fontSize: 16, fontWeight: 'bold', color: '#002045' },
    field: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#74777f', marginBottom: 8, letterSpacing: 0.5 },
    input: { height: 55, backgroundColor: '#faf9fd', borderWith: 1, borderColor: '#e3e2e6', borderRadius: 18, paddingHorizontal: 20, justifyContent: 'center', fontSize: 15, color: '#002045' },
    row: { flexDirection: 'row' },
    submitButton: { height: 60, backgroundColor: '#a14009', borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10, shadowColor: '#a14009', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e3e2e6' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#002045' },
    categoryList: { padding: 10 },
    categoryItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, backgroundColor: '#faf9fd' },
    categoryItemSelected: { backgroundColor: '#fff4ee', borderWidth: 1, borderColor: '#a14009' },
    categoryName: { fontSize: 16, fontWeight: '600', color: '#002045', flex: 1 },
    categoryNameSelected: { color: '#a14009', fontWeight: 'bold' }
});

export default ProductForm;
