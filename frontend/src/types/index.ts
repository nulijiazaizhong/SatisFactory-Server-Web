// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ConnectRequest {
  host: string;
  port?: number;
  username?: string;
  password?: string;
  skipSSLVerification?: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  host?: string;
  port?: number;
}

// Server state types (from Satisfactory SDK)
export interface ServerState {
  // Add actual server state fields based on SDK response
  [key: string]: unknown;
}

export interface ServerOptions {
  DSAutoPause?: boolean;
  DSAutoSaveOnDisconnect?: boolean;
  AutosaveInterval?: number;
  ServerRestartTimeSlot?: number;
  SendGameplayData?: boolean;
  NetworkQuality?: number;
}

export interface AdvancedGameSettings {
  NoPower?: boolean;
  DisableArachnidCreatures?: boolean;
  NoUnlockCost?: boolean;
  SetGamePhase?: number;
  GiveAllTiers?: boolean;
  UnlockAllResearchSchematics?: boolean;
  UnlockInstantAltRecipes?: boolean;
  UnlockAllResourceSinkSchematics?: boolean;
  GiveItems?: string;
  NoBuildCost?: boolean;
  GodMode?: boolean;
  FlightMode?: boolean;
}

export interface SaveSession {
  name: string;
  // Add other session fields as needed
  [key: string]: unknown;
}

export interface NewGameData {
  SessionName: string;
  MapName?: string;
  StartingLocation?: string;
  AdvancedGameSettings?: AdvancedGameSettings;
}
