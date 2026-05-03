import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, ActivityIndicator, Dimensions, RefreshControl
} from 'react-native';
import { MapPin, Gauge, Fuel, Settings2, Calendar, CheckCircle2, Clock, Star, MessageSquarePlus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import useStore from '../store/useStore';
import { getImageUrl } from '../utils/imageUrl';

const { width } = Dimensions.get('window');

const Spec = ({ Icon, label, value }) => (
  <View style={styles.specCard}>
    <Icon color={colors.primary} size={20} strokeWidth={1.8} />
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

export default function CarDetailScreen({ route, navigation }) {
  const { carId } = route.params;
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { isAuthenticated, user } = useStore();

  const fetchCarData = useCallback(async () => {
    try {
      // Fetch car details first
      const carRes = await api.get(`/cars/${carId}`);
      setCar(carRes.data.data);
      
      // Separately fetch reviews so it doesn't block if reviews route fails
      try {
        const reviewRes = await api.get(`/cars/${carId}/reviews`);
        setReviews(reviewRes.data.data || []);
      } catch (revErr) {
        console.log('Error fetching reviews', revErr);
      }
      
    } catch (err) {
      console.log('Error fetching car details', err);
      Alert.alert('Error', 'Could not load vehicle details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => { fetchCarData(); }, [fetchCarData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCarData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!car) return null;

  const images = car.images?.length > 0 ? [car.mainImage, ...car.images] : [car.mainImage];

  const handleBook = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to book a test drive.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Auth') }
      ]);
      return;
    }
    navigation.navigate('Booking', { carId: car._id });
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to submit a review.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Auth') }
      ]);
      return;
    }
    navigation.navigate('AddReview', { carId: car._id, carName: `${car.brand} ${car.model}` });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: getImageUrl(img) }}
                style={styles.mainImage}
              />
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />)}
            </View>
          )}
          <View style={[styles.statusPill, car.status !== 'Available' && styles.statusPillUnavail]}>
            <Text style={styles.statusPillText}>{car.status}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brandText}>{car.brand}</Text>
              <Text style={styles.title}>{car.model}</Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>Rs {car.price?.toLocaleString()}</Text>
              <Text style={styles.conditionText}>{car.condition}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin color={colors.textLight} size={14} />
            <Text style={styles.locationText}>{car.location || 'Main Showroom'}</Text>
          </View>

          <View style={styles.specsGrid}>
            <Spec Icon={Calendar}  label="Year"         value={String(car.year)} />
            <Spec Icon={Gauge}     label="Mileage"      value={`${car.mileage?.toLocaleString()} km`} />
            <Spec Icon={Fuel}      label="Fuel"         value={car.fuelType} />
            <Spec Icon={Settings2} label="Transmission" value={car.transmission} />
          </View>

          <Text style={styles.sectionTitle}>About this vehicle</Text>
          <Text style={styles.description}>{car.description}</Text>

          {/* Reviews Section */}
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {(!isAuthenticated || user?.role === 'Customer') && (
              <TouchableOpacity onPress={handleAddReview} style={styles.addReviewBtn}>
                <MessageSquarePlus color={colors.primary} size={20} />
                <Text style={styles.addReviewText}>Rate Car</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet. Be the first to rate!</Text>
          ) : (
            reviews.map(r => (
              <View key={r._id} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <Text style={styles.reviewUser}>{r.user?.name}</Text>
                  <View style={styles.reviewStars}>
                    {[1,2,3,4,5].map(s => <Star key={s} fill={s <= r.rating ? '#EAB308' : 'transparent'} color={s <= r.rating ? '#EAB308' : colors.border} size={12} />)}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {(!isAuthenticated || user?.role === 'Customer') && (
        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceLabel}>Total Price</Text>
            <Text style={styles.footerPriceValue}>Rs {car.price?.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, car.status !== 'Available' && styles.bookBtnDisabled]}
            onPress={handleBook}
            disabled={car.status !== 'Available'}
          >
            {car.status === 'Available' ? (
              <>
                <Calendar color="#fff" size={18} />
                <Text style={styles.bookBtnText}>Book Test Drive</Text>
              </>
            ) : (
              <Text style={styles.bookBtnText}>Not Available</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  galleryContainer: { position: 'relative' },
  mainImage: { width, height: 300 },
  dots: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 16, width: '100%', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 16 },
  statusPill: { position: 'absolute', top: 16, right: 16, backgroundColor: colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusPillUnavail: { backgroundColor: '#94A3B8' },
  statusPillText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  brandText: { fontSize: 13, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: '800', color: colors.text },
  conditionText: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  locationText: { color: colors.textLight, fontSize: 14 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  specCard: { width: '47%', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 6 },
  specLabel: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  specValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.textLight, lineHeight: 24, marginBottom: 30 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addReviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addReviewText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  noReviews: { color: colors.textLight, fontStyle: 'italic', marginBottom: 20 },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  reviewUserRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewUser: { fontSize: 14, fontWeight: '700', color: colors.text },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 14, color: colors.textLight, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 34, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: 16, position: 'absolute', bottom: 0, width: '100%' },
  footerPrice: { flex: 1 },
  footerPriceLabel: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  footerPriceValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  bookBtn: { flex: 2, flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  bookBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
