import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function EditSparePartScreen({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    partName: '', partNumber: '', slug: '', brand: '', category: '', 
    salePrice: '', stockQuantity: '', image: '',
    status: 'Active', metaTitle: '', metaDescription: '', shortDescription: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = async () => {
    try {
      const res = await api.get(`/spare-parts/${id}`);
      const part = res.data.data;
      setFormData({
        ...part,
        category: part.category.join(', '),
        salePrice: part.salePrice ? part.salePrice.toString() : '',
        stockQuantity: part.stockQuantity.toString(),
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load details' });
      navigation.goBack();
    } finally {
      setFetching(false);
    }
  };

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

      await api.put(`/spare-parts/${id}`, payload);
      Toast.show({ type: 'success', text1: 'Spare part updated successfully' });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Update failed' });
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
      />
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  if (fetching) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

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
        <View style={styles.col}>{renderInput('stockQuantity', 'Stock Qty', 'numeric')}</View>
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
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Update Spare Part</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
