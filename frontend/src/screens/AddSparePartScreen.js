import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function AddSparePartScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partName: '',
    partNumber: '',
    slug: '',
    brand: '',
    category: '',
    salePrice: '',
    stockQuantity: '',
    image: '',
    status: 'Active',
    metaTitle: '',
    metaDescription: '',
    shortDescription: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrs = {};
    if (!formData.partName || formData.partName.length < 3) newErrs.partName = 'Name must be at least 3 chars';
    if (!formData.partNumber || !/^[a-zA-Z0-9_-]+$/.test(formData.partNumber)) newErrs.partNumber = 'Required, alphanumeric with - or _';
    if (!formData.slug) newErrs.slug = 'Slug is required';
    if (!formData.brand) newErrs.brand = 'Brand is required';
    if (!formData.category) newErrs.category = 'Required';
    if (!formData.salePrice || isNaN(formData.salePrice) || Number(formData.salePrice) <= 0) newErrs.salePrice = 'Valid price required';
    if (!formData.stockQuantity || isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0) newErrs.stockQuantity = 'Valid stock required';
    
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleGenerateSlug = () => {
    const slug = formData.partName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Please fix the errors below' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        category: formData.category.split(',').map(c => c.trim()),
        salePrice: Number(formData.salePrice),
        stockQuantity: Number(formData.stockQuantity)
      };

      await api.post('/spare-parts', payload);
      Toast.show({ type: 'success', text1: 'Spare part created successfully' });
      navigation.goBack();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Creation Failed:\n${errorMsg}\n\nMake sure you restarted the backend server after the recent fixes!`);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (key, placeholder, keyboardType = 'default', autoCapitalize = 'none') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{placeholder} {['partName', 'partNumber', 'slug', 'brand', 'category', 'salePrice', 'stockQuantity'].includes(key) && '*'}</Text>
      <TextInput
        style={[styles.input, errors[key] && styles.inputError]}
        value={formData[key]}
        onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onBlur={key === 'partName' ? handleGenerateSlug : undefined}
      />
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderInput('partName', 'Part Name (Min 3 chars)', 'default', 'words')}
      {renderInput('slug', 'Slug (Unique URL identifier)')}
      {renderInput('partNumber', 'Part Number (Unique)')}
      {renderInput('brand', 'Brand', 'default', 'words')}
      {renderInput('category', 'Categories (Comma separated)')}
      
      <View style={styles.row}>
        <View style={styles.col}>{renderInput('salePrice', 'Price (Rs)', 'numeric')}</View>
        <View style={styles.col}>{renderInput('stockQuantity', 'Stock', 'numeric')}</View>
      </View>
      
      <View style={styles.row}>
        <View style={styles.col}>
           <Text style={styles.label}>Status *</Text>
           <TouchableOpacity 
             style={styles.statusToggle} 
             onPress={() => setFormData(prev => ({ ...prev, status: prev.status === 'Active' ? 'Inactive' : 'Active' }))}
           >
             <Text style={styles.statusToggleText}>{formData.status}</Text>
           </TouchableOpacity>
        </View>
      </View>

      {renderInput('image', 'Image URL')}
      {renderInput('shortDescription', 'Short Description')}
      {renderInput('metaTitle', 'Meta Title (Max 60 chars)')}
      {renderInput('metaDescription', 'Meta Description (Max 160 chars)')}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Spare Part</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 16, paddingBottom: 40 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, height: 48, paddingHorizontal: 12, color: colors.text },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  statusToggle: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center' },
  statusToggleText: { color: colors.primary, fontWeight: '700' },
  submitBtn: { backgroundColor: colors.primary, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
