import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, Image
} from 'react-native';
import { CarFront, DollarSign, MapPin, FileText, PlusCircle, Tag, Fuel, Settings2, Calendar, CheckCircle2 } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const CATEGORIES  = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric', 'Other'];
const FUELS       = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const CONDITIONS  = ['New', 'Used'];

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

export default function AddCarScreen({ navigation }) {
  const [brand, setBrand]         = useState('');
  const [model, setModel]         = useState('');
  const [year, setYear]           = useState('');
  const [price, setPrice]         = useState('');
  const [quantity, setQuantity]   = useState('1');
  const [mileage, setMileage]     = useState('');
  const [fuelType, setFuelType]   = useState('Petrol');
  const [transmission, setTrans]  = useState('Automatic');
  const [condition, setCondition] = useState('New');
  const [category, setCategory]   = useState('Sedan');
  const [description, setDesc]    = useState('');
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (!brand || !model || !year || !price || !mileage || !quantity || !description) {
      showError('Please fill all required fields');
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
        mileage: parseInt(mileage), fuelType, transmission, condition,
        category, description,
        // Use a placeholder image since file upload requires multipart form
        mainImage: mainImage || '/uploads/cars/placeholder.jpg',
        status: 'Available'
      };

      await api.post('/cars', payload);
      showSuccess('Car listing created successfully!');
      navigation.navigate('ManageInventory');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <ChipSelector label="Category"      options={CATEGORIES}    selected={category}    onSelect={setCategory} />
      <ChipSelector label="Fuel Type"     options={FUELS}         selected={fuelType}    onSelect={setFuelType} />
      <ChipSelector label="Transmission"  options={TRANSMISSIONS} selected={transmission} onSelect={setTrans} />
      <ChipSelector label="Condition"     options={CONDITIONS}    selected={condition}   onSelect={setCondition} />

      <Text style={styles.sectionTitle}>Details</Text>
      <Field Icon={Settings2}  placeholder="Brand (e.g. Toyota)" value={brand}     onChangeText={setBrand} />
      <Field Icon={CarFront}   placeholder="Model  (e.g. Camry)"     value={model}     onChangeText={setModel} />
      <Field Icon={Calendar}   placeholder="Year   (e.g. 2023)"      value={year}      onChangeText={setYear}   keyboard="numeric" />
      <Field Icon={DollarSign} placeholder="Price (Rs) (Min 1,000,000)" value={price}     onChangeText={setPrice}  keyboard="numeric" />
      <Field Icon={Tag}        placeholder="Quantity"                value={quantity}  onChangeText={setQuantity} keyboard="numeric" />
      <Field Icon={Settings2}  placeholder="Mileage (km)"            value={mileage}   onChangeText={setMileage} keyboard="numeric" />

      <Text style={styles.sectionTitle}>Description</Text>
      <View style={[styles.field, styles.textArea]}>
        <TextInput
          style={[styles.fieldInput, { textAlignVertical: 'top', height: 100 }]}
          placeholder="Describe the vehicle condition, features..."
          value={description}
          onChangeText={setDesc}
          multiline
          placeholderTextColor={colors.textLight}
        />
      </View>

      <Text style={styles.sectionTitle}>Image URL (Optional)</Text>
      <Field Icon={FileText} placeholder="https://..." value={mainImage} onChangeText={setMainImage} />

      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
              <PlusCircle color="#fff" size={20} />
              <Text style={styles.btnText}>Publish Listing</Text>
            </>
        }
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 10 },
  chipSection: { marginBottom: 12 },
  chipLabel: { fontSize: 13, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textLight, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 54, marginBottom: 12 },
  textArea: { height: 120, alignItems: 'flex-start', paddingTop: 14 },
  fieldInput: { flex: 1, fontSize: 15, color: colors.text },
  btn: { flexDirection: 'row', backgroundColor: colors.primary, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
