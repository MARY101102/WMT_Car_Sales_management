import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen        from '../screens/LandingScreen';
import CarListScreen        from '../screens/CarListScreen';
import CarDetailScreen      from '../screens/CarDetailScreen';
import LoginScreen          from '../screens/LoginScreen';
import BookingScreen        from '../screens/BookingScreen';
import ProfileScreen        from '../screens/ProfileScreen';
import AdminDashboard       from '../screens/AdminDashboard';
import CreateStaffScreen    from '../screens/CreateStaffScreen';
import AddCarScreen         from '../screens/AddCarScreen';
import ManageBookingsScreen from '../screens/ManageBookingsScreen';
import AllUsersScreen       from '../screens/AllUsersScreen';
import UpdateProfileScreen  from '../screens/UpdateProfileScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import AddReviewScreen      from '../screens/AddReviewScreen';
import InquiriesScreen      from '../screens/InquiriesScreen';
import StaffDashboard       from '../screens/StaffDashboard';
import ManageInventoryScreen from '../screens/ManageInventoryScreen';
import EditCarScreen        from '../screens/EditCarScreen';
import ManageInquiriesScreen from '../screens/ManageInquiriesScreen';
import PromotionsScreen     from '../screens/PromotionsScreen';
import CreatePromotionScreen from '../screens/CreatePromotionScreen';
import ReviewModerationScreen from '../screens/ReviewModerationScreen';
import ReportsScreen        from '../screens/ReportsScreen';
import EditPromotionScreen from '../screens/EditPromotionScreen';

import SparePartsScreen from '../screens/SparePartsScreen';
import SparePartDetailScreen from '../screens/SparePartDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AdminSparePartsScreen from '../screens/AdminSparePartsScreen';
import AddSparePartScreen from '../screens/AddSparePartScreen';
import EditSparePartScreen from '../screens/EditSparePartScreen';
import SparePartAdminDetailScreen from '../screens/SparePartAdminDetailScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';

import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          contentStyle: { backgroundColor: colors.backgroundSecondary }
        }}
      >
        {/* Public */}
        <Stack.Screen name="Landing"  component={LandingScreen}  options={{ headerShown: false }} />
        <Stack.Screen name="CarList"  component={CarListScreen}  options={{ title: 'Our Inventory' }} />
        <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ title: 'Car Details' }} />
        <Stack.Screen name="Auth"     component={LoginScreen}    options={{ title: 'Sign In / Sign Up' }} />

        {/* Customer Protected */}
        <Stack.Screen name="Booking"        component={BookingScreen}        options={{ title: 'Book Test Drive' }} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile"        component={ProfileScreen}        options={{ title: 'My Profile' }} />
        <Stack.Screen name="UpdateProfile"  component={UpdateProfileScreen}  options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="AddReview"      component={AddReviewScreen}      options={{ title: 'Rate Vehicle' }} />
        <Stack.Screen name="Inquiries"      component={InquiriesScreen}      options={{ title: 'Support & Inquiries' }} />

        {/* Staff / Admin Dashboard Choice */}
        <Stack.Screen name="StaffDashboard" component={StaffDashboard}       options={{ title: 'Staff Panel' }} />
        <Stack.Screen name="Admin"          component={AdminDashboard}       options={{ title: 'Admin Panel' }} />

        {/* Shared Management */}
        <Stack.Screen name="AddCar"           component={AddCarScreen}         options={{ title: 'Add Vehicle' }} />
        <Stack.Screen name="EditCar"          component={EditCarScreen}        options={{ title: 'Edit Vehicle' }} />
        <Stack.Screen name="ManageInventory"  component={ManageInventoryScreen} options={{ title: 'Inventory' }} />
        <Stack.Screen name="ManageBookings"   component={ManageBookingsScreen}  options={{ title: 'Bookings' }} />
        <Stack.Screen name="ManageInquiries"  component={ManageInquiriesScreen} options={{ title: 'Inquiries' }} />

        {/* Admin Only */}
        <Stack.Screen name="CreateStaff"      component={CreateStaffScreen}     options={{ title: 'New Staff' }} />
        <Stack.Screen name="AllUsers"         component={AllUsersScreen}        options={{ title: 'User Management' }} />
        <Stack.Screen name="Promotions"       component={PromotionsScreen}      options={{ title: 'Promotions' }} />
        <Stack.Screen name="CreatePromotion"  component={CreatePromotionScreen} options={{ title: 'New Promotion' }} />
        <Stack.Screen name="EditPromotion"    component={EditPromotionScreen}   options={{ title: 'Edit Promotion' }} />
        <Stack.Screen name="ReviewModeration" component={ReviewModerationScreen} options={{ title: 'Moderation' }} />
        <Stack.Screen name="Reports"          component={ReportsScreen}         options={{ title: 'Reports' }} />

        {/* Spare Parts - Customer */}
        <Stack.Screen name="SpareParts"       component={SparePartsScreen}      options={{ title: 'Spare Parts' }} />
        <Stack.Screen name="SparePartDetail"  component={SparePartDetailScreen} options={{ title: 'Part Details' }} />
        <Stack.Screen name="Cart"             component={CartScreen}            options={{ title: 'Shopping Cart' }} />
        <Stack.Screen name="Checkout"         component={CheckoutScreen}        options={{ title: 'Checkout' }} />

        {/* Spare Parts - Admin */}
        <Stack.Screen name="AdminSpareParts"  component={AdminSparePartsScreen} options={{ title: 'Manage Spare Parts' }} />
        <Stack.Screen name="AddSparePart"     component={AddSparePartScreen}    options={{ title: 'Add Spare Part' }} />
        <Stack.Screen name="EditSparePart"    component={EditSparePartScreen}   options={{ title: 'Edit Spare Part' }} />
        <Stack.Screen name="SparePartAdminDetail" component={SparePartAdminDetailScreen} options={{ title: 'Part Details' }} />
        <Stack.Screen name="AdminOrders"      component={AdminOrdersScreen}     options={{ title: 'Manage Orders' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
