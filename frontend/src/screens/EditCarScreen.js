import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CarFront, DollarSign, FileText, Save, Tag, Settings2, Fuel, Settings } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const CATEGORIES = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric', 'Other'];
const STATUSES = ['Available', 'Sold', 'Unavailable'];
const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const CONDITIONS = ['New', 'Used'];

const Field = ({ Icon, placeholder, value, onChangeText, keyboard }) => (
  <View style={styles.field}>
    <Icon color={colors.textLight} size={18} strokeWidth={1.8} />
    <TextInput
      style={styles.fieldInput}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.textLight}
      keyboardType={keyboard || 'default'}
    />
  </View>
);

const ChipSelector = ({ label, options, selected, onSelect }) => (
  <View style={styles.chipSection}>
    <Text style={styles.chipLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.chipActive]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, selected === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default function EditCarScreen({ route, navigation }) {
  const { car } = route.params;
  const [brand, setBrand] = useState(car.brand);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(car.year.toString());
  const [price, setPrice] = useState(car.price.toString());
  const [quantity, setQuantity] = useState(car.quantity ? car.quantity.toString() : '1');
  const [mileage, setMileage] = useState(car.mileage.toString());
  const [fuelType, setFuelType] = useState(car.fuelType || 'Petrol');
  const [transmission, setTrans] = useState(car.transmission || 'Automatic');
  const [condition, setCondition] = useState(car.condition || 'New');
  const [status, setStatus] = useState(car.status);
  const [category, setCategory] = useState(car.category);
  const [description, setDesc] = useState(car.description);
  const [mainImage, setMainImage] = useState(car.mainImage);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!brand || !model || !year || !price || !quantity || !description) {
      showError('Please fill required fields');
      return;
    }
    if (parseFloat(price) < 1000000) {
      showError('Price must be at least Rs 1,000,000');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        brand, model, year: parseInt(year), price: parseFloat(price),
        quantity: parseInt(quantity),
        mileage: parseInt(mileage), status, category, description, mainImage,
        fuelType, transmission, condition
      };
      const res = await api.patch(`/cars/${car._id}`, payload);
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
      <ChipSelector label="Status" options={STATUSES} selected={status} onSelect={setStatus} />
      <ChipSelector label="Category" options={CATEGORIES} selected={category} onSelect={setCategory} />
      <ChipSelector label="Fuel Type" options={FUELS} selected={fuelType} onSelect={setFuelType} />
      <ChipSelector label="Transmission" options={TRANSMISSIONS} selected={transmission} onSelect={setTrans} />
      <ChipSelector label="Condition" options={CONDITIONS} selected={condition} onSelect={setCondition} />

      <Text style={styles.sectionTitle}>Vehicle Details</Text>
      <Field Icon={Settings2} placeholder="Brand" value={brand} onChangeText={setBrand} />
      <Field Icon={CarFront} placeholder="Model" value={model} onChangeText={setModel} />
      <Field Icon={Tag} placeholder="Year" value={year} onChangeText={setYear} keyboard="numeric" />
      <Field Icon={DollarSign} placeholder="Price (Rs) (Min 1M)" value={price} onChangeText={setPrice} keyboard="numeric" />
      <Field Icon={Tag} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboard="numeric" />
      <Field Icon={Settings2} placeholder="Mileage" value={mileage} onChangeText={setMileage} keyboard="numeric" />

      <Text style={styles.sectionTitle}>Description</Text>
      <View style={styles.textArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Description..."
          value={description}
          onChangeText={setDesc}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <Text style={styles.sectionTitle}>Image URL</Text>
      <Field Icon={FileText} placeholder="Main Image URL" value={mainImage} onChangeText={setMainImage} />

      <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            <Save color="#fff" size={20} />
            <Text style={styles.btnText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  chipSection: { marginBottom: 16 },
  chipLabel: { fontSize: 13, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textLight, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 54, marginBottom: 12 },
  textArea: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, height: 120 },
  textInput: { flex: 1, fontSize: 15, color: colors.text },
  fieldInput: { flex: 1, fontSize: 15, color: colors.text },
  btn: { backgroundColor: colors.primary, height: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
