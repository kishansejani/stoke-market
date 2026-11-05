import { Candle } from '@stock-market/shared-types';

export interface IndicatorPoint {
  time: number | string;
  value: number;
}

export interface MACDResult {
  time: number | string;
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerBandsResult {
  time: number | string;
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Calculates Simple Moving Average (SMA) for a list of candles.
 */
export function calculateSMA(candles: Candle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];

  const results: IndicatorPoint[] = [];
  let sum = 0;

  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) {
      sum -= candles[i - period].close;
    }

    if (i >= period - 1) {
      results.push({
        time: candles[i].time,
        value: Number((sum / period).toFixed(4)),
      });
    }
  }

  return results;
}

/**
 * Calculates Exponential Moving Average (EMA).
 */
export function calculateEMA(candles: Candle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];

  const results: IndicatorPoint[] = [];
  const multiplier = 2 / (period + 1);

  // Initialize first EMA as the SMA of the first `period` elements
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;
  results.push({
    time: candles[period - 1].time,
    value: Number(prevEma.toFixed(4)),
  });

  for (let i = period; i < candles.length; i++) {
    const currentPrice = candles[i].close;
    const currentEma = (currentPrice - prevEma) * multiplier + prevEma;
    prevEma = currentEma;
    results.push({
      time: candles[i].time,
      value: Number(currentEma.toFixed(4)),
    });
  }

  return results;
}

/**
 * Calculates Relative Strength Index (RSI) using Wilder's smoothing method.
 */
export function calculateRSI(candles: Candle[], period: number = 14): IndicatorPoint[] {
  if (candles.length <= period) return [];

  const results: IndicatorPoint[] = [];
  let gains = 0;
  let losses = 0;

  // First period calculations
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

  results.push({
    time: candles[period].time,
    value: Number(rsi.toFixed(2)),
  });

  // Subsequent calculations with Wilder's smoothing
  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    results.push({
      time: candles[i].time,
      value: Number(rsi.toFixed(2)),
    });
  }

  return results;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence).
 * Standard parameters: fast = 12, slow = 26, signal = 9
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  if (candles.length < slowPeriod + signalPeriod) return [];

  const emaFast = calculateEMA(candles, fastPeriod);
  const emaSlow = calculateEMA(candles, slowPeriod);

  // Map slow EMA times to fast EMA
  const fastMap = new Map(emaFast.map((item) => [item.time, item.value]));

  const macdLine: IndicatorPoint[] = [];
  for (const slowItem of emaSlow) {
    const fastVal = fastMap.get(slowItem.time);
    if (fastVal !== undefined) {
      macdLine.push({
        time: slowItem.time,
        value: Number((fastVal - slowItem.value).toFixed(4)),
      });
    }
  }

  // Calculate signal line (EMA of MACD line)
  if (macdLine.length < signalPeriod) return [];

  // Convert MACD line items to fake candles for EMA helper
  const macdCandles: Candle[] = macdLine.map((item) => ({
    time: item.time,
    open: item.value,
    high: item.value,
    low: item.value,
    close: item.value,
  }));

  const signalLine = calculateEMA(macdCandles, signalPeriod);
  const signalMap = new Map(signalLine.map((item) => [item.time, item.value]));

  const results: MACDResult[] = [];
  for (const m of macdLine) {
    const sigVal = signalMap.get(m.time);
    if (sigVal !== undefined) {
      results.push({
        time: m.time,
        macd: m.value,
        signal: sigVal,
        histogram: Number((m.value - sigVal).toFixed(4)),
      });
    }
  }

  return results;
}

/**
 * Calculates Bollinger Bands (Upper, Middle = SMA, Lower = Middle - (stdDev * multiplier)).
 */
export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  multiplier: number = 2
): BollingerBandsResult[] {
  if (candles.length < period) return [];

  const results: BollingerBandsResult[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, c) => acc + c.close, 0);
    const mean = sum / period;

    const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    results.push({
      time: candles[i].time,
      middle: Number(mean.toFixed(4)),
      upper: Number((mean + stdDev * multiplier).toFixed(4)),
      lower: Number((mean - stdDev * multiplier).toFixed(4)),
    });
  }

  return results;
}
