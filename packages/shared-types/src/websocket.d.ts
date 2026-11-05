import { MarketTick } from './quote';
import { MarketId, MarketStatusType } from './market';
export interface WebSocketClientEvents {
    'subscribe:symbols': (data: {
        symbols: string[];
    }) => void;
    'unsubscribe:symbols': (data: {
        symbols: string[];
    }) => void;
    'ping': () => void;
}
export interface WebSocketServerEvents {
    'market:tick': (tick: MarketTick) => void;
    'market:status': (status: {
        market: MarketId;
        status: MarketStatusType;
        serverTime: string;
    }) => void;
    'alert:triggered': (alert: {
        alertId: string;
        symbol: string;
        targetPrice: number;
        currentPrice: number;
        condition: string;
    }) => void;
    'pong': () => void;
}
//# sourceMappingURL=websocket.d.ts.map