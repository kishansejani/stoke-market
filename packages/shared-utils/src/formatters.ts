/**
 * Formats a monetary number into Indian Rupee (INR) or US Dollar (USD) format.
 * For INR: Supports Indian numbering system (Lakhs, Crores).
 * For USD: Supports Millions, Billions, Trillions.
 */
export function formatCurrency(
  value: number | undefined | null,
  currency: 'INR' | 'USD' = 'INR',
  options: { decimals?: number; compact?: boolean } = {}
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '—';
  }

  const { decimals = 2, compact = false } = options;

  if (compact) {
    if (currency === 'INR') {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 10000000) {
        return `${sign}₹${(abs / 10000000).toFixed(decimals)} Cr`;
      }
      if (abs >= 100000) {
        return `${sign}₹${(abs / 100000).toFixed(decimals)} L`;
      }
      if (abs >= 1000) {
        return `${sign}₹${(abs / 1000).toFixed(decimals)} K`;
      }
      return `${sign}₹${abs.toFixed(decimals)}`;
    } else {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 1e12) {
        return `${sign}$${(abs / 1e12).toFixed(decimals)} T`;
      }
      if (abs >= 1e9) {
        return `${sign}$${(abs / 1e9).toFixed(decimals)} B`;
      }
      if (abs >= 1e6) {
        return `${sign}$${(abs / 1e6).toFixed(decimals)} M`;
      }
      if (abs >= 1e3) {
        return `${sign}$${(abs / 1e3).toFixed(decimals)} K`;
      }
      return `${sign}$${abs.toFixed(decimals)}`;
    }
  }

  // Full precision currency formatting
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a percentage change with optional explicit plus sign.
 */
export function formatPercentage(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}

/**
 * Formats a volume quantity with compact abbreviation (K, M, B).
 */
export function formatVolume(volume: number | undefined | null): string {
  if (!volume || isNaN(volume)) return '0';
  const abs = Math.abs(volume);
  if (abs >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
  return volume.toLocaleString();
}

