import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import useStore from '../store/useStore';
import Toast from 'react-native-toast-message';
import { Minus, Plus, ShoppingCart } from 'lucide-react-native';

export default function SparePartDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, user } = useStore();

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = async () => {
    try {
      const res = await api.get(`/spare-parts/${id}`);
      setPart(res.data.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error loading details' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (quantity > part.stockQuantity) {
       Toast.show({ type: 'error', text1: 'Not enough stock' });
       return;
    }
    addToCart({
      sparePart: part._id,
      name: part.partName,
      partNumber: part.partNumber,
      price: part.salePrice,
      image: part.image,
      quantity
    });
    Toast.show({ type: 'success', text1: 'Added to Cart' });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!part) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: part.image || 'https://via.placeholder.com/400' }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.brand}>{part.brand}</Text>
          <Text style={styles.title}>{part.partName}</Text>
          <Text style={styles.partNumber}>Part No: {part.partNumber}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>Rs {part.salePrice.toLocaleString()}</Text>
          </View>

          <View style={styles.stockRow}>
            <Text style={styles.stockText}>
              Status: <Text style={{ color: part.stockQuantity > 0 ? colors.success : colors.error }}>
                {part.stockQuantity > 0 ? `In Stock (${part.stockQuantity})` : 'Out of Stock'}
              </Text>
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{part.shortDescription || 'No description available.'}</Text>

          {part.compatibility && part.compatibility.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Vehicle Compatibility</Text>
              <View style={styles.tagsContainer}>
                {part.compatibility.map((tag, idx) => (
                  <View key={idx} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                ))}
              </View>
            </>
          )}

          {part.specifications && part.specifications.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <View style={styles.specsContainer}>
                {part.specifications.map((spec, idx) => (
                  <View key={idx} style={styles.specRow}>
                    <Text style={styles.specKey}>{spec.key}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {(!user || user.role === 'Customer') && (
        <View style={styles.bottomBar}>
          <View style={styles.qtyContainer}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            ><Minus size={16} color={colors.text} /></TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(Math.min(part.stockQuantity, quantity + 1))}
              disabled={quantity >= part.stockQuantity}
            ><Plus size={16} color={colors.text} /></TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.addBtn, part.stockQuantity <= 0 && { backgroundColor: colors.border }]} 
            onPress={handleAddToCart}
            disabled={part.stockQuantity <= 0}
          >
            <ShoppingCart color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.addBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250, resizeMode: 'contain', backgroundColor: '#fff' },
  content: { padding: 16 },
  brand: { fontSize: 13, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  partNumber: { fontSize: 13, color: colors.textLight, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  price: { fontSize: 24, fontWeight: '800', color: colors.text },
  oldPrice: { fontSize: 16, color: colors.textLight, textDecorationLine: 'line-through' },
  stockRow: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  stockText: { fontSize: 14, fontWeight: '600', color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 10 },
  description: { fontSize: 14, color: colors.textLight, lineHeight: 22, marginBottom: 16 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  tagText: { fontSize: 12, color: colors.textLight },
  specsContainer: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 40 },
  specRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, padding: 12 },
  specKey: { flex: 1, fontWeight: '600', color: colors.text, fontSize: 13 },
  specValue: { flex: 2, color: colors.textLight, fontSize: 13 },
  bottomBar: { flexDirection: 'row', padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: 16 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, width: 110, justifyContent: 'space-between', paddingHorizontal: 8 },
  qtyBtn: { padding: 8 },
  qtyText: { fontSize: 16, fontWeight: '700', color: colors.text },
  addBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
