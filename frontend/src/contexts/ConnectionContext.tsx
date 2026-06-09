import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ConnectionStatus } from '../types';
import * as api from '../api/client';

interface ConnectionContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isFullAccess: boolean; // true if web UI password was verified
  connectionInfo: ConnectionStatus | null;
  error: string | null;
  authenticate: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFullAccess, setIsFullAccess] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await api.getStatus();
      if (response.data.success && response.data.data) {
        setIsConnected(response.data.data.isConnected);
        setConnectionInfo(response.data.data);
      }
    } catch {
      setIsConnected(false);
      setConnectionInfo(null);
    }
  }, []);

  const authenticate = useCallback(async (password: string): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await api.verifyPassword(password);
      if (response.data.success) {
        setIsFullAccess(true);
        return true;
      } else {
        setError(response.data.message || 'Authentication failed');
        return false;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Authentication failed';
      setError(message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const lock = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setIsFullAccess(false);
      setError(null);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await api.disconnect();
    } catch {
      // Ignore disconnect errors
    } finally {
      setIsConnected(false);
      setIsFullAccess(false);
      setConnectionInfo(null);
      setError(null);
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <ConnectionContext.Provider value={{
      isConnected,
      isConnecting,
      isFullAccess,
      connectionInfo,
      error,
      authenticate,
      lock,
      disconnect,
      checkStatus
    }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}