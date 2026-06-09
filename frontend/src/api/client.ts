import axios from 'axios';
import type {
  ApiResponse,
  ConnectionStatus,
  ServerState,
  ServerOptions,
  AdvancedGameSettings,
  SaveSession,
  NewGameData
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Connection
export const connect = (host: string, port?: number, username?: string, password?: string, skipSSLVerification?: boolean) =>
  api.post<ApiResponse>('/connect', { host, port, username, password, skipSSLVerification });

export const disconnect = () =>
  api.delete<ApiResponse>('/connect');

// Auth
export const verifyPassword = (password: string) =>
  api.post<ApiResponse>('/auth/verify', { password });

export const logout = () =>
  api.post<ApiResponse>('/auth/logout');

export const getStatus = () =>
  api.get<ApiResponse<ConnectionStatus>>('/status');

export const healthCheck = () =>
  api.get<ApiResponse>('/health');

// Server State
export const getServerState = () =>
  api.get<ApiResponse<ServerState>>('/server-state');

export const getServerOptions = () =>
  api.get<ApiResponse<ServerOptions>>('/server-options');

export const updateServerOptions = (options: ServerOptions) =>
  api.put<ApiResponse>('/server-options', options);

export const getAdvancedSettings = () =>
  api.get<ApiResponse<AdvancedGameSettings>>('/advanced-settings');

export const updateAdvancedSettings = (settings: AdvancedGameSettings) =>
  api.put<ApiResponse>('/advanced-settings', settings);

// Sessions
export const getSessions = () =>
  api.get<ApiResponse<SaveSession[]>>('/sessions');

export const createSession = (gameData: NewGameData) =>
  api.post<ApiResponse>('/sessions', gameData);

export const saveGame = (saveName: string) =>
  api.post<ApiResponse>('/sessions/save', { saveName });

export const loadGame = (saveName: string, enableAdvancedGameSettings?: boolean) =>
  api.post<ApiResponse>('/sessions/load', { saveName, enableAdvancedGameSettings });

export const deleteSession = (name: string) =>
  api.delete<ApiResponse>(`/sessions/${encodeURIComponent(name)}`);

// Actions
export const runCommand = (command: string) =>
  api.post<ApiResponse>('/command', { command });

export const shutdown = () =>
  api.post<ApiResponse>('/shutdown');

export default api;
