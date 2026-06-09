import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Save, Settings, Lock } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import * as api from '../api/client';

// Server options from API have FG. prefix and string values
interface RawServerOptions {
  serverOptions?: Record<string, string>;
  pendingServerOptions?: Record<string, string>;
  [key: string]: unknown;
}

// Parsed server options for the form
interface ParsedServerOptions {
  DSAutoPause?: boolean;
  DSAutoSaveOnDisconnect?: boolean;
  AutosaveInterval?: number;
  NetworkQuality?: number;
  SendGameplayData?: boolean;
  EnableSeasonalEvents?: boolean;
  AgreeToCrashUpload?: boolean;
  ServerRestartTimeSlot?: number;
  WeatherPreset?: string;
}

// Convert API response to parsed options
const parseServerOptions = (raw: RawServerOptions): ParsedServerOptions => {
  const opts: ParsedServerOptions = {};
  const rawOpts = raw?.serverOptions || {};

  if (rawOpts['FG.DSAutoPause']) opts.DSAutoPause = rawOpts['FG.DSAutoPause'] === 'True';
  if (rawOpts['FG.DSAutoSaveOnDisconnect']) opts.DSAutoSaveOnDisconnect = rawOpts['FG.DSAutoSaveOnDisconnect'] === 'True';
  if (rawOpts['FG.AutosaveInterval']) opts.AutosaveInterval = parseFloat(rawOpts['FG.AutosaveInterval']) || 0;
  if (rawOpts['FG.NetworkQuality']) opts.NetworkQuality = parseInt(rawOpts['FG.NetworkQuality']) || 0;
  if (rawOpts['FG.SendGameplayData']) opts.SendGameplayData = rawOpts['FG.SendGameplayData'] === 'True';
  if (rawOpts['FG.EnableSeasonalEvents']) opts.EnableSeasonalEvents = rawOpts['FG.EnableSeasonalEvents'] === 'True';
  if (rawOpts['FG.AgreeToCrashUpload']) opts.AgreeToCrashUpload = rawOpts['FG.AgreeToCrashUpload'] === 'True';
  if (rawOpts['FG.ServerRestartTimeSlot']) opts.ServerRestartTimeSlot = parseFloat(rawOpts['FG.ServerRestartTimeSlot']) || 0;
  if (rawOpts['FG.WeatherPreset']) opts.WeatherPreset = rawOpts['FG.WeatherPreset'];

  return opts;
};

// Convert parsed options to API format
const toApiOptions = (opts: ParsedServerOptions): Record<string, string> => {
  const result: Record<string, string> = {};

  if (opts.DSAutoPause !== undefined) result['FG.DSAutoPause'] = String(opts.DSAutoPause);
  if (opts.DSAutoSaveOnDisconnect !== undefined) result['FG.DSAutoSaveOnDisconnect'] = String(opts.DSAutoSaveOnDisconnect);
  if (opts.AutosaveInterval !== undefined) result['FG.AutosaveInterval'] = String(opts.AutosaveInterval);
  if (opts.NetworkQuality !== undefined) result['FG.NetworkQuality'] = String(opts.NetworkQuality);
  if (opts.SendGameplayData !== undefined) result['FG.SendGameplayData'] = String(opts.SendGameplayData);
  if (opts.EnableSeasonalEvents !== undefined) result['FG.EnableSeasonalEvents'] = String(opts.EnableSeasonalEvents);
  if (opts.AgreeToCrashUpload !== undefined) result['FG.AgreeToCrashUpload'] = String(opts.AgreeToCrashUpload);
  if (opts.ServerRestartTimeSlot !== undefined) result['FG.ServerRestartTimeSlot'] = String(opts.ServerRestartTimeSlot);
  if (opts.WeatherPreset !== undefined) result['FG.WeatherPreset'] = opts.WeatherPreset;

  return result;
};

export default function ServerOptionsPage() {
  const { isConnected, isFullAccess } = useConnection();
  const [options, setOptions] = useState<ParsedServerOptions>({});
  const [rawOptions, setRawOptions] = useState<RawServerOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.getServerOptions();
      if (response.data.success && response.data.data) {
        const raw = response.data.data as unknown as RawServerOptions;
        setRawOptions(raw);
        setOptions(parseServerOptions(raw));
      } else {
        setError(response.data.message || '获取服务器选项失败');
      }
    } catch (err: any) {
      setError(err.message || '获取服务器选项失败');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && isFullAccess) {
      fetchOptions();
    }
  }, [isConnected, isFullAccess, fetchOptions]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const apiOptions = toApiOptions(options);
      const response = await api.updateServerOptions(apiOptions as any);
      if (response.data.success) {
        setSuccess('服务器选项应用成功');
        fetchOptions();
      } else {
        setError(response.data.message || '应用服务器选项失败');
      }
    } catch (err: any) {
      setError(err.message || '应用服务器选项失败');
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="empty-state">
        <Settings size={64} className="empty-state__icon" />
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">服务器设置</h1>
        <button onClick={fetchOptions} className="btn btn--secondary" disabled={loading}>
          <RefreshCw size={16} />
          刷新
        </button>
      </div>

      {error && <div className="toast toast--error mb-lg">{error}</div>}
      {success && <div className="toast toast--success mb-lg">{success}</div>}

      <div className="card">
        <div className="card__header">
          <div className="card__title">
            <Settings size={14} />
            配置
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
          {/* 自动暂停 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="form-label form-label--inline">自动暂停</div>
              <div className="text-sm text-secondary">
                当无玩家连接时自动暂停服务器
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={Boolean(options.DSAutoPause)}
                onChange={e => setOptions({ ...options, DSAutoPause: e.target.checked })}
              />
              <span className="toggle__slider" />
            </label>
          </div>

          {/* 断开时自动保存 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="form-label form-label--inline">断开时自动保存</div>
              <div className="text-sm text-secondary">
                最后一位玩家断开时自动保存游戏
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={Boolean(options.DSAutoSaveOnDisconnect)}
                onChange={e => setOptions({ ...options, DSAutoSaveOnDisconnect: e.target.checked })}
              />
              <span className="toggle__slider" />
            </label>
          </div>

          {/* 自动保存间隔 (API返回的是秒，这里显示分钟) */}
          <div className="flex items-center justify-between">
            <div>
              <div className="form-label form-label--inline">自动保存间隔</div>
              <div className="text-sm text-secondary">
                自动保存的时间间隔（分钟）
              </div>
            </div>
            <input
              type="number"
              className="form-input form-input--sm"
              style={{ width: '100px' }}
              value={Math.round((options.AutosaveInterval || 0) / 60)}
              onChange={e => setOptions({ ...options, AutosaveInterval: (parseInt(e.target.value) || 0) * 60 })}
              min={1}
              max={60}
            />
          </div>

          {/* 网络质量 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="form-label form-label--inline">网络质量</div>
              <div className="text-sm text-secondary">
                数值越高 = 带宽占用越大（0-3）
              </div>
            </div>
            <input
              type="number"
              className="form-input form-input--sm"
              style={{ width: '100px' }}
              value={options.NetworkQuality ?? 1}
              onChange={e => setOptions({ ...options, NetworkQuality: parseInt(e.target.value) || 0 })}
              min={0}
              max={3}
            />
          </div>

          {/* 发送游戏数据 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="form-label form-label--inline">发送游戏数据</div>
              <div className="text-sm text-secondary">
                与 Coffee Stain Studios 共享游戏数据
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={Boolean(options.SendGameplayData)}
                onChange={e => setOptions({ ...options, SendGameplayData: e.target.checked })}
              />
              <span className="toggle__slider" />
            </label>
          </div>

          {/* 启用季节活动 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="form-label form-label--inline">启用季节活动</div>
              <div className="text-sm text-secondary">
                启用游戏中的季节性事件
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={Boolean(options.EnableSeasonalEvents)}
                onChange={e => setOptions({ ...options, EnableSeasonalEvents: e.target.checked })}
              />
              <span className="toggle__slider" />
            </label>
          </div>

          {/* 同意崩溃上传 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="form-label form-label--inline">同意崩溃上传</div>
              <div className="text-sm text-secondary">
                帮助 Coffee Stain 改进游戏
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={Boolean(options.AgreeToCrashUpload)}
                onChange={e => setOptions({ ...options, AgreeToCrashUpload: e.target.checked })}
              />
              <span className="toggle__slider" />
            </label>
          </div>
        </div>

        <div className="divider mt-xl" />

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn btn--primary" disabled={saving}>
            <Save size={16} />
            {saving ? '应用中...' : '应用更改'}
          </button>
        </div>
      </div>

      {/* 调试：显示原始数据 */}
      {rawOptions && (
        <div className="card mt-xl">
          <div className="card__header">
            <div className="card__title">
              <Settings size={14} />
              API 原始数据（调试用）
            </div>
          </div>
          <pre>
{JSON.stringify(rawOptions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
