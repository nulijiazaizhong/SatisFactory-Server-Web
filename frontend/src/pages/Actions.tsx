import { useState } from 'react';
import { Terminal, Power, Send, AlertTriangle, TerminalSquare, Lock } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import * as api from '../api/client';

export default function Actions() {
  const { isConnected, isFullAccess } = useConnection();
  const [command, setCommand] = useState('');
  const [commandResult, setCommandResult] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [sendingCommand, setSendingCommand] = useState(false);

  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [shuttingDown, setShuttingDown] = useState(false);
  const [shutdownResult, setShutdownResult] = useState<string | null>(null);

  const handleSendCommand = async () => {
    if (!command.trim()) return;

    setSendingCommand(true);
    setCommandResult(null);
    setCommandError(null);

    try {
      const response = await api.runCommand(command);
      if (response.data.success) {
        setCommandResult('命令执行成功');
        setCommand('');
      } else {
        setCommandError(response.data.message || '命令执行失败');
      }
    } catch (err: any) {
      setCommandError(err.message || '命令执行失败');
    } finally {
      setSendingCommand(false);
    }
  };

  const handleShutdown = async () => {
    setShuttingDown(true);
    setShutdownResult(null);

    try {
      const response = await api.shutdown();
      if (response.data.success) {
        setShutdownResult('关闭命令已发送，服务器即将关闭。');
        setShowShutdownModal(false);
      } else {
        setShutdownResult(response.data.message || '关闭服务器失败');
      }
    } catch (err: any) {
      setShutdownResult(err.message || '关闭服务器失败');
    } finally {
      setShuttingDown(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="empty-state">
        <Terminal size={64} className="empty-state__icon" />
        <h2 className="empty-state__title">未连接</h2>
        <p className="empty-state__description">连接服务器后可执行操作</p>
      </div>
    );
  }

  if (!isFullAccess) {
    return (
      <div className="empty-state">
        <Lock size={64} className="empty-state__icon" />
        <h2 className="empty-state__title">需要完整权限</h2>
        <p className="empty-state__description">
          此页面需要输入密码连接才能访问。<br />
          请断开连接后重新连接，并填写密码。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">操作</h1>
      </div>

      {commandError && <div className="toast toast--error mb-lg">{commandError}</div>}
      {commandResult && <div className="toast toast--success mb-lg">{commandResult}</div>}
      {shutdownResult && <div className="toast toast--warning mb-lg">{shutdownResult}</div>}

      {/* 控制台命令卡片 */}
      <div className="card mb-xl">
        <div className="card__header">
          <div className="card__title">
            <TerminalSquare size={14} />
            控制台命令
          </div>
        </div>
        <p className="text-secondary mb-lg">
          在服务器上执行控制台命令。示例: <code>Help</code>, <code>ListPlayers</code>, <code>GiveAllItems</code>
        </p>
        <div className="flex gap-md">
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder="输入命令..."
            onKeyDown={e => e.key === 'Enter' && handleSendCommand()}
          />
          <button
            onClick={handleSendCommand}
            className="btn btn--primary"
            disabled={sendingCommand || !command.trim()}
          >
            <Send size={16} />
            发送
          </button>
        </div>
      </div>

      {/* 关闭服务器卡片 */}
      <div className="card">
        <div className="card__header">
          <div className="card__title">
            <Power size={14} />
            关闭服务器
          </div>
        </div>
        <p className="text-secondary mb-lg">
          关闭幸福工厂服务器。注意：根据服务配置，服务器可能会自动重启。
        </p>
        <button
          onClick={() => setShowShutdownModal(true)}
          className="btn btn--danger"
        >
          <Power size={16} />
          关闭服务器
        </button>
      </div>

      {/* 关闭确认弹窗 */}
      {showShutdownModal && (
        <div className="modal-backdrop" onClick={() => setShowShutdownModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title flex items-center gap-sm">
                <AlertTriangle size={20} style={{ color: 'var(--status-warning)' }} />
                确认关闭
              </h3>
              <button onClick={() => setShowShutdownModal(false)} className="modal__close">
                <Power size={20} />
              </button>
            </div>
            <p className="modal__hint">
              确定要关闭服务器吗？此操作无法远程撤销。
            </p>
            <div className="modal__footer">
              <button onClick={() => setShowShutdownModal(false)} className="btn btn--secondary">
                取消
              </button>
              <button onClick={handleShutdown} className="btn btn--danger" disabled={shuttingDown}>
                {shuttingDown ? '关闭中...' : '关闭服务器'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
