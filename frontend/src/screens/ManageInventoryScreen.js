import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Edit3, Trash2, Plus, Search } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';
import { getImageUrl } from '../utils/imageUrl';

export default function ManageInventoryScreen({ navigation }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = useCallback(async () => {
    try {
      const res = await api.get('/cars');
      setCars(res.data.data.cars || []);
    } catch (err) {
      showError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this vehicle from inventory?')) {
        performDelete(id);
      }
    } else {
      Alert.alert(
        'Delete Car',
        'Are you sure you want to remove this vehicle from inventory?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => performDelete(id) }
        ]
      );
    }
  };

  const performDelete = async (id) => {
    try {
      const res = await api.delete(`/cars/${id}`);
      showSuccess(res.data.message);
      setCars(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      showError('Failed to delete car');
    }
  };

  const renderCar = ({ item }) => (
    <View style={styles.carCard}>
      <Image 
        source={{ uri: getImageUrl(item.mainImage) }} 
        style={styles.carImage} 
      />
      <View style={styles.carInfo}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.model}>{item.model} ({item.year})</Text>
        <Text style={styles.price}>Rs {item.price.toLocaleString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? '#D1FAE5' : '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Available' ? '#065F46' : '#991B1B' }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditCar', { car: item })}>
          <Edit3 color={colors.primary} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Trash2 color="#EF4444" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{cars.length} cars in inventory</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddCar')}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addBtnText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cars}
        keyExtractor={i => i._id}
        renderItem={renderCar}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No cars found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  count: { fontSize: 14, color: colors.textLight, fontWeight: '600' },
  addBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  carCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  carImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.backgroundSecondary },
  carInfo: { flex: 1, marginLeft: 16 },
  brand: { fontSize: 12, color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  model: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  actions: { gap: 10 },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40, fontSize: 15 },
});
