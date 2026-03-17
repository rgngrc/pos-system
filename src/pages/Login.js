import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';

// ── US4 constants ────────────────────────────────────────────────────────────
const MAX_ATTEMPTS    = 5;
const LOCKOUT_MS      = 5 * 60 * 1000; // 5 minutes

function Login() {
  // ── Unchanged context ──────────────────────────────────────────────────────
  const { login, users, loginAttempts, setLoginAttempts, auditLog, setAuditLog } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [countdown, setCountdown] = useState(0); // seconds remaining in lockout

  // ── US4: Live countdown timer when locked ─────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); setError(''); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // ── US4: Audit log helper ──────────────────────────────────────────────────
  const addAuditEntry = (action) => {
    setAuditLog(prev => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        actor: username || 'unknown',
        action,
      },
    ]);
  };

  // ── UNCHANGED core login logic + US4 additions ────────────────────────────
  const handleLogin = () => {
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    // ── US4: Check if this account is currently locked ─────────────────────
    const prev = loginAttempts[username] || { count: 0, lockedUntil: null };
    if (prev.lockedUntil) {
      const remaining = new Date(prev.lockedUntil) - Date.now();
      if (remaining > 0) {
        const secs = Math.ceil(remaining / 1000);
        setCountdown(secs);
        setError(`Account locked. Try again in ${Math.ceil(secs / 60)} min ${secs % 60}s.`);
        return;
      }
      // Lockout expired — reset
      setLoginAttempts(a => ({ ...a, [username]: { count: 0, lockedUntil: null } }));
    }

    // ── UNCHANGED: find user ───────────────────────────────────────────────
    const found = users.find(
      u => u.username === username && u.password === password
    );

    if (!found) {
      // ── US4: track failed attempt ────────────────────────────────────────
      const newCount = (prev.count || 0) + 1;
      const willLock = newCount >= MAX_ATTEMPTS;
      const lockedUntil = willLock
        ? new Date(Date.now() + LOCKOUT_MS).toISOString()
        : null;

      setLoginAttempts(a => ({
        ...a,
        [username]: { count: newCount, lockedUntil },
      }));

      // ── US4: log the failed attempt ──────────────────────────────────────
      addAuditEntry(
        willLock
          ? `Failed login #${newCount} — account LOCKED for 5 min`
          : `Failed login attempt ${newCount}/${MAX_ATTEMPTS}`
      );

      if (willLock) {
        setCountdown(LOCKOUT_MS / 1000);
        setError(`Too many failed attempts. Account locked for 5 minutes.`);
      } else {
        setError(
          `Invalid username or password. ${MAX_ATTEMPTS - newCount} attempt${MAX_ATTEMPTS - newCount !== 1 ? 's' : ''} remaining.`
        );
      }
      return;
    }

    // ── UNCHANGED: check active ────────────────────────────────────────────
    if (!found.active) {
      setError('This account is deactivated. Contact administrator.');
      return;
    }

    // ── US4: reset attempts on successful login ────────────────────────────
    setLoginAttempts(a => ({ ...a, [username]: { count: 0, lockedUntil: null } }));
    addAuditEntry(`Successful login as ${found.role}`);

    login(found);
  };

  const attempts     = loginAttempts[username] || { count: 0 };
  const isLocked     = countdown > 0;
  const attemptsLeft = MAX_ATTEMPTS - (attempts.count || 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{ position: 'fixed', top: '-80px', left: '-80px', width: '320px', height: '320px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-60px', right: '-60px', width: '260px', height: '260px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ background: 'white', borderRadius: '28px', width: '420px', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 40px 32px', textAlign: 'center', color: 'white' }}>
          <div style={{ width: '68px', height: '68px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '30px', border: '1px solid rgba(255,255,255,0.3)' }}>🛍️</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: '22px' }}>SariPh Retail Store</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.75, fontSize: '13.5px' }}>Sign in to your account</p>
        </div>

        {/* Form */}
        <div style={{ padding: '36px 40px 40px' }}>

          {/* Lockout Banner */}
          {isLocked && (
            <div style={{
              background: '#FEF2F2', border: '1.5px solid #FECACA',
              borderRadius: '14px', padding: '16px',
              textAlign: 'center', marginBottom: '20px',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>🔒</div>
              <div style={{ fontWeight: 700, color: '#DC2626', fontSize: '14px', marginBottom: '4px' }}>
                Account Locked
              </div>
              <div style={{ color: '#EF4444', fontSize: '13px' }}>
                Try again in{' '}
                <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '15px' }}>
                  {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* Attempt warning (not yet locked) */}
          {!isLocked && attempts.count > 0 && attempts.count < MAX_ATTEMPTS && (
            <div style={{
              background: '#FFFBEB', border: '1.5px solid #FDE68A',
              borderRadius: '12px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px', fontSize: '12.5px', color: '#92400E',
            }}>
              ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Username
            </label>
            <input
              className="form-control"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter your username"
              disabled={isLocked}
              style={{ borderRadius: '12px', border: '2px solid #E2E8F0', padding: '13px 16px', fontSize: '14px', width: '100%', opacity: isLocked ? 0.5 : 1 }}
              onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && !isLocked && handleLogin()}
              placeholder="Enter your password"
              disabled={isLocked}
              style={{ borderRadius: '12px', border: '2px solid #E2E8F0', padding: '13px 16px', fontSize: '14px', width: '100%', opacity: isLocked ? 0.5 : 1 }}
              onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Error */}
          {error && !isLocked && (
            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '12px 16px', color: '#DC2626', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={isLocked}
            style={{
              width: '100%',
              background: isLocked
                ? '#E2E8F0'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none', borderRadius: '14px', padding: '15px',
              color: isLocked ? '#94A3B8' : 'white',
              fontWeight: 700, fontSize: '15px',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              boxShadow: isLocked ? 'none' : '0 6px 20px rgba(102,126,234,0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { if (!isLocked) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 10px 25px rgba(102,126,234,0.5)'; } }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; if (!isLocked) e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.45)'; }}
          >
            {isLocked ? '🔒 Account Locked' : 'Sign In →'}
          </button>

          {/* Demo credentials hint */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: '#94A3B8', border: '1px solid #E2E8F0' }}>
              💡 Try: <strong style={{ color: '#667eea' }}>cashier1</strong> · <strong style={{ color: '#667eea' }}>supervisor1</strong> · <strong style={{ color: '#667eea' }}>admin1</strong> (pass123)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;