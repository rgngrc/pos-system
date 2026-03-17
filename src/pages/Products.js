import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

function Products() {
  // ── UNCHANGED logic vars ───────────────────────────────────────────────────
  const { user, products, setProducts, productLog, setProductLog } = useContext(AuthContext);
  // NOTE: products now comes from App.js context (shared with Sales.js)

  const isAdmin = user?.role === 'Administrator';
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState({ name: '', barcode: '', price: '', stock: '' });
  const [error, setError]         = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({ name: '', barcode: '', price: '', stock: '' });

  // ── US1: product change log helper ────────────────────────────────────────
  const addProductLog = (action) => {
    setProductLog(prev => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        userId: user?.username || 'unknown',
        action,
      },
    ]);
  };

  // ── UNCHANGED filtered list ────────────────────────────────────────────────
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  );

  // ── UNCHANGED addProduct + US1 log ────────────────────────────────────────
  const addProduct = () => {
    if (!isAdmin) { setError('Only administrators can add products.'); return; }
    if (!form.name || !form.barcode || !form.price || !form.stock) { setError('All fields are required.'); return; }
    if (products.some(p => p.barcode === form.barcode)) { setError('Barcode must be unique.'); return; }
    const newProduct = { id: Date.now(), ...form, price: +form.price, stock: +form.stock, active: true };
    setProducts([...products, newProduct]);
    addProductLog(`Added product: "${newProduct.name}" (Barcode: ${newProduct.barcode}, Price: ₱${newProduct.price})`); // US1
    setForm({ name: '', barcode: '', price: '', stock: '' });
    setError('');
  };

  // ── UNCHANGED toggleActive + US1 log ──────────────────────────────────────
  const toggleActive = (id) => {
    if (!isAdmin) { setError('Only administrators can change product status.'); return; }
    const product = products.find(p => p.id === id);
    setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
    addProductLog(`${product.active ? 'Deactivated' : 'Activated'} product: "${product.name}"`); // US1
  };

  // ── UNCHANGED startEditing ────────────────────────────────────────────────
  const startEditing = (product) => {
    if (!isAdmin) return;
    setEditingId(product.id);
    setEditForm({ name: product.name, barcode: product.barcode, price: product.price, stock: product.stock });
    setError('');
  };

  // ── UNCHANGED saveEdit + US1 log ──────────────────────────────────────────
  const saveEdit = (id) => {
    if (!isAdmin) return;
    if (!editForm.name || !editForm.barcode || editForm.price === '' || editForm.stock === '') { setError('All fields are required to update product.'); return; }
    if (products.some(p => p.barcode === editForm.barcode && p.id !== id)) { setError('Barcode must be unique.'); return; }
    setProducts(products.map(p =>
      p.id === id
        ? { ...p, name: editForm.name, barcode: editForm.barcode, price: +editForm.price, stock: +editForm.stock }
        : p
    ));
    addProductLog(`Updated product ID ${id}: "${editForm.name}" — Price: ₱${editForm.price}, Stock: ${editForm.stock}`); // US1
    setEditingId(null);
    setError('');
  };

  const cancelEdit = () => { setEditingId(null); setError(''); };

  // ── UI helpers (display only) ──────────────────────────────────────────────
  const cardStyle = { background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9', marginBottom: '20px' };
  const inputStyle = { borderRadius: '10px', border: '2px solid #E2E8F0', padding: '10px 14px', fontSize: '13px', width: '100%', outline: 'none' };
  const btnBase = { padding: '7px 16px', borderRadius: '9px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 800, color: '#1E293B', margin: 0, fontSize: '22px' }}>📦 Product Management</h3>
        <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0' }}>Manage your store inventory — changes are logged automatically</p>
      </div>

      {/* Add Product Form */}
      {isAdmin ? (
        <div style={cardStyle}>
          <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '16px', fontSize: '14px' }}>➕ Add New Product</h6>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Name</label>
              <input style={inputStyle} className="form-control" placeholder="e.g. Rice 5kg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Barcode</label>
              <input style={inputStyle} className="form-control" placeholder="e.g. 1004" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Price (₱)</label>
              <input type="number" style={inputStyle} className="form-control" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Stock</label>
              <input type="number" style={inputStyle} className="form-control" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="col-md-3">
              <button onClick={addProduct} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(102,126,234,0.4)', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                + Add Product
              </button>
            </div>
          </div>
          {error && <div style={{ marginTop: '14px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '11px 16px', color: '#DC2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ {error}</div>}
        </div>
      ) : (
        <div style={{ ...cardStyle, background: '#EFF6FF', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <p style={{ margin: 0, color: '#1D4ED8', fontSize: '13.5px', fontWeight: 500 }}>Log in as Administrator to add or modify products.</p>
        </div>
      )}

      {/* Product Table */}
      <div style={cardStyle}>
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
          <input className="form-control" placeholder="Search by name or barcode..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '44px' }} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['Name', 'Barcode', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', background: '#F8FAFC' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', opacity: p.active ? 1 : 0.55, background: idx % 2 === 0 ? 'white' : '#FAFAFA' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 600, color: '#1E293B' }}>
                    {editingId === p.id ? <input style={inputStyle} className="form-control" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /> : p.name}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#6B7280', fontFamily: 'monospace', fontSize: '13px' }}>
                    {editingId === p.id ? <input style={inputStyle} className="form-control" value={editForm.barcode} onChange={e => setEditForm({ ...editForm, barcode: e.target.value })} /> : <span style={{ background: '#F1F5F9', borderRadius: '6px', padding: '3px 10px' }}>{p.barcode}</span>}
                  </td>
                  <td style={{ padding: '13px 16px', fontWeight: 700, color: '#059669' }}>
                    {editingId === p.id ? <input type="number" style={inputStyle} className="form-control" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} /> : `₱${p.price.toLocaleString()}`}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {editingId === p.id
                      ? <input type="number" style={inputStyle} className="form-control" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                      : p.stock === 0
                        ? <span style={{ background: '#FEF2F2', color: '#EF4444', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>Out of stock</span>
                        : <span style={{ background: '#F0FDF4', color: '#16A34A', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>{p.stock} units</span>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: p.active ? '#ECFDF5' : '#F1F5F9', color: p.active ? '#10B981' : '#94A3B8', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                      {p.active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {isAdmin ? (
                      editingId === p.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => saveEdit(p.id)} style={{ ...btnBase, background: '#10B981', color: 'white' }}>✓ Save</button>
                          <button onClick={cancelEdit} style={{ ...btnBase, background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => startEditing(p)} style={{ ...btnBase, background: '#EEF2FF', color: '#4F46E5' }}>✎ Edit</button>
                          <button onClick={() => toggleActive(p.id)} style={{ ...btnBase, background: p.active ? '#FEF2F2' : '#F0FDF4', color: p.active ? '#EF4444' : '#16A34A' }}>
                            {p.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )
                    ) : (
                      <span style={{ color: '#CBD5E1', fontSize: '12px', fontStyle: 'italic' }}>Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#CBD5E1' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '14px' }}>No products match your search</div>
            </div>
          )}
        </div>
      </div>

      {/* ── US1: Product Change Log ──────────────────────────────────────── */}
      <div style={cardStyle}>
        <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '16px', fontSize: '14px' }}>📝 Product Change Log</h6>
        {productLog.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', background: '#F8FAFC', borderRadius: '14px', color: '#CBD5E1', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            No product changes recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {productLog.slice().reverse().map(entry => (
              <div key={entry.id} style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px 16px', borderLeft: '3px solid #667eea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#4F46E5' }}>{entry.userId}</span>
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

export default Products;