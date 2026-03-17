import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

const PASSWORD_RULES = 'Password must be 8+ chars, include a number and a letter';

function validatePassword(password) {
    if (!password || password.length < 8) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[a-zA-Z]/.test(password)) return false;
    return true;
}

function Users() {
    const { user, users, setUsers, auditLog, setAuditLog } = useContext(AuthContext);
    const isAdmin = user?.role === 'Administrator';

    const [form, setForm] = useState({ username: '', password: '', name: '', role: 'Cashier' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', password: '', name: '', role: 'Cashier' });
    const [error, setError] = useState('');

    const addLog = (action) => {
        setAuditLog(prev => [
            ...prev,
            {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                actor: user?.username || 'system',
                action,
            },
        ]);
    };

    const addUser = () => {
        if (!isAdmin) {
            setError('Only administrators can manage users.');
            return;
        }

        if (!form.username || !form.password || !form.name) {
            setError('Username, password, and name are required.');
            return;
        }

        if (!validatePassword(form.password)) {
            setError(PASSWORD_RULES);
            return;
        }

        if (users.some(u => u.username === form.username)) {
            setError('Username already exists.');
            return;
        }

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

        if (!editForm.username || !editForm.name) {
            setError('Username and name are required.');
            return;
        }

        if (editForm.password && !validatePassword(editForm.password)) {
            setError(PASSWORD_RULES);
            return;
        }

        if (users.some(u => u.username === editForm.username && u.id !== id)) {
            setError('Another user already has this username.');
            return;
        }

        setUsers(users.map(u => {
            if (u.id !== id) return u;
            const updated = {
                ...u,
                username: editForm.username.trim(),
                name: editForm.name.trim(),
                role: editForm.role,
            };
            if (editForm.password) {
                updated.password = editForm.password;
            }
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

    if (!isAdmin) {
        return <div className="alert alert-warning">Only administrators can access user management.</div>;
    }

    return (
        <div>
            <h3 className="mb-4">User Management</h3>

            <div className="card p-3 mb-4">
                <h5>Create New User</h5>
                <div className="row g-2">
                    <div className="col-md-3">
                        <input className="form-control" placeholder="Name" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                        <input className="form-control" placeholder="Username" value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                        <input type="password" className="form-control" placeholder="Password" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="Cashier">Cashier</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Administrator">Administrator</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-dark w-100" onClick={addUser}>Create</button>
                    </div>
                </div>
                <div className="small text-muted mt-2">{PASSWORD_RULES}</div>
                {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>

            <div className="card p-3 mb-4">
                <h5>Active Users</h5>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className={u.active ? '' : 'table-secondary'}>
                                <td>
                                    {editingId === u.id ? (
                                        <input className="form-control" value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                    ) : u.name}
                                </td>
                                <td>
                                    {editingId === u.id ? (
                                        <input className="form-control" value={editForm.username}
                                            onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                                    ) : u.username}
                                </td>
                                <td>
                                    {editingId === u.id ? (
                                        <select className="form-select" value={editForm.role}
                                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                                            <option value="Cashier">Cashier</option>
                                            <option value="Supervisor">Supervisor</option>
                                            <option value="Administrator">Administrator</option>
                                        </select>
                                    ) : u.role}
                                </td>
                                <td>{u.active ? 'Active' : 'Inactive'}</td>
                                <td>
                                    {editingId === u.id ? (
                                        <>
                                            <button className="btn btn-sm btn-success me-1" onClick={() => saveEdit(u.id)}>Save</button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-sm btn-primary me-1" onClick={() => startEditing(u)}>Edit</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => deactivateUser(u)} disabled={!u.active}>
                                                Deactivate
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card p-3">
                <h5>User Audit Log</h5>
                {auditLog.length === 0 ? (
                    <div className="text-muted">No user activity recorded yet.</div>
                ) : (
                    <ul className="list-group">
                        {auditLog.slice().reverse().map(entry => (
                            <li key={entry.id} className="list-group-item">
                                <strong>{entry.timestamp}</strong> - {entry.actor}: {entry.action}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Users;
