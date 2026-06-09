import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Save, Play, Trash2, Plus, X, FolderOpen, AlertTriangle, Lock } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import * as api from '../api/client';
import type { SaveSession } from '../types';

// Debug: store raw sessions data to see actual structure
interface RawSessionData {
  [key: string]: unknown;
}

export default function Sessions() {
  const { isConnected, isFullAccess } = useConnection();
  const [sessions, setSessions] = useState<SaveSession[]>([]);
  const [rawSessions, setRawSessions] = useState<RawSessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SaveSession | null>(null);
  const [saveName, setSaveName] = useState('');
  const [newGameName, setNewGameName] = useState('');
  const [newGameMap, setNewGameMap] = useState('Default');

  const fetchSessions = useCallback(async () => {
    if (!isConnected || !isFullAccess) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.getSessions();
      if (response.data.success && response.data.data) {
        // Store raw data for debugging
        setRawSessions(response.data.data as unknown as RawSessionData);
        // Handle both array and object response
        const data = response.data.data as unknown;
        if (Array.isArray(data)) {
          setSessions(data as SaveSession[]);
        } else if (typeof data === 'object' && data !== null) {
          const dataObj = data as Record<string, unknown>;
          if (Array.isArray(dataObj['sessions'])) {
            setSessions(dataObj['sessions'] as SaveSession[]);
          } else if (Array.isArray(dataObj['SaveSessions'])) {
            setSessions(dataObj['SaveSessions'] as SaveSession[]);
          } else {
            const firstKey = Object.keys(dataObj)[0];
            if (firstKey && Array.isArray(dataObj[firstKey])) {
              setSessions(dataObj[firstKey] as SaveSession[]);
            } else {
              console.error('Unexpected sessions data structure:', dataObj);
              setSessions([]);
            }
          }
        } else {
          setSessions([]);
        }
      } else {
        setError(response.data.message || '获取存档列表失败');
      }
    } catch (err: any) {
      setError(err.message || '获取存档列表失败');
    } finally {
      setLoading(false);
    }
  }, [isConnected, isFullAccess]);

  useEffect(() => {
    if (isConnected && isFullAccess) {
      fetchSessions();
    }
  }, [isConnected, isFullAccess, fetchSessions]);

  const handleSave = async () => {
    if (!saveName.trim()) return;

    setActionLoading('save');
    setError(null);
    setSuccess(null);

    try {
      const response = await api.saveGame(saveName);
      if (response.data.success) {
        setSuccess(`游戏已保存为 "${saveName}"`);
        setShowSaveModal(false);
        setSaveName('');
        fetchSessions();
      } else {
        setError(response.data.message || '保存游戏失败');
      }
    } catch (err: any) {
      setError(err.message || '保存游戏失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoad = async () => {
    if (!selectedSession) return;

    setActionLoading('load');
    setError(null);
    setSuccess(null);

    try {
      const response = await api.loadGame(selectedSession.name);
      if (response.data.success) {
        setSuccess(`已加载 "${selectedSession.name}"`);
        setShowLoadModal(false);
        setSelectedSession(null);
        fetchSessions();
      } else {
        setError(response.data.message || '加载游戏失败');
      }
    } catch (err: any) {
      setError(err.message || '加载游戏失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (session: SaveSession) => {
    if (!confirm(`确定删除 "${session.name}"？此操作不可撤销。`)) return;

    setActionLoading(`delete-${session.name}`);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.deleteSession(session.name);
      if (response.data.success) {
        setSuccess(`已删除 "${session.name}"`);
        fetchSessions();
      } else {
        setError(response.data.message || '删除存档失败');
      }
    } catch (err: any) {
      setError(err.message || '删除存档失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateNew = async () => {
    if (!newGameName.trim()) return;

    setActionLoading('create');
    setError(null);
    setSuccess(null);

    try {
      const response = await api.createSession({
        SessionName: newGameName,
        MapName: newGameMap
      });
      if (response.data.success) {
        setSuccess(`已创建新游戏 "${newGameName}"`);
        setShowNewGameModal(false);
        setNewGameName('');
        setNewGameMap('Default');
        fetchSessions();
      } else {
        setError(response.data.message || '创建新游戏失败');
      }
    } catch (err: any) {
      setError(err.message || '创建新游戏失败');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="empty-state">
        <FolderOpen size={64} className="empty-state__icon" />
        <h2 className="empty-state__title">未连接</h2>
        <p className="empty-state__description">连接服务器后可管理存档</p>
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
        <h1 className="page-header__title">存档管理</h1>
        <div className="flex gap-md">
          <button onClick={() => setShowSaveModal(true)} className="btn btn--secondary">
            <Save size={16} />
            保存游戏
          </button>
          <button onClick={() => setShowNewGameModal(true)} className="btn btn--primary">
            <Plus size={16} />
            新建游戏
          </button>
          <button onClick={fetchSessions} className="btn btn--secondary" disabled={loading}>
            <RefreshCw size={16} />
            刷新
          </button>
        </div>
      </div>

      {error && <div className="toast toast--error mb-lg">{error}</div>}
      {success && <div className="toast toast--success mb-lg">{success}</div>}

      <div className="card">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={48} className="empty-state__icon" />
            <h3 className="empty-state__title">暂无存档</h3>
            <p className="empty-state__description">
              创建新游戏或保存当前会话
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>存档名称</th>
                  <th style={{ width: '160px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.name}>
                    <td>
                      <div className="flex items-center gap-md">
                        <FolderOpen size={16} style={{ color: 'var(--accent-primary)' }} />
                        <span className="font-bold">{session.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setShowLoadModal(true);
                          }}
                          className="btn btn--secondary btn--sm"
                          disabled={actionLoading !== null}
                        >
                          <Play size={14} />
                          加载
                        </button>
                        <button
                          onClick={() => handleDelete(session)}
                          className="btn btn--danger btn--sm"
                          disabled={actionLoading !== null}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 调试：显示原始数据 */}
      {rawSessions && (
        <div className="card mt-xl">
          <div className="card__header">
            <div className="card__title">
              <FolderOpen size={14} />
              API 原始数据（调试用）
            </div>
          </div>
          <pre>
{JSON.stringify(rawSessions, null, 2)}
          </pre>
        </div>
      )}

      {/* 保存游戏弹窗 */}
      {showSaveModal && (
        <div className="modal-backdrop" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title flex items-center gap-sm">
                <Save size={20} style={{ color: 'var(--accent-primary)' }} />
                保存游戏
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="modal__close">
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">存档名称</label>
              <input
                type="text"
                className="form-input"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="MySave1"
                autoFocus
              />
            </div>
            <div className="modal__footer">
              <button onClick={() => setShowSaveModal(false)} className="btn btn--secondary">
                取消
              </button>
              <button
                onClick={handleSave}
                className="btn btn--primary"
                disabled={actionLoading !== null || !saveName.trim()}
              >
                {actionLoading === 'save' ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 加载游戏弹窗 */}
      {showLoadModal && selectedSession && (
        <div className="modal-backdrop" onClick={() => setShowLoadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title flex items-center gap-sm">
                <AlertTriangle size={20} style={{ color: 'var(--status-warning)' }} />
                加载游戏
              </h3>
              <button onClick={() => setShowLoadModal(false)} className="modal__close">
                <X size={20} />
              </button>
            </div>
            <p className="modal__hint">
              确定要加载存档 <strong>"{selectedSession.name}"</strong> 吗？当前游戏将被替换。
            </p>
            <div className="modal__footer">
              <button onClick={() => setShowLoadModal(false)} className="btn btn--secondary">
                取消
              </button>
              <button onClick={handleLoad} className="btn btn--primary" disabled={actionLoading !== null}>
                {actionLoading === 'load' ? '加载中...' : '加载'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建游戏弹窗 */}
      {showNewGameModal && (
        <div className="modal-backdrop" onClick={() => setShowNewGameModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title flex items-center gap-sm">
                <Plus size={20} style={{ color: 'var(--accent-primary)' }} />
                创建新游戏
              </h3>
              <button onClick={() => setShowNewGameModal(false)} className="modal__close">
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">会话名称 *</label>
              <input
                type="text"
                className="form-input"
                value={newGameName}
                onChange={e => setNewGameName(e.target.value)}
                placeholder="MyNewFactory"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">地图</label>
              <select
                className="form-input"
                value={newGameMap}
                onChange={e => setNewGameMap(e.target.value)}
              >
                <option value="Default">默认</option>
                <option value="Desert">沙漠</option>
                <option value="NorthernForest">北方森林</option>
                <option value="GrassFields">草原</option>
              </select>
            </div>
            <div className="modal__footer">
              <button onClick={() => setShowNewGameModal(false)} className="btn btn--secondary">
                取消
              </button>
              <button
                onClick={handleCreateNew}
                className="btn btn--primary"
                disabled={actionLoading !== null || !newGameName.trim()}
              >
                {actionLoading === 'create' ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
