import { RefreshCw, LogOut, Wifi, Lock, Unlock } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

interface HeaderProps {
  onConnectClick: () => void;
}

export default function Header({ onConnectClick }: HeaderProps) {
  const { isConnected, isFullAccess, connectionInfo, disconnect, checkStatus } = useConnection();

  return (
    <header className="app-header">
      <div className="app-header__logo">
        <svg
          width="36"
          height="36"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="6" fill="#ff6b35" />
          <path
            d="M8 12h16M8 16h12M8 20h8"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="app-header__title">幸福工厂服务器</span>
      </div>

      <div className="app-header__actions">
        <button
          onClick={checkStatus}
          className="btn btn--ghost btn--icon"
          title="刷新状态"
        >
          <RefreshCw size={18} />
        </button>

        {isConnected ? (
          <>
            <div className="flex items-center gap-sm">
              <span className={`status-indicator ${isFullAccess ? 'status-indicator--online' : 'status-indicator--warning'}`}>
                <span className="status-indicator__dot" />
                <span>{connectionInfo?.host}:{connectionInfo?.port}</span>
              </span>
            </div>
            <div className="flex items-center gap-xs" style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isFullAccess ? 'rgba(63, 185, 80, 0.15)' : 'rgba(210, 153, 34, 0.15)',
              color: isFullAccess ? 'var(--status-online)' : 'var(--status-warning)',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              {isFullAccess ? <Unlock size={12} /> : <Lock size={12} />}
              {isFullAccess ? '完整权限' : '只读'}
            </div>
            <button
              onClick={disconnect}
              className="btn btn--secondary btn--sm"
              title="断开连接"
            >
              <LogOut size={14} />
              断开
            </button>
          </>
        ) : (
          <>
            <div className="status-indicator status-indicator--offline">
              <span className="status-indicator__dot" />
              <span>未连接</span>
            </div>
            <button
              onClick={onConnectClick}
              className="btn btn--primary"
            >
              <Wifi size={16} />
              连接
            </button>
          </>
        )}
      </div>
    </header>
  );
}
