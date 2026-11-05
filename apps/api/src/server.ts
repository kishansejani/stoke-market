import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { SocketServer } from './websocket/socketServer';
import { marketEngine } from './services/marketEngine';

const app = express();
const server = http.createServer(app);

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matched origins
      if (!origin || config.cors.origins.includes(origin) || config.cors.origins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Global Stock Market API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Versioned API
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Initialize Realtime WebSocket Server
export const socketServer = new SocketServer(server);

// Boot Server & Market Engine
async function bootstrap() {
  try {
    console.log('[Server] Starting Market Engine & Provider Adapters...');
    await marketEngine.start();

    server.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 GLOBAL STOCK MARKET API SERVER RUNNING`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🔗 REST Base: http://localhost:${config.port}/api/v1`);
      console.log(`⚡ WebSocket: ws://localhost:${config.port}`);
      console.log(`🛠️  Environment: ${config.env}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  }
}

bootstrap();

export { app, server };
