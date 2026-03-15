import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['Cashier', 'Supervisor', 'Administrator'] },
    { path: '/sales', label: 'New Sale', icon: '🛒', roles: ['Cashier'] },
    { path: '/discounts', label: 'Discounts', icon: '🏷️', roles: ['Cashier'] },
    { path: '/transactions', label: 'Transactions', icon: '📋', roles: ['Cashier', 'Supervisor'] },
    { path: '/products', label: 'Products', icon: '📦', roles: ['Administrator'] },
];

function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

    return (
        <div style={styles.sidebar}>
            <div style={styles.brand}>🏪 RetailPOS</div>

            <div style={styles.userCard}>
                <div style={styles.avatar}>{user?.name?.[0]}</div>
                <div>
                    <div style={styles.userName}>{user?.name}</div>
                    <div style={styles.userRole}>{user?.role}</div>
                </div>
            </div>

            <nav>
                {visibleItems.map(item => (
                    <div
                        key={item.path}
                        style={{
                            ...styles.navItem,
                            ...(location.pathname === item.path ? styles.navActive : {})
                        }}
                        onClick={() => navigate(item.path)}
                    >
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div style={styles.logoutBtn} onClick={logout}>
                🚪 Logout
            </div>
        </div>
    );
}

const styles = {
    sidebar: { width: '220px', background: '#1b263b', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 0 20px', flexShrink: 0 },
    brand: { padding: '24px 20px 16px', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    userCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#415a77', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
    userName: { fontSize: '13px', fontWeight: '600' },
    userRole: { fontSize: '11px', opacity: 0.6 },
    navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', borderRadius: '0', transition: 'background 0.15s' },
    navActive: { background: '#415a77', fontWeight: '600' },
    logoutBtn: { marginTop: 'auto', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', opacity: 0.7 },
};

export default Sidebar;