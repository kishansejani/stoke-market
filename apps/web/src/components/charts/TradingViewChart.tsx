import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  WhitespaceData,
  ColorType,
  Time,
} from 'lightweight-charts';
import { Candle, ChartRange } from '@stock-market/shared-types';
import { calculateSMA, calculateEMA, calculateBollingerBands, calculateRSI } from '@stock-market/shared-utils';

interface TradingViewChartProps {
  candles: Candle[];
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  height?: number;
}

export type ChartType = 'candlestick' | 'line' | 'area';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles,
  range,
  onRangeChange,
  height = 420,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showEMA20, setShowEMA20] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#151F30' },
        textColor: '#94A3B8',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.6)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.6)' },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1E293B',
      },
      crosshair: {
        vertLine: { color: '#3B82F6', width: 1, style: 2 },
        horzLine: { color: '#3B82F6', width: 1, style: 2 },
      },
    });

    chartRef.current = chart;

    if (candles.length > 0) {
      // Sort candles ascending by timestamp
      const sortedCandles = [...candles].sort((a, b) => Number(a.time) - Number(b.time));

      // 1. Primary Series based on selected chart type
      if (chartType === 'candlestick') {
        const candleSeries = chart.addCandlestickSeries({
          upColor: '#22C55E',
          downColor: '#EF4444',
          borderVisible: false,
          wickUpColor: '#22C55E',
          wickDownColor: '#EF4444',
        });
        const candleData: CandlestickData<Time>[] = sortedCandles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        candleSeries.setData(candleData);
      } else if (chartType === 'area') {
        const areaSeries = chart.addAreaSeries({
          topColor: 'rgba(59, 130, 246, 0.4)',
          bottomColor: 'rgba(59, 130, 246, 0.0)',
          lineColor: '#3B82F6',
          lineWidth: 2,
        });
        const lineData: LineData<Time>[] = sortedCandles.map((c) => ({
          time: c.time as Time,
          value: c.close,
        }));
        areaSeries.setData(lineData);
      } else {
        const lineSeries = chart.addLineSeries({
          color: '#3B82F6',
          lineWidth: 2,
        });
        const lineData: LineData<Time>[] = sortedCandles.map((c) => ({
          time: c.time as Time,
          value: c.close,
        }));
        lineSeries.setData(lineData);
      }

      // 2. Volume Series
      const volumeSeries = chart.addHistogramSeries({
        color: 'rgba(59, 130, 246, 0.3)',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      const volData = sortedCandles.map((c) => ({
        time: c.time as Time,
        value: c.volume || 0,
        color: c.close >= c.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
      }));
      volumeSeries.setData(volData);

      // 3. Technical Indicators: SMA 20
      if (showSMA20) {
        const sma20 = calculateSMA(sortedCandles, 20);
        if (sma20.length > 0) {
          const smaSeries = chart.addLineSeries({
            color: '#F59E0B', // Amber
            lineWidth: 2,
            title: 'SMA 20',
          });
          smaSeries.setData(sma20.map((s) => ({ time: s.time as Time, value: s.value })));
        }
      }

      // SMA 50
      if (showSMA50) {
        const sma50 = calculateSMA(sortedCandles, 50);
        if (sma50.length > 0) {
          const sma50Series = chart.addLineSeries({
            color: '#8B5CF6', // Purple
            lineWidth: 2,
            title: 'SMA 50',
          });
          sma50Series.setData(sma50.map((s) => ({ time: s.time as Time, value: s.value })));
        }
      }

      // EMA 20
      if (showEMA20) {
        const ema20 = calculateEMA(sortedCandles, 20);
        if (ema20.length > 0) {
          const emaSeries = chart.addLineSeries({
            color: '#06B6D4', // Cyan
            lineWidth: 2,
            title: 'EMA 20',
          });
          emaSeries.setData(ema20.map((s) => ({ time: s.time as Time, value: s.value })));
        }
      }

      // Bollinger Bands
      if (showBollinger) {
        const bb = calculateBollingerBands(sortedCandles, 20, 2);
        if (bb.length > 0) {
          const upperSeries = chart.addLineSeries({
            color: 'rgba(236, 72, 153, 0.7)',
            lineWidth: 1,
            title: 'BB Upper',
          });
          const lowerSeries = chart.addLineSeries({
            color: 'rgba(236, 72, 153, 0.7)',
            lineWidth: 1,
            title: 'BB Lower',
          });
          upperSeries.setData(bb.map((b) => ({ time: b.time as Time, value: b.upper })));
          lowerSeries.setData(bb.map((b) => ({ time: b.time as Time, value: b.lower })));
        }
      }

      chart.timeScale().fitContent();
    }

    // Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartContainerRef.current) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, chartType, showSMA20, showSMA50, showEMA20, showBollinger, height]);

  const ranges: ChartRange[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

  return (
    <div className="w-full bg-[#151F30] rounded-2xl border border-[#1E293B] overflow-hidden p-4 space-y-3">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        {/* Chart Series Type */}
        <div className="flex items-center space-x-1 p-1 bg-[#0B1220] rounded-lg border border-[#1E293B] text-xs">
          <button
            onClick={() => setChartType('candlestick')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              chartType === 'candlestick' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Candles
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              chartType === 'area' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              chartType === 'line' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Line
          </button>
        </div>

        {/* Technical Indicators Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              showSMA20
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-[#0B1220] text-slate-400 border-[#1E293B] hover:text-white'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              showSMA50
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                : 'bg-[#0B1220] text-slate-400 border-[#1E293B] hover:text-white'
            }`}
          >
            SMA 50
          </button>
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              showEMA20
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-[#0B1220] text-slate-400 border-[#1E293B] hover:text-white'
            }`}
          >
            EMA 20
          </button>
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
              showBollinger
                ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                : 'bg-[#0B1220] text-slate-400 border-[#1E293B] hover:text-white'
            }`}
          >
            Bollinger
          </button>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 p-1 bg-[#0B1220] rounded-lg border border-[#1E293B] text-xs">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                range === r ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Lightweight Chart DOM Container */}
      <div ref={chartContainerRef} className="w-full relative min-h-[380px]" />

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#1E293B]">
        <span>Powered by TradingView Lightweight Charts™</span>
        <span className="text-amber-400/90 font-mono">Simulated data for non-commercial sandbox</span>
      </div>
    </div>
  );
};
