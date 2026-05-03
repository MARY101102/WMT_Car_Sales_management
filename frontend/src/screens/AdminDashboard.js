import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { BarChart2, Car, Calendar, Users, UserPlus, PlusCircle, ChevronRight, TrendingUp, ClipboardList, Tag, Star, MessageSquare, PieChart, Package } from 'lucide-react-native';
import api from '../services/api';
import useStore from '../store/useStore';
import { colors } from '../theme/colors';

const StatCard = ({ label, value, Icon, accent }) => (
  <View style={[styles.statCard, { borderLeftColor: accent, borderLeftWidth: 4 }]}>
    <View style={[styles.statIconBox, { backgroundColor: accent + '20' }]}>
      <Icon color={accent} size={22} strokeWidth={1.8} />
    </View>
    <View>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const ActionBtn = ({ label, sub, Icon, accent, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.actionIcon, { backgroundColor: accent + '18' }]}>
      <Icon color={accent} size={24} strokeWidth={1.8} />
    </View>
    <View style={styles.actionText}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </View>
    <ChevronRight color={colors.border} size={20} />
  </TouchableOpacity>
);

export default function AdminDashboard({ navigation }) {
  const { user } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setStats(res.data.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
        </View>
        <Text style={styles.greeting}>Control Panel,</Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>

      <Text style={styles.sectionTitle}>Performance Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Cars" value={stats?.totalCars} Icon={Car} accent={colors.primary} />
        <StatCard label="Users" value={stats?.totalUsers} Icon={Users} accent="#1D4ED8" />
        <StatCard label="Bookings" value={stats?.totalBookings} Icon={Calendar} accent="#059669" />
        <StatCard label="Revenue" value={`Rs ${(stats?.totalRevenue || 0).toLocaleString()}`} Icon={TrendingUp} accent="#D97706" />
      </View>

      <Text style={styles.sectionTitle}>Inventory & Sales</Text>
      <View style={styles.actionsCard}>
        <ActionBtn label="Add Vehicle" sub="List a new car" Icon={PlusCircle} accent={colors.primary} onPress={() => navigation.navigate('AddCar')} />
        <View style={styles.divider} />
        <ActionBtn label="Manage Vehicles" sub="Edit/Delete listings" Icon={Car} accent="#1D4ED8" onPress={() => navigation.navigate('ManageInventory')} />
        <View style={styles.divider} />
        <ActionBtn label="Add Spare Part" sub="List a new part" Icon={PlusCircle} accent="#D97706" onPress={() => navigation.navigate('AddSparePart')} />
        <View style={styles.divider} />
        <ActionBtn label="Manage Spare Parts" sub="Add/Edit parts & accessories" Icon={Tag} accent="#D97706" onPress={() => navigation.navigate('AdminSpareParts')} />
        <View style={styles.divider} />
        <ActionBtn label="Sales Reports" sub="View charts & trends" Icon={BarChart2} accent="#059669" onPress={() => navigation.navigate('Reports')} />
      </View>

      <Text style={styles.sectionTitle}>Marketing & Content</Text>
      <View style={styles.actionsCard}>
        <ActionBtn label="Promotions" sub="Manage discount codes" Icon={Tag} accent="#D97706" onPress={() => navigation.navigate('Promotions')} />
        <View style={styles.divider} />
        <ActionBtn label="Review Moderation" sub="Approve user reviews" Icon={Star} accent="#7C3AED" onPress={() => navigation.navigate('ReviewModeration')} />
      </View>

      <Text style={styles.sectionTitle}>Operations</Text>
      <View style={styles.actionsCard}>
        <ActionBtn label="Manage Bookings" sub="Review test drives" Icon={ClipboardList} accent="#059669" onPress={() => navigation.navigate('ManageBookings')} />
        <View style={styles.divider} />
        <ActionBtn label="Manage Orders" sub="Process spare part purchases" Icon={Package} accent="#D97706" onPress={() => navigation.navigate('AdminOrders')} />
        <View style={styles.divider} />
        <ActionBtn label="User Support" sub="Customer inquiries" Icon={MessageSquare} accent="#1D4ED8" onPress={() => navigation.navigate('ManageInquiries')} />
      </View>

      <Text style={styles.sectionTitle}>User Management</Text>
      <View style={styles.actionsCard}>
        <ActionBtn label="Create Staff" sub="Add new team members" Icon={UserPlus} accent="#7C3AED" onPress={() => navigation.navigate('CreateStaff')} />
        <View style={styles.divider} />
        <ActionBtn label="All Users" sub="Manage roles & accounts" Icon={Users} accent="#D97706" onPress={() => navigation.navigate('AllUsers')} />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: { backgroundColor: colors.surface, padding: 24, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: colors.border },
  adminBadge: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  adminBadgeText: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  greeting: { fontSize: 15, color: colors.textLight },
  name: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.text, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  statCard: { width: '47%', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  actionsCard: { marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  actionSub: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 82 },
});
