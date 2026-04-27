import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

function Admin() {
    const { user, users, setUsers, products, setProducts, auditLog, setAuditLog } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('users');
    const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'Cashier', active: true });
    const [newProduct, setNewProduct] = useState({ name: '', barcode: '', price: 0, stock: 0, active: true });
    const [editingUser, setEditingUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    if (user?.role !== 'Administrator') {
        return (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E', fontSize: '14px', fontWeight: 500 }}>
                ⚠️ Administrator access only
            </div>
        );
    }

    // ─── Login Logs Cleanup ───────────────────────────────────────────────────

    // Filter out incomplete login entries (must have a reason)
    const loginLogs = auditLog.filter(log =>
        log.type === 'Login' && log.reason === 'Successful login'
    );
    const cleanedLoginLogs = [];
    const userLoginMap = {};

    loginLogs.forEach(log => {
        if (!userLoginMap[log.actor]) {
            userLoginMap[log.actor] = [];
        }
        userLoginMap[log.actor].push(log);
    });

    Object.values(userLoginMap).forEach(logs => {
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        let lastKeptTime = null;
        logs.forEach(log => {
            if (!lastKeptTime || (new Date(lastKeptTime) - new Date(log.timestamp)) > 60000) {
                cleanedLoginLogs.push(log);
                lastKeptTime = log.timestamp;
            }
        });
    });

    const cleanupDuplicateLogins = () => {
        if (!window.confirm('Remove duplicate login entries? This cannot be undone.')) return;
        const filteredAuditLog = auditLog.filter(log => {
            if (log.type !== 'Login') return true;
            if (log.reason !== 'Successful login') return false; // Remove incomplete entries
            return cleanedLoginLogs.includes(log);
        });
        setAuditLog(filteredAuditLog);
        alert('✓ Cleaned up duplicate login entries');
    };

    // ─── User Management ──────────────────────────────────────────────────────

    const addUser = () => {
        if (!newUser.username || !newUser.password || !newUser.name) {
            alert('Please fill all fields');
            return;
        }

        if (users.find(u => u.username === newUser.username)) {
            alert('Username already exists');
            return;
        }

        setUsers([...users, { ...newUser, id: Date.now() }]);
        setNewUser({ username: '', password: '', name: '', role: 'Cashier', active: true });
        alert('✓ User added successfully');
    };

    const updateUser = () => {
        if (!editingUser.username || !editingUser.password || !editingUser.name) {
            alert('Please fill all fields');
            return;
        }

        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
        alert('✓ User updated successfully');
    };

    const toggleUserActive = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
    };

    // ─── Product Management ───────────────────────────────────────────────────

    const addProduct = () => {
        if (!newProduct.name || !newProduct.barcode || newProduct.price <= 0) {
            alert('Please fill all required fields');
            return;
        }

        if (products.find(p => p.barcode === newProduct.barcode)) {
            alert('Barcode already exists');
            return;
        }

        setProducts([...products, { ...newProduct, id: Date.now() }]);
        setNewProduct({ name: '', barcode: '', price: 0, stock: 0, active: true });
        alert('✓ Product added successfully');
    };

    const updateProduct = () => {
        if (!editingProduct.name || !editingProduct.barcode || editingProduct.price <= 0) {
            alert('Please fill all required fields');
            return;
        }

        setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
        setEditingProduct(null);
        alert('✓ Product updated successfully');
    };

    const toggleProductActive = (id) => {
        setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    // ─── Styles ───────────────────────────────────────────────────────────────

    const card = { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' };
    const inp = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', marginBottom: '10px', outline: 'none' };
    const btn = { padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginRight: '8px' };
    const btnPrimary = { ...btn, background: '#667eea', color: 'white' };
    const btnSecondary = { ...btn, background: '#E2E8F0', color: '#1E293B' };
    const btnDanger = { ...btn, background: '#EF4444', color: 'white' };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>⚙️ Administrator Dashboard</h2>
                <p style={{ color: '#94A3B8', fontSize: '14px' }}>Manage users, products, and system settings</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #E2E8F0', flexWrap: 'wrap' }}>
                {['users', 'products', 'loginlogs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            background: activeTab === tab ? '#667eea' : 'transparent',
                            color: activeTab === tab ? 'white' : '#64748B',
                            fontWeight: activeTab === tab ? 700 : 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab ? '3px solid #667eea' : 'none',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => !activeTab === tab && (e.currentTarget.style.color = '#1E293B')}
                        onMouseLeave={e => !activeTab === tab && (e.currentTarget.style.color = '#64748B')}>
                        {tab === 'users' && '👥 Users'}
                        {tab === 'products' && '📦 Products'}
                        {tab === 'loginlogs' && '🔐 Login Logs'}
                    </button>
                ))}
            </div>

            {/* ─── USERS TAB ─── */}
            {activeTab === 'users' && (
                <>
                    {/* Add User Form */}
                    <div style={card}>
                        <h5 style={{ fontWeight: 700, marginBottom: '16px' }}>➕ Add New User</h5>
                        <div className="row g-2">
                            <div className="col-md-3">
                                <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} style={inp} />
                            </div>
                            <div className="col-md-3">
                                <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} style={inp} />
                            </div>
                            <div className="col-md-2">
                                <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={inp} />
                            </div>
                            <div className="col-md-2">
                                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={inp}>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <button onClick={addUser} style={btnPrimary}>✓ Add User</button>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div style={card}>
                        <h5 style={{ fontWeight: 700, marginBottom: '16px' }}>User Accounts ({users.length})</h5>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Username</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Role</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, idx) => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FAFAFA' : 'white' }}>
                                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600 }}>{u.username}</td>
                                            <td style={{ padding: '12px', fontSize: '12px' }}>{u.name}</td>
                                            <td style={{ padding: '12px', fontSize: '12px' }}>
                                                <span style={{ background: '#EEF2FF', color: '#667eea', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '10px' }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '12px' }}>
                                                <span style={{ background: u.active ? '#ECFDF5' : '#FEF2F2', color: u.active ? '#059669' : '#EF4444', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '10px' }}>
                                                    {u.active ? '✓ Active' : '✕ Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '12px' }}>
                                                <button onClick={() => setEditingUser(u)} style={{ ...btn, background: '#667eea', color: 'white', marginRight: '4px' }}>Edit</button>
                                                <button onClick={() => toggleUserActive(u.id)} style={{ ...btn, background: u.active ? '#EF4444' : '#10B981', color: 'white' }}>
                                                    {u.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Edit User Modal */}
                    {editingUser && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
                                <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>Edit User</h5>
                                <input type="text" placeholder="Username" value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} style={inp} disabled />
                                <input type="password" placeholder="Password" value={editingUser.password} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} style={inp} />
                                <input type="text" placeholder="Full Name" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} style={inp} />
                                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} style={inp}>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setEditingUser(null)} style={btnSecondary}>Cancel</button>
                                    <button onClick={updateUser} style={btnPrimary}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>)}

            {/* ─── PRODUCTS TAB ─── */}
            {activeTab === 'products' && (
                <>
                    {/* Add Product Form */}
                    <div style={card}>
                        <h5 style={{ fontWeight: 700, marginBottom: '16px' }}>➕ Add New Product</h5>
                        <div className="row g-2">
                            <div className="col-md-3">
                                <input type="text" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={inp} />
                            </div>
                            <div className="col-md-2">
                                <input type="text" placeholder="Barcode" value={newProduct.barcode} onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} style={inp} />
                            </div>
                            <div className="col-md-2">
                                <input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })} style={inp} />
                            </div>
                            <div className="col-md-2">
                                <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })} style={inp} />
                            </div>
                            <div className="col-md-3">
                                <button onClick={addProduct} style={btnPrimary}>✓ Add Product</button>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div style={card}>
                        <h5 style={{ fontWeight: 700, marginBottom: '16px' }}>Product Catalog ({products.length})</h5>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Product Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Barcode</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Price</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Stock</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p, idx) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FAFAFA' : 'white' }}>
                                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600 }}>{p.name}</td>
                                            <td style={{ padding: '12px', fontSize: '12px' }}>{p.barcode}</td>
                                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 700 }}>₱{p.price.toLocaleString()}</td>
                                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 700, color: p.stock === 0 ? '#EF4444' : '#10B981' }}>
                                                {p.stock}
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '12px' }}>
                                                <span style={{ background: p.active ? '#ECFDF5' : '#FEF2F2', color: p.active ? '#059669' : '#EF4444', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '10px' }}>
                                                    {p.active ? '✓ Active' : '✕ Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '12px' }}>
                                                <button onClick={() => setEditingProduct(p)} style={{ ...btn, background: '#667eea', color: 'white', marginRight: '4px' }}>Edit</button>
                                                <button onClick={() => toggleProductActive(p.id)} style={{ ...btn, background: p.active ? '#EF4444' : '#10B981', color: 'white' }}>
                                                    {p.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Edit Product Modal */}
                    {editingProduct && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
                                <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>Edit Product</h5>
                                <input type="text" placeholder="Product Name" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={inp} />
                                <input type="text" placeholder="Barcode" value={editingProduct.barcode} onChange={e => setEditingProduct({ ...editingProduct, barcode: e.target.value })} style={inp} disabled />
                                <input type="number" placeholder="Price" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} style={inp} />
                                <input type="number" placeholder="Stock" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} style={inp} />
                                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setEditingProduct(null)} style={btnSecondary}>Cancel</button>
                                    <button onClick={updateProduct} style={btnPrimary}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>)}

            {/* ─── LOGIN LOGS TAB ─── */}
            {activeTab === 'loginlogs' && (
                <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h5 style={{ fontWeight: 700, margin: 0 }}>Login History</h5>
                        <button
                            onClick={cleanupDuplicateLogins}
                            style={{ ...btnPrimary }}
                            onMouseEnter={e => e.currentTarget.style.background = '#764ba2'}
                            onMouseLeave={e => e.currentTarget.style.background = '#667eea'}>
                            🧹 Cleanup Duplicates
                        </button>
                    </div>

                    <div style={{ marginBottom: '16px', background: '#EEF2FF', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#4F46E5' }}>
                        <strong>Total login entries:</strong> {loginLogs.length} | <strong>Cleaned entries:</strong> {cleanedLoginLogs.length}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Username</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Date & Time</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginLogs.length > 0 ? loginLogs
                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                    .map((log, idx) => {
                                        const isDuplicate = !cleanedLoginLogs.includes(log);
                                        return (
                                            <tr key={log.id} style={{ borderBottom: '1px solid #E2E8F0', background: isDuplicate ? '#FEF2F2' : (idx % 2 === 0 ? '#FAFAFA' : 'white') }}>
                                                <td style={{ padding: '12px', fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>{log.actor}</td>
                                                <td style={{ padding: '12px', fontSize: '12px', color: '#64748B' }}>{log.actorName}</td>
                                                <td style={{ padding: '12px', fontSize: '12px', color: '#64748B' }}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        background: isDuplicate ? '#FEF2F2' : '#ECFDF5',
                                                        color: isDuplicate ? '#EF4444' : '#059669',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {isDuplicate ? '⚠️ Duplicate' : '✓ Valid'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                    : <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#CBD5E1' }}>No login logs</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;