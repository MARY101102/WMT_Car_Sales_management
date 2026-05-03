import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Plus, Edit2, Trash2, Search, RefreshCw, Eye } from 'lucide-react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminSparePartsScreen({ navigation }) {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/spare-parts?limit=100'; // High limit for admin table
      if (search) url += `&search=${search}`;
      
      const res = await api.get(url);
      setParts(res.data.data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to fetch parts' });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      fetchParts();
    }, [fetchParts])
  );

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this spare part?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/spare-parts/${id}`);
            Toast.show({ type: 'success', text1: 'Deleted successfully' });
            fetchParts();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed to delete' });
          }
        }
      }
    ]);
  };

  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/spare-parts/${item._id}`, { status: newStatus });
      Toast.show({ type: 'success', text1: `Status changed to ${newStatus}` });
      fetchParts();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{item.partName}</Text>
      <Text style={[styles.cell, { flex: 1 }]} numberOfLines={1}>{item.category[0]}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>Rs {item.salePrice}</Text>
      <Text style={[styles.cell, { flex: 0.8 }]}>{item.stockQuantity}</Text>
      <TouchableOpacity onPress={() => toggleStatus(item)} style={{ flex: 1, alignItems: 'center' }}>
        <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actionsCell}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SparePartAdminDetail', { id: item._id })}>
          <Eye size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EditSparePart', { id: item._id })}>
          <Edit2 size={18} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Search color={colors.textLight} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, number..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchParts}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddSparePart')}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Part Name</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Part No.</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Price</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Stock</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Status</Text>
          <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>Actions</Text>
        </View>

        {loading ? (
          <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : (
          <FlatList
            data={parts}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No spare parts found.</Text>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary, padding: 16 },
  header: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, height: 44, marginLeft: 8, color: colors.text },
  addBtn: { flexDirection: 'row', backgroundColor: colors.primary, alignItems: 'center', paddingHorizontal: 16, borderRadius: 8, height: 44 },
  addBtnText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  table: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerCell: { fontWeight: '700', color: colors.text, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  cell: { fontSize: 13, color: colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: colors.success + '20' },
  statusInactive: { backgroundColor: colors.textLight + '20' },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.text },
  actionsCell: { flex: 1.5, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  actionBtn: { padding: 4 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 40, color: colors.textLight }
});
