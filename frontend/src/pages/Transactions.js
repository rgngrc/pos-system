import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';

// --- 1. RECEIPT COMPONENT (MATCHES YOUR SALES.JS DARK UI) ---
const ReceiptDisplay = ({ tx, onClose, fmt }) => {
  const items = useMemo(() => {
    if (!tx || !tx.items) return [];
    try {
      return typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items;
    } catch (e) { 
      console.error("Parsing error:", e);
      return []; 
    }
  }, [tx]);

  if (!tx) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(4px)', zIndex: 1000 }}>
      <div className="pos-card animate-scaleIn" style={{ width: 400, padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Receipt</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-pos-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>🖨️ Print</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>&times;</button>
          </div>
        </div>

        <div style={{ padding: '30px 40px' }}>
          {/* Logo Section */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 28, 
              color: 'var(--accent-green)', 
              margin: '0 0 8px 0',
              textTransform: 'uppercase'
            }}>POS System</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Your Local Store</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tel: (02) 1234-5678</p>
          </div>

          {/* Info Section */}
          <div style={{ display: 'grid', gap: 8, marginBottom: 25, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Receipt #</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>#{tx.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date</span>
              <span>{new Date(tx.created_at).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cashier</span>
              <span>{tx.user?.name || 'User'}</span>
            </div>
          </div>

          {/* Items List - Comprehensive Mapping for Names and Prices */}
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 20, marginBottom: 20 }}>
            {items.map((item, i) => {
              // Checks top-level and nested relationship names (Laravel standard)
              const itemName = item.name || item.product_name || item.item_name || item.product?.name || item.book?.title || "Unknown Item";
              const itemPrice = parseFloat(item.price || item.unit_price || item.amount || 0);
              const itemQty = parseInt(item.qty || item.quantity || 1);
              const itemTotal = itemPrice * itemQty;

              return (
                <div key={i} style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span style={{ textTransform: 'capitalize' }}>{itemName}</span>
                    <span>{fmt(itemTotal)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {itemQty} × {fmt(itemPrice)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 15, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 14 }}>
              <span>Subtotal</span>
              <span>{fmt(tx.subtotal)}</span>
            </div>
            {tx.discount_percentage > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-amber)', fontSize: 14 }}>
                <span>Discount ({tx.discount_percentage}%)</span>
                <span>-{fmt((tx.subtotal * tx.discount_percentage) / 100)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, textTransform: 'uppercase' }}>TOTAL</h2>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--accent-green)' }}>{fmt(tx.total)}</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}>
              <span>Payment ({tx.paymentMethod || tx.payment_method || 'Cash'})</span>
              <span>{fmt(tx.total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 40, borderTop: '1px dashed var(--border)', paddingTop: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 5px 0' }}>Thank you for your purchase!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>Please keep this receipt for reference</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. MAIN TRANSACTIONS PAGE ---
export default function Transactions() {
  const { 
    user, 
    transactions, 
    setTransactions, 
    lastReceipt, 
    postVoidRequests, 
    setPostVoidRequests, 
    setAuditLog 
  } = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [viewTx, setViewTx] = useState(null);
  const [postVoidTx, setPostVoidTx] = useState(null);
  const [postVoidReason, setPostVoidReason] = useState('');

  // Initial Fetch
  useEffect(() => {
    const fetchSales = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/sales?user_id=${user.id}`);
        setTransactions(response.data);
      } catch (error) {
        console.error("API Error:", error);
      }
    };
    fetchSales();
  }, [user?.id, setTransactions]);

  // Currency Formatter
  const fmt = n => `₱${(parseFloat(n) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  // List Processing
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const cashierName = tx.user?.name || '';
      const matchSearch = !search || tx.id.toString().includes(search) || cashierName.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || new Date(tx.created_at).toDateString() === new Date(dateFilter).toDateString();
      return matchSearch && matchDate;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [transactions, search, dateFilter]);

  const totalRevenue = filtered.reduce((s, t) => s + (parseFloat(t.total) || 0), 0);

  // Voiding Workflow
  const handlePostVoid = () => {
    if (!postVoidReason.trim()) return;
    const req = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      requestedBy: user.username,
      requestedByName: user.name,
      transactionId: postVoidTx.id,
      total: postVoidTx.total,
      reason: postVoidReason,
      status: 'Pending',
    };
    setPostVoidRequests(prev => [...prev, req]);
    setAuditLog(prev => [...prev, {
      id: Date.now(),
      type: 'PostVoid Request',
      status: 'Pending',
      actor: user.username,
      actorName: user.name,
      itemName: `Receipt #${postVoidTx.id}`,
      total: postVoidTx.total,
      reason: postVoidReason,
      timestamp: new Date().toISOString(),
    }]);
    setPostVoidTx(null);
    setPostVoidReason('');
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Page Header */}
      <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Transactions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>View and manage completed sales for your account</p>
      </div>

      {/* Summary Cards */}
      <div className="animate-fadeInUp delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Transactions', value: filtered.length, color: 'blue' },
          { label: 'Total Revenue', value: fmt(totalRevenue), color: 'green' },
          { label: 'Avg. Transaction', value: fmt(filtered.length ? totalRevenue / filtered.length : 0), color: 'amber' },
        ].map(s => (
          <div key={s.label} className="pos-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: `var(--accent-${s.color})`, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="animate-fadeInUp delay-2 pos-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
             <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input className="pos-input" style={{ paddingLeft: 34 }} placeholder="Search receipt # or cashier..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" className="pos-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          {lastReceipt && (
            <button className="btn-pos-secondary" style={{ fontSize: 12 }} onClick={() => setViewTx(lastReceipt)}>🖨️ Reprint Last</button>
          )}
        </div>
      </div>

      {/* Main Table - ALL original columns restored */}
      <div className="pos-card animate-fadeInUp delay-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pos-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date & Time</th>
                <th>Cashier</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => {
                let itemsCount = 0;
                try { itemsCount = (typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items)?.length || 0; } catch(e) {}
                return (
                  <tr key={tx.id}>
                    <td><span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>#{tx.id}</span></td>
                    <td style={{ fontSize: 11 }}>
                      <div>{new Date(tx.created_at).toLocaleDateString()}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td>{tx.user?.name || 'System'}</td>
                    <td>{itemsCount} items</td>
                    <td>{fmt(tx.subtotal)}</td>
                    <td>{tx.discount_percentage > 0 ? `${tx.discount_percentage}%` : '—'}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(tx.total)}</td>
                    <td><span className="pos-badge badge-blue">{tx.paymentMethod || 'Cash'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setViewTx(tx)} className="btn-pos-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>View</button>
                        {user?.role === 'Cashier' && !postVoidRequests.find(r => r.transactionId === tx.id) && (
                          <button onClick={() => setPostVoidTx(tx)} className="btn-pos-danger" style={{ padding: '4px 10px', fontSize: 11 }}>Void</button>
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

      {/* Modal Overlays */}
      {viewTx && <ReceiptDisplay tx={viewTx} onClose={() => setViewTx(null)} fmt={fmt} />}

      {postVoidTx && (
        <div className="modal-overlay" onClick={() => setPostVoidTx(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Request Post-Void</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 15 }}>Reason for voiding Receipt #{postVoidTx.id}</p>
            <textarea className="pos-input" style={{ width: '100%', minHeight: 100 }} placeholder="Explain why..." value={postVoidReason} onChange={e => setPostVoidReason(e.target.value)} />
            <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
              <button onClick={() => setPostVoidTx(null)} className="btn-pos-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handlePostVoid} disabled={!postVoidReason.trim()} className="btn-pos-danger" style={{ flex: 1 }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}