import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';

// --- LOCAL RECEIPT COMPONENT ---
// This handles the "View" modal since the file was missing
const ReceiptDisplay = ({ tx, onClose, fmt }) => {
  if (!tx) return null;

  return (
    <div className="pos-card" style={{ width: 320, padding: 24, background: '#fff', color: '#000', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Lokalance POS</h2>
        <p style={{ fontSize: 12, color: '#666' }}>Cabuyao City, Laguna</p>
      </div>

      <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: 12, marginBottom: 12, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Receipt #:</span>
          <span style={{ fontWeight: 700 }}>{tx.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{new Date(tx.created_at).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cashier:</span>
          <span>{tx.user?.name || 'System'}</span>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        {tx.items && JSON.parse(typeof tx.items === 'string' ? tx.items : JSON.stringify(tx.items)).map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span>{item.qty}x {item.name}</span>
            <span>{fmt(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: 12, fontSize: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>{fmt(tx.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-amber)' }}>
          <span>Discount ({tx.discount_percentage || 0}%)</span>
          <span>-{fmt((tx.subtotal * (tx.discount_percentage || 0)) / 100)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, marginTop: 8 }}>
          <span>TOTAL</span>
          <span>{fmt(tx.total)}</span>
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: '#666', borderTop: '1px dashed #ccc', paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Payment:</span>
          <span>{tx.paymentMethod}</span>
        </div>
      </div>

      <button className="btn-pos-secondary" onClick={onClose} style={{ width: '100%', marginTop: 24 }}>Close Receipt</button>
    </div>
  );
};

// --- MAIN TRANSACTIONS PAGE ---
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

  useEffect(() => {
    const fetchSales = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/sales?user_id=${user.id}`);
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchSales();
  }, [user?.id, setTransactions]);

  // Bulletproof Formatter
  const fmt = n => {
    const value = parseFloat(n) || 0;
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const cashierName = tx.user?.name || '';
      const matchSearch = !search || tx.id.toString().includes(search) || cashierName.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || new Date(tx.created_at).toDateString() === new Date(dateFilter).toDateString();
      return matchSearch && matchDate;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [transactions, search, dateFilter]);

  const totalRevenue = filtered.reduce((s, t) => s + (parseFloat(t.total) || 0), 0);

  const handlePostVoid = () => {
    if (!postVoidReason.trim()) return;
    const req = {
      id: Date.now(),
      transactionId: postVoidTx.id,
      total: postVoidTx.total,
      reason: postVoidReason,
      status: 'Pending',
    };
    setPostVoidRequests(prev => [...prev, req]);
    setPostVoidTx(null);
    setPostVoidReason('');
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Transactions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>View and manage completed sales</p>
      </div>

      {/* Summary Cards */}
      <div className="animate-fadeInUp delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Transactions', value: filtered.length, color: 'blue' },
          { label: 'Total Revenue', value: fmt(totalRevenue), color: 'green' },
          { label: 'Avg. Transaction', value: fmt(filtered.length ? totalRevenue / filtered.length : 0), color: 'amber' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: `var(--accent-${s.color})`, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters (UI Preserved) */}
      <div className="animate-fadeInUp delay-2 pos-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input className="pos-input" style={{ paddingLeft: 12 }} placeholder="Search by receipt # or cashier..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" className="pos-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
      </div>

      {/* Table */}
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
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td><span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>#{tx.id}</span></td>
                  <td style={{ fontSize: 12 }}>
                    <div>{new Date(tx.created_at).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td>{tx.user?.name || 'System'}</td>
                  <td>{tx.items?.length || 0} items</td>
                  <td>{fmt(tx.subtotal)}</td>
                  <td>{tx.discount_percentage > 0 ? `${tx.discount_percentage}%` : '—'}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(tx.total)}</td>
                  <td><span className="pos-badge badge-blue">{tx.paymentMethod}</span></td>
                  <td>
                    <button onClick={() => setViewTx(tx)} className="btn-pos-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>View</button>
                    {user?.role === 'Cashier' && (
                      <button onClick={() => setPostVoidTx(tx)} className="btn-pos-danger" style={{ padding: '4px 10px', fontSize: 11, marginLeft: 6 }}>Void</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {viewTx && (
        <div className="modal-overlay" onClick={() => setViewTx(null)}>
          <div onClick={e => e.stopPropagation()}>
            <ReceiptDisplay tx={viewTx} onClose={() => setViewTx(null)} fmt={fmt} />
          </div>
        </div>
      )}

      {postVoidTx && (
        <div className="modal-overlay" onClick={() => setPostVoidTx(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>Request Void</h3>
            <textarea className="pos-input" style={{ minHeight: 80 }} placeholder="Reason..." value={postVoidReason} onChange={e => setPostVoidReason(e.target.value)} />
            <button onClick={handlePostVoid} className="btn-pos-danger" style={{ width: '100%', marginTop: 12 }}>Submit Request</button>
          </div>
        </div>
      )}
    </div>
  );
}