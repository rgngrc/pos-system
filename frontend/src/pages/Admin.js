import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

function Admin() {
    const { user, users, setUsers, products, setProducts, auditLog, setAuditLog } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('users');
    
    // Forms State
    const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'Cashier', active: true });
    const [newProduct, setNewProduct] = useState({ name: '', barcode: '', price: 0, stock: 0, active: true });
    const [editingUser, setEditingUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    if (user?.role !== 'Administrator') {
        return (
            <div className="animate-fadeInUp" style={{ background: 'var(--accent-amber-dim)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '12px', padding: '20px', color: 'var(--accent-amber)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                <h3 style={{ margin: 0 }}>Administrator Access Only</h3>
                <p style={{ fontSize: '13px', opacity: 0.8 }}>You do not have permission to view this page.</p>
            </div>
        );
    }

    // Logic: Login Logs Cleanup
    const loginLogs = auditLog.filter(log => log.type === 'Login' && log.reason === 'Successful login');

    const addUser = () => {
        if (!newUser.username || !newUser.password || !newUser.name) return alert('Please fill all fields');
        setUsers([...users, { ...newUser, id: Date.now() }]);
        setNewUser({ username: '', password: '', name: '', role: 'Cashier', active: true });
    };

    const addProduct = () => {
        if (!newProduct.name || !newProduct.barcode || newProduct.price <= 0) return alert('Fill required fields');
        setProducts([...products, { ...newProduct, id: Date.now() }]);
        setNewProduct({ name: '', barcode: '', price: 0, stock: 0, active: true });
    };

    const fmt = (n) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    return (
        <div style={{ maxWidth: 1200 }}>
            {/* Header */}
            <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>System Administration</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage user accounts, product inventory, and system security logs.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                {[
                    { id: 'users', label: '👥 Users' },
                    { id: 'products', label: '📦 Products' },
                    { id: 'logs', label: '🔐 Security Logs' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="btn-pos-secondary"
                        style={{
                            borderColor: activeTab === tab.id ? 'var(--accent-green)' : 'var(--border)',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                            fontWeight: activeTab === tab.id ? 700 : 500
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="animate-fadeInUp">
                    <div className="pos-card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>➕ Add New User</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                            <input className="pos-input" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                            <input className="pos-input" type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            <input className="pos-input" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                            <select className="pos-input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="Cashier">Cashier</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Administrator">Administrator</option>
                            </select>
                            <button className="btn-pos-primary" onClick={addUser}>Add User</button>
                        </div>
                    </div>

                    <div className="pos-card">
                        <table className="pos-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.username}</td>
                                        <td>{u.name}</td>
                                        <td><span className="pos-badge badge-blue">{u.role}</span></td>
                                        <td>{u.active ? <span className="pos-badge badge-green">Active</span> : <span className="pos-badge badge-muted">Inactive</span>}</td>
                                        <td><button className="btn-pos-secondary" style={{ padding: '4px 12px' }} onClick={() => setEditingUser(u)}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="animate-fadeInUp">
                    <div className="pos-card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>➕ Add New Product</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                            <input className="pos-input" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                            <input className="pos-input" placeholder="Barcode" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} />
                            <input className="pos-input" type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                            <input className="pos-input" type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                            <button className="btn-pos-primary" onClick={addProduct}>Add Product</button>
                        </div>
                    </div>

                    <div className="pos-card">
                        <table className="pos-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Barcode</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ fontSize: '12px' }}>{p.barcode}</td>
                                        <td style={{ fontWeight: 700 }}>{fmt(p.price)}</td>
                                        <td style={{ color: p.stock <= 5 ? 'var(--accent-pink)' : 'inherit' }}>{p.stock}</td>
                                        <td>{p.active ? <span className="pos-badge badge-green">Active</span> : <span className="pos-badge badge-muted">Inactive</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
                <div className="pos-card animate-fadeInUp">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Login Security Logs</h3>
                    <table className="pos-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Timestamp</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loginLogs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20).map(log => (
                                <tr key={log.id}>
                                    <td style={{ fontWeight: 600 }}>{log.actorName} <span style={{ opacity: 0.5, fontWeight: 400 }}>({log.actor})</span></td>
                                    <td style={{ fontSize: '12px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td><span className="pos-badge badge-green">Success</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Admin;