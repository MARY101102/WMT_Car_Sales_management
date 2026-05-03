import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Tag, Calendar, Percent, CheckCircle2, DollarSign, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const ChipSelector = ({ label, options, selected, onSelect }) => (
  <View style={styles.chipSection}>
    <Text style={styles.chipLabel}>{label}</Text>
    <View style={styles.chipRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.chipActive]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, selected === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function CreatePromotionScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !code || !discountValue || !endDate) {
      showError('Please fill in all fields');
      return;
    }
    if (discountType === 'Percentage') {
      const val = parseFloat(discountValue);
      if (val < 0 || val > 10) {
        showError('Discount percentage must be between 0% and 10%');
        return;
      }
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('code', code.toUpperCase());
      formData.append('discountType', discountType.toLowerCase());
      formData.append('discountValue', discountValue);
      formData.append('startDate', new Date(startDate).toISOString());
      formData.append('endDate', new Date(endDate).toISOString());

      if (image) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('bannerImage', {
          uri: image.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const res = await api.post('/promotions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccess(res.data.message);
      navigation.goBack();
    } catch (err) {
      showError(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Promotion Details</Text>
        
        <View style={styles.field}>
          <Tag color={colors.textLight} size={20} />
          <TextInput 
            style={styles.input} 
            placeholder="Promotion Title" 
            value={title} 
            onChangeText={setTitle}
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.field}>
          <Percent color={colors.textLight} size={20} />
          <TextInput 
            style={styles.input} 
            placeholder="Promo Code (e.g. SUMMER24)" 
            value={code} 
            onChangeText={setCode}
            autoCapitalize="characters"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <ChipSelector 
          label="Discount Type" 
          options={['Percentage', 'Fixed']} 
          selected={discountType} 
          onSelect={setDiscountType} 
        />

        <View style={styles.field}>
          {discountType === 'Percentage' ? <Percent color={colors.textLight} size={20} /> : <DollarSign color={colors.textLight} size={20} />}
          <TextInput 
            style={styles.input} 
            placeholder={discountType === 'Percentage' ? "Discount Percentage (e.g. 10)" : "Discount Amount (e.g. 500)"}
            value={discountValue} 
            onChangeText={setDiscountValue}
            keyboardType="numeric"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <Text style={styles.fieldLabel}>Start Date</Text>
        <View style={styles.field}>
          <Calendar color={colors.textLight} size={20} />
          {Platform.OS === 'web' ? (
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={webInputStyle}
            />
          ) : (
            <TextInput 
              style={styles.input} 
              placeholder="Start Date (YYYY-MM-DD)" 
              value={startDate} 
              onChangeText={setStartDate}
              placeholderTextColor={colors.textLight}
            />
          )}
        </View>

        <Text style={styles.fieldLabel}>End Date</Text>
        <View style={styles.field}>
          <Calendar color={colors.textLight} size={20} />
          {Platform.OS === 'web' ? (
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={webInputStyle}
            />
          ) : (
            <TextInput 
              style={styles.input} 
              placeholder="End Date (YYYY-MM-DD)" 
              value={endDate} 
              onChangeText={setEndDate}
              placeholderTextColor={colors.textLight}
            />
          )}
        </View>

        <Text style={styles.fieldLabel}>Promotion Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <ImageIcon color={colors.primary} size={24} />
          <Text style={styles.imagePickerText}>{image ? 'Change Image' : 'Upload Image'}</Text>
        </TouchableOpacity>
        {image && <Text style={styles.imageName}>{image.uri.split('/').pop()}</Text>}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <CheckCircle2 color="#fff" size={20} />
              <Text style={styles.btnText}>Create Promotion</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const webInputStyle = {
  flex: 1,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '15px',
  color: colors.text,
  fontFamily: 'inherit',
  padding: '8px'
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.backgroundSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 54, marginBottom: 16 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  chipSection: { marginBottom: 20 },
  chipLabel: { fontSize: 13, fontWeight: '700', color: colors.textLight, marginBottom: 10, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.textLight, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  imagePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.backgroundSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', height: 54, marginBottom: 8 },
  imagePickerText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  imageName: { fontSize: 12, color: colors.textLight, marginBottom: 16, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, height: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
