import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

function Transactions() {
    const { user, auditLog, setAuditLog } = useContext(AuthContext);
    const [refresh, setRefresh] = useState(false);

    // Filter out invalid/empty transactions
    const validLogs = auditLog.filter(log =>
        log && log.itemName && log.itemName !== 'N/A' && log.total > 0
    );

    const transactions = validLogs.map(log => ({
        id: log.id,
        total: log.total || log.amount || 0,
        type: log.type,
        status: log.status || 'Pending',
        actor: log.actor,
        actorName: log.actorName || 'Unknown',
        timestamp: log.timestamp,
        reason: log.reason || 'N/A',
        itemName: log.itemName || 'N/A',
        itemQty: log.itemQty || log.quantity || 1,
        approvedBy: log.approvedBy || '',
        approvedAt: log.approvedAt || '',
    }));

    const approveTransaction = (id) => {
        const updated = auditLog.map(log =>
            log.id === id
                ? {
                    ...log,
                    status: 'Approved',
                    approvedBy: user.username,
                    approvedAt: new Date().toLocaleString()
                }
                : log
        );
        setAuditLog(updated);
        setRefresh(!refresh);
    };

    const rejectTransaction = (id) => {
        const updated = auditLog.map(log =>
            log.id === id
                ? {
                    ...log,
                    status: 'Rejected',
                    rejectedBy: user.username,
                    rejectedAt: new Date().toLocaleString()
                }
                : log
        );
        setAuditLog(updated);
        setRefresh(!refresh);
    };

    const statusStyle = (status) => {
        const map = {
            Completed: { bg: '#ECFDF5', color: '#059669' },
            Pending: { bg: '#FFFBEB', color: '#D97706' },
            Approved: { bg: '#EEF2FF', color: '#4F46E5' },
            Rejected: { bg: '#FEF2F2', color: '#EF4444' },
            Canceled: { bg: '#FEF2F2', color: '#EF4444' },
            Logged: { bg: '#FFFBEB', color: '#D97706' },
        };
        return map[status] || { bg: '#F1F5F9', color: '#94A3B8' };
    };

    // Filter based on user role
    const isSupervisor = user?.role === 'Supervisor';
    const displayTransactions = isSupervisor
        ? transactions.filter(t =>
            // Show ALL transaction types for supervisor to review
            (t.type === 'Completed Sale' ||
                t.type === 'Void Item' ||
                t.type === 'Voided Item' ||
                t.type === 'Canceled Sale' ||
                t.type === 'Post-Void Request' ||
                t.type === 'Receipt Reprint') &&
            // Show all statuses (don't filter by status)
            (t.status === 'Pending' || t.status === 'Approved' || t.status === 'Rejected' || t.status === 'Completed')
        )
        : transactions;

    const totalCompleted = displayTransactions
        .filter(t => t.status === 'Completed' || t.status === 'Approved')
        .reduce((sum, t) => sum + t.total, 0);

    const totalPending = displayTransactions
        .filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + t.total, 0);

    const cardStyle = { background: 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' };

    if (!isSupervisor && user?.role !== 'Cashier') {
        return (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E', fontSize: '14px', fontWeight: 500, fontFamily: "'Segoe UI', sans-serif" }}>
                ⚠️ Only Cashiers and Supervisors can view transactions.
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 800, color: '#1E293B', fontSize: '22px' }}>
                    📋 Transactions {isSupervisor && <span style={{ fontSize: '14px', color: '#94A3B8' }}>(Supervisor Review)</span>}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>
                    {isSupervisor ? 'Review and approve/reject pending transactions' : 'View your transaction history'}
                </p>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Transactions', value: displayTransactions.length, icon: '🧾', bg: '#EEF2FF' },
                    { label: 'Completed/Approved', value: `₱${totalCompleted.toLocaleString()}`, icon: '✅', bg: '#ECFDF5' },
                    { label: isSupervisor ? 'Pending Approval' : 'Pending', value: `₱${totalPending.toLocaleString()}`, icon: '⏳', bg: '#FFFBEB' },
                ].map(c => (
                    <div className="col-md-4" key={c.label}>
                        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                                {c.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700 }}>{c.label}</div>
                                <div style={{ fontSize: '22px', fontWeight: 800 }}>{c.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, marginBottom: '16px' }}>Transaction History</h6>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cashier</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                {isSupervisor && <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {displayTransactions.length > 0 ? displayTransactions.map((t, idx) => {
                                const s = statusStyle(t.status);
                                const canApproveReject = isSupervisor && t.status === 'Pending' && (t.type === 'Void Item' || t.type === 'Canceled Sale' || t.type === 'Post-Void Request');

                                // Show action buttons for pending items OR show all completed/approved sales for review
                                const shouldShowRow = isSupervisor
                                    ? (t.status === 'Pending' && (t.type === 'Void Item' || t.type === 'Canceled Sale' || t.type === 'Post-Void Request')) ||
                                    (t.type === 'Completed Sale' && (t.status === 'Completed' || t.status === 'Approved')) ||
                                    ((t.type === 'Void Item' || t.type === 'Canceled Sale' || t.type === 'Post-Void Request') && (t.status === 'Approved' || t.status === 'Rejected'))
                                    : true;

                                if (!shouldShowRow) return null;

                                return (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FAFAFA' : 'white', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#FAFAFA' : 'white'}>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>#{t.id}</td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#64748B' }}>
                                            <span style={{ display: 'inline-block', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{t.type}</span>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>{t.itemName}</td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#64748B' }}>{t.itemQty}</td>
                                        <td style={{ padding: '12px', fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>₱{t.total.toLocaleString()}</td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>{t.actorName}</td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#64748B' }}>
                                            {t.timestamp ? new Date(t.timestamp).toLocaleString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#64748B', maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={t.reason}>
                                            {t.reason}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                background: s.bg,
                                                color: s.color,
                                                borderRadius: '8px',
                                                padding: '4px 10px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em'
                                            }}>
                                                {t.status}
                                            </span>
                                        </td>
                                        {isSupervisor && (
                                            <td style={{ padding: '12px' }}>
                                                {canApproveReject ? (
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => approveTransaction(t.id)}
                                                            style={{
                                                                background: '#10B981',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: 600,
                                                                fontSize: '10px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => rejectTransaction(t.id)}
                                                            style={{
                                                                background: '#EF4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: 600,
                                                                fontSize: '10px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic' }}>—</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={isSupervisor ? 10 : 9} style={{ textAlign: 'center', padding: '40px', color: '#CBD5E1' }}>
                                        🧾 {isSupervisor ? 'No pending transactions to review' : 'No transactions yet'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Supervisor Info Box */}
            {isSupervisor && (
                <div style={{
                    marginTop: '20px',
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #F3E8FF 100%)',
                    border: '1.5px solid #C7D2FE',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#4F46E5',
                    fontSize: '13px',
                    fontFamily: "'Segoe UI', sans-serif"
                }}>
                    <span style={{ fontSize: '20px' }}>ℹ️</span>
                    <div>
                        <strong>Supervisor Note:</strong> Review pending voided items, canceled sales, and post-void requests. Approved transactions update the system. Rejected items are logged for audit.
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;