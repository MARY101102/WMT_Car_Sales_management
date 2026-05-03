import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Car, Calendar, MessageSquare, List, PlusCircle, ChevronRight, BarChart, Package, Tag } from 'lucide-react-native';
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

export default function StaffDashboard({ navigation }) {
  const { user } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.staffBadge}>
          <Text style={styles.staffBadgeText}>STAFF PANEL</Text>
        </View>
        <Text style={styles.greeting}>Welcome,</Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard label="Total Cars"     value={stats?.totalCars}      Icon={Car}      accent={colors.primary} />
          <StatCard label="Active Bookings" value={stats?.totalBookings}  Icon={Calendar} accent="#059669" />
          <StatCard label="Pending"        value={stats?.pendingBookings} Icon={BarChart} accent="#D97706" />
        </View>
      )}

      <Text style={styles.sectionTitle}>Inventory Control</Text>
      <View style={styles.actionsCard}>
        <ActionBtn
          label="Add New Car"
          sub="List a new vehicle for sale"
          Icon={PlusCircle}
          accent={colors.primary}
          onPress={() => navigation.navigate('AddCar')}
        />
        <View style={styles.divider} />
        <ActionBtn
          label="Manage Inventory"
          sub="Edit or delete existing cars"
          Icon={List}
          accent="#1D4ED8"
          onPress={() => navigation.navigate('ManageInventory')}
        />
      </View>

      <Text style={styles.sectionTitle}>Operations & Sales</Text>
      <View style={styles.actionsCard}>
        <ActionBtn
          label="Manage Promotions"
          sub="Active deals & offers"
          Icon={Tag}
          accent="#7C3AED"
          onPress={() => navigation.navigate('Promotions')}
        />
        <View style={styles.divider} />
        <ActionBtn
          label="Add Spare Part"
          sub="List a new part"
          Icon={PlusCircle}
          accent={colors.primary}
          onPress={() => navigation.navigate('AddSparePart')}
        />
        <View style={styles.divider} />
        <ActionBtn
          label="Manage Spare Parts"
          sub="Inventory control"
          Icon={Package}
          accent={colors.primary}
          onPress={() => navigation.navigate('AdminSpareParts')}
        />
        <View style={styles.divider} />
        <ActionBtn
          label="Manage Orders"
          sub="Process spare part purchases"
          Icon={Package}
          accent="#D97706"
          onPress={() => navigation.navigate('AdminOrders')}
        />
      </View>

      <Text style={styles.sectionTitle}>Customer Relations</Text>
      <View style={styles.actionsCard}>
        <ActionBtn
          label="Booking Requests"
          sub="Approve or manage test drives"
          Icon={Calendar}
          accent="#059669"
          onPress={() => navigation.navigate('ManageBookings')}
        />
        <View style={styles.divider} />
        <ActionBtn
          label="Customer Inquiries"
          sub="Respond to user messages"
          Icon={MessageSquare}
          accent="#1D4ED8"
          onPress={() => navigation.navigate('ManageInquiries')}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: { backgroundColor: colors.surface, padding: 24, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: colors.border },
  staffBadge: { alignSelf: 'flex-start', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  staffBadgeText: { fontSize: 11, fontWeight: '800', color: '#1D4ED8', letterSpacing: 0.5 },
  greeting: { fontSize: 15, color: colors.textLight },
  name: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  statCard: { width: '47%', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  actionsCard: { marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  actionSub: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 82 },
});
