import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { formatCurrency } from '@stock-market/shared-utils';

interface WatchlistScreenProps {
  onSelectStock: (symbol: string) => void;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({ onSelectStock }) => {
  const [items, setItems] = useState([
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2845.5, change: '+1.14%', cur: 'INR' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3950.8, change: '-1.11%', cur: 'INR' },
    { symbol: 'AAPL.US', name: 'Apple Inc.', price: 232.4, change: '+1.66%', cur: 'USD' },
    { symbol: 'NVDA.US', name: 'NVIDIA Corporation', price: 141.5, change: '+3.13%', cur: 'USD' },
  ]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mobile Watchlist Stream</Text>
      <Text style={styles.subtitle}>Synchronized across your registered terminal devices</Text>

      <View style={styles.list}>
        {items.map((stk) => {
          const isUp = stk.change.startsWith('+');
          return (
            <TouchableOpacity
              key={stk.symbol}
              style={styles.card}
              onPress={() => onSelectStock(stk.symbol)}
            >
              <View>
                <Text style={styles.ticker}>{stk.symbol.split('.')[0]}</Text>
                <Text style={styles.name}>{stk.name}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{formatCurrency(stk.price, stk.cur as any)}</Text>
                <Text style={[styles.change, { color: isUp ? theme.colors.successLight : theme.colors.dangerLight }]}>
                  {stk.change}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticker: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  name: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  change: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

