import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { Shield, User, Trash2, Edit2, X, Check } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const ROLE_COLORS = {
  Admin:    { bg: '#FEE2E2', text: colors.primary },
  Staff:    { bg: '#DBEAFE', text: '#1D4ED8' },
  Customer: { bg: '#D1FAE5', text: '#065F46' },
};

export default function AllUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        performDelete(id);
      }
    } else {
      Alert.alert('Delete User', 'This action cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performDelete(id) }
      ]);
    }
  };

  const performDelete = async (id) => {
    try {
      const res = await api.delete(`/users/${id}`);
      showSuccess(res.data.message);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) { showError('Failed to delete user'); }
  };

  const handleUpdateRole = async (newRole) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/users/${selectedUser._id}/role`, { role: newRole });
      showSuccess(res.data.message);
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, role: newRole } : u));
      setSelectedUser(null);
    } catch (err) { showError('Failed to update role'); }
    finally { setUpdating(false); }
  };

  const renderUser = ({ item }) => {
    const rc = ROLE_COLORS[item.role] || ROLE_COLORS.Customer;
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{item.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={[styles.rolePill, { backgroundColor: rc.bg }]}>
            <Shield color={rc.text} size={10} />
            <Text style={[styles.roleText, { color: rc.text }]}>{item.role}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setSelectedUser(item)}>
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

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{users.length} registered users</Text>
      <FlatList
        data={users}
        keyExtractor={i => i._id}
        renderItem={renderUser}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No users found</Text>}
      />

      <Modal visible={!!selectedUser} animationType="fade" transparent onRequestClose={() => setSelectedUser(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Role</Text>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Select a new role for {selectedUser?.name}</Text>
            
            <View style={styles.optionsContainer}>
              {['Admin', 'Staff', 'Customer'].map(r => (
                <TouchableOpacity 
                  key={r} 
                  style={[styles.roleOption, selectedUser?.role === r && styles.roleOptionSelected]}
                  onPress={() => handleUpdateRole(r)}
                  disabled={updating}
                >
                  <Text style={[styles.roleOptionText, selectedUser?.role === r && styles.roleOptionTextSelected]}>{r}</Text>
                  {selectedUser?.role === r && <Check color="#fff" size={18} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  count: { fontSize: 13, color: colors.textLight, fontWeight: '600', padding: 16, paddingBottom: 0 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#fff', fontSize: 20, fontWeight: '800' },
  info: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.textLight, marginTop: 2, marginBottom: 6 },
  rolePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  roleText: { fontSize: 10, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, width: '100%', maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  modalSub: { fontSize: 14, color: colors.textLight, marginBottom: 20 },
  optionsContainer: { gap: 10 },
  roleOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  roleOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleOptionText: { fontSize: 16, fontWeight: '600', color: colors.text },
  roleOptionTextSelected: { color: '#fff' },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40 },
});
