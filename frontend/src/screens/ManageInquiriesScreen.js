import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Platform, Alert } from 'react-native';
import { MessageCircle, Send, User, Clock, X, MessageSquare } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

export default function ManageInquiriesScreen() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [submitting, setSubmitting] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching all inquiries...');
      const res = await api.get('/inquiries/all');
      console.log('Inquiries fetched:', res.data.data?.length);
      setInquiries(res.data.data || []);
    } catch (err) {
      console.error('Fetch inquiries error:', err);
      showError(err.response?.data?.message || 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleRespond = async () => {
    if (!response) {
      showError('Please write a response');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.patch(`/inquiries/${selectedInquiry._id}/respond`, { response, status });
      showSuccess(res.data.message);
      setResponse('');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      showError('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Inquiry', 'Are you sure you want to delete this resolved inquiry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/inquiries/${id}`);
          showSuccess('Inquiry deleted');
          fetchInquiries();
        } catch (err) {
          showError(err.response?.data?.message || 'Delete failed');
        }
      }}
    ]);
  };

  const renderInquiry = ({ item }) => (
    <TouchableOpacity 
      style={styles.inquiryCard} 
      onPress={() => {
        setSelectedInquiry(item);
        setResponse(item.response || '');
        setStatus(item.status === 'Pending' ? 'In Progress' : item.status);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userIconCircle}>
            <User color={colors.primary} size={14} />
          </View>
          <View>
            <Text style={styles.userName}>{item.user?.name || 'Anonymous'}</Text>
            <Text style={styles.userEmail}>{item.user?.email}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'Resolved' ? '#D1FAE5' : item.status === 'In Progress' ? '#DBEAFE' : '#FEF3C7' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'Resolved' ? '#065F46' : item.status === 'In Progress' ? '#1E40AF' : '#92400E' 
          }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Clock color={colors.textLight} size={14} />
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        {item.status === 'Resolved' && (
          <TouchableOpacity 
            style={{ padding: 4 }} 
            onPress={(e) => { e.stopPropagation(); handleDelete(item._id); }}
          >
            <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>DELETE</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && inquiries.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading inquiries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageSquare color={colors.primary} size={20} />
        <Text style={styles.count}>{inquiries.length} customer inquiries</Text>
      </View>
      
      <FlatList
        data={inquiries}
        keyExtractor={i => i._id}
        renderItem={renderInquiry}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageCircle color={colors.border} size={60} strokeWidth={1} />
            <Text style={styles.empty}>No inquiries found</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchInquiries}>
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={!!selectedInquiry} animationType="slide" transparent onRequestClose={() => setSelectedInquiry(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inquiry Details</Text>
              <TouchableOpacity onPress={() => setSelectedInquiry(null)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>From</Text>
                <Text style={styles.detailValue}>{selectedInquiry?.customerName} ({selectedInquiry?.phoneNumber})</Text>
                {selectedInquiry?.user?.email && <Text style={{fontSize: 12, color: colors.textLight}}>{selectedInquiry?.user?.email}</Text>}
              </View>
              {selectedInquiry?.invoiceNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice Number</Text>
                  <Text style={styles.detailValue}>{selectedInquiry.invoiceNumber}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subject</Text>
                <Text style={styles.detailValue}>{selectedInquiry?.subject}</Text>
              </View>
              <View style={styles.messageBox}>
                <Text style={styles.detailLabel}>Message</Text>
                <Text style={styles.messageText}>{selectedInquiry?.message}</Text>
              </View>

              <Text style={styles.responseLabel}>Your Response</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                {['In Progress', 'Resolved'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusOption, status === s && styles.statusOptionActive]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.responseInput}
                  placeholder="Write your response here..."
                  value={response}
                  onChangeText={setResponse}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleRespond} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Send color="#fff" size={18} />
                  <Text style={styles.submitBtnText}>Send Response</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: colors.textLight, fontSize: 14, fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  count: { fontSize: 14, color: colors.text, fontWeight: '700' },
  inquiryCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 11, color: colors.textLight },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  subject: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  message: { fontSize: 14, color: colors.textLight, lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.backgroundSecondary },
  date: { fontSize: 12, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 24, width: '100%', maxWidth: 500, maxHeight: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  modalBody: { flex: 1 },
  detailRow: { marginBottom: 16 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  detailValue: { fontSize: 15, color: colors.text, fontWeight: '600' },
  messageBox: { backgroundColor: colors.backgroundSecondary, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  messageText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  responseLabel: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  inputContainer: { backgroundColor: colors.backgroundSecondary, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  responseInput: { padding: 16, fontSize: 15, color: colors.text, height: 120 },
  submitBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  empty: { fontSize: 16, color: colors.textLight, fontWeight: '600' },
  refreshBtn: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.primary },
  refreshBtnText: { color: '#fff', fontWeight: '700' },
  statusOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  statusOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusOptionText: { fontSize: 13, color: colors.textLight, fontWeight: '600' },
  statusOptionTextActive: { color: '#fff' }
});
