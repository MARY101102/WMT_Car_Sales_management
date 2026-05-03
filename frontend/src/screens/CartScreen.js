import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import useStore from '../store/useStore';
import { Trash2, Plus, Minus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateCartQuantity } = useStore();

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Toast.show({ type: 'error', text1: 'Cart is empty' });
      return;
    }
    navigation.navigate('Checkout');
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('SpareParts')}>
          <Text style={styles.shopBtnText}>Browse Spare Parts</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {cart.map((item) => (
          <View key={item.sparePart} style={styles.cartItem}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.itemImg} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemPrice}>Rs {item.price.toLocaleString()}</Text>
              
              <View style={styles.itemActions}>
                <View style={styles.qtyBox}>
                  <TouchableOpacity onPress={() => updateCartQuantity(item.sparePart, Math.max(1, item.quantity - 1))}>
                    <Minus size={16} color={colors.textLight} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateCartQuantity(item.sparePart, item.quantity + 1)}>
                    <Plus size={16} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.sparePart)} style={styles.delBtn}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Amount:</Text>
          <Text style={styles.totalPrice}>Rs {totalAmount.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  scrollContent: { padding: 16, paddingBottom: 30 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: colors.textLight, marginBottom: 20 },
  shopBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cartItem: { flexDirection: 'row', backgroundColor: colors.surface, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  itemImg: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemPrice: { fontSize: 15, fontWeight: '800', color: colors.primary, marginVertical: 4 },
  itemActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, width: 80, justifyContent: 'space-between' },
  qtyText: { fontSize: 14, fontWeight: '600', color: colors.text },
  delBtn: { padding: 4 },
  footer: { backgroundColor: colors.surface, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryText: { fontSize: 16, color: colors.textLight, fontWeight: '500' },
  totalPrice: { fontSize: 20, color: colors.text, fontWeight: '800' },
  checkoutBtn: { backgroundColor: colors.primary, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
