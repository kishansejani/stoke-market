import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { marketEngine } from '../services/marketEngine';
import { MarketTick, JwtPayload } from '@stock-market/shared-types';

export class SocketServer {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.cors.origins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupMarketTickRelay();
  }

  private setupMiddleware() {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token && typeof token === 'string') {
        try {
          const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
          socket.data.user = decoded;
        } catch {
          // Allow connection as anonymous visitor for public quote streams
        }
      }
      next();
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id} (User: ${socket.data.user?.email || 'Guest'})`);

      // Symbol subscriptions
      socket.on('subscribe:symbols', (data: { symbols: string[] }) => {
        if (!data || !Array.isArray(data.symbols)) return;
        for (const symbol of data.symbols) {
          socket.join(symbol);
        }
      });

      // Symbol unsubscriptions
      socket.on('unsubscribe:symbols', (data: { symbols: string[] }) => {
        if (!data || !Array.isArray(data.symbols)) return;
        for (const symbol of data.symbols) {
          socket.leave(symbol);
        }
      });

      // Ping-pong healthcheck
      socket.on('ping', () => {
        socket.emit('pong');
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  private setupMarketTickRelay() {
    marketEngine.onTick((tick: MarketTick) => {
      // Broadcast to room named after the symbol
      this.io.to(tick.symbol).emit('market:tick', tick);
    });
  }

  getIO(): Server {
    return this.io;
  }
}
