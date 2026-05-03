import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

export default function InquiriesScreen() {
  const [inquiries, setInquiries] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await api.get('/inquiries/my');
      setInquiries(res.data.data);
    } catch (err) {
      showError('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleSubmit = async () => {
    if (!subject || !message || !customerName || !phoneNumber) {
      showError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { subject, message, customerName, phoneNumber, invoiceNumber: invoiceNumber || undefined };
      if (editingId) {
        const res = await api.put(`/inquiries/${editingId}`, payload);
        showSuccess('Inquiry updated successfully');
        setEditingId(null);
      } else {
        const res = await api.post('/inquiries', payload);
        showSuccess(res.data.message);
      }
      setSubject('');
      setMessage('');
      setCustomerName('');
      setPhoneNumber('');
      setInvoiceNumber('');
      fetchInquiries();
    } catch (err) {
      showError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setSubject(item.subject);
    setMessage(item.message);
    setCustomerName(item.customerName);
    setPhoneNumber(item.phoneNumber);
    setInvoiceNumber(item.invoiceNumber || '');
  };

  const renderInquiry = ({ item }) => (
    <View style={styles.inquiryCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.subject}>{item.subject}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {item.status === 'Pending' && (
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>EDIT</Text>
            </TouchableOpacity>
          )}
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === 'Resolved' ? '#D1FAE5' : item.status === 'In Progress' ? '#DBEAFE' : '#FEF3C7' 
          }]}>
            <Text style={[styles.statusText, { 
              color: item.status === 'Resolved' ? '#065F46' : item.status === 'In Progress' ? '#1E40AF' : '#92400E' 
            }]}>{item.status}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <View style={styles.footer}>
        <Clock color={colors.textLight} size={14} />
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      {item.response && (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Admin Response:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={inquiries}
        keyExtractor={i => i._id}
        renderItem={renderInquiry}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <View style={styles.formCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Inquiry' : 'New Inquiry'}</Text>
              {editingId && (
                <TouchableOpacity onPress={() => { setEditingId(null); setSubject(''); setMessage(''); setCustomerName(''); setPhoneNumber(''); setInvoiceNumber(''); }}>
                  <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '700' }}>CANCEL</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput 
              style={styles.subjectInput}
              placeholder="Customer Name"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor={colors.textLight}
            />
            <TextInput 
              style={styles.subjectInput}
              placeholder="Phone Number (10 digits)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor={colors.textLight}
            />
            <TextInput 
              style={styles.subjectInput}
              placeholder="Invoice Number (Optional, e.g. INV-1234)"
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
              placeholderTextColor={colors.textLight}
            />
            <TextInput 
              style={styles.subjectInput}
              placeholder="Subject (e.g. Finance Options)"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor={colors.textLight}
            />
            <TextInput 
              style={styles.messageInput}
              placeholder="Your detailed message..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.textLight}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Send color="#fff" size={18} />
                  <Text style={styles.sendBtnText}>{editingId ? 'Update Inquiry' : 'Submit Inquiry'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        }
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        ListEmptyComponent={
          !loading && <View style={styles.empty}><Text style={styles.emptyText}>No inquiries found</Text></View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  formCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16 },
  subjectInput: { backgroundColor: colors.backgroundSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 15, color: colors.text, marginBottom: 12 },
  messageInput: { backgroundColor: colors.backgroundSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 15, color: colors.text, height: 100, marginBottom: 16 },
  sendBtn: { backgroundColor: colors.primary, height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  inquiryCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subject: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  message: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontSize: 12, color: colors.textLight },
  responseBox: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#F9FAFB', margin: -16, padding: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  responseLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  responseText: { fontSize: 14, color: colors.text, fontStyle: 'italic' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: colors.textLight, fontSize: 15 },
});
