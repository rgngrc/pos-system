import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

const ROLES = ['Cashier', 'Supervisor', 'Administrator'];
const roleColors = {
  Administrator: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  Supervisor: { bg: 'rgba(77,159,255,0.15)', color: '#4d9fff' },
  Cashier: { bg: 'rgba(0,229,160,0.15)', color: '#00e5a0' },
};

export default function Users() {
  const { users, setUsers, auditLog, setAuditLog, user: currentUser } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'Cashier', active: true });
  const [error, setError] = useState('');

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: '', username: '', password: '', role: 'Cashier', active: true });
    setError('');
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, username: u.username, password: u.password, role: u.role, active: u.active });
    setError('');
    setShowModal(true);
  };

  const handleSave = () => {
    setError('');
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      setError('All fields are required.'); return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    const dupUsername = users.find(u => u.username === form.username.trim() && u.id !== editUser?.id);
    if (dupUsername) { setError('Username already exists.'); return; }

    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u));
      setAuditLog(prev => [...prev, {
        id: Date.now(), type: 'User Edit', status: 'Completed',
        actor: currentUser.username, actorName: currentUser.name,
        itemName: form.username, reason: 'User updated', timestamp: new Date().toISOString(),
      }]);
    } else {
      const newId = Math.max(...users.map(u => u.id), 0) + 1;
      setUsers(prev => [...prev, { id: newId, ...form }]);
      setAuditLog(prev => [...prev, {
        id: Date.now(), type: 'User Add', status: 'Completed',
        actor: currentUser.username, actorName: currentUser.name,
        itemName: form.username, reason: `User added as ${form.role}`, timestamp: new Date().toISOString(),
      }]);
    }
    setShowModal(false);
  };

  const toggleActive = (u) => {
    if (u.id === currentUser.id) return;
    setUsers(prev => prev.map(us => us.id === u.id ? { ...us, active: !us.active } : us));
    setAuditLog(prev => [...prev, {
      id: Date.now(), type: u.active ? 'User Deactivate' : 'User Activate',
      status: 'Completed', actor: currentUser.username, actorName: currentUser.name,
      itemName: u.username, reason: u.active ? 'User deactivated' : 'User reactivated',
      timestamp: new Date().toISOString(),
    }]);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="animate-fadeInUp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{users.length} total · {users.filter(u => u.active).length} active</p>
        </div>
        <button onClick={openAdd} className="btn-pos-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add User
        </button>
      </div>

      {/* Role summary cards */}
      <div className="animate-fadeInUp delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role && u.active).length;
          const rs = roleColors[role];
          return (
            <div key={role} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: rs.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.color, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>
                {count}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{role}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="pos-card animate-fadeInUp delay-2" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input className="pos-input" style={{ paddingLeft: 34 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', ...ROLES].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid',
                borderColor: roleFilter === r ? (roleColors[r]?.color || 'var(--accent-green)') : 'var(--border)',
                background: roleFilter === r ? (roleColors[r]?.bg || 'var(--accent-green-dim)') : 'transparent',
                color: roleFilter === r ? (roleColors[r]?.color || 'var(--accent-green)') : 'var(--text-muted)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              }}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pos-card animate-fadeInUp delay-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const rs = roleColors[u.role];
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${rs.color}, ${rs.color}88)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                          color: 'var(--text-inverse)', flexShrink: 0,
                        }}>
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                          {isSelf && <span style={{ fontSize: 10, color: 'var(--accent-green)' }}>You</span>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{u.username}</span></td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: rs.bg, color: rs.color }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.active
                        ? <span className="pos-badge badge-green"><span className="status-dot active" />Active</span>
                        : <span className="pos-badge badge-muted"><span className="status-dot inactive" />Inactive</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(u)} className="btn-pos-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>Edit</button>
                        {!isSelf && (
                          <button onClick={() => toggleActive(u)} style={{
                            padding: '4px 10px', fontSize: 11, borderRadius: 8, border: '1px solid var(--border)',
                            background: 'transparent', color: u.active ? 'var(--accent-amber)' : 'var(--accent-green)',
                            cursor: 'pointer',
                          }}>
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16 }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Full Name', key: 'name', placeholder: 'e.g. Juan dela Cruz', type: 'text' },
                { label: 'Username', key: 'username', placeholder: 'e.g. cashier1', type: 'text' },
                { label: 'Password', key: 'password', placeholder: 'Min. 6 characters', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="pos-input" value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Role</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ROLES.map(r => {
                    const rs = roleColors[r];
                    return (
                      <button key={r} onClick={() => setForm(prev => ({ ...prev, role: r }))} style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, border: '1px solid',
                        borderColor: form.role === r ? rs.color : 'var(--border)',
                        background: form.role === r ? rs.bg : 'transparent',
                        color: form.role === r ? rs.color : 'var(--text-muted)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      }}>{r}</button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active</label>
                <button onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))} style={{ width: 44, height: 24, borderRadius: 12, background: form.active ? 'var(--accent-green)' : 'var(--bg-elevated)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: form.active ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', background: 'rgba(255,77,143,0.1)', border: '1px solid rgba(255,77,143,0.2)', borderRadius: 8, color: 'var(--accent-pink)', fontSize: 12, marginTop: 12 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} className="btn-pos-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={handleSave} className="btn-pos-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {editUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}