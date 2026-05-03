import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function SparePartAdminDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPart();
  }, [id]);

  const fetchPart = async () => {
    try {
      const res = await api.get(`/spare-parts/${id}`);
      setPart(res.data.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error loading details' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!part) return null;

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: part.image || 'https://via.placeholder.com/400' }} style={styles.image} />
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InfoRow label="Part Name" value={part.partName} />
        <InfoRow label="Part Number" value={part.partNumber} />
        <InfoRow label="Slug" value={part.slug} />
        <InfoRow label="Brand" value={part.brand} />
        <InfoRow label="Category" value={part.category?.join(', ')} />
        <InfoRow label="Status" value={part.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pricing & Stock</Text>
        <InfoRow label="Price" value={`Rs ${part.salePrice.toLocaleString()}`} />
        <InfoRow label="Stock Quantity" value={part.stockQuantity} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Descriptions & Meta</Text>
        <Text style={styles.descText}><Text style={styles.bold}>Short Desc:</Text> {part.shortDescription || 'N/A'}</Text>
        <Text style={styles.descText}><Text style={styles.bold}>Meta Title:</Text> {part.metaTitle || 'N/A'}</Text>
        <Text style={styles.descText}><Text style={styles.bold}>Meta Desc:</Text> {part.metaDescription || 'N/A'}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  image: { width: '100%', height: 200, resizeMode: 'contain', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 14, color: colors.textLight, fontWeight: '500' },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '600' },
  descText: { fontSize: 14, color: colors.text, marginBottom: 8, lineHeight: 20 },
  bold: { fontWeight: '700', color: colors.textLight }
});
