import { useState } from 'react';
import { X, Wifi, Loader2, AlertTriangle } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectionModal({ isOpen, onClose }: ConnectionModalProps) {
  const { connect, isConnecting, error } = useConnection();
  const [host, setHost] = useState('');
  const [port, setPort] = useState('7777');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await connect(host, parseInt(port) || 7777, username, password);
    if (success) {
      setHost('');
      setPort('7777');
      setUsername('');
      setPassword('');
      onClose();
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title flex items-center gap-sm">
            <Wifi size={20} style={{ color: 'var(--accent-primary)' }} />
            连接服务器
          </h2>
          <button
            onClick={handleClose}
            disabled={isConnecting}
            className="modal__close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">服务器地址 *</label>
            <input
              type="text"
              className="form-input"
              value={host}
              onChange={e => setHost(e.target.value)}
              placeholder="192.168.1.100"
              required
              disabled={isConnecting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">端口</label>
            <input
              type="number"
              className="form-input form-input--sm"
              value={port}
              onChange={e => setPort(e.target.value)}
              placeholder="7777"
              disabled={isConnecting}
            />
          </div>

          <div className="divider" />

          <div className="form-group">
            <label className="form-label form-label--inline">
              用户名
              <span className="form-label__hint">(可选)</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ADMINISTRATOR"
              disabled={isConnecting}
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label--inline">
              密码
              <span className="form-label__hint">(填写后获得完整权限)</span>
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="留空则使用无密码登录（仅可查看仪表盘）"
              disabled={isConnecting}
            />
          </div>

          {/* 权限提示 */}
          {!password && (
            <div className="flex items-start gap-md mb-lg" style={{
              padding: 'var(--space-md)',
              backgroundColor: 'rgba(210, 153, 34, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--status-warning)'
            }}>
              <AlertTriangle size={18} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
              <div className="text-sm">
                <div className="font-bold" style={{ color: 'var(--status-warning)' }}>无密码登录（只读权限）</div>
                <div className="text-secondary mt-sm">
                  未输入密码时只能查看仪表盘，无法修改服务器设置、管理存档或执行操作。
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="toast toast--error mb-lg">
              {error}
            </div>
          )}

          <div className="modal__footer">
            <button
              type="button"
              onClick={handleClose}
              disabled={isConnecting}
              className="btn btn--secondary"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isConnecting || !host}
            >
              {isConnecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  连接中...
                </>
              ) : password ? (
                <>
                  <Wifi size={16} />
                  连接（完整权限）
                </>
              ) : (
                <>
                  <Wifi size={16} />
                  连接（只读）
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
