import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { formatCurrency, formatPercentage } from '@stock-market/shared-utils';
import { NormalizedQuote } from '@stock-market/shared-types';

interface StockDetailScreenProps {
  symbol: string;
  onBack: () => void;
}

export const StockDetailScreen: React.FC<StockDetailScreenProps> = ({ symbol, onBack }) => {
  const [quote, setQuote] = useState<NormalizedQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/stocks/${encodeURIComponent(symbol)}`);
        const json = await res.json();
        if (json.success) {
          setQuote(json.data);
        }
      } catch {
        // Fallback simulated quote
        const isIndia = symbol.includes('.NS') || symbol.includes('.BO') || symbol.includes('NIFTY') || symbol.includes('SENSEX');
        setQuote({
          symbol,
          ticker: symbol.split('.')[0],
          name: `${symbol.split('.')[0]} Enterprise`,
          exchange: isIndia ? 'NSE' : 'NASDAQ',
          market: isIndia ? 'IN' : 'US',
          currency: isIndia ? 'INR' : 'USD',
          price: isIndia ? 2845.5 : 232.4,
          previousClose: isIndia ? 2813.4 : 228.6,
          open: isIndia ? 2820.0 : 229.5,
          high: isIndia ? 2862.0 : 233.8,
          low: isIndia ? 2810.0 : 228.9,
          volume: 6842000,
          change: isIndia ? 32.1 : 3.8,
          changePercent: isIndia ? 1.14 : 1.66,
          day52WeekHigh: isIndia ? 3350.0 : 250.0,
          day52WeekLow: isIndia ? 2100.0 : 160.0,
          marketCap: isIndia ? 19250000000000 : 3520000000000,
          peRatio: 28.4,
          isSimulated: true,
          delayMinutes: 0,
          dataSource: 'SIMULATED DATA',
          lastTradeAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [symbol]);

  if (loading || !quote) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to Overview</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.tickerText}>{quote.ticker}</Text>
          <Text style={styles.exchangeBadge}>{quote.exchange}</Text>
          <Text style={styles.simBadge}>SIMULATED DATA</Text>
        </View>
        <Text style={styles.companyName}>{quote.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.mainPrice}>{formatCurrency(quote.price, quote.currency)}</Text>
          <Text style={[styles.changeText, { color: isPositive ? theme.colors.successLight : theme.colors.dangerLight }]}>
            {quote.change > 0 ? `+${quote.change}` : quote.change} ({formatPercentage(quote.changePercent)})
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Exchange Market Metrics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Day Open</Text>
          <Text style={styles.statValue}>{formatCurrency(quote.open, quote.currency)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Day High</Text>
          <Text style={[styles.statValue, { color: theme.colors.successLight }]}>
            {formatCurrency(quote.high, quote.currency)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Day Low</Text>
          <Text style={[styles.statValue, { color: theme.colors.dangerLight }]}>
            {formatCurrency(quote.low, quote.currency)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Prev Close</Text>
          <Text style={styles.statValue}>{formatCurrency(quote.previousClose, quote.currency)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statValue}>{quote.volume.toLocaleString()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>{formatCurrency(quote.marketCap, quote.currency, { compact: true })}</Text>
        </View>
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
  backButton: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  headerCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tickerText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  exchangeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  simBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: theme.colors.warning,
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  companyName: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  mainPrice: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  changeText: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    width: '48%',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

