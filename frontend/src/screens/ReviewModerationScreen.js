import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Star, CheckCircle, Trash2, User, Car } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

export default function ReviewModerationScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      // Assuming a general endpoint for all reviews exists or we use car-specific ones
      // For now, let's assume /api/v1/reviews/pending exists for moderation
      const res = await api.get('/reviews/pending');
      setReviews(res.data.data);
    } catch (err) {
      showError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/reviews/${id}/approve`);
      showSuccess(res.data.message);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) { showError('Approval failed'); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Review', 'Remove this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/reviews/${id}`);
          showSuccess('Review removed');
          setReviews(prev => prev.filter(r => r._id !== id));
        } catch (err) { showError('Failed to delete'); }
      }}
    ]);
  };

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <User color={colors.primary} size={14} />
          <Text style={styles.userName}>{item.user?.name}</Text>
        </View>
        <View style={styles.carInfo}>
          <Car color={colors.textLight} size={14} />
          <Text style={styles.carName}>{item.car?.brand} {item.car?.model}</Text>
        </View>
      </View>
      
      <View style={styles.starRow}>
        {[1,2,3,4,5].map(s => <Star key={s} fill={s <= item.rating ? '#EAB308' : 'transparent'} color={s <= item.rating ? '#EAB308' : colors.border} size={16} />)}
      </View>

      <Text style={styles.comment}>{item.comment}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item._id)}>
          <CheckCircle color="#fff" size={16} />
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Trash2 color="#EF4444" size={16} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{reviews.length} reviews pending moderation</Text>
      <FlatList
        data={reviews}
        keyExtractor={i => i._id}
        renderItem={renderReview}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>All caught up! No pending reviews.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  count: { fontSize: 13, color: colors.textLight, fontWeight: '600', padding: 16, paddingBottom: 0 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 13, fontWeight: '700', color: colors.text },
  carInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  carName: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  starRow: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  comment: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  approveBtn: { flex: 1, backgroundColor: '#059669', height: 40, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, backgroundColor: '#FEF2F2', height: 40, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#FEE2E2' },
  deleteBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40 },
});
