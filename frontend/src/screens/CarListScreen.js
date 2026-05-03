import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, ActivityIndicator, ScrollView
} from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

const CATEGORIES = ['All', 'SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric', 'Other'];
const FUELS = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];

export default function CarListScreen({ navigation, route }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(route.params?.search || '');
  const [category, setCategory] = useState(route.params?.category || 'All');
  const [fuelFilter, setFuelFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCars = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      let url = `/cars?page=${pg}&limit=8`;
      if (search) url += `&search=${search}`;
      if (category && category !== 'All') url += `&category=${category}`;
      if (fuelFilter && fuelFilter !== 'All') url += `&fuelType=${fuelFilter}`;

      const res = await api.get(url);
      const { cars: newCars, pagination } = res.data.data;
      setCars(pg === 1 ? newCars : prev => [...prev, ...newCars]);
      setTotalPages(pagination.pages);
      setPage(pg);
    } catch (e) {
      console.log('Fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [search, category, fuelFilter]);

  useEffect(() => { fetchCars(1); }, [category, fuelFilter]);

  const renderCar = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CarDetail', { carId: item._id })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: getImageUrl(item.mainImage) }}
        style={styles.cardImage}
      />
      {item.status === 'Available' && <View style={styles.availBadge}><Text style={styles.availBadgeText}>Available</Text></View>}
      <View style={styles.cardBody}>
        <Text style={styles.cardBrand}>{item.brand} {item.model}</Text>
        <Text style={styles.cardPrice}>Rs {item.price.toLocaleString()}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.chip}><Text style={styles.chipText}>{item.year}</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>{item.transmission}</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>{item.fuelType}</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search color={colors.textLight} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search brand, model..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchCars(1)}
            placeholderTextColor={colors.textLight}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(''); }}>
              <X color={colors.textLight} size={18} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => fetchCars(1)}>
          <Filter color="#fff" size={18} />
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.filterChip, category === c && styles.filterChipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.filterChipText, category === c && styles.filterChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fuel filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow2} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {FUELS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, fuelFilter === f && styles.filterChipActive]}
            onPress={() => setFuelFilter(f)}
          >
            <Text style={[styles.filterChipText, fuelFilter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultsText}>{cars.length} vehicle{cars.length !== 1 ? 's' : ''} found</Text>

      {/* List */}
      <FlatList
        data={cars}
        keyExtractor={item => item._id}
        renderItem={renderCar}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No vehicles found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters</Text>
            </View>
          )
        }
        ListFooterComponent={
          page < totalPages ? (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => fetchCars(page + 1)} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.loadMoreText}>Load More</Text>}
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: 14, height: 48, gap: 10
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  searchBtn: {
    width: 48, height: 48, backgroundColor: colors.primary,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center'
  },
  filterRow: { maxHeight: 50, marginBottom: 4 },
  filterRow2: { maxHeight: 44, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    marginRight: 8, height: 36, justifyContent: 'center'
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.textLight, fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  resultsText: { paddingHorizontal: 16, marginBottom: 8, fontSize: 13, color: colors.textLight, fontWeight: '500' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border
  },
  cardImage: { width: '100%', height: 200 },
  availBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6
  },
  availBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 16 },
  cardBrand: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardPrice: { fontSize: 22, fontWeight: '800', color: colors.primary, marginBottom: 12 },
  cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.backgroundSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  chipText: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: colors.textLight },
  loadMoreBtn: {
    marginVertical: 16, height: 50, borderRadius: 12, borderWidth: 1.5,
    borderColor: colors.primary, justifyContent: 'center', alignItems: 'center'
  },
  loadMoreText: { color: colors.primary, fontWeight: '700', fontSize: 15 }
});
