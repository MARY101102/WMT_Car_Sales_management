import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Mail, Lock, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import useStore from '../store/useStore';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const Field = ({ Icon, placeholder, value, onChangeText, secure, label }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
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
  </View>
);

export default function UpdateProfileScreen({ navigation }) {
  const { user, setUser } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateInfo = async () => {
    if (!name || !email) {
      showError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.patch('/auth/update-profile', { name, email });
      setUser(res.data.data);
      showSuccess(res.data.message);
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showError('Please fill in both password fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.patch('/auth/change-password', { currentPassword, newPassword });
      showSuccess(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showError(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Field Icon={User} label="Full Name" placeholder="Your Name" value={name} onChangeText={setName} />
        <Field Icon={Mail} label="Email Address" placeholder="email@example.com" value={email} onChangeText={setEmail} />
        <TouchableOpacity style={styles.btn} onPress={handleUpdateInfo} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Info</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { marginTop: 30 }]}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Field Icon={Lock} label="Current Password" placeholder="••••••••" value={currentPassword} onChangeText={setCurrentPassword} secure />
        <Field Icon={Lock} label="New Password" placeholder="••••••••" value={newPassword} onChangeText={setNewPassword} secure />
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.text }]} onPress={handleChangePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Change Password</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 20 },
  section: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20 },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.textLight, marginBottom: 8 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.backgroundSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 50 },
  fieldInput: { flex: 1, fontSize: 15, color: colors.text },
  btn: { backgroundColor: colors.primary, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
