/**
 * Technical Indicator Calculations
 * Simple implementations for RSI, MACD, and Stochastic oscillators
 */

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp?: number;
}

export interface RSIResult {
  value: number;
  signal: 'overbought' | 'oversold' | 'neutral';
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface StochasticResult {
  k: number;
  d: number;
  signal: 'overbought' | 'oversold' | 'neutral';
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period = 14): RSIResult {
  if (prices.length < period + 1) {
    return { value: 50, signal: 'neutral' };
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI for remaining periods using smoothed averages
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return { value: 100, signal: 'overbought' };
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral';
  if (rsi > 70) signal = 'overbought';
  else if (rsi < 30) signal = 'oversold';

  return { value: rsi, signal };
}

/**
 * Calculate EMA (Exponential Moving Average)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA for first value
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) {
    sum += prices[i];
  }
  ema.push(sum / Math.min(period, prices.length));

  // Calculate EMA for remaining values
  for (let i = 1; i < prices.length; i++) {
    const currentEMA = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    ema.push(currentEMA);
  }

  return ema;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[], 
  fastPeriod = 12, 
  slowPeriod = 26, 
  signalPeriod = 9
): MACDResult {
  if (prices.length < slowPeriod) {
    return { macd: 0, signal: 0, histogram: 0, trend: 'neutral' };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine: number[] = [];
  const minLength = Math.min(fastEMA.length, slowEMA.length);

  for (let i = 0; i < minLength; i++) {
    macdLine.push(fastEMA[i] - slowEMA[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = [];

  for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }

  const currentMACD = macdLine[macdLine.length - 1] || 0;
  const currentSignal = signalLine[signalLine.length - 1] || 0;
  const currentHistogram = histogram[histogram.length - 1] || 0;

  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (currentMACD > currentSignal && currentHistogram > 0) {
    trend = 'bullish';
  } else if (currentMACD < currentSignal && currentHistogram < 0) {
    trend = 'bearish';
  }

  return {
    macd: currentMACD,
    signal: currentSignal,
    histogram: currentHistogram,
    trend,
  };
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  candles: CandleData[], 
  kPeriod = 14, 
  dPeriod = 3
): StochasticResult {
  if (candles.length < kPeriod) {
    return { k: 50, d: 50, signal: 'neutral' };
  }

  const kValues: number[] = [];

  for (let i = kPeriod - 1; i < candles.length; i++) {
    const periodCandles = candles.slice(i - kPeriod + 1, i + 1);
    const highest = Math.max(...periodCandles.map(c => c.high));
    const lowest = Math.min(...periodCandles.map(c => c.low));
    const current = candles[i].close;

    const k = ((current - lowest) / (highest - lowest)) * 100;
    kValues.push(k);
  }

  // Calculate %D (SMA of %K)
  const dValues: number[] = [];
  for (let i = dPeriod - 1; i < kValues.length; i++) {
    const sum = kValues.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
    dValues.push(sum / dPeriod);
  }

  const currentK = kValues[kValues.length - 1] || 50;
  const currentD = dValues[dValues.length - 1] || 50;

  let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral';
  if (currentK > 80 && currentD > 80) signal = 'overbought';
  else if (currentK < 20 && currentD < 20) signal = 'oversold';

  return { k: currentK, d: currentD, signal };
}

/**
 * Generate composite signal from multiple indicators
 */
export function generateCompositeSignal(
  rsi: RSIResult,
  macd: MACDResult,
  stoch: StochasticResult
): { signal: string; confidence: number; description: string } {
  let bullishSignals = 0;
  let bearishSignals = 0;
  let totalSignals = 0;

  // RSI signals
  if (rsi.signal === 'oversold') bullishSignals++;
  else if (rsi.signal === 'overbought') bearishSignals++;
  totalSignals++;

  // MACD signals
  if (macd.trend === 'bullish') bullishSignals++;
  else if (macd.trend === 'bearish') bearishSignals++;
  totalSignals++;

  // Stochastic signals
  if (stoch.signal === 'oversold') bullishSignals++;
  else if (stoch.signal === 'overbought') bearishSignals++;
  totalSignals++;

  const confidence = Math.max(bullishSignals, bearishSignals) / totalSignals;

  let signal = '➖'; // Neutral
  let description = 'Mixed signals, no clear direction';

  if (bullishSignals > bearishSignals && confidence >= 0.6) {
    signal = '📈';
    description = `Bullish signals from ${bullishSignals}/${totalSignals} indicators`;
  } else if (bearishSignals > bullishSignals && confidence >= 0.6) {
    signal = '📉';
    description = `Bearish signals from ${bearishSignals}/${totalSignals} indicators`;
  }

  return { signal, confidence, description };
}

/**
 * Format indicator values for display
 */
export function formatIndicatorValue(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

/**
 * Get signal color for UI display
 */
export function getSignalColor(signal: string): string {
  switch (signal) {
    case '📈': return '#10B981'; // Green
    case '📉': return '#EF4444'; // Red
    case '➖': return '#6B7280'; // Gray
    default: return '#6B7280';
  }
}