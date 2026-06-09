import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Gamepad2,
  FolderOpen,
  Terminal,
  Lock,
  Power
} from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/options', icon: Settings, label: '服务器设置', requireFullAccess: true },
  { to: '/settings', icon: Gamepad2, label: '游戏设置', requireFullAccess: true },
  { to: '/sessions', icon: FolderOpen, label: '存档管理', requireFullAccess: true },
  { to: '/actions', icon: Terminal, label: '操作', requireFullAccess: true },
];

export default function Sidebar() {
  const { isConnected, isFullAccess } = useConnection();

  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar__nav">
        {navItems.map(({ to, icon: Icon, label, requireFullAccess }) => {
          // If item requires full access and user doesn't have it, show as disabled
          const isDisabled = requireFullAccess && !isFullAccess;

          if (isDisabled) {
            return (
              <div
                key={to}
                className="app-sidebar__link app-sidebar__link--disabled"
                title="需要输入密码才能访问"
                style={{ cursor: 'not-allowed', opacity: 0.5 }}
              >
                <Icon size={18} />
                <span>{label}</span>
                <Lock size={12} style={{ marginLeft: 'auto' }} />
              </div>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="app-sidebar__footer">
        {!isFullAccess && isConnected && (
          <div className="flex items-center gap-sm mb-sm" style={{ color: 'var(--status-warning)', fontSize: '0.65rem' }}>
            <Lock size={10} />
            只读模式
          </div>
        )}
        <Power size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
        幸福工厂控制面板 v1.0
      </div>
    </aside>
  );
}
