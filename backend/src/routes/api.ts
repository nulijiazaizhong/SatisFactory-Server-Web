import { Router, Request, Response } from 'express';
import { serverService } from '../services/serverService.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { MinimumPrivilegeLevel } = require('satisfactory-dedicated-server-sdk');
import type { ConnectRequest, CommandRequest } from '../types.js';

const router = Router();

// POST /api/auth/verify - Verify web UI password
router.post('/auth/verify', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: 'MISSING_PASSWORD', message: 'Password is required' });
  }

  const isValid = serverService.verifyWebUIPassword(password);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'INVALID_PASSWORD', message: 'Invalid password' });
  }

  return res.json({ success: true, data: { message: 'Authentication successful' } });
});

// POST /api/auth/logout - Clear web UI auth session (client-side action, server just acknowledges)
router.post('/auth/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, data: { message: 'Logged out successfully' } });
});

// POST /api/connect - Connect to a server (auto-connect from config on startup)
router.post('/connect', async (req: Request, res: Response) => {
  const { host, port, username, password, skipSSLVerification } = req.body as ConnectRequest;

  if (!host) {
    return res.status(400).json({ success: false, error: 'MISSING_HOST', message: 'Host is required' });
  }

  const result = await serverService.connect(host, port || 7777, { skipSSLVerification });

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'CONNECTION_FAILED', message: result.message });
  }

  // Attempt login
  const privilegeLevel = MinimumPrivilegeLevel[username?.toUpperCase() as keyof typeof MinimumPrivilegeLevel] || MinimumPrivilegeLevel.ADMINISTRATOR;

  if (password) {
    // Password provided - use password login
    const loginResult = await serverService.login(privilegeLevel, password);
    if (!loginResult.success) {
      await serverService.disconnect();
      return res.status(401).json({ success: false, error: 'AUTH_FAILED', message: loginResult.message });
    }
  } else {
    // No password - try passwordless login
    const loginResult = await serverService.login(privilegeLevel);
    if (!loginResult.success) {
      // Check if it's because passwordless is not allowed
      if (loginResult.message?.includes('passwordless_login_not_possible') ||
          loginResult.message?.includes('passwordless')) {
        await serverService.disconnect();
        return res.status(401).json({
          success: false,
          error: 'PASSWORD_REQUIRED',
          message: '此服务器不允许无密码登录，请提供密码'
        });
      }
      await serverService.disconnect();
      return res.status(401).json({ success: false, error: 'AUTH_FAILED', message: loginResult.message });
    }
  }

  return res.json({ success: true, data: { message: 'Connected and authenticated successfully' } });
});

// DELETE /api/connect - Disconnect from server
router.delete('/connect', async (_req: Request, res: Response) => {
  await serverService.disconnect();
  return res.json({ success: true, data: { message: 'Disconnected successfully' } });
});

// GET /api/status - Get connection status
router.get('/status', (_req: Request, res: Response) => {
  const status = serverService.getStatus();
  return res.json({ success: true, data: status });
});

// GET /api/health - Health check
router.get('/health', async (_req: Request, res: Response) => {
  const result = await serverService.healthCheck();
  return res.json({ success: result.success, data: result });
});

// GET /api/server-state - Query server state
router.get('/server-state', async (_req: Request, res: Response) => {
  const result = await serverService.queryServerState();

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'QUERY_FAILED', message: result.message });
  }

  return res.json({ success: true, data: result.data });
});

// GET /api/server-options - Get server options
router.get('/server-options', async (_req: Request, res: Response) => {
  const result = await serverService.getServerOptions();

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'QUERY_FAILED', message: result.message });
  }

  return res.json({ success: true, data: result.data });
});

// PUT /api/server-options - Update server options
router.put('/server-options', async (req: Request, res: Response) => {
  const options = req.body;
  const result = await serverService.applyServerOptions(options);

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'UPDATE_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

// GET /api/advanced-settings - Get advanced game settings
router.get('/advanced-settings', async (_req: Request, res: Response) => {
  const result = await serverService.getAdvancedGameSettings();

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'QUERY_FAILED', message: result.message });
  }

  return res.json({ success: true, data: result.data });
});

// PUT /api/advanced-settings - Update advanced game settings
router.put('/advanced-settings', async (req: Request, res: Response) => {
  const settings = req.body;
  const result = await serverService.applyAdvancedGameSettings(settings);

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'UPDATE_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

// GET /api/sessions - List all save sessions
router.get('/sessions', async (_req: Request, res: Response) => {
  const result = await serverService.enumerateSessions();

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'QUERY_FAILED', message: result.message });
  }

  return res.json({ success: true, data: result.data });
});

// POST /api/sessions - Create new game
router.post('/sessions', async (req: Request, res: Response) => {
  const gameData = req.body;
  const result = await serverService.createNewGame(gameData);

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'CREATE_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

// POST /api/sessions/save - Save current game
router.post('/sessions/save', async (req: Request, res: Response) => {
  const { saveName } = req.body;

  if (!saveName) {
    return res.status(400).json({ success: false, error: 'MISSING_SAVE_NAME', message: 'Save name is required' });
  }

  const result = await serverService.saveGame(saveName);

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'SAVE_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

// POST /api/sessions/load - Load a saved game
router.post('/sessions/load', async (req: Request, res: Response) => {
  const { saveName, enableAdvancedGameSettings } = req.body;

  if (!saveName) {
    return res.status(400).json({ success: false, error: 'MISSING_SAVE_NAME', message: 'Save name is required' });
  }

  const result = await serverService.loadGame(saveName, enableAdvancedGameSettings ?? false);

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'LOAD_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

// DELETE /api/sessions/:name - Delete a save session
router.delete('/sessions/:name', async (req: Request, res: Response) => {
  const { name } = req.params;
  const result = await serverService.deleteSaveSession(name);

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'DELETE_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

// POST /api/command - Run a console command
router.post('/command', async (req: Request, res: Response) => {
  const { command } = req.body as CommandRequest;

  if (!command) {
    return res.status(400).json({ success: false, error: 'MISSING_COMMAND', message: 'Command is required' });
  }

  const result = await serverService.runCommand(command);

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'COMMAND_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

// POST /api/shutdown - Shutdown the server
router.post('/shutdown', async (_req: Request, res: Response) => {
  const result = await serverService.shutdown();

  if (!result.success) {
    return res.status(400).json({ success: false, error: 'SHUTDOWN_FAILED', message: result.message });
  }

  return res.json({ success: true, data: { message: result.message } });
});

export default router;
