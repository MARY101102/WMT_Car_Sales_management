import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to fetch orders' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleUpdateStatus = (orderId, currentStatus) => {
    if (currentStatus === 'Delivered') {
      Toast.show({ type: 'info', text1: 'Order is already delivered' });
      return;
    }

    Alert.alert('Update Order Status', 'What would you like to update this order to?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Mark Paid', 
        onPress: async () => {
          try {
            await api.put(`/orders/${orderId}/pay`);
            Toast.show({ type: 'success', text1: 'Order marked as paid' });
            fetchOrders();
          } catch (e) {
            alert(`Failed: ${e.response?.data?.message || e.message}`);
          }
        }
      },
      { 
        text: 'Mark Delivered', 
        onPress: async () => {
          try {
            await api.put(`/orders/${orderId}/deliver`);
            Toast.show({ type: 'success', text1: 'Order marked as delivered' });
            fetchOrders();
          } catch (e) {
            alert(`Failed: ${e.response?.data?.message || e.message}`);
          }
        }
      }
    ]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <Clock size={16} color="#D97706" />;
      case 'Shipped': return <Truck size={16} color="#1D4ED8" />;
      case 'Delivered': return <CheckCircle size={16} color="#059669" />;
      default: return <Package size={16} color={colors.textLight} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return '#FEF3C7';
      case 'Shipped': return '#DBEAFE';
      case 'Delivered': return '#D1FAE5';
      default: return '#F3F4F6';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Processing': return '#D97706';
      case 'Shipped': return '#1D4ED8';
      case 'Delivered': return '#059669';
      default: return colors.textLight;
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <Text style={styles.customerName}>
          Customer: {item.user?.name || 'Unknown'} ({item.user?.email || 'N/A'})
        </Text>
        <Text style={styles.address}>
          Deliver to: {item.shippingAddress.address}, {item.shippingAddress.city}, {item.shippingAddress.postalCode}
        </Text>
        
        <View style={styles.itemsList}>
          {item.items.map((cartItem, idx) => (
            <Text key={idx} style={styles.itemText}>• {cartItem.name} (x{cartItem.quantity})</Text>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.paymentStatus}>
            Payment: <Text style={{ color: item.isPaid ? '#059669' : '#D97706', fontWeight: 'bold' }}>
              {item.isPaid ? 'PAID' : 'PENDING'}
            </Text> ({item.paymentMethod})
          </Text>
          <Text style={styles.totalPrice}>Rs {item.totalPrice.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.updateBtn} 
        onPress={() => handleUpdateStatus(item._id, item.status)}
      >
        <Text style={styles.updateBtnText}>Update Status</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Orders</Text>
      <Text style={styles.subtitle}>Review purchases and update delivery statuses</Text>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textLight, marginBottom: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 30 },
  emptyText: { textAlign: 'center', color: colors.textLight, marginTop: 40, fontSize: 16 },
  orderCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  orderId: { fontSize: 16, fontWeight: '700', color: colors.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderBody: { marginBottom: 16 },
  customerName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  address: { fontSize: 13, color: colors.textLight, marginBottom: 12, lineHeight: 18 },
  itemsList: { backgroundColor: colors.backgroundSecondary, padding: 10, borderRadius: 8, marginBottom: 12 },
  itemText: { fontSize: 13, color: colors.text, marginBottom: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentStatus: { fontSize: 13, color: colors.textLight },
  totalPrice: { fontSize: 18, fontWeight: '800', color: colors.primary },
  updateBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  updateBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});
