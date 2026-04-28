import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

const CATEGORIES = ['Staples', 'Condiments', 'Canned Goods', 'Instant Food', 'Beverages', 'Bakery', 'Snacks', 'Dairy', 'Personal Care', 'Other'];

export default function Products() {
  const { products, setProducts, productLog, setProductLog, auditLog, setAuditLog, user } = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', barcode: '', price: '', stock: '', category: 'Other', active: true });
  const [error, setError] = useState('');

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchCat = categoryFilter === 'All' || (p.category || 'Other') === categoryFilter;
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Active' ? p.active : !p.active);
    return matchSearch && matchCat && matchStatus;
  });

  const allCategories = ['All', ...new Set(products.map(p => p.category || 'Other'))];
  const fmt = n => `₱${parseFloat(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', barcode: '', price: '', stock: '', category: 'Other', active: true });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, barcode: p.barcode, price: p.price, stock: p.stock, category: p.category || 'Other', active: p.active });
    setError('');
    setShowModal(true);
  };

  const handleSave = () => {
    setError('');
    if (!form.name.trim() || !form.barcode.trim() || form.price === '' || form.stock === '') {
      setError('All fields are required.'); return;
    }
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock);
    if (isNaN(price) || price < 0) { setError('Invalid price.'); return; }
    if (isNaN(stock) || stock < 0) { setError('Invalid stock.'); return; }

    const dupBarcode = products.find(p => p.barcode === form.barcode.trim() && p.id !== editProduct?.id);
    if (dupBarcode) { setError('Barcode already exists.'); return; }

    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...form, price, stock } : p));
      setProductLog(prev => [...prev, {
        id: Date.now(), action: 'Edit', productId: editProduct.id, productName: form.name,
        actor: user.username, actorName: user.name, timestamp: new Date().toISOString(),
        changes: `Price: ${fmt(editProduct.price)} → ${fmt(price)}, Stock: ${editProduct.stock} → ${stock}`,
      }]);
      setAuditLog(prev => [...prev, { id: Date.now(), type: 'Product Edit', status: 'Completed', actor: user.username, actorName: user.name, itemName: form.name, reason: 'Product updated', timestamp: new Date().toISOString() }]);
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      setProducts(prev => [...prev, { id: newId, ...form, price, stock }]);
      setProductLog(prev => [...prev, {
        id: Date.now(), action: 'Add', productId: newId, productName: form.name,
        actor: user.username, actorName: user.name, timestamp: new Date().toISOString(),
        changes: `Added at ${fmt(price)}, stock: ${stock}`,
      }]);
      setAuditLog(prev => [...prev, { id: Date.now(), type: 'Product Add', status: 'Completed', actor: user.username, actorName: user.name, itemName: form.name, reason: 'Product added', timestamp: new Date().toISOString() }]);
    }
    setShowModal(false);
  };

  const toggleActive = (p) => {
    setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, active: !pr.active } : pr));
    setAuditLog(prev => [...prev, {
      id: Date.now(), type: p.active ? 'Product Deactivate' : 'Product Activate',
      status: 'Completed', actor: user.username, actorName: user.name,
      itemName: p.name, reason: p.active ? 'Product deactivated' : 'Product activated',
      timestamp: new Date().toISOString(),
    }]);
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="animate-fadeInUp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{products.length} products · {products.filter(p => p.active).length} active</p>
        </div>
        <button onClick={openAdd} className="btn-pos-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="pos-card animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input className="pos-input" style={{ paddingLeft: 34 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="pos-input" style={{ width: 160 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="pos-input" style={{ width: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="pos-card animate-fadeInUp delay-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No products found</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{p.name}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)', padding: '2px 8px', borderRadius: 4 }}>
                      {p.barcode}
                    </span>
                  </td>
                  <td><span className="pos-badge badge-muted">{p.category || 'Other'}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(p.price)}</span></td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      color: p.stock === 0 ? 'var(--accent-pink)' : p.stock <= 5 ? 'var(--accent-amber)' : 'var(--accent-green)',
                    }}>
                      {p.stock}
                    </span>
                    {p.stock === 0 && <span className="pos-badge badge-pink" style={{ marginLeft: 6, fontSize: 10 }}>Out</span>}
                    {p.stock > 0 && p.stock <= 5 && <span className="pos-badge badge-amber" style={{ marginLeft: 6, fontSize: 10 }}>Low</span>}
                  </td>
                  <td>
                    {p.active
                      ? <span className="pos-badge badge-green"><span className="status-dot active" />Active</span>
                      : <span className="pos-badge badge-muted"><span className="status-dot inactive" />Inactive</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(p)} className="btn-pos-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>Edit</button>
                      <button onClick={() => toggleActive(p)} style={{
                        padding: '4px 10px', fontSize: 11, borderRadius: 8, border: '1px solid var(--border)',
                        background: 'transparent', color: p.active ? 'var(--accent-amber)' : 'var(--accent-green)',
                        cursor: 'pointer',
                      }}>
                        {p.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Product Name', key: 'name', placeholder: 'e.g. Rice (5kg)', type: 'text' },
                { label: 'Barcode', key: 'barcode', placeholder: 'e.g. 1001', type: 'text' },
                { label: 'Price (₱)', key: 'price', placeholder: '0.00', type: 'number' },
                { label: 'Stock', key: 'stock', placeholder: '0', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {f.label}
                  </label>
                  <input type={f.type} placeholder={f.placeholder} className="pos-input"
                    value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Category</label>
                <select className="pos-input" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active</label>
                <button
                  onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: form.active ? 'var(--accent-green)' : 'var(--bg-elevated)',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: form.active ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                  }} />
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
                {editProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}