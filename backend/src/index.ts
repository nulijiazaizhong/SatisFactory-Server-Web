import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { MinimumPrivilegeLevel } = require('satisfactory-dedicated-server-sdk');
import apiRoutes from './routes/api.js';
import { serverService } from './services/serverService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || 'config.json';
const STATIC_PATH = process.env.STATIC_PATH || path.join(process.cwd(), 'public');

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

// Serve static files (built frontend)
app.use(express.static(STATIC_PATH));

// API routes
app.use('/api', apiRoutes);

// Serve frontend for all other routes (SPA support)
app.get('*', (_req, res) => {
  res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

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

  // Load config from environment variables first, fallback to config file
  console.log(`   Loading server config...`);
  let configResult: { success: boolean; message: string; config?: any };

  // Try environment variables first
  const envResult = serverService.loadConfig();
  if (envResult.success) {
    configResult = { success: true, message: 'Loaded from environment', config: serverService.getConfig() };
    console.log(`   ✓ Config loaded from environment`);
  } else {
    // Fallback to config file
    console.log(`   ⚠️  Environment config not found, trying file: ${SERVER_CONFIG_PATH}`);
    configResult = serverService.loadConfigFromFile(SERVER_CONFIG_PATH);
    if (configResult.success) {
      console.log(`   ✓ Config loaded from file`);
    }
  }

  if (!configResult.success) {
    console.error(`   ⚠️  Failed to load config: ${configResult.message}`);
    console.error(`   ⚠️  Set SERVER_HOST, SERVER_PORT, SERVER_PASSWORD, WEBUI_PASSWORD env vars or create config.json`);
  } else {
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
          console.log(`   ✓ Logged in (read-only mode)`);
        }
      } else {
        console.log(`   ⚠️  Login warning: ${loginResult.message}`);
      }
    } else {
      console.error(`   ⚠️  Failed to connect: ${connectResult.message}`);
    }
  }
});
