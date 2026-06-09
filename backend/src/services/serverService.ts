import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';

const require = createRequire(import.meta.url);
const { SatisfactoryApi, MinimumPrivilegeLevel, AdvancedGameSettings, ServerOptions } = require('satisfactory-dedicated-server-sdk');

export interface ServerConfig {
  server: {
    host: string;
    port: number;
    password?: string;
  };
  webUI: {
    password: string;
  };
}

export class ServerService {
  private api: SatisfactoryApi | null = null;
  private isConnected = false;
  private connectionInfo: { host: string; port: number } | null = null;
  private config: ServerConfig | null = null;

  loadConfig(configPath: string): { success: boolean; message: string; config?: ServerConfig } {
    try {
      const resolvedPath = path.resolve(configPath);
      if (!fs.existsSync(resolvedPath)) {
        return { success: false, message: `Config file not found: ${resolvedPath}` };
      }
      const content = fs.readFileSync(resolvedPath, 'utf-8');
      const config = JSON.parse(content) as ServerConfig;

      if (!config.server?.host || !config.server?.port) {
        return { success: false, message: 'Invalid config: missing server.host or server.port' };
      }
      if (!config.webUI?.password) {
        return { success: false, message: 'Invalid config: missing webUI.password' };
      }

      this.config = config;
      return { success: true, message: 'Config loaded successfully', config };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to load config' };
    }
  }

  getConfig(): ServerConfig | null {
    return this.config;
  }

  async autoConnect(): Promise<{ success: boolean; message: string }> {
    if (!this.config) {
      return { success: false, message: 'Config not loaded' };
    }

    const { host, port } = this.config.server;
    return this.connect(host, port, { skipSSLVerification: true });
  }

  async connect(
    host: string,
    port: number = 7777,
    options?: { skipSSLVerification?: boolean; username?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.api = new SatisfactoryApi(host, port, {
        skipSSLVerification: options?.skipSSLVerification ?? true
      });

      await this.api.initCertificate();

      const health = await this.api.healthCheck();
      if (!health.success) {
        this.api = null;
        return { success: false, message: health.message || 'Health check failed' };
      }

      this.isConnected = true;
      this.connectionInfo = { host, port };
      return { success: true, message: 'Connected successfully' };
    } catch (error: any) {
      this.api = null;
      this.isConnected = false;
      return { success: false, message: error.message || 'Connection failed' };
    }
  }

  async login(
    minimumPrivilegeLevel: MinimumPrivilegeLevel,
    password?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected to server' };
    }

    try {
      if (password) {
        await this.api.passwordLogin(minimumPrivilegeLevel, password);
      } else {
        await this.api.passwordlessLogin(minimumPrivilegeLevel);
      }
      return { success: true, message: 'Logged in successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }

  verifyWebUIPassword(password: string): boolean {
    if (!this.config) {
      return false;
    }
    return this.config.webUI.password === password;
  }

  isWebUIPasswordSet(): boolean {
    return !!this.config?.webUI?.password;
  }

  async disconnect(): Promise<void> {
    this.api = null;
    this.isConnected = false;
    this.connectionInfo = null;
  }

  getStatus(): { isConnected: boolean; host?: string; port?: number } {
    return {
      isConnected: this.isConnected,
      host: this.connectionInfo?.host,
      port: this.connectionInfo?.port
    };
  }

  async healthCheck(): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      const result = await this.api.healthCheck();
      return { success: result.success, message: result.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async queryServerState(): Promise<{ success: boolean; data?: any; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      const response = await this.api.queryServerState();
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getServerOptions(): Promise<{ success: boolean; data?: any; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      const response = await this.api.getServerOptions();
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async applyServerOptions(options: ServerOptions): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.applyServerOptions(options);
      return { success: true, message: 'Server options applied successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getAdvancedGameSettings(): Promise<{ success: boolean; data?: any; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      const response = await this.api.getAdvancedGameSettings();
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async applyAdvancedGameSettings(settings: AdvancedGameSettings): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.applyAdvancedGameSettings(settings);
      return { success: true, message: 'Advanced game settings applied successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async enumerateSessions(): Promise<{ success: boolean; data?: any; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      const response = await this.api.enumerateSessions();
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async createNewGame(gameData: any): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.createNewGame(gameData);
      return { success: true, message: 'New game created successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async saveGame(saveName: string): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.saveGame(saveName);
      return { success: true, message: 'Game saved successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async loadGame(saveName: string, enableAdvancedGameSettings = false): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.loadGame(saveName, enableAdvancedGameSettings);
      return { success: true, message: 'Game loaded successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async deleteSaveSession(sessionName: string): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.deleteSaveSession(sessionName);
      return { success: true, message: 'Save session deleted successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async runCommand(command: string): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.runCommand(command);
      return { success: true, message: 'Command executed successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async shutdown(): Promise<{ success: boolean; message?: string }> {
    if (!this.api) {
      return { success: false, message: 'Not connected' };
    }

    try {
      await this.api.shutdown();
      return { success: true, message: 'Server shutdown command sent' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export const serverService = new ServerService();
