import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar, Clock, Car, CheckCircle2, XCircle, ChevronDown } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';

const STATUS_FLOW = ['Pending', 'Approved', 'Completed', 'Cancelled'];
const STATUS_COLORS = {
  Pending:   { bg: '#FEF3C7', text: '#92400E' },
  Approved:  { bg: '#D1FAE5', text: '#065F46' },
  Completed: { bg: '#DBEAFE', text: '#1D4ED8' },
  Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function ManageBookingsScreen() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return STATUS_FLOW[idx + 1] || null;
  };

  const renderItem = ({ item }) => {
    const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Pending;
    const next = nextStatus(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
          </View>
          <Text style={styles.bookingType}>{item.type}</Text>
        </View>

        <View style={styles.row}>
          <Car color={colors.textLight} size={16} strokeWidth={1.8} />
          <Text style={styles.carName}>
            {item.car?.brand} {item.car?.model} ({item.car?.year})
          </Text>
        </View>
        <View style={styles.row}>
          <Calendar color={colors.textLight} size={16} strokeWidth={1.8} />
          <Text style={styles.metaText}>{new Date(item.date).toDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Clock color={colors.textLight} size={16} strokeWidth={1.8} />
          <Text style={styles.metaText}>{item.timeSlot}</Text>
        </View>
        {item.user && (
          <Text style={styles.userText}>👤 {item.user.name} — {item.user.email}</Text>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {next && item.status !== 'Cancelled' && (
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => updateStatus(item._id, next)}
              disabled={updating === item._id}
            >
              {updating === item._id
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <CheckCircle2 color="#fff" size={16} />
                    <Text style={styles.approveBtnText}>Mark {next}</Text>
                  </>
              }
            </TouchableOpacity>
          )}
          {item.status !== 'Cancelled' && item.status !== 'Completed' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => updateStatus(item._id, 'Cancelled')}
              disabled={updating === item._id}
            >
              <XCircle color={colors.primary} size={16} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</Text>
      <FlatList
        data={bookings}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  count: { fontSize: 13, color: colors.textLight, fontWeight: '500', padding: 16, paddingBottom: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  bookingType: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  carName: { fontSize: 15, fontWeight: '700', color: colors.text },
  metaText: { fontSize: 14, color: colors.textLight },
  userText: { fontSize: 13, color: colors.textLight, marginTop: 6, marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  approveBtn: { flex: 1, flexDirection: 'row', backgroundColor: colors.success || '#059669', borderRadius: 10, height: 42, justifyContent: 'center', alignItems: 'center', gap: 6 },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FEE2E2', borderRadius: 10, height: 42, justifyContent: 'center', alignItems: 'center', gap: 6 },
  cancelBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
});
