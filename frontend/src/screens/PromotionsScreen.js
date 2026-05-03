import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Tag, Trash2, Plus, Calendar, Percent, Edit2 } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

export default function PromotionsScreen({ navigation }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // All | Active | Expired

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await api.get('/promotions');
      setPromotions(res.data.data);
    } catch (err) {
      showError('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this promotion?')) {
        performDelete(id);
      }
    } else {
      Alert.alert('Delete Promotion', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performDelete(id) }
      ]);
    }
  };

  const performDelete = async (id) => {
    try {
      await api.delete(`/promotions/${id}`);
      showSuccess('Promotion deleted');
      setPromotions(prev => prev.filter(p => p._id !== id));
    } catch (err) { showError('Failed to delete'); }
  };

  const handleCopyCode = async (code) => {
    try {
      await Clipboard.setStringAsync(code);
      showSuccess('Promo code copied');
    } catch (e) {
      showError('Copy failed');
    }
  };

  const renderPromotion = ({ item }) => {
    const now = new Date();
    const ends = new Date(item.endDate);
    const daysLeft = Math.ceil((ends - now) / (1000 * 60 * 60 * 24));
    const expired = daysLeft < 0 || !item.isActive;

    return (
      <View style={[styles.promoCard, expired && styles.promoCardExpired]}>
        {item.bannerImage ? (
          <Image source={{ uri: item.bannerImage }} style={styles.thumb} />
        ) : (
          <View style={styles.promoIcon}>
            <Percent color={colors.primary} size={24} />
          </View>
        )}

        <View style={styles.promoInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.promoTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, expired ? styles.badgeExpired : styles.badgeActive]}>
              <Text style={styles.statusText}>{expired ? 'Expired' : `Active (${daysLeft}d)`}</Text>
            </View>
          </View>

          <Text style={styles.promoCode}>CODE: {item.code}</Text>
          <Text style={styles.promoValue}>{item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `Rs ${item.discountValue} OFF`}</Text>
          <View style={styles.dateRow}>
            <Calendar color={colors.textLight} size={14} />
            <Text style={styles.dateText}>Ends {ends.toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopyCode(item.code)}>
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditPromotion', { promotion: item })}>
            <Edit2 color={colors.primary} size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
            <Trash2 color="#EF4444" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  const filtered = promotions.filter(p => {
    if (filter === 'All') return true;
    const ends = new Date(p.endDate);
    const expired = (new Date() > ends) || !p.isActive;
    return filter === 'Active' ? !expired : expired;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPromotions();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{promotions.length} active promotions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreatePromotion')}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addBtnText}>New Promo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['All','Active','Expired'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter===f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter===f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={renderPromotion}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No promotions found</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
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
  promoCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  promoIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  thumb: { width: 90, height: 60, borderRadius: 10, marginRight: 12, backgroundColor: colors.backgroundSecondary },
  promoInfo: { flex: 1 },
  promoTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  promoCode: { fontSize: 13, color: colors.primary, fontWeight: '700', marginTop: 2 },
  promoValue: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dateText: { fontSize: 12, color: colors.textLight },
  actions: { gap: 8 },
  copyBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surfaceDark, marginBottom: 6 },
  copyText: { color: colors.text, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeActive: { backgroundColor: '#ECFCCB' },
  badgeExpired: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 12, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 12 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surface },
  filterActive: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  filterText: { color: colors.textLight },
  filterTextActive: { color: colors.primary, fontWeight: '700' },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40 },
});
