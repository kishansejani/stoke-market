import { MarketId, MarketStatusType } from '@stock-market/shared-types';

export interface MarketSessionStatus {
  marketId: MarketId;
  status: MarketStatusType;
  isOpen: boolean;
  localTimeStr: string;
  tradingHours: string;
  timezone: string;
}

/**
 * Determines current market status based on exchange operational schedules.
 * India (IST: UTC+5:30):
 *  - Pre-market: 09:00 - 09:15
 *  - Normal Trading: 09:15 - 15:30 (Mon-Fri)
 * USA (Eastern: UTC-5 or UTC-4):
 *  - Pre-market: 04:00 - 09:30
 *  - Normal Trading: 09:30 - 16:00 (Mon-Fri)
 *  - After-hours: 16:00 - 20:00
 */
export function getMarketSessionStatus(marketId: MarketId, now = new Date()): MarketSessionStatus {
  if (marketId === 'IN') {
    // Convert to IST
    const istOffset = 5.5 * 60; // minutes
    const utcMinutes = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcMinutes + istOffset * 60000);

    const day = istTime.getUTCDay(); // 0 is Sunday, 6 is Saturday
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const timeInMinutes = hours * 60 + minutes;

    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} IST`;

    // Weekend check
    if (day === 0 || day === 6) {
      return {
        marketId: 'IN',
        status: 'CLOSED',
        isOpen: false,
        localTimeStr: timeStr,
        tradingHours: '09:15 - 15:30 IST',
        timezone: 'Asia/Kolkata',
      };
    }

    // 09:00 to 09:15 is pre-market
    if (timeInMinutes >= 9 * 60 && timeInMinutes < 9 * 60 + 15) {
      return {
        marketId: 'IN',
        status: 'PRE_MARKET',
        isOpen: false,
        localTimeStr: timeStr,
        tradingHours: '09:15 - 15:30 IST',
        timezone: 'Asia/Kolkata',
      };
    }

    // 09:15 to 15:30 is regular trading
    if (timeInMinutes >= 9 * 60 + 15 && timeInMinutes <= 15 * 60 + 30) {
      return {
        marketId: 'IN',
        status: 'OPEN',
        isOpen: true,
        localTimeStr: timeStr,
        tradingHours: '09:15 - 15:30 IST',
        timezone: 'Asia/Kolkata',
      };
    }

    return {
      marketId: 'IN',
      status: 'CLOSED',
      isOpen: false,
      localTimeStr: timeStr,
      tradingHours: '09:15 - 15:30 IST',
      timezone: 'Asia/Kolkata',
    };
  } else {
    // US Eastern Time (ET)
    // Approximate ET offset (-5 or -4 depending on DST). Let's use Intl.DateTimeFormat for exact US ET
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
    });

    const parts = formatter.formatToParts(now);
    const dayPart = parts.find((p) => p.type === 'weekday')?.value;
    const hourPart = Number(parts.find((p) => p.type === 'hour')?.value || '0');
    const minPart = Number(parts.find((p) => p.type === 'minute')?.value || '0');
    const timeInMinutes = hourPart * 60 + minPart;

    const isWeekend = dayPart === 'Sat' || dayPart === 'Sun';
    const timeStr = `${String(hourPart).padStart(2, '0')}:${String(minPart).padStart(2, '0')} ET`;

    if (isWeekend) {
      return {
        marketId: 'US',
        status: 'CLOSED',
        isOpen: false,
        localTimeStr: timeStr,
        tradingHours: '09:30 - 16:00 ET',
        timezone: 'America/New_York',
      };
    }

    // Pre-market: 04:00 to 09:30
    if (timeInMinutes >= 4 * 60 && timeInMinutes < 9 * 60 + 30) {
      return {
        marketId: 'US',
        status: 'PRE_MARKET',
        isOpen: false,
        localTimeStr: timeStr,
        tradingHours: '09:30 - 16:00 ET',
        timezone: 'America/New_York',
      };
    }

    // Regular market: 09:30 to 16:00
    if (timeInMinutes >= 9 * 60 + 30 && timeInMinutes <= 16 * 60) {
      return {
        marketId: 'US',
        status: 'OPEN',
        isOpen: true,
        localTimeStr: timeStr,
        tradingHours: '09:30 - 16:00 ET',
        timezone: 'America/New_York',
      };
    }

    // After hours: 16:00 to 20:00
    if (timeInMinutes > 16 * 60 && timeInMinutes <= 20 * 60) {
      return {
        marketId: 'US',
        status: 'AFTER_HOURS',
        isOpen: false,
        localTimeStr: timeStr,
        tradingHours: '09:30 - 16:00 ET',
        timezone: 'America/New_York',
      };
    }

    return {
      marketId: 'US',
      status: 'CLOSED',
      isOpen: false,
      localTimeStr: timeStr,
      tradingHours: '09:30 - 16:00 ET',
      timezone: 'America/New_York',
    };
  }
}

