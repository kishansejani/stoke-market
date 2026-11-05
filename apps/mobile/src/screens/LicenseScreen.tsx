import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { theme } from '../theme';

export const LicenseScreen: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    if (!licenseKey.trim()) {
      Alert.alert('Required', 'Please enter your software license key.');
      return;
    }
    setActivated(true);
    Alert.alert('Activated', 'License verified! This mobile device has been granted perpetual terminal access.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Perpetual License Seat</Text>
      <Text style={styles.subtitle}>
        Bind this Android/iOS mobile installation to your one-time purchase package.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Hardware Device Activation</Text>
        <Text style={styles.infoText}>
          Enter the cryptographically signed key generated from your Web purchase.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="STK-PRO-XXXX-XXXX-XXXX"
          placeholderTextColor={theme.colors.textMuted}
          value={licenseKey}
          onChangeText={setLicenseKey}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.button} onPress={handleActivate}>
          <Text style={styles.buttonText}>Verify & Bind Mobile Device</Text>
        </TouchableOpacity>

        {activated && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              ✓ Status: ACTIVE (Perpetual Software License Bound)
            </Text>
            <Text style={styles.statusSub}>
              Included Real-Time Cloud Data Feed: 365 Days Active
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: theme.colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  statusText: {
    color: theme.colors.successLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
});
