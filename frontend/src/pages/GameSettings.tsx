import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Save, Gamepad2, Lock } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import * as api from '../api/client';
import type { AdvancedGameSettings } from '../types';

export default function GameSettings() {
  const { isConnected, isFullAccess } = useConnection();
  const [settings, setSettings] = useState<AdvancedGameSettings>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!isConnected || !isFullAccess) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.getAdvancedSettings();
      if (response.data.success && response.data.data) {
        setSettings(response.data.data as AdvancedGameSettings);
      } else {
        setError(response.data.message || '获取游戏设置失败');
      }
    } catch (err: any) {
      setError(err.message || '获取游戏设置失败');
    } finally {
      setLoading(false);
    }
  }, [isConnected, isFullAccess]);

  useEffect(() => {
    if (isConnected && isFullAccess) {
      fetchSettings();
    }
  }, [isConnected, isFullAccess, fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.updateAdvancedSettings(settings);
      if (response.data.success) {
        setSuccess('游戏设置应用成功');
        fetchSettings();
      } else {
        setError(response.data.message || '应用游戏设置失败');
      }
    } catch (err: any) {
      setError(err.message || '应用游戏设置失败');
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="empty-state">
        <Gamepad2 size={64} className="empty-state__icon" />
        <h2 className="empty-state__title">未连接</h2>
        <p className="empty-state__description">连接服务器后可管理设置</p>
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

  const toggleFields: { key: keyof AdvancedGameSettings; label: string; description: string }[] = [
    { key: 'GodMode', label: '上帝模式', description: '玩家无敌' },
    { key: 'NoPower', label: '无限电力', description: '建筑不需要电力' },
    { key: 'NoBuildCost', label: '建筑免费', description: '建筑无成本' },
    { key: 'NoUnlockCost', label: '解锁免费', description: '所有科技免费解锁' },
    { key: 'FlightMode', label: '飞行模式', description: '玩家可以飞行' },
    { key: 'GiveAllTiers', label: '解锁所有阶段', description: '游戏开始时解锁所有阶段' },
    { key: 'DisableArachnidCreatures', label: '禁用蜘蛛', description: '移除蜘蛛敌人' },
    { key: 'UnlockAllResearchSchematics', label: '解锁所有研究', description: '所有研究已解锁' },
    { key: 'UnlockInstantAltRecipes', label: '即时替代配方', description: '替代配方即时解锁' },
    { key: 'UnlockAllResourceSinkSchematics', label: '解锁资源回收', description: '所有资源回收科技可用' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">游戏设置</h1>
        <button onClick={fetchSettings} className="btn btn--secondary" disabled={loading}>
          <RefreshCw size={16} />
          刷新
        </button>
      </div>

      {error && <div className="toast toast--error mb-lg">{error}</div>}
      {success && <div className="toast toast--success mb-lg">{success}</div>}

      <div className="card">
        <div className="card__header">
          <div className="card__title">
            <Gamepad2 size={14} />
            游戏修改器
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
          {toggleFields.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="form-label">{label}</div>
                <div className="text-sm text-secondary">{description}</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={Boolean(settings[key])}
                  onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
                />
                <span className="toggle__slider" />
              </label>
            </div>
          ))}
        </div>

        <div className="divider mt-xl" />

        <div className="form-group">
          <label className="form-label">给予物品（控制台命令）</label>
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '400px' }}
            value={settings.GiveItems ?? ''}
            onChange={e => setSettings({ ...settings, GiveItems: e.target.value })}
            placeholder="例如: FicsIt_FicsItMod/Materials/Plastic"
          />
        </div>

        <div className="flex justify-end mt-xl">
          <button onClick={handleSave} className="btn btn--primary" disabled={saving}>
            <Save size={16} />
            {saving ? '应用中...' : '应用更改'}
          </button>
        </div>
      </div>
    </div>
  );
}
