import { useState } from 'react';
import { RefreshCw, LogOut, Wifi, Lock, Unlock, Loader2 } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

interface HeaderProps {
  onConnectClick: () => void;
}

export default function Header({ onConnectClick }: HeaderProps) {
  const { isConnected, isFullAccess, connectionInfo, disconnect, checkStatus, authenticate, lock, error, isConnecting } = useConnection();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    const success = await authenticate(password);
    if (success) {
      setPassword('');
    }
  };

  const handleLock = async () => {
    await lock();
  };

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

            {isFullAccess ? (
              // Authenticated - show unlock badge with lock button
              <div className="flex items-center gap-xs">
                <div className="flex items-center gap-xs" style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(63, 185, 80, 0.15)',
                  color: 'var(--status-online)',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  <Unlock size={12} />
                  完整权限
                </div>
                <button
                  onClick={handleLock}
                  className="btn btn--secondary btn--sm"
                  title="锁定管理功能"
                >
                  <Lock size={14} />
                  锁定
                </button>
              </div>
            ) : (
              // Not authenticated - show password input
              <form onSubmit={handleAuthenticate} className="flex items-center gap-xs">
                <div className="flex items-center gap-xs" style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(210, 153, 34, 0.15)',
                  color: 'var(--status-warning)',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  <Lock size={12} />
                  只读
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input form-input--sm"
                  style={{ width: '120px' }}
                  placeholder="管理密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isConnecting}
                />
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={isConnecting || !password.trim()}
                  title="解锁管理功能"
                >
                  {isConnecting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Unlock size={14} />
                  )}
                </button>
              </form>
            )}

            {error && !isFullAccess && (
              <span className="text-sm" style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>
                {error}
              </span>
            )}

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