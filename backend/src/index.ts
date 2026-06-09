import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { MinimumPrivilegeLevel } = require('satisfactory-dedicated-server-sdk');
import apiRoutes from './routes/api.js';
import { serverService } from './services/serverService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || 'config.json';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Satisfactory Server API running on http://localhost:${PORT}`);
  console.log(`   CORS enabled for: ${CORS_ORIGIN}`);

  // Load config and auto-connect to game server
  console.log(`   Loading server config from: ${SERVER_CONFIG_PATH}`);
  const configResult = serverService.loadConfig(SERVER_CONFIG_PATH);

  if (!configResult.success) {
    console.error(`   ⚠️  Failed to load config: ${configResult.message}`);
    console.error(`   ⚠️  Please create ${SERVER_CONFIG_PATH} with server and webUI configuration`);
  } else {
    console.log(`   ✓ Config loaded successfully`);
    console.log(`   Connecting to game server at ${configResult.config?.server.host}:${configResult.config?.server.port}...`);

    const connectResult = await serverService.autoConnect();
    if (connectResult.success) {
      console.log(`   ✓ Connected to game server`);

      // Auto-login with password (if provided in config) or passwordless
      const serverPassword = configResult.config?.server.password;

      const loginResult = await serverService.login(MinimumPrivilegeLevel.ADMINISTRATOR, serverPassword);
      if (loginResult.success) {
        if (serverPassword) {
          console.log(`   ✓ Logged in with full access`);
        } else {
          console.log(`   ✓ Logged in (read-only mode - password required for full access)`);
        }
      } else {
        console.log(`   ⚠️  Login warning: ${loginResult.message}`);
      }
    } else {
      console.error(`   ⚠️  Failed to connect: ${connectResult.message}`);
    }
  }
});
