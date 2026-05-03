import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import useStore from './src/store/useStore';

export default function App() {
  const checkAuth = useStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}
