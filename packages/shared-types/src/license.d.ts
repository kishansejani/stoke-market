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
    licenseKey: string;
    userId: string;
    productName: string;
    status: LicenseStatus;
    maxDevices: number;
    activeDevices: DeviceActivation[];
    dataAccessExpiry: string;
    softwareAccessExpiry?: string;
    signature: string;
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
//# sourceMappingURL=license.d.ts.map