import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

// ✅ NAV_ITEMS roles — UNCHANGED, only added icon (display only)
const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', roles: ['Cashier', 'Supervisor', 'Administrator'], icon: '📊' },
    { path: '/sales', label: 'New Sale', roles: ['Cashier'], icon: '🛒' },
    { path: '/discounts', label: 'Discounts', roles: ['Cashier'], icon: '🏷️' },
    { path: '/transactions', label: 'Transactions', roles: ['Cashier', 'Supervisor'], icon: '📋' },
    { path: '/products', label: 'Products', roles: ['Administrator'], icon: '📦' },
    { path: '/users', label: 'Users', roles: ['Administrator'], icon: '👥' },
];

function Sidebar() {
    // ✅ ALL LOGIC — COMPLETELY UNCHANGED
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

    const rolePill = {
        Administrator: { bg: 'rgba(99,102,241,0.25)', text: '#A5B4FC' },
        Supervisor: { bg: 'rgba(16,185,129,0.25)', text: '#6EE7B7' },
        Cashier: { bg: 'rgba(245,158,11,0.25)', text: '#FCD34D' },
    };
    const roleStyle = rolePill[user?.role] || { bg: 'rgba(255,255,255,0.1)', text: '#ccc' };

    return (
        <div style={{
            width: '240px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #1E1B4B 0%, #2D2A70 60%, #312E81 100%)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 14px',
            boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
            flexShrink: 0,
        }}>

            {/* Brand */}
            <div style={{
                textAlign: 'center', marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <div style={{
                    width: '54px', height: '54px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', margin: '0 auto 10px',
                    boxShadow: '0 6px 16px rgba(102,126,234,0.45)',
                }}>🛍️</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.2px' }}>
                    SariPh
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                    Retail Store POS
                </div>
            </div>

            {/* User Profile Card */}
            <div style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '14px',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '16px', flexShrink: 0,
                }}>
                    {user?.name?.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        color: 'white', fontWeight: 600, fontSize: '13px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {user?.name}
                    </div>
                    <span style={{
                        display: 'inline-block', marginTop: '4px',
                        background: roleStyle.bg, color: roleStyle.text,
                        borderRadius: '6px', padding: '2px 9px',
                        fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.04em',
                    }}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1 }}>
                <div style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                    fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px',
                }}>
                    Navigation
                </div>
                {visibleItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                width: '100%',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '11px 14px', marginBottom: '3px',
                                borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: isActive
                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                    : 'transparent',
                                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                                fontWeight: isActive ? 700 : 400,
                                fontSize: '13.5px', textAlign: 'left',
                                transition: 'all 0.18s ease',
                                boxShadow: isActive ? '0 4px 14px rgba(102,126,234,0.4)' : 'none',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span style={{ fontSize: '17px', flexShrink: 0 }}>{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <button
                onClick={logout}
                style={{
                    width: '100%', padding: '11px 14px',
                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent', color: 'rgba(255,255,255,0.55)',
                    fontSize: '13.5px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.18s ease',
                    fontFamily: "'Segoe UI', sans-serif",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                    e.currentTarget.style.color = '#FCA5A5';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }}
            >
                🚪 Logout
            </button>
        </div>
    );
}

export default Sidebar;