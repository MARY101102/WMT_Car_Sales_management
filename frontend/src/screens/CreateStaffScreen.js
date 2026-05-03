import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';

const Field = ({ Icon, placeholder, value, onChangeText, secure }) => (
  <View style={styles.field}>
    <Icon color={colors.textLight} size={20} strokeWidth={1.8} />
    <TextInput
      style={styles.fieldInput}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      placeholderTextColor={colors.textLight}
      autoCapitalize="none"
    />
  </View>
);

export default function CreateStaffScreen({ navigation }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !email || !password || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/users/create-staff', { name, email, password, phoneNumber });
      Alert.alert(
        'Staff Created ✅',
        `Account created for ${res.data.data.name}\nEmail: ${res.data.data.email}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      alert(`Creation Failed:\n${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.iconBanner}>
          <View style={styles.iconCircle}>
            <User color={colors.primary} size={32} strokeWidth={1.5} />
          </View>
          <Text style={styles.cardTitle}>New Staff Account</Text>
          <Text style={styles.cardSub}>Staff can manage inventory and update booking statuses.</Text>
        </View>

        <Field Icon={User}  placeholder="Full Name"     value={name}     onChangeText={setName} />
        <Field Icon={Mail}  placeholder="Email Address" value={email}    onChangeText={setEmail} />
        <Field Icon={User}  placeholder="Phone Number (10 digits)" value={phoneNumber} onChangeText={setPhoneNumber} />
        <Field Icon={Lock}  placeholder="Password"      value={password} onChangeText={setPassword} secure />

        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <CheckCircle2 color="#fff" size={20} />
                <Text style={styles.btnText}>Create Staff Account</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 24 },
  iconBanner: { alignItems: 'center', marginBottom: 28 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 6 },
  cardSub: { fontSize: 14, color: colors.textLight, textAlign: 'center', lineHeight: 20 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.backgroundSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 56, marginBottom: 14 },
  fieldInput: { flex: 1, fontSize: 16, color: colors.text },
  btn: { flexDirection: 'row', backgroundColor: colors.primary, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
