import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  sales: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  transactions: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevron: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
};

const roleColors = {
  Administrator: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  Supervisor: { bg: 'rgba(77,159,255,0.15)', color: '#4d9fff' },
  Cashier: { bg: 'rgba(0,229,160,0.15)', color: '#00e5a0' },
};

export default function Sidebar() {
  const { user, logout, sidebarCollapsed, setSidebarCollapsed } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard', roles: ['Cashier', 'Supervisor', 'Administrator'] },
    { path: '/sales', label: 'Sales', icon: 'sales', roles: ['Cashier'] },
    { path: '/transactions', label: 'Transactions', icon: 'transactions', roles: ['Cashier', 'Supervisor'] },
    { path: '/products', label: 'Products', icon: 'products', roles: ['Administrator'] },
    { path: '/users', label: 'Users', icon: 'users', roles: ['Administrator'] },
    { path: '/admin', label: 'Admin Panel', icon: 'admin', roles: ['Administrator'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));
  const roleStyle = roleColors[user?.role] || roleColors.Cashier;
  const collapsed = sidebarCollapsed;

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Logo area */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border)',
        minHeight: 64,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent-green), #00b37a)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1 }}>POS System</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>v2.0 Enhanced</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--accent-green), #00b37a)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="2.5">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center',
            transform: collapsed ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
            marginLeft: collapsed ? 0 : 4,
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {icons.chevron}
        </button>
      </div>

      {/* User info */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 36, height: 36,
          background: `linear-gradient(135deg, ${roleStyle.color}, ${roleStyle.color}88)`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: 13,
          color: 'var(--text-inverse)',
          flexShrink: 0,
          boxShadow: `0 0 12px ${roleStyle.color}40`,
        }}>
          {user?.name?.[0] || 'U'}
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <span style={{
              display: 'inline-block',
              padding: '1px 8px',
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 600,
              background: roleStyle.bg,
              color: roleStyle.color,
              marginTop: 2,
            }}>
              {user?.role}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 8px 8px', marginBottom: 2 }}>
            Navigation
          </div>
        )}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'var(--accent-green-dim)' : 'transparent',
                color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-glass)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3, height: '60%',
                  background: 'var(--accent-green)',
                  borderRadius: '0 3px 3px 0',
                  boxShadow: '0 0 8px var(--accent-green)',
                }} />
              )}
              <span style={{ flexShrink: 0 }}>{icons[item.icon]}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '10px' : '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent',
            color: 'var(--accent-pink)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-pink-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title={collapsed ? 'Logout' : undefined}
        >
          {icons.logout}
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}