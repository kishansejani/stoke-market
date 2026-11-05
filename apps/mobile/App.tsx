import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';
import { StockDetailScreen } from './src/screens/StockDetailScreen';
import { LicenseScreen } from './src/screens/LicenseScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'watchlist' | 'license'>('home');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>
          STOKE <Text style={styles.proPill}>PRO</Text>
        </Text>
        <Text style={styles.marketStatusBadge}>● MARKET CONNECTED</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {selectedStock ? (
          <StockDetailScreen
            symbol={selectedStock}
            onBack={() => setSelectedStock(null)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen onSelectStock={(sym) => setSelectedStock(sym)} />
            )}
            {activeTab === 'watchlist' && (
              <WatchlistScreen onSelectStock={(sym) => setSelectedStock(sym)} />
            )}
            {activeTab === 'license' && <LicenseScreen />}
          </>
        )}
      </View>

      {/* Bottom Tab Bar */}
      {!selectedStock && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('home')}
          >
            <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
              Markets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('watchlist')}
          >
            <Text style={[styles.navText, activeTab === 'watchlist' && styles.navTextActive]}>
              Watchlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('license')}
          >
            <Text style={[styles.navText, activeTab === 'license' && styles.navTextActive]}>
              License
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  topBar: {
    height: 50,
    backgroundColor: theme.colors.secondaryBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  proPill: {
    color: theme.colors.primary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  marketStatusBadge: {
    color: theme.colors.successLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    height: 56,
    backgroundColor: theme.colors.secondaryBg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  navTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
