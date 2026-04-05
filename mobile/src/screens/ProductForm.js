import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Package, Tag, DollarSign, List, Barcode, Check, Camera, Image as ImageIcon } from 'lucide-react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ProductForm = ({ barcode, token, onComplete }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('Dairy');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
        if (!name || !price || !quantity) {
            alert('Veuillez remplir tous les champs obligatoires.');
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
            alert('Produit ajouté au stock!');
            onComplete();
        } catch (error) {
            console.error("Upload Error:", error.response?.data || error.message);
            alert('Erreur lors de l’ajout.');
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
                                <Text style={styles.imageLabel}>AJOUTER PHOTO</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.barcodeIcon}>
                            <Barcode color="#4f46e5" size={24} />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>BARCODE DÉTECTÉ</Text>
                            <Text style={styles.barcodeText}>{barcode}</Text>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>NOM DU PRODUIT</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Ex: Fromage La Vache Quirit" 
                                value={name} 
                                onChangeText={setName} 
                                returnKeyType="next"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>PRIX (MAD)</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="0.00" 
                                    keyboardType="numeric" 
                                    value={price} 
                                    onChangeText={setPrice} 
                                />
                            </View>
                            <View style={[styles.field, { flex: 1, marginLeft: 15 }]}>
                                <Text style={styles.label}>STOCK INIT</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="0" 
                                    keyboardType="numeric" 
                                    value={quantity} 
                                    onChangeText={setQuantity} 
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>CATÉGORIE MOBILE</Text>
                            <View style={styles.input}>
                                <Text style={{ color: '#1e293b', fontWeight: 'bold' }}>{category}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Check color="#fff" size={20} />
                                    <Text style={styles.submitText}>VALIDER L'INVENTAIRE</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 32, padding: 25, shadowColor: '#64748b', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5, overflow: 'hidden' },
    imageSelector: { height: 160, backgroundColor: '#f8fafc', borderRadius: 24, marginBottom: 25, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0', overflow: 'hidden' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imageLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 10, letterSpacing: 1 },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    barcodeIcon: { width: 50, height: 50, backgroundColor: '#eef2ff', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5 },
    barcodeText: { fontSize: 16, fontWeight: 'bold', color: '#4338ca' },
    field: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 },
    input: { height: 55, backgroundColor: '#f8fafc', borderWith: 1, borderColor: '#f1f5f9', borderRadius: 18, paddingHorizontal: 20, justifyContent: 'center', fontSize: 15, color: '#1e293b' },
    row: { flexDirection: 'row' },
    submitButton: { height: 60, backgroundColor: '#4f46e5', borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

export default ProductForm;
