import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Search, ChevronRight, CarFront, Zap, Shield, Sparkles } from 'lucide-react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import useStore from '../store/useStore';
import { getImageUrl } from '../utils/imageUrl';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'SUV', Icon: Shield },
  { id: '2', name: 'Sedan', Icon: CarFront },
  { id: '3', name: 'Luxury', Icon: Sparkles },
  { id: '4', name: 'Electric', Icon: Zap }
];

export default function LandingScreen({ navigation }) {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [latestCars, setLatestCars] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useStore();

  useEffect(() => {
    fetchCars();
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/promotions');
      setPromotions(response.data.data || []);
    } catch (error) {
      console.log('Error fetching promotions', error);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars?limit=10');
      const allCars = response.data.data.cars || [];
      setFeaturedCars(allCars.slice(0, 5));
      setLatestCars(allCars.slice(0, 8));
    } catch (error) {
      console.log('Error fetching cars', error);
    }
  };

  const handleSearch = () => {
    navigation.navigate('CarList', { search: searchQuery });
  };

  const renderCarCard = (car, isFeatured = false) => (
    <TouchableOpacity
      key={car._id}
      style={[styles.carCard, isFeatured ? styles.featuredCard : styles.latestCard]}
      onPress={() => navigation.navigate('CarDetail', { carId: car._id })}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl(car.mainImage) }}
          style={styles.carImage}
        />
        {car.condition === 'New' && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
      </View>
      <View style={styles.carInfo}>
        <View style={styles.carHeaderRow}>
          <Text style={styles.carBrand} numberOfLines={1}>{car.brand} {car.model}</Text>
        </View>
        <Text style={styles.carPrice}>Rs {car.price.toLocaleString()}</Text>
        <View style={styles.carMeta}>
          <Text style={styles.metaText}>{car.year}</Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{car.transmission}</Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{car.fuelType}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>

          {/* Top Navigation Bar */}
          <View style={styles.topNav}>
            <Text style={styles.logoText}>Car<Text style={{ color: colors.primary }}>Hub</Text></Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate(isAuthenticated ? 'Profile' : 'Auth')}
            >
              <Text style={styles.loginBtnText}>{isAuthenticated ? 'Profile' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Find Your Dream Car Today</Text>
            <Text style={styles.heroSubtitle}>Explore the premium marketplace for modern vehicles</Text>

            <View style={styles.searchContainer}>
              <Search color={colors.textLight} size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search brand, model..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
            {promotions.map(promo => (
              <View key={promo._id} style={styles.promoCard}>
                <Image source={{ uri: getImageUrl(promo.bannerImage) }} style={styles.promoImage} />
                <View style={styles.promoOverlay}>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoValue}>
                    {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `Rs ${promo.discountValue} OFF`}
                  </Text>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>CODE: {promo.code}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map(cat => {
            const IconComponent = cat.Icon;
            return (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => navigation.navigate('CarList', { category: cat.name })}>
                <View style={styles.iconCircle}>
                  <IconComponent color={colors.primary} size={24} strokeWidth={1.5} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
          {(!user || user.role === 'Customer') && (
            <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('SpareParts')}>
              <View style={styles.iconCircle}>
                <Zap color={colors.primary} size={24} strokeWidth={1.5} />
              </View>
              <Text style={styles.categoryName}>Spare Parts</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Featured Cars Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Vehicles</Text>
          <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate('CarList')}>
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight color={colors.primary} size={16} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredContainer}>
          {featuredCars.length > 0 ? (
            featuredCars.map(car => renderCarCard(car, true))
          ) : (
            <Text style={styles.emptyText}>Loading featured cars...</Text>
          )}
        </ScrollView>
      </View>

      {/* Latest Inventory Section */}
      <View style={[styles.section, styles.latestSection]}>
        <Text style={styles.sectionTitle}>Latest Inventory</Text>
        <View style={styles.latestGrid}>
          {latestCars.length > 0 ? (
            latestCars.map(car => renderCarCard(car, false))
          ) : (
            <Text style={styles.emptyText}>Loading inventory...</Text>
          )}
        </View>

        <TouchableOpacity style={styles.browseAllBtn} onPress={() => navigation.navigate('CarList')}>
          <Text style={styles.browseAllBtnText}>Browse Full Inventory</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary, // Using the slight off-white background
  },
  heroSection: {
    height: 380,
    position: 'relative',
    backgroundColor: '#37508aff', // Premium dark slate background
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(225, 29, 72, 0.05)', // Very subtle primary color tint
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // for status bar spacing
    width: '100%',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loginBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  heroContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end', // Push text to bottom half
    paddingBottom: 40,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: '#E2E8F0',
    fontSize: 16,
    marginBottom: 30,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 100, // Fully rounded search bar
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  section: {
    paddingVertical: 24,
  },
  latestSection: {
    paddingBottom: 50,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
    marginRight: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    width: 95,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE4E6', // Very faint red tint for icon background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  featuredContainer: {
    paddingHorizontal: 15,
  },
  carCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  featuredCard: {
    width: width * 0.75,
    marginHorizontal: 5,
  },
  latestGrid: {
    paddingHorizontal: 20,
    flexDirection: 'column',
    gap: 16,
  },
  latestCard: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 190,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  carInfo: {
    padding: 16,
  },
  carHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  carBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  carPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  carMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  emptyText: {
    paddingHorizontal: 20,
    color: colors.textLight,
  },
  browseAllBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  browseAllBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  promoSection: {
    paddingVertical: 20,
  },
  promoScroll: {
    paddingHorizontal: 15,
  },
  promoCard: {
    width: width * 0.8,
    height: 160,
    marginHorizontal: 5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'center',
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  promoBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  }
});
