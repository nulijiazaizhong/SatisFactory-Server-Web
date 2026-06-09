import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Users, Clock, Map, Server, AlertCircle, Cpu } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import * as api from '../api/client';

interface ServerGameState {
  activeSessionName?: string;
  numConnectedPlayers?: number;
  playerLimit?: number;
  techTier?: number;
  activeSchematic?: string;
  gamePhase?: string;
  isGameRunning?: boolean;
  totalGameDuration?: number;
  isGamePaused?: boolean;
  averageTickRate?: number;
  autoLoadSessionName?: string;
  agreeToCrashUploadRequested?: boolean;
  [key: string]: unknown;
}

interface ServerState {
  serverGameState?: ServerGameState;
  [key: string]: unknown;
}

export default function Dashboard() {
  const { isConnected } = useConnection();
  const [serverState, setServerState] = useState<ServerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServerState = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.getServerState();
      if (response.data.success && response.data.data) {
        setServerState(response.data.data as ServerState);
      } else {
        setError(response.data.message || '获取服务器状态失败');
      }
    } catch (err: any) {
      setError(err.message || '获取服务器状态失败');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      fetchServerState();
    }
  }, [isConnected, fetchServerState]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchServerState, 10000);
    return () => clearInterval(interval);
  }, [isConnected, fetchServerState]);

  if (!isConnected) {
    return (
      <div className="empty-state">
        <Server size={64} className="empty-state__icon" />
        <h2 className="empty-state__title">未连接</h2>
        <p className="empty-state__description">
          连接服务器后可查看状态和管理设置
        </p>
      </div>
    );
  }

  // Helper to format game duration (seconds to HH:MM:SS)
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const gameState = serverState?.serverGameState;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">仪表盘</h1>
        <button
          onClick={fetchServerState}
          className="btn btn--secondary"
          disabled={loading}
        >
          <RefreshCw size={16} />
          刷新
        </button>
      </div>

      {error && (
        <div className="card card--bordered mb-lg" style={{ borderLeftColor: 'var(--status-offline)' }}>
          <div className="flex items-center gap-md">
            <AlertCircle size={20} style={{ color: 'var(--status-offline)' }} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {/* 服务器状态 */}
        <div className="card card--bordered">
          <div className="card__title">
            <Server size={16} />
            服务器状态
          </div>
          <div className="flex items-center gap-md mt-md">
            <span className={`status-indicator ${gameState?.isGameRunning ? 'status-indicator--online' : 'status-indicator--offline'}`}>
              <span className="status-indicator__dot" />
              {gameState?.isGameRunning ? '运行中' : '已停止'}
            </span>
          </div>
          <div className="card__subtitle">
            版本: {gameState?.activeSessionName || '未知'}
          </div>
        </div>

        {/* 在线玩家 */}
        <div className="card card--bordered">
          <div className="card__title">
            <Users size={16} />
            在线玩家
          </div>
          <div className="card__value mt-md">
            {gameState?.numConnectedPlayers ?? 0} / {gameState?.playerLimit ?? 0}
          </div>
          <div className="card__subtitle">
            {gameState?.numConnectedPlayers === 0
              ? '当前无玩家在线'
              : gameState?.numConnectedPlayers === 1
              ? '位玩家已连接'
              : '位玩家已连接'}
          </div>
        </div>

        {/* 当前版本 */}
        <div className="card card--bordered">
          <div className="card__title">
            <Map size={16} />
            游戏版本
          </div>
          <div className="card__value mt-md" style={{ fontSize: '1.25rem' }}>
            {gameState?.activeSessionName || '无活动会话'}
          </div>
          <div className="card__subtitle">
            自动加载: {gameState?.autoLoadSessionName || '无'}
          </div>
        </div>

        {/* 游戏时间 */}
        <div className="card card--bordered">
          <div className="card__title">
            <Clock size={16} />
            游戏时间
          </div>
          <div className="card__value mt-md">
            {formatDuration(gameState?.totalGameDuration)}
          </div>
          <div className="card__subtitle">
            {gameState?.isGamePaused ? '已暂停' : '运行中'}
          </div>
        </div>
      </div>

      {/* 额外信息 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
        {/* 技术等级 */}
        <div className="card">
          <div className="card__title flex items-center gap-sm">
            <Cpu size={14} />
            技术等级
          </div>
          <div className="card__value">{gameState?.techTier ?? 'N/A'}</div>
        </div>

        {/* 平均Tick率 */}
        <div className="card">
          <div className="card__title flex items-center gap-sm">
            <Clock size={14} />
            平均Tick率
          </div>
          <div className="card__value" style={{ fontSize: '1.25rem' }}>
            {gameState?.averageTickRate ? gameState.averageTickRate.toFixed(1) : 'N/A'}
          </div>
          <div className="card__subtitle">
            {gameState?.averageTickRate && gameState.averageTickRate < 20
              ? '偏低，可能有延迟问题'
              : '正常'}
          </div>
        </div>
      </div>
    </div>
  );
}
