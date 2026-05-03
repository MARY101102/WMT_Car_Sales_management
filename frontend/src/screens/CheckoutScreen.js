import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import useStore from '../store/useStore';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function CheckoutScreen({ navigation }) {
  const { cart, clearCart, user } = useStore();
  const [loading, setLoading] = useState(false);
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Sri Lanka');

  const itemsPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingPrice = 500; // Flat shipping rate
  const totalPrice = itemsPrice + shippingPrice;

  const handlePlaceOrder = async () => {
    if (!address || !city || !postalCode) {
      Toast.show({ type: 'error', text1: 'Please fill all address fields' });
      return;
    }
    
    if (!user) {
      Toast.show({ type: 'info', text1: 'Please login to checkout' });
      navigation.navigate('Auth');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: 'Cash on Delivery',
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        totalPrice
      };

      const res = await api.post('/orders', orderData);
      
      clearCart();
      Toast.show({ type: 'success', text1: 'Order placed successfully!' });
      // Navigate to a success screen or home
      navigation.navigate('Landing');
      
    } catch (error) {
      console.log('Checkout error:', error.response?.data || error);
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to place order' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Shipping Information</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Street Address" value={address} onChangeText={setAddress} placeholderTextColor={colors.textLight} />
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} placeholderTextColor={colors.textLight} />
        <TextInput style={styles.input} placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" placeholderTextColor={colors.textLight} />
        <TextInput style={styles.input} placeholder="Country" value={country} editable={false} placeholderTextColor={colors.textLight} />
      </View>

      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.card}>
        {cart.map(item => (
          <View key={item.sparePart} style={styles.summaryRow}>
            <Text style={styles.summaryText}>{item.name} x {item.quantity}</Text>
            <Text style={styles.summaryVal}>Rs {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Subtotal</Text>
          <Text style={styles.summaryVal}>Rs {itemsPrice.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Shipping</Text>
          <Text style={styles.summaryVal}>Rs {shippingPrice.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalVal}>Rs {totalPrice.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handlePlaceOrder} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Place Order (COD)</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12, marginTop: 10 },
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, marginBottom: 12, color: colors.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryText: { fontSize: 14, color: colors.textLight, flex: 1, paddingRight: 10 },
  summaryVal: { fontSize: 14, color: colors.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  totalText: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalVal: { fontSize: 18, fontWeight: '800', color: colors.primary },
  btn: { backgroundColor: colors.primary, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
