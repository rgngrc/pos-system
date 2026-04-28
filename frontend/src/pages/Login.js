import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import api from '../services/api';

export default function Login() {
  const { login, auditLog, setAuditLog, loginAttempts, setLoginAttempts } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState('');

  const LOCKOUT_THRESHOLD = 5;
  const LOCKOUT_MS = 5 * 60 * 1000;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const now = Date.now();
    const attempts = loginAttempts[username] || { count: 0, lockedUntil: 0 };

    if (attempts.lockedUntil > now) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000);
      setError(`Account locked. Try again in ${remaining}s.`);
      setLoading(false);
      return;
    }

    try {
      const response = await api.login({ username, password });
      const foundUser = response.user;

      if (!foundUser) {
        handleFailedAttempt(username, attempts, now);
        setLoading(false);
        return;
      }

      if (!foundUser.active) {
        setError('This account has been deactivated.');
        setLoading(false);
        return;
      }

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      setLoginAttempts(prev => ({ ...prev, [username]: { count: 0, lockedUntil: 0 } }));

      setAuditLog(prev => [...prev, {
        id: Date.now(),
        type: 'Login',
        status: 'Completed',
        actor: foundUser.username,
        actorName: foundUser.name,
        itemName: `${foundUser.role} login`,
        reason: 'Successful login',
        timestamp: new Date().toISOString(),
      }]);

      login(foundUser);
    } catch (err) {
      console.error('Login error:', err);
      handleFailedAttempt(username, attempts, now);
    } finally {
      setLoading(false);
    }
  };

  const handleFailedAttempt = (username, attempts, now) => {
    const newCount = attempts.count + 1;
    const newAttempts = { ...loginAttempts };
    if (newCount >= LOCKOUT_THRESHOLD) {
      newAttempts[username] = { count: newCount, lockedUntil: now + LOCKOUT_MS };
      setError('Too many failed attempts. Locked for 5 minutes.');
    } else {
      newAttempts[username] = { count: newCount, lockedUntil: 0 };
      setError(`Invalid credentials. ${LOCKOUT_THRESHOLD - newCount} attempt(s) left.`);
    }
    setLoginAttempts(newAttempts);
    setAuditLog(prev => [...prev, {
      id: Date.now(),
      type: 'Login',
      status: 'Failed',
      actor: username,
      actorName: username,
      reason: 'Invalid credentials',
      timestamp: new Date().toISOString(),
    }]);
  };

  const demoUsers = [
    { username: 'cashier1', password: 'pass123', role: 'Cashier', color: '#00e5a0' },
    { username: 'supervisor1', password: 'pass123', role: 'Supervisor', color: '#4d9fff' },
    { username: 'admin1', password: 'pass123', role: 'Administrator', color: '#a855f7' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <svg width="100%" height="100%" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: '0 20px', animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--accent-green), #00b37a)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(0,229,160,0.3)', animation: 'float 3s ease-in-out infinite' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>POS System</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em' }}>USERNAME</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === 'username' ? 'var(--accent-green)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} onFocus={() => setFocused('username')} onBlur={() => setFocused('')} placeholder="Enter username" className="pos-input" style={{ paddingLeft: 38 }} autoComplete="username" required />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused === 'password' ? 'var(--accent-green)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder="Enter password" className="pos-input" style={{ paddingLeft: 38, paddingRight: 38 }} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  {showPw ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(255,77,143,0.1)', border: '1px solid rgba(255,77,143,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-pink)', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeIn 0.2s ease' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-pos-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
              {loading ? (
                <><span className="pos-spinner" style={{ width: 16, height: 16 }} />Signing in...</>
              ) : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>Sign In</>
              )}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Demo Accounts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {demoUsers.map(u => (
              <button key={u.username} onClick={() => { setUsername(u.username); setPassword(u.password); setError(''); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = u.color + '44'; e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>pass123</div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: u.color + '22', color: u.color }}>{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}