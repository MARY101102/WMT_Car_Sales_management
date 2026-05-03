import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, ChevronRight, Calendar } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function BookingSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CheckCircle2 color={colors.success || '#059669'} size={80} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your test drive request has been submitted successfully. Our team will review it and get back to you shortly.
        </Text>

        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Calendar color="#fff" size={20} />
          <Text style={styles.primaryBtnText}>View My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Landing')}
        >
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
          <ChevronRight color={colors.textLight} size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, justifyContent: 'center', padding: 30 },
  content: { alignItems: 'center' },
  iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textLight, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  primaryBtn: { backgroundColor: colors.primary, width: '100%', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  secondaryBtn: { width: '100%', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  secondaryBtnText: { color: colors.textLight, fontWeight: '600', fontSize: 15 },
});
