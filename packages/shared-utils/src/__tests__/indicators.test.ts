import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
} from '../indicators.js';
import { formatCurrency, formatPercentage, formatVolume } from '../formatters.js';
import { getMarketSessionStatus } from '../marketTime.js';
import { Candle } from '@stock-market/shared-types';

const sampleCandles: Candle[] = [
  { time: 1, open: 100, high: 105, low: 99, close: 102 },
  { time: 2, open: 102, high: 106, low: 101, close: 105 },
  { time: 3, open: 105, high: 108, low: 104, close: 107 },
  { time: 4, open: 107, high: 110, low: 106, close: 108 },
  { time: 5, open: 108, high: 112, low: 107, close: 111 },
  { time: 6, open: 111, high: 115, low: 110, close: 114 },
  { time: 7, open: 114, high: 116, low: 112, close: 113 },
  { time: 8, open: 113, high: 115, low: 111, close: 112 },
  { time: 9, open: 112, high: 117, low: 111, close: 116 },
  { time: 10, open: 116, high: 120, low: 115, close: 119 },
  { time: 11, open: 119, high: 121, low: 117, close: 118 },
  { time: 12, open: 118, high: 122, low: 117, close: 121 },
  { time: 13, open: 121, high: 125, low: 120, close: 124 },
  { time: 14, open: 124, high: 128, low: 123, close: 127 },
  { time: 15, open: 127, high: 130, low: 126, close: 129 },
  { time: 16, open: 129, high: 131, low: 128, close: 130 },
];

describe('Technical Indicators & Financial Utilities', () => {
  it('calculates Simple Moving Average (SMA) correctly', () => {
    const sma3 = calculateSMA(sampleCandles, 3);
    assert.equal(sma3.length, sampleCandles.length - 2);
    // (102 + 105 + 107) / 3 = 104.6667
    assert.ok(Math.abs(sma3[0].value - 104.6667) < 0.001);
  });

  it('calculates Exponential Moving Average (EMA) correctly', () => {
    const ema3 = calculateEMA(sampleCandles, 3);
    assert.equal(ema3.length, sampleCandles.length - 2);
    assert.ok(Math.abs(ema3[0].value - 104.6667) < 0.001);
    assert.ok(ema3[1].value > 104.6667);
  });

  it('calculates RSI values within 0 and 100 range', () => {
    const rsi = calculateRSI(sampleCandles, 14);
    assert.ok(rsi.length > 0);
    for (const point of rsi) {
      assert.ok(point.value >= 0 && point.value <= 100);
    }
  });

  it('calculates Bollinger Bands correctly with upper > middle > lower', () => {
    const bb = calculateBollingerBands(sampleCandles, 5, 2);
    assert.equal(bb.length, sampleCandles.length - 4);
    for (const b of bb) {
      assert.ok(b.upper >= b.middle);
      assert.ok(b.middle >= b.lower);
    }
  });

  it('formats currency correctly for INR and USD', () => {
    assert.ok(formatCurrency(2845.5, 'INR').includes('2,845.50'));
    assert.ok(formatCurrency(195.25, 'USD').includes('195.25'));
    assert.equal(formatCurrency(150000000, 'INR', { compact: true }), '₹15.00 Cr');
    assert.equal(formatCurrency(3000000000, 'USD', { compact: true }), '$3.00 B');
  });

  it('formats percentages with signs', () => {
    assert.equal(formatPercentage(3.45), '+3.45%');
    assert.equal(formatPercentage(-1.2), '-1.20%');
    assert.equal(formatPercentage(0), '0.00%');
  });

  it('formats volume compactly', () => {
    assert.equal(formatVolume(5200000), '5.20M');
    assert.equal(formatVolume(1200000000), '1.20B');
  });

  it('returns valid session status for Indian and US markets', () => {
    const inStatus = getMarketSessionStatus('IN');
    assert.ok(['OPEN', 'CLOSED', 'PRE_MARKET'].includes(inStatus.status));
    assert.equal(inStatus.timezone, 'Asia/Kolkata');

    const usStatus = getMarketSessionStatus('US');
    assert.ok(['OPEN', 'CLOSED', 'PRE_MARKET', 'AFTER_HOURS'].includes(usStatus.status));
    assert.equal(usStatus.timezone, 'America/New_York');
  });
});
