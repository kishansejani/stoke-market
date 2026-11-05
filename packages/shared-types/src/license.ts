export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';

export interface DeviceActivation {
  deviceId: string;
  os: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web';
  deviceName: string;
  activatedAt: string;
  lastSeenAt: string;
}

export interface License {
  id: string;
  licenseKey: string; // e.g. STK-PRO-8712-4412-9982
  userId: string;
  productName: string;
  status: LicenseStatus;
  maxDevices: number;
  activeDevices: DeviceActivation[];
  dataAccessExpiry: string; // ISO Date string for when included real-time cloud data expires
  softwareAccessExpiry?: string; // null for lifetime software
  signature: string; // HMAC cryptographic token
  createdAt: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  status: LicenseStatus;
  license?: License;
  message: string;
  hasDataAccess: boolean;
  daysRemainingData: number;
}
