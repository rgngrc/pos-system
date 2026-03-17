import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

// ✅ UNCHANGED — critical logic
const PASSWORD_RULES = 'Password must be 8+ chars, include a number and a letter';

function validatePassword(password) {
    if (!password || password.length < 8) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[a-zA-Z]/.test(password)) return false;
    return true;
}

function Users() {
    // ✅ ALL STATE AND LOGIC — COMPLETELY UNCHANGED
    const { user, users, setUsers, auditLog, setAuditLog } = useContext(AuthContext);
    const isAdmin = user?.role === 'Administrator';

    const [form, setForm]           = useState({ username: '', password: '', name: '', role: 'Cashier' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm]   = useState({ username: '', password: '', name: '', role: 'Cashier' });
    const [error, setError]         = useState('');

    const addLog = (action) => {
        setAuditLog(prev => [...prev, {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            actor: user?.username || 'system',
            action,
        }]);
    };

    const addUser = () => {
        if (!isAdmin) { setError('Only administrators can manage users.'); return; }
        if (!form.username || !form.password || !form.name) { setError('Username, password, and name are required.'); return; }
        if (!validatePassword(form.password)) { setError(PASSWORD_RULES); return; }
        if (users.some(u => u.username === form.username)) { setError('Username already exists.'); return; }
        const newUser = {
            id: Date.now(),
            username: form.username.trim(),
            password: form.password,
            name: form.name.trim(),
            role: form.role,
            active: true,
        };
        setUsers([...users, newUser]);
        addLog(`Created user ${newUser.username} as ${newUser.role}`);
        setForm({ username: '', password: '', name: '', role: 'Cashier' });
        setError('');
    };

    const startEditing = (u) => {
        if (!isAdmin) return;
        setEditingId(u.id);
        setEditForm({ username: u.username, password: '', name: u.name, role: u.role });
        setError('');
    };

    const saveEdit = (id) => {
        if (!isAdmin) return;
        if (!editForm.username || !editForm.name) { setError('Username and name are required.'); return; }
        if (editForm.password && !validatePassword(editForm.password)) { setError(PASSWORD_RULES); return; }
        if (users.some(u => u.username === editForm.username && u.id !== id)) {
            setError('Another user already has this username.'); return;
        }
        setUsers(users.map(u => {
            if (u.id !== id) return u;
            const updated = {
                ...u,
                username: editForm.username.trim(),
                name: editForm.name.trim(),
                role: editForm.role,
            };
            if (editForm.password) updated.password = editForm.password;
            return updated;
        }));
        addLog(`Updated user record ${editForm.username} (role ${editForm.role})`);
        setEditingId(null);
        setError('');
    };

    const deactivateUser = (u) => {
        if (!isAdmin) return;
        if (u.id === user.id) {
            setError('Administrators cannot deactivate their own account.');
            return;
        }
        setUsers(users.map(v => v.id === u.id ? { ...v, active: false } : v));
        addLog(`Deactivated user ${u.username}`);
        setError('');
    };

    // Non-admin guard
    if (!isAdmin) {
        return (
            <div style={{
                background: '#FFFBEB', border: '1.5px solid #FDE68A',
                borderRadius: '16px', padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: '10px',
                color: '#92400E', fontSize: '14px', fontWeight: 500,
                fontFamily: "'Segoe UI', sans-serif",
            }}>
                ⚠️ Only administrators can access user management.
            </div>
        );
    }

    // UI helpers (display only)
    const cardStyle = {
        background: 'white', borderRadius: '20px', padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        border: '1px solid #F1F5F9', marginBottom: '20px',
    };
    const inputStyle = {
        borderRadius: '10px', border: '2px solid #E2E8F0',
        padding: '10px 14px', fontSize: '13px', width: '100%', outline: 'none',
    };
    const btnBase = {
        padding: '7px 16px', borderRadius: '9px', border: 'none',
        fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    };

    const RoleBadge = ({ role }) => {
        const map = {
            Administrator: { bg: '#EEF2FF', color: '#4F46E5' },
            Supervisor:    { bg: '#ECFDF5', color: '#059669' },
            Cashier:       { bg: '#FFFBEB', color: '#D97706' },
        };
        const s = map[role] || { bg: '#F3F4F6', color: '#6B7280' };
        return (
            <span style={{
                background: s.bg, color: s.color,
                borderRadius: '7px', padding: '4px 12px',
                fontSize: '12px', fontWeight: 700,
            }}>
                {role}
            </span>
        );
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 800, color: '#1E293B', margin: 0, fontSize: '22px' }}>
                    👥 User Management
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0' }}>
                    Manage system users, roles, and access
                </p>
            </div>

            {/* Create User Form */}
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '16px', fontSize: '14px' }}>
                    ➕ Create New User
                </h6>
                <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Full Name</label>
                        <input style={inputStyle} className="form-control"
                            placeholder="e.g. Juan dela Cruz" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Username</label>
                        <input style={inputStyle} className="form-control"
                            placeholder="username" value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Password</label>
                        <input type="password" style={inputStyle} className="form-control"
                            placeholder="••••••••" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Role</label>
                        <select style={inputStyle} className="form-select" value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="Cashier">Cashier</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Administrator">Administrator</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button onClick={addUser} style={{
                            width: '100%', padding: '11px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            border: 'none', borderRadius: '12px', color: 'white',
                            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(102,126,234,0.4)',
                            transition: 'transform 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            Create
                        </button>
                    </div>
                </div>

                <div style={{
                    marginTop: '12px', background: '#F8FAFC', borderRadius: '10px',
                    padding: '9px 14px', fontSize: '12px', color: '#64748B',
                    display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                    🔐 {PASSWORD_RULES}
                </div>

                {error && (
                    <div style={{
                        marginTop: '12px', background: '#FEF2F2',
                        border: '1.5px solid #FECACA', borderRadius: '12px',
                        padding: '11px 16px', color: '#DC2626', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '16px', fontSize: '14px' }}>
                    👤 System Users
                </h6>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                                {['Name', 'Username', 'Role', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 16px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: 700, color: '#94A3B8',
                                        textTransform: 'uppercase', letterSpacing: '0.07em',
                                        background: '#F8FAFC',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, idx) => (
                                <tr key={u.id} style={{
                                    borderBottom: '1px solid #F1F5F9',
                                    opacity: u.active ? 1 : 0.5,
                                    background: idx % 2 === 0 ? 'white' : '#FAFAFA',
                                }}>
                                    <td style={{ padding: '13px 16px' }}>
                                        {editingId === u.id ? (
                                            <input style={inputStyle} className="form-control"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '34px', height: '34px',
                                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                    borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white', fontWeight: 800,
                                                    fontSize: '13px', flexShrink: 0,
                                                }}>
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#1E293B' }}>
                                                    {u.name}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '13px 16px', color: '#6B7280', fontFamily: 'monospace' }}>
                                        {editingId === u.id ? (
                                            <input style={inputStyle} className="form-control"
                                                value={editForm.username}
                                                onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                                        ) : (
                                            <span style={{ background: '#F1F5F9', borderRadius: '6px', padding: '3px 10px' }}>
                                                {u.username}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        {editingId === u.id ? (
                                            <select style={inputStyle} className="form-select"
                                                value={editForm.role}
                                                onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                                                <option value="Cashier">Cashier</option>
                                                <option value="Supervisor">Supervisor</option>
                                                <option value="Administrator">Administrator</option>
                                            </select>
                                        ) : <RoleBadge role={u.role} />}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{
                                            background: u.active ? '#ECFDF5' : '#F9FAFB',
                                            color: u.active ? '#10B981' : '#9CA3AF',
                                            borderRadius: '8px', padding: '4px 12px',
                                            fontSize: '12px', fontWeight: 700,
                                        }}>
                                            {u.active ? '● Active' : '○ Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        {editingId === u.id ? (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => saveEdit(u.id)}
                                                    style={{ ...btnBase, background: '#10B981', color: 'white' }}>
                                                    ✓ Save
                                                </button>
                                                <button onClick={() => setEditingId(null)}
                                                    style={{ ...btnBase, background: '#F1F5F9', color: '#64748B' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => startEditing(u)}
                                                    style={{ ...btnBase, background: '#EEF2FF', color: '#4F46E5' }}>
                                                    ✎ Edit
                                                </button>
                                                <button onClick={() => deactivateUser(u)}
                                                    disabled={!u.active}
                                                    style={{
                                                        ...btnBase,
                                                        background: u.active ? '#FEF2F2' : '#F9FAFB',
                                                        color: u.active ? '#EF4444' : '#9CA3AF',
                                                        cursor: u.active ? 'pointer' : 'not-allowed',
                                                        opacity: u.active ? 1 : 0.5,
                                                    }}>
                                                    Deactivate
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit Log */}
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '16px', fontSize: '14px' }}>
                    📋 Audit Log
                </h6>
                {auditLog.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '36px',
                        background: '#F8FAFC', borderRadius: '14px',
                        color: '#CBD5E1', fontSize: '14px',
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                        No user activity recorded yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {auditLog.slice().reverse().map(entry => (
                            <div key={entry.id} style={{
                                background: '#F8FAFC', borderRadius: '12px',
                                padding: '12px 16px', borderLeft: '3px solid #667eea',
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', fontSize: '13px',
                            }}>
                                <div>
                                    <span style={{ fontWeight: 700, color: '#4F46E5' }}>{entry.actor}</span>
                                    <span style={{ color: '#64748B', marginLeft: '6px' }}>{entry.action}</span>
                                </div>
                                <span style={{ color: '#94A3B8', fontSize: '11.5px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                                    {entry.timestamp}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;