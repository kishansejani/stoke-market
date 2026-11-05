export type AlertCondition = 'ABOVE' | 'BELOW' | 'PCT_CHANGE_UP' | 'PCT_CHANGE_DOWN';
export interface PriceAlert {
    id: string;
    userId: string;
    instrumentId: string;
    symbol: string;
    condition: AlertCondition;
    targetPrice: number;
    currentPriceAtCreation?: number;
    triggered: boolean;
    triggeredAt?: string;
    isActive: boolean;
    createdAt: string;
}
export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'ALERT' | 'SYSTEM' | 'ORDER' | 'LICENSE';
    read: boolean;
    metadata?: Record<string, unknown>;
    createdAt: string;
}
//# sourceMappingURL=alert.d.ts.map