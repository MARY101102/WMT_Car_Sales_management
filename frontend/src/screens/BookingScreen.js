import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar, Clock, Car, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import api from '../services/api';
import useStore from '../store/useStore';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const TimeSlot = ({ time, selected, onSelect }) => (
  <TouchableOpacity 
    style={[styles.slot, selected === time && styles.slotActive]} 
    onPress={() => onSelect(time)}
  >
    <Text style={[styles.slotText, selected === time && styles.slotTextActive]}>{time}</Text>
  </TouchableOpacity>
);

export default function BookingScreen({ route, navigation }) {
  const { carId } = route.params;
  const [date, setDate] = useState('2024-12-01');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [loading, setLoading] = useState(false);
  const { token } = useStore();

  const handleBooking = async () => {
    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        car: carId,
        type: 'TestDrive',
        date,
        timeSlot
      });
      showSuccess(res.data.message);
      navigation.replace('BookingSuccess');
    } catch (error) {
      showError(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Calendar color={colors.primary} size={32} />
        </View>
        <Text style={styles.title}>Schedule Test Drive</Text>
        <Text style={styles.subtitle}>Select your preferred date and time to experience this vehicle.</Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Preferred Date</Text>
          <View style={styles.inputWrapper}>
            <Calendar color={colors.textLight} size={20} />
            <TextInput 
              style={styles.input} 
              value={date} 
              onChangeText={setDate} 
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <Text style={styles.label}>Select Time Slot</Text>
        <View style={styles.slotsGrid}>
          {slots.map(s => <TimeSlot key={s} time={s} selected={timeSlot} onSelect={setTimeSlot} />)}
        </View>

        <TouchableOpacity 
          style={styles.confirmBtn} 
          onPress={handleBooking} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <CheckCircle2 color="#fff" size={20} />
              <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Clock color={colors.primary} size={18} />
        <Text style={styles.infoText}>Test drives usually last 30-45 minutes. Please bring your valid driver's license.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textLight, lineHeight: 22, marginBottom: 30 },
  inputSection: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.backgroundSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 16, color: colors.text },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  slot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 14, color: colors.textLight, fontWeight: '600' },
  slotTextActive: { color: '#fff', fontWeight: '700' },
  confirmBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  infoBox: { flexDirection: 'row', gap: 12, marginTop: 24, backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DBEAFE' },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18, fontWeight: '500' },
});
