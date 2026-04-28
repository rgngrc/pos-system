import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../App';
import ReceiptDisplay from '../components/ReceiptDisplay';

export default function Transactions() {
  const { user, transactions, setTransactions, lastReceipt, setLastReceipt, voidLog, postVoidRequests, setPostVoidRequests, setAuditLog } = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [viewTx, setViewTx] = useState(null);
  const [postVoidTx, setPostVoidTx] = useState(null);
  const [postVoidReason, setPostVoidReason] = useState('');

  const fmt = n => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = !search || tx.id.toString().includes(search) || tx.cashierName?.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || new Date(tx.timestamp).toDateString() === new Date(dateFilter).toDateString();
      return matchSearch && matchDate;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [transactions, search, dateFilter]);

  const totalRevenue = filtered.reduce((s, t) => s + t.total, 0);

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
      <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Transactions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>View and manage completed sales</p>
      </div>

      {/* Summary */}
      <div className="animate-fadeInUp delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Transactions', value: filtered.length, color: 'blue' },
          { label: 'Total Revenue', value: fmt(totalRevenue), color: 'green' },
          { label: 'Avg. Transaction', value: fmt(filtered.length ? totalRevenue / filtered.length : 0), color: 'amber' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: `var(--accent-${s.color})`, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="animate-fadeInUp delay-2 pos-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input className="pos-input" style={{ paddingLeft: 34 }} placeholder="Search by receipt # or cashier..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" className="pos-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          {(search || dateFilter) && (
            <button className="btn-pos-secondary" style={{ fontSize: 12 }} onClick={() => { setSearch(''); setDateFilter(''); }}>
              Clear Filters
            </button>
          )}
          {lastReceipt && (
            <button className="btn-pos-secondary" style={{ fontSize: 12 }} onClick={() => setViewTx(lastReceipt)}>
              🖨️ Reprint Last
            </button>
          )}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No transactions found
                  </td>
                </tr>
              ) : filtered.map(tx => (
                <tr key={tx.id}>
                  <td><span style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-green)', fontWeight: 700 }}>#{tx.id}</span></td>
                  <td style={{ fontSize: 12 }}>
                    <div style={{ color: 'var(--text-primary)' }}>{new Date(tx.timestamp).toLocaleDateString('en-PH')}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{new Date(tx.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{tx.cashierName}</td>
                  <td>{tx.items?.length || 0} items</td>
                  <td>{fmt(tx.subtotal || 0)}</td>
                  <td>
                    {tx.discount > 0
                      ? <span className="pos-badge badge-amber">{tx.discount}%</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(tx.total)}</span></td>
                  <td><span className="pos-badge badge-blue">{tx.paymentMethod}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setViewTx(tx)} className="btn-pos-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>View</button>
                      {user?.role === 'Cashier' && !postVoidRequests.find(r => r.transactionId === tx.id) && (
                        <button onClick={() => setPostVoidTx(tx)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 8, border: '1px solid rgba(255,77,143,0.3)', background: 'rgba(255,77,143,0.08)', color: 'var(--accent-pink)', cursor: 'pointer' }}>
                          Void
                        </button>
                      )}
                      {postVoidRequests.find(r => r.transactionId === tx.id) && (
                        <span className="pos-badge badge-amber" style={{ fontSize: 10 }}>
                          {postVoidRequests.find(r => r.transactionId === tx.id)?.status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt modal */}
      {viewTx && (
        <div className="modal-overlay" onClick={() => setViewTx(null)}>
          <div onClick={e => e.stopPropagation()}>
            <ReceiptDisplay tx={viewTx} onClose={() => setViewTx(null)} />
          </div>
        </div>
      )}

      {/* Post-void request modal */}
      {postVoidTx && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: 8 }}>Request Post-Void</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Submit a void request for <strong style={{ color: 'var(--accent-green)' }}>Receipt #{postVoidTx.id}</strong> ({fmt(postVoidTx.total)}).
              A supervisor will need to approve this.
            </p>
            <textarea
              className="pos-input"
              style={{ resize: 'vertical', minHeight: 80, fontFamily: 'var(--font-body)' }}
              placeholder="Enter reason for void request..."
              value={postVoidReason}
              onChange={e => setPostVoidReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => { setPostVoidTx(null); setPostVoidReason(''); }} className="btn-pos-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={handlePostVoid} disabled={!postVoidReason.trim()} className="btn-pos-danger" style={{ flex: 1, justifyContent: 'center', opacity: !postVoidReason.trim() ? 0.5 : 1 }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}