import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme';
import { formatCurrency, formatPercentage } from '@stock-market/shared-utils';
import { IndexSummary } from '@stock-market/shared-types';

interface HomeScreenProps {
  onSelectStock: (symbol: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectStock }) => {
  const [activeMarket, setActiveMarket] = useState<'IN' | 'US'>('IN');
  const [indices, setIndices] = useState<IndexSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fallback initial values if network server is booting
  const mockIndia: IndexSummary[] = [
    {
      symbol: 'NIFTY50.IDX',
      name: 'NIFTY 50',
      marketId: 'IN',
      exchangeId: 'NSE',
      currentValue: 24350.25,
      change: 149.75,
      changePercent: 0.62,
      high: 24410.8,
      low: 24190.1,
      previousClose: 24200.5,
      isSimulated: true,
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      symbol: 'BANKNIFTY.IDX',
      name: 'BANK NIFTY',
      marketId: 'IN',
      exchangeId: 'NSE',
      currentValue: 52180.6,
      change: 330.4,
      changePercent: 0.64,
      high: 52350.0,
      low: 51800.0,
      previousClose: 51850.2,
      isSimulated: true,
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      symbol: 'SENSEX.IDX',
      name: 'BSE SENSEX',
      marketId: 'IN',
      exchangeId: 'BSE',
      currentValue: 80120.45,
      change: 470.35,
      changePercent: 0.59,
      high: 80340.5,
      low: 79600.0,
      previousClose: 79650.1,
      isSimulated: true,
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
    },
  ];

  const mockUS: IndexSummary[] = [
    {
      symbol: 'SPX.IDX',
      name: 'S&P 500',
      marketId: 'US',
      exchangeId: 'NYSE',
      currentValue: 5864.2,
      change: 49.1,
      changePercent: 0.84,
      high: 5878.9,
      low: 5820.0,
      previousClose: 5815.1,
      isSimulated: true,
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      symbol: 'NDX.IDX',
      name: 'NASDAQ 100',
      marketId: 'US',
      exchangeId: 'NASDAQ',
      currentValue: 20380.4,
      change: 229.6,
      changePercent: 1.14,
      high: 20450.0,
      low: 20180.0,
      previousClose: 20150.8,
      isSimulated: true,
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
    },
  ];

  const loadData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/markets/${activeMarket}/summary`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setIndices(json.data);
      } else {
        setIndices(activeMarket === 'IN' ? mockIndia : mockUS);
      }
    } catch {
      setIndices(activeMarket === 'IN' ? mockIndia : mockUS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeMarket]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={theme.colors.primary} />
      }
    >
      {/* Disclaimer Banner */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          ⚠️ Development Sandbox Mode: Market Quotes Marked SIMULATED DATA
        </Text>
      </View>

      {/* Market Selector Pill */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeMarket === 'IN' && styles.tabButtonActive]}
          onPress={() => setActiveMarket('IN')}
        >
          <Text style={[styles.tabText, activeMarket === 'IN' && styles.tabTextActive]}>
            🇮🇳 India (NSE / BSE)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeMarket === 'US' && styles.tabButtonActive]}
          onPress={() => setActiveMarket('US')}
        >
          <Text style={[styles.tabText, activeMarket === 'US' && styles.tabTextActive]}>
            🇺🇸 USA (NASDAQ / NYSE)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Benchmark Indices List */}
      <Text style={styles.sectionTitle}>Benchmark Market Indices</Text>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.cardsContainer}>
          {indices.map((idx) => {
            const isPositive = idx.change >= 0;
            return (
              <TouchableOpacity
                key={idx.symbol}
                style={styles.card}
                onPress={() => onSelectStock(idx.symbol)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{idx.name}</Text>
                  <Text style={styles.badge}>{idx.exchangeId}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>{idx.currentValue.toLocaleString()}</Text>
                  <View style={[styles.changePill, isPositive ? styles.changePillUp : styles.changePillDown]}>
                    <Text style={[styles.changeText, isPositive ? styles.textUp : styles.textDown]}>
                      {formatPercentage(idx.changePercent)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>Prev: {idx.previousClose.toLocaleString()}</Text>
                  <Text style={styles.liveIndicator}>● STREAMING</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Featured Market Equities */}
      <Text style={styles.sectionTitle}>
        {activeMarket === 'IN' ? 'Featured Nifty Largecaps' : 'Featured US Megacaps'}
      </Text>

      <View style={styles.cardsContainer}>
        {(activeMarket === 'IN'
          ? [
              { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2845.5, change: '+1.14%' },
              { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3950.8, change: '-1.11%' },
              { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', price: 1685.2, change: '+1.52%' },
            ]
          : [
              { symbol: 'AAPL.US', name: 'Apple Inc.', price: 232.4, change: '+1.66%' },
              { symbol: 'NVDA.US', name: 'NVIDIA Corporation', price: 141.5, change: '+3.13%' },
              { symbol: 'MSFT.US', name: 'Microsoft Corporation', price: 428.15, change: '+1.39%' },
            ]
        ).map((stk) => (
          <TouchableOpacity
            key={stk.symbol}
            style={styles.stockRow}
            onPress={() => onSelectStock(stk.symbol)}
          >
            <View>
              <Text style={styles.cardTitle}>{stk.symbol.split('.')[0]}</Text>
              <Text style={styles.subText}>{stk.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.priceTextSmall}>
                {formatCurrency(stk.price, activeMarket === 'IN' ? 'INR' : 'USD')}
              </Text>
              <Text style={[styles.subText, { color: stk.change.startsWith('+') ? theme.colors.successLight : theme.colors.dangerLight }]}>
                {stk.change}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  disclaimerBox: {
    padding: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 16,
  },
  disclaimerText: {
    color: theme.colors.warning,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: theme.colors.border,
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  priceTextSmall: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  changePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changePillUp: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  changePillDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  textUp: {
    color: theme.colors.successLight,
  },
  textDown: {
    color: theme.colors.dangerLight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 41, 59, 0.5)',
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  liveIndicator: {
    color: theme.colors.successLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
  stockRow: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
});

