import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';

const TYPE_COLORS = {
    'Completed Sale': { bg: '#ECFDF5', color: '#059669', dot: '#10B981' },
    'Void Item': { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' },
    'Canceled Sale': { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
    'Post-Void Request': { bg: '#EEF2FF', color: '#4F46E5', dot: '#6366F1' },
    'Receipt Reprint': { bg: '#F0F9FF', color: '#0284C7', dot: '#0EA5E9' },
};

const STATUS_COLORS = {
    Completed: { bg: '#ECFDF5', color: '#059669' },
    Pending: { bg: '#FFFBEB', color: '#D97706' },
    Approved: { bg: '#EEF2FF', color: '#4F46E5' },
    Rejected: { bg: '#FEF2F2', color: '#DC2626' },
    Logged: { bg: '#F1F5F9', color: '#64748B' },
};

const TRANSACTIONAL_TYPES = ['Completed Sale', 'Void Item', 'Canceled Sale', 'Post-Void Request', 'Receipt Reprint'];

function Transactions() {
    const { user, auditLog, setAuditLog, products, setProducts } = useContext(AuthContext);
    const isSupervisor = user?.role === 'Supervisor';

    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDate, setFilterDate] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // ─── Supervisor Actions ───────────────────────────────────────────────────

    const approvePostVoid = (entry) => {
        if (!window.confirm(`Approve post-void for "${entry.itemName}"?\nThis will restore inventory.`)) return;

        if (entry.originalReceipt?.items) {
            setProducts(prev => prev.map(p => {
                const item = entry.originalReceipt.items.find(i => i.id === p.id);
                return item ? { ...p, stock: p.stock + item.qty } : p;
            }));
        }

        setAuditLog(prev => prev.map(log =>
            log.id === entry.id
                ? { ...log, status: 'Approved', reviewedBy: user?.username, reviewedAt: new Date().toISOString() }
                : log
        ));
    };

    const rejectPostVoid = (entry) => {
        const rejectReason = prompt('Reason for rejection (optional):');
        setAuditLog(prev => prev.map(log =>
            log.id === entry.id
                ? { ...log, status: 'Rejected', reviewedBy: user?.username, reviewedAt: new Date().toISOString(), rejectReason: rejectReason?.trim() || null }
                : log
        ));
    };

    // ─── Filtering & Sorting ──────────────────────────────────────────────────

    const allTypes = ['All', ...TRANSACTIONAL_TYPES.filter(type => auditLog.some(l => l.type === type))];

    const filtered = auditLog
        .slice()
        .reverse()
        .filter(log => {
            if (!TRANSACTIONAL_TYPES.includes(log.type)) return false;
            if (filterType !== 'All' && log.type !== filterType) return false;
            if (filterStatus !== 'All' && log.status !== filterStatus) return false;
            if (filterDate) {
                const logDate = new Date(log.timestamp).toLocaleDateString();
                const selDate = new Date(filterDate).toLocaleDateString();
                if (logDate !== selDate) return false;
            }
            return true;
        });

    // ONLY Post-Void Requests go into the Action Queue
    const pendingRequests = auditLog.filter(l => l.type === 'Post-Void Request' && l.status === 'Pending');

    // Stats
    const transactionLogs = auditLog.filter(l => TRANSACTIONAL_TYPES.includes(l.type));
    const completedSales = auditLog.filter(l => l.type === 'Completed Sale');
    const totalRevenue = completedSales.reduce((sum, l) => sum + (l.total || 0), 0);
    const voidCount = auditLog.filter(l => l.type === 'Void Item').length;
    const cancelCount = auditLog.filter(l => l.type === 'Canceled Sale').length;

    // ─── Styles ───────────────────────────────────────────────────────────────

    const cardStyle = {
        background: 'white', borderRadius: '18px', padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', marginBottom: '16px',
    };
    const badgeStyle = (colors) => ({
        display: 'inline-block',
        background: colors.bg, color: colors.color,
        padding: '3px 10px', borderRadius: '8px',
        fontSize: '11px', fontWeight: 700,
    });
    const selStyle = {
        padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #E2E8F0',
        fontSize: '12px', outline: 'none', background: 'white', cursor: 'pointer',
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 800, color: '#1E293B', fontSize: '22px', margin: 0 }}>📋 Transactions</h3>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0' }}>
                    {isSupervisor ? 'Review approval requests and monitor transaction logs' : 'View your transaction history'}
                </p>
            </div>

            {/* Supervisor Action Queue: ONLY for Post-Voids */}
            {isSupervisor && pendingRequests.length > 0 && (
                <div style={{ ...cardStyle, border: '2px solid #C7D2FE', background: '#F5F3FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⏳</div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#3730A3', fontSize: '15px' }}>
                                Approval Requests ({pendingRequests.length})
                            </div>
                            <div style={{ color: '#6366F1', fontSize: '12px' }}>Sensitive actions requiring your authorization</div>
                        </div>
                    </div>

                    {pendingRequests.map(entry => (
                        <div key={entry.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '10px', border: '1px solid #DDD6FE' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '13.5px', marginBottom: '2px' }}>{entry.itemName}</div>
                                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                                        Requested by <strong>{entry.actorName || entry.actor}</strong>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 800, color: '#4F46E5', fontSize: '15px' }}>
                                    ₱{entry.total?.toLocaleString('en', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => approvePostVoid(entry)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>✓ Approve</button>
                                <button onClick={() => rejectPostVoid(entry)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>✕ Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="row g-3 mb-3">
                {[
                    { label: 'Total Logs', value: transactionLogs.length, icon: '🧾', bg: '#F8FAFC', color: '#1E293B' },
                    { label: 'Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: '💰', bg: '#F0FDF4', color: '#059669' },
                    { label: 'Voided Items', value: voidCount, icon: '🗑️', bg: '#FFFBEB', color: '#D97706' },
                    { label: 'Canceled Sales', value: cancelCount, icon: '✕', bg: '#FEF2F2', color: '#DC2626' },
                ].map(s => (
                    <div className="col-6 col-md-3" key={s.label}>
                        <div style={{ ...cardStyle, marginBottom: 0, background: s.bg, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '22px' }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>{s.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{ ...cardStyle, padding: '14px 18px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Filter:</span>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selStyle}>
                        {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={selStyle} />
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94A3B8' }}>
                        Showing {filtered.length} entries
                    </span>
                </div>
            </div>

            {/* Log Table */}
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, marginBottom: '16px', color: '#374151', fontSize: '14px' }}>📜 Audit & History</h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filtered.map(entry => {
                        const typeColor = TYPE_COLORS[entry.type] || { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' };
                        const statusColor = STATUS_COLORS[entry.status] || { bg: '#F1F5F9', color: '#94A3B8' };
                        const isExpanded = expandedId === entry.id;

                        return (
                            <div key={entry.id} style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColor.dot }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={badgeStyle(typeColor)}>{entry.type}</span>
                                            <span style={badgeStyle(statusColor)}>{entry.status}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                                            <strong>{entry.actorName || entry.actor}</strong> · {entry.itemName}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>₱{(entry.total || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid #E2E8F0', padding: '14px 16px', background: 'white', fontSize: '12.5px' }}>
                                        <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>AUDIT DETAILS</div>
                                        <div style={{ color: '#374151', lineHeight: '1.5' }}>
                                            {entry.reason ? `Reason: ${entry.reason}` : 'No reason provided.'}
                                            {entry.reviewedBy && <div style={{ marginTop: '4px', color: '#6366F1' }}>Approved by: {entry.reviewedBy}</div>}
                                            {entry.rejectReason && <div style={{ marginTop: '4px', color: '#EF4444' }}>Rejection Reason: {entry.rejectReason}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Transactions;