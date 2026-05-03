import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { User, Mail, Shield, LogOut, Calendar, ChevronRight, Edit3, MessageCircle, Settings } from 'lucide-react-native';
import useStore from '../store/useStore';
import api from '../services/api';
import { colors } from '../theme/colors';

const ROLE_COLORS = {
  Admin:    { bg: '#FEE2E2', text: colors.primary },
  Staff:    { bg: '#DBEAFE', text: '#1D4ED8' },
  Customer: { bg: '#D1FAE5', text: '#065F46' },
};

const ProfileLink = ({ Icon, label, onPress, color = colors.text }) => (
  <TouchableOpacity style={styles.linkRow} onPress={onPress}>
    <View style={[styles.linkIcon, { backgroundColor: color + '10' }]}>
      <Icon color={color} size={20} />
    </View>
    <Text style={[styles.linkLabel, { color }]}>{label}</Text>
    <ChevronRight color={colors.border} size={18} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useStore();
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (user) {
      try {
        const res = await api.get('/bookings/my-bookings');
        setBookings(res.data.data || []);
      } catch (err) {}
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>You're not logged in</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.Customer;

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{user.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={[styles.rolePill, { backgroundColor: roleStyle.bg }]}>
          <Shield color={roleStyle.text} size={13} />
          <Text style={[styles.roleText, { color: roleStyle.text }]}>{user.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        <View style={styles.card}>
          <ProfileLink Icon={Edit3} label="Edit Profile" onPress={() => navigation.navigate('UpdateProfile')} />
          {user.role === 'Customer' && (
            <>
              <View style={styles.divider} />
              <ProfileLink Icon={MessageCircle} label="Support & Inquiries" onPress={() => navigation.navigate('Inquiries')} />
              <View style={styles.divider} />
              <ProfileLink Icon={Calendar} label="Booking History" onPress={() => {}} />
            </>
          )}
        </View>
      </View>

      {/* Staff/Admin Shortcut */}
      {(user.role === 'Admin' || user.role === 'Staff') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <TouchableOpacity 
            style={styles.adminBtn} 
            onPress={() => navigation.navigate(user.role === 'Admin' ? 'Admin' : 'StaffDashboard')}
          >
            <Settings color={colors.primary} size={20} />
            <Text style={styles.adminBtnText}>Go to {user.role} Panel</Text>
            <ChevronRight color={colors.primary} size={18} />
          </TouchableOpacity>
        </View>
      )}

      {user.role === 'Customer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {bookings.length === 0 ? (
            <View style={styles.emptyBookings}>
              <Calendar color={colors.border} size={32} />
              <Text style={styles.emptyBookingsText}>No bookings yet</Text>
            </View>
          ) : (
            bookings.slice(0, 3).map(b => (
              <View key={b._id} style={styles.bookingCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingCar}>{b.car?.brand} {b.car?.model}</Text>
                  <Text style={styles.bookingDate}>{new Date(b.date).toDateString()}</Text>
                  <Text style={styles.bookingType}>{b.type}</Text>
                </View>
                <View style={[styles.statusChip, b.status === 'Approved' && styles.statusApproved, b.status === 'Cancelled' && styles.statusCancelled]}>
                  <Text style={styles.statusChipText}>{b.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color={colors.primary} size={18} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  hero: { backgroundColor: colors.surface, alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarLetter: { color: '#fff', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: 13, fontWeight: '700' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  linkIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 66 },
  adminBtn: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  adminBtnText: { flex: 1, color: colors.primary, fontWeight: '700', fontSize: 15 },
  bookingCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  bookingCar: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  bookingDate: { fontSize: 13, color: colors.textLight, marginBottom: 2 },
  bookingType: { fontSize: 12, color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  statusChip: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusApproved: { backgroundColor: '#D1FAE5' },
  statusCancelled: { backgroundColor: '#FEE2E2' },
  statusChipText: { fontSize: 11, fontWeight: '800', color: colors.text },
  emptyBookings: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyBookingsText: { color: colors.textLight, fontSize: 14 },
  logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  logoutText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  loginBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
});
