import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { AuthContext } from '../App';
import api from '../services/api';

// --- RECEIPT COMPONENT ---
const ReceiptDisplay = ({ tx, onClose, fmt }) => {
  const items = useMemo(() => {
    if (!tx || !tx.items) return [];
    try { return typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items; }
    catch (e) { return []; }
  }, [tx]);

  if (!tx) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(4px)', zIndex: 1000 }}>
      <div className="pos-card animate-scaleIn" style={{ width: 400, padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Receipt</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-pos-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>🖨️ Print</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>&times;</button>
          </div>
        </div>
        <div style={{ padding: '30px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent-green)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>POS System</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Your Local Store</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tel: (02) 1234-5678</p>
          </div>
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
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 20, marginBottom: 20 }}>
            {items.map((item, i) => {
              const itemName = item.name || item.product_name || item.product?.name || 'Unknown Item';
              const itemPrice = parseFloat(item.price || item.unit_price || 0);
              const itemQty = parseInt(item.qty || item.quantity || 1);
              return (
                <div key={i} style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{itemName}</span><span>{fmt(itemPrice * itemQty)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{itemQty} × {fmt(itemPrice)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 15, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 14 }}>
              <span>Subtotal</span><span>{fmt(tx.subtotal)}</span>
            </div>
            {tx.discount_percentage > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-amber)', fontSize: 14 }}>
                <span>Discount ({tx.discount_percentage}%)</span>
                <span>-{fmt((tx.subtotal * tx.discount_percentage) / 100)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>TOTAL</h2>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--accent-green)' }}>{fmt(tx.total)}</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}>
              <span>Payment ({tx.paymentMethod || 'Cash'})</span><span>{fmt(tx.total)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 40, borderTop: '1px dashed var(--border)', paddingTop: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 5px 0' }}>Thank you for your purchase!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>Please keep this receipt for reference</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- VOID STATUS BADGE ---
const VoidBadge = ({ status }) => {
  const styles = {
    Pending: { bg: 'rgba(251,191,36,0.15)', color: '#f59e0b', label: '⏳ Pending' },
    Approved: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '✕ Voided' },
    Rejected: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', label: '✗ Rejected' },
  };
  const s = styles[status];
  if (!s) return null;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

// --- MAIN TRANSACTIONS PAGE ---
export default function Transactions() {
  const { user, transactions, setTransactions, lastReceipt, setAuditLog } = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [viewTx, setViewTx] = useState(null);
  const [postVoidTx, setPostVoidTx] = useState(null);
  const [postVoidReason, setPostVoidReason] = useState('');
  const [voidRequests, setVoidRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'voidRequests'
  const [reviewingId, setReviewingId] = useState(null);

  const isSupervisorOrAdmin = user?.role === 'Supervisor' || user?.role === 'Administrator';

  const fetchData = useCallback(async () => {
    try {
      const [sales, voids] = await Promise.all([
        api.getSales(),
        api.getVoidRequests(),
      ]);
      setTransactions(sales);
      setVoidRequests(voids);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [setTransactions]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = n => `₱${(parseFloat(n) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  // Map sale_id -> void request for quick lookup
  const voidMap = useMemo(() => {
    const map = {};
    voidRequests.forEach(r => { map[r.sale_id] = r; });
    return map;
  }, [voidRequests]);

  const pendingVoids = useMemo(() => voidRequests.filter(r => r.status === 'Pending'), [voidRequests]);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const cashierName = tx.user?.name || '';
      const matchSearch = !search || tx.id.toString().includes(search) || cashierName.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || new Date(tx.created_at).toDateString() === new Date(dateFilter).toDateString();
      return matchSearch && matchDate;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [transactions, search, dateFilter]);

  const totalRevenue = filtered.reduce((s, t) => s + (parseFloat(t.total) || 0), 0);

  // Cashier submits void request
  const handlePostVoid = async () => {
    if (!postVoidReason.trim()) return;
    try {
      const saved = await api.createVoidRequest({
        sale_id: postVoidTx.id,
        requested_by: user.id,
        reason: postVoidReason,
      });
      setVoidRequests(prev => [...prev, saved]);
      setAuditLog(prev => [...prev, {
        id: Date.now(), type: 'PostVoid Request', status: 'Pending',
        actor: user.username, actorName: user.name,
        itemName: `Receipt #${postVoidTx.id}`,
        total: postVoidTx.total, reason: postVoidReason,
        timestamp: new Date().toISOString(),
      }]);
      setPostVoidTx(null);
      setPostVoidReason('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Supervisor approves or rejects
  const handleReview = async (voidRequestId, status) => {
    setReviewingId(voidRequestId);
    try {
      const updated = await api.reviewVoidRequest(voidRequestId, {
        status,
        reviewed_by: user.id,
      });
      setVoidRequests(prev => prev.map(r => r.id === voidRequestId ? updated : r));
      setAuditLog(prev => [...prev, {
        id: Date.now(), type: `PostVoid ${status}`, status,
        actor: user.username, actorName: user.name,
        itemName: `Receipt #${updated.sale_id}`,
        total: updated.sale?.total,
        reason: status === 'Approved' ? 'Supervisor approved void' : 'Supervisor rejected void',
        timestamp: new Date().toISOString(),
      }]);
      // Refresh sales to reflect voided status
      const sales = await api.getSales();
      setTransactions(sales);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
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
          <div key={s.label} className="pos-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: `var(--accent-${s.color})`, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs — supervisor/admin sees both tabs */}
      {isSupervisorOrAdmin && (
        <div className="animate-fadeInUp delay-2" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'transactions', label: 'All Transactions' },
            { key: 'voidRequests', label: `Void Requests${pendingVoids.length > 0 ? ` (${pendingVoids.length})` : ''}` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              borderColor: activeTab === tab.key ? 'var(--accent-green)' : 'var(--border)',
              background: activeTab === tab.key ? 'var(--accent-green-dim)' : 'transparent',
              color: activeTab === tab.key ? 'var(--accent-green)' : 'var(--text-muted)',
            }}>{tab.label}</button>
          ))}
        </div>
      )}

      {/* ── TAB: VOID REQUESTS (supervisor/admin only) ── */}
      {activeTab === 'voidRequests' && isSupervisorOrAdmin && (
        <div className="pos-card animate-fadeInUp" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Requested By</th>
                  <th>Reason</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {voidRequests.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>No void requests</td></tr>
                )}
                {voidRequests.map(r => (
                  <tr key={r.id}>
                    <td><span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>#{r.sale_id}</span></td>
                    <td>{r.requested_by_user?.name || r.requestedBy?.name || '—'}</td>
                    <td style={{ maxWidth: 200, fontSize: 12 }}>{r.reason}</td>
                    <td>{fmt(r.sale?.total)}</td>
                    <td style={{ fontSize: 11 }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td><VoidBadge status={r.status} /></td>
                    <td>
                      {r.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleReview(r.id, 'Approved')}
                            disabled={reviewingId === r.id}
                            className="btn-pos-primary"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                          >
                            {reviewingId === r.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReview(r.id, 'Rejected')}
                            disabled={reviewingId === r.id}
                            className="btn-pos-danger"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {r.status !== 'Pending' && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          by {r.reviewed_by_user?.name || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: TRANSACTIONS TABLE ── */}
      {activeTab === 'transactions' && (
        <>
          {/* Controls */}
          <div className="animate-fadeInUp delay-2 pos-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
                <input className="pos-input" style={{ paddingLeft: 34 }} placeholder="Search receipt # or cashier..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <input type="date" className="pos-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
              {lastReceipt && (
                <button className="btn-pos-secondary" style={{ fontSize: 12 }} onClick={() => setViewTx(lastReceipt)}>🖨️ Reprint Last</button>
              )}
            </div>
          </div>

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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx => {
                    let itemsCount = 0;
                    try { itemsCount = (typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items)?.length || 0; } catch (e) { }
                    const voidReq = voidMap[tx.id];
                    const isVoided = voidReq?.status === 'Approved';

                    return (
                      <tr key={tx.id} style={{ opacity: isVoided ? 0.6 : 1 }}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>#{tx.id}</span>
                            {/* ✅ Show void status badge inline */}
                            {voidReq && <VoidBadge status={voidReq.status} />}
                          </div>
                        </td>
                        <td style={{ fontSize: 11 }}>
                          <div>{new Date(tx.created_at).toLocaleDateString()}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td>{tx.user?.name || 'System'}</td>
                        <td>{itemsCount} items</td>
                        <td>{fmt(tx.subtotal)}</td>
                        <td>{tx.discount_percentage > 0 ? `${tx.discount_percentage}%` : '—'}</td>
                        <td style={{ fontWeight: 700, textDecoration: isVoided ? 'line-through' : 'none', color: isVoided ? 'var(--text-muted)' : 'inherit' }}>
                          {fmt(tx.total)}
                        </td>
                        <td><span className="pos-badge badge-blue">{tx.paymentMethod || 'Cash'}</span></td>
                        <td>
                          {/* ✅ Status column */}
                          {isVoided
                            ? <span className="pos-badge badge-muted">Voided</span>
                            : voidReq?.status === 'Pending'
                              ? <span className="pos-badge badge-amber">Void Pending</span>
                              : <span className="pos-badge badge-green">Completed</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setViewTx(tx)} className="btn-pos-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>View</button>
                            {/* ✅ Cashier: show Void button only if no existing void request */}
                            {user?.role === 'Cashier' && !voidReq && !isVoided && (
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
        </>
      )}

      {/* Modals */}
      {viewTx && <ReceiptDisplay tx={viewTx} onClose={() => setViewTx(null)} fmt={fmt} />}

      {postVoidTx && (
        <div className="modal-overlay" onClick={() => setPostVoidTx(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Request Post-Void</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 15 }}>
              Reason for voiding Receipt #{postVoidTx.id}
            </p>
            <textarea className="pos-input" style={{ width: '100%', minHeight: 100 }} placeholder="Explain why..." value={postVoidReason} onChange={e => setPostVoidReason(e.target.value)} />
            <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
              <button onClick={() => setPostVoidTx(null)} className="btn-pos-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handlePostVoid} disabled={!postVoidReason.trim()} className="btn-pos-danger" style={{ flex: 1 }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}