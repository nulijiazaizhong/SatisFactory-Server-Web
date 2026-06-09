// Shared types for the API
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

export interface CommandRequest {
  command: string;
}
