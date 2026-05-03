import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { Tag, Calendar, Percent, CheckCircle2, DollarSign, Save, Image as ImageIcon } from 'lucide-react-native';
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
          style={[styles.chip, selected.toLowerCase() === opt.toLowerCase() && styles.chipActive]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, selected.toLowerCase() === opt.toLowerCase() && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function EditPromotionScreen({ route, navigation }) {
  const { promotion } = route.params;
  const [title, setTitle] = useState(promotion.title);
  const [code, setCode] = useState(promotion.code);
  const [discountType, setDiscountType] = useState(promotion.discountType === 'percentage' ? 'Percentage' : 'Fixed');
  const [discountValue, setDiscountValue] = useState(promotion.discountValue.toString());
  const [startDate, setStartDate] = useState(new Date(promotion.startDate).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(promotion.endDate).toISOString().split('T')[0]);
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

  const generateCode = (len = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    setCode(out);
  };

  const handleUpdate = async () => {
    if (!title || !code || !discountValue || !endDate) {
      showError('Please fill in all fields');
      return;
    }
    if (discountType === 'Percentage') {
      const val = parseFloat(discountValue);
      if (isNaN(val) || val < 0 || val > 100) {
        showError('Discount percentage must be between 0% and 100%');
        return;
      }
    }
    if (new Date(startDate) > new Date(endDate)) {
      showError('Start date must be before end date');
      return;
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

      const res = await api.patch(`/promotions/${promotion._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccess(res.data.message);
      navigation.goBack();
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Edit Promotion</Text>
        
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
            placeholder="Promo Code" 
            value={code} 
            onChangeText={setCode}
            autoCapitalize="characters"
            placeholderTextColor={colors.textLight}
          />
          <TouchableOpacity style={styles.generateBtn} onPress={() => generateCode(8)}>
            <Text style={styles.generateText}>Generate</Text>
          </TouchableOpacity>
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
            placeholder={discountType === 'Percentage' ? "Discount Percentage" : "Discount Amount"}
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
              placeholder="YYYY-MM-DD" 
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
              placeholder="YYYY-MM-DD" 
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
        {image ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} resizeMode="cover" />
            <Text style={styles.imageName}>{image.uri.split('/').pop()}</Text>
          </View>
        ) : promotion.bannerImage ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: promotion.bannerImage }} style={styles.imagePreview} resizeMode="cover" />
            <Text style={styles.imageName}>Existing: {promotion.bannerImage.split('/').pop()}</Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save color="#fff" size={20} />
                <Text style={styles.btnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => navigation.goBack()}>
            <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
  imagePreviewWrap: { alignItems: 'center', marginBottom: 12 },
  imagePreview: { width: '100%', height: 140, borderRadius: 12, marginBottom: 8 },
  generateBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surfaceDark, borderWidth: 1, borderColor: colors.border },
  generateText: { color: colors.text, fontWeight: '700' },
  btn: { backgroundColor: colors.primary, height: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  saveBtn: { flex: 1 },
  cancelBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flex: 1, justifyContent: 'center' },
});
