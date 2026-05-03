import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, ActivityIndicator, ScrollView
} from 'react-native';
import { Search, Filter, X, ShoppingCart } from 'lucide-react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import useStore from '../store/useStore';
import Toast from 'react-native-toast-message';

const CATEGORIES = ['All', 'Engine', 'Brakes', 'Suspension', 'Filters', 'Body', 'Other'];

export default function SparePartsScreen({ navigation, route }) {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart, cart, user } = useStore();

  const fetchParts = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      let url = `/spare-parts?page=${pg}&limit=10`;
      if (search) url += `&search=${search}`;
      if (category && category !== 'All') url += `&category=${category}`;

      const res = await api.get(url);
      const { data: newParts, pagination } = res.data;
      setParts(pg === 1 ? newParts : prev => [...prev, ...newParts]);
      setTotalPages(pagination.pages || 1);
      setPage(pg);
    } catch (e) {
      console.log('Fetch error', e);
      Toast.show({ type: 'error', text1: 'Error fetching parts' });
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { fetchParts(1); }, [category]);

  const handleAddToCart = (part) => {
    if (part.stockQuantity <= 0) {
      Toast.show({ type: 'error', text1: 'Out of Stock' });
      return;
    }
    addToCart({
      sparePart: part._id,
      name: part.partName,
      partNumber: part.partNumber,
      price: part.salePrice,
      image: part.image,
      quantity: 1
    });
    Toast.show({ type: 'success', text1: 'Added to Cart' });
  };

  const renderPart = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SparePartDetail', { id: item._id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
      {item.stockQuantity <= 0 && <View style={styles.outOfStockBadge}><Text style={styles.badgeText}>Out of Stock</Text></View>}
      {item.salePrice && item.stockQuantity > 0 && <View style={styles.saleBadge}><Text style={styles.badgeText}>Sale</Text></View>}
      
      <View style={styles.cardBody}>
        <Text style={styles.cardBrand}>{item.brand}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.partName}</Text>
        <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>Rs {item.salePrice.toLocaleString()}</Text>
        </View>

        {(!user || user.role === 'Customer') && (
          <TouchableOpacity 
            style={[styles.cartBtn, item.stockQuantity <= 0 && styles.cartBtnDisabled]}
            onPress={() => handleAddToCart(item)}
            disabled={item.stockQuantity <= 0}
          >
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.searchBox}>
          <Search color={colors.textLight} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search parts..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchParts(1)}
            placeholderTextColor={colors.textLight}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(''); }}>
              <X color={colors.textLight} size={18} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {(!user || user.role === 'Customer') && (
          <TouchableOpacity style={styles.cartIconBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart color={colors.primary} size={24} />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

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

      <FlatList
        data={parts}
        keyExtractor={item => item._id}
        renderItem={renderPart}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 50}} /> : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No parts found</Text>
            </View>
          )
        }
        ListFooterComponent={
          page < totalPages ? (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => fetchParts(page + 1)} disabled={loading}>
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
  headerRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10, alignItems: 'center' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: 14, height: 48, gap: 10
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  cartIconBtn: { padding: 8, position: 'relative' },
  cartBadge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: colors.error,
    borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  filterRow: { maxHeight: 50, marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    marginRight: 8, height: 36, justifyContent: 'center'
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.textLight, fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: colors.surface, borderRadius: 12, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border
  },
  cardImage: { width: '100%', height: 120, resizeMode: 'cover' },
  outOfStockBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.error, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  saleBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardBody: { padding: 12 },
  cardBrand: { fontSize: 11, color: colors.textLight, textTransform: 'uppercase', fontWeight: '600', marginBottom: 2 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, height: 38 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: colors.primary },
  cardPriceOld: { fontSize: 12, color: colors.textLight, textDecorationLine: 'line-through' },
  cartBtn: { backgroundColor: colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  cartBtnDisabled: { backgroundColor: colors.border },
  cartBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: colors.textLight },
  loadMoreBtn: {
    marginVertical: 16, height: 44, borderRadius: 12, borderWidth: 1,
    borderColor: colors.primary, justifyContent: 'center', alignItems: 'center'
  },
  loadMoreText: { color: colors.primary, fontWeight: '600' }
});
