import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Mail, Lock, User as UserIcon, ShieldCheck, Users, Briefcase, Phone, Eye, EyeOff } from 'lucide-react-native';
import useStore from '../store/useStore';
import { colors } from '../theme/colors';
import { showSuccess, showError } from '../utils/toast';

const ROLES = [
  { label: 'Customer',  value: 'Customer',  Icon: Users,       desc: 'Browse & book vehicles'     },
];

// Staff and Admin accounts are created by the Admin — login below

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setRole]     = useState('Customer');
  const [isRegistering, setMode]    = useState(route.params?.screen === 'Register');
  const [loginError, setLoginError] = useState(false);

  const { login, register, isLoading, error } = useStore();

  const handleAuth = async () => {
    setLoginError(false);
    if (!email || !password || (isRegistering && (!name || !phoneNumber))) {
      showError('Please fill in all fields');
      return;
    }

    // isLoading is handled by the store actions
    try {
      if (isRegistering) {
        const success = await register(name, email, password, selectedRole, phoneNumber);
        if (success) {
          showSuccess('Account created successfully!');
          navigation.navigate('Landing');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          showSuccess('Login successful! Welcome back.');
          navigation.navigate('Landing');
        } else {
          setLoginError(true);
          showError('Invalid email or password');
        }
      }
    } catch (err) {
      setLoginError(true);
      showError('Invalid email or password');
    } finally {
    // isLoading is handled by the store actions
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Car<Text style={{ color: colors.primary }}>Hub</Text></Text>
          <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Sign up to get started' : 'Login to access your account'}
          </Text>
        </View>

        {/* Role Selector — only shown when registering */}
        {isRegistering && (
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Select Account Type</Text>
            <View style={styles.roleGrid}>
              {ROLES.map(({ label, value, Icon, desc }) => {
                const active = selectedRole === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                    onPress={() => setRole(value)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconCircle, active && styles.roleIconCircleActive]}>
                      <Icon size={20} color={active ? '#fff' : colors.textLight} strokeWidth={1.8} />
                    </View>
                    <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>{label}</Text>
                    <Text style={styles.roleDesc}>{desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Fields */}
        {isRegistering && (
          <>
            <View style={styles.inputContainer}>
              <UserIcon color={colors.textLight} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textLight}
              />
            </View>
            <View style={styles.inputContainer}>
              <Phone color={colors.textLight} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number (10 digits)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </>
        )}

        <View style={[styles.inputContainer, loginError && styles.inputError]}>
          <Mail color={colors.textLight} size={20} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => { setEmail(text); setLoginError(false); }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={[styles.inputContainer, loginError && styles.inputError]}>
          <Lock color={colors.textLight} size={20} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => { setPassword(text); setLoginError(false); }}
            secureTextEntry={!showPassword}
            placeholderTextColor={colors.textLight}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff color={colors.textLight} size={20} />
            ) : (
              <Eye color={colors.textLight} size={20} />
            )}
          </TouchableOpacity>
        </View>

        {!isRegistering && (
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? `Sign Up as ${selectedRole}` : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Switch mode */}
        <TouchableOpacity style={styles.switchButton} onPress={() => setMode(!isRegistering)}>
          <Text style={styles.switchTextBody}>
            {isRegistering ? 'Already have an account?  ' : "Don't have an account?  "}
            <Text style={styles.switchTextHighlight}>
              {isRegistering ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  formContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  // Role selector
  roleSection: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0F2',
  },
  roleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleIconCircleActive: {
    backgroundColor: colors.primary,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  roleTitleActive: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 14,
  },
  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchTextBody: {
    color: colors.textLight,
    fontSize: 15,
  },
  switchTextHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
});
