import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

/**
 * ProtectedRoute — US4 requirement
 * Wraps routes that require authentication and/or specific roles.
 * Usage: <ProtectedRoute roles={['Administrator']}><AdminPage /></ProtectedRoute>
 */
function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);

  // Not logged in — redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but wrong role — redirect to dashboard
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{
        background: '#FFFBEB', border: '1.5px solid #FDE68A',
        borderRadius: '16px', padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: '12px',
        color: '#92400E', fontSize: '14px', fontWeight: 500,
        fontFamily: "'Segoe UI', sans-serif",
        maxWidth: '480px', marginTop: '20px',
      }}>
        <span style={{ fontSize: '24px' }}>🔒</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Access Denied</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            You need the <strong>{roles.join(' or ')}</strong> role to access this page.
            Your current role is <strong>{user.role}</strong>.
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;