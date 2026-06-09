import { X, Wifi, Loader2 } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectionModal({ isOpen, onClose }: ConnectionModalProps) {
  const { isConnected, connectionInfo, disconnect, isConnecting } = useConnection();

  if (!isOpen) return null;

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
            连接状态
          </h2>
          <button
            onClick={handleClose}
            disabled={isConnecting}
            className="modal__close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal__body">
          {isConnected ? (
            <div className="flex flex-col gap-md">
              <div className="flex items-center gap-sm">
                <span className="status-indicator status-indicator--online">
                  <span className="status-indicator__dot" />
                  <span>已连接</span>
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">服务器地址</label>
                <div className="form-input form-input--static">
                  {connectionInfo?.host}:{connectionInfo?.port}
                </div>
              </div>
              <p className="text-secondary text-sm">
                服务器连接通过配置文件管理。如需更改服务器地址，请修改 backend/config.json 文件。
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              <div className="flex items-center gap-sm">
                <span className="status-indicator status-indicator--offline">
                  <span className="status-indicator__dot" />
                  <span>未连接</span>
                </span>
              </div>
              <p className="text-secondary text-sm">
                服务器未连接。请确保 backend 服务已启动并正确配置 config.json。
              </p>
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={isConnecting}
            className="btn btn--secondary"
          >
            关闭
          </button>
          {isConnected && (
            <button
              type="button"
              onClick={() => { disconnect(); onClose(); }}
              disabled={isConnecting}
              className="btn btn--danger"
            >
              {isConnecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  处理中...
                </>
              ) : (
                '断开连接'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}