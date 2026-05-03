import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const StarRating = ({ rating, onRatingChange }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map(s => (
      <TouchableOpacity key={s} onPress={() => onRatingChange(s)}>
        <Star 
          fill={s <= rating ? '#EAB308' : 'transparent'} 
          color={s <= rating ? '#EAB308' : colors.border} 
          size={36} 
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    ))}
  </View>
);

export default function AddReviewScreen({ route, navigation }) {
  const { carId, carName } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment) {
      showError('Please write a comment');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/cars/${carId}/reviews`, { rating, comment });
      showSuccess(res.data.message);
      navigation.goBack();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.carName}>{carName}</Text>
        <Text style={styles.label}>How was your experience?</Text>
        <StarRating rating={rating} onRatingChange={setRating} />
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Review Comment</Text>
          <View style={styles.textArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Tell us what you think about this car..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <CheckCircle2 color="#fff" size={20} />
              <Text style={styles.btnText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  carName: { fontSize: 14, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  label: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 20 },
  starRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  inputContainer: { width: '100%', marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: colors.textLight, marginBottom: 10 },
  textArea: { backgroundColor: colors.backgroundSecondary, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, height: 150 },
  textInput: { flex: 1, fontSize: 15, color: colors.text },
  btn: { backgroundColor: colors.primary, height: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
