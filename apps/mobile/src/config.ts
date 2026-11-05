/**
 * API configuration for Stoke Mobile Application
 * In production APK, this points to your live Render/Cloud backend API.
 * You can also override it with EXPO_PUBLIC_API_URL environment variable.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://stock-market-api.onrender.com/api/v1';

export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ||
  'https://stock-market-api.onrender.com';
