import React, { useContext } from 'react';
import { AuthContext } from '../App';

function Transactions() {
    const { auditLog } = useContext(AuthContext);

    // Map auditLog to transactions with status
    const transactions = auditLog.map(log => ({
        id: log.id,
        total: log.total || log.amount || 0,
        status: (log.type === 'Voided Item' || log.type === 'Canceled Sale') ? 'Voided' : 'Completed'
    }));

    // UI helper only
    const statusStyle = (status) => {
        const map = {
            Completed: { bg: '#ECFDF5', color: '#059669' },
            Voided: { bg: '#FEF2F2', color: '#EF4444' },
            Pending: { bg: '#FFFBEB', color: '#D97706' },
        };
        return map[status] || { bg: '#F1F5F9', color: '#94A3B8' };
    };

    const totalCompleted = transactions
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + t.total, 0);

    const totalVoided = transactions
        .filter(t => t.status === 'Voided')
        .reduce((sum, t) => sum + t.total, 0);

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 800, color: '#1E293B', margin: 0, fontSize: '22px' }}> 📋 Transactions </h3>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0' }}> View and monitor all sales transactions </p>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Transactions', value: transactions.length, icon: '🧾', bg: '#EEF2FF' },
                    { label: 'Completed Sales', value: `₱${totalCompleted.toLocaleString()}`, icon: '✅', bg: '#ECFDF5' },
                    { label: 'Voided Sales', value: `₱${totalVoided.toLocaleString()}`, icon: '❌', bg: '#FEF2F2' },
                ].map(c => (
                    <div className="col-md-4" key={c.label}>
                        <div style={{
                            background: 'white',
                            borderRadius: '18px',
                            padding: '20px 22px',
                            border: '1px solid #F1F5F9',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            <div style={{
                                width: '52px',
                                height: '52px',
                                background: c.bg,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                flexShrink: 0,
                            }}>
                                {c.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#94A3B8',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '4px'
                                }}>
                                    {c.label}
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B' }}>
                                    {c.value}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                border: '1px solid #F1F5F9',
            }}>
                <h6 style={{
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: '18px',
                    fontSize: '14px'
                }}>
                    Transaction History
                </h6>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '13.5px'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                                {['Transaction ID', 'Total Amount', 'Status'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 18px',
                                        textAlign: 'left',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#94A3B8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.07em',
                                        background: '#F8FAFC',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t, idx) => {
                                const s = statusStyle(t.status);
                                return (
                                    <tr key={t.id} style={{
                                        borderBottom: '1px solid #F1F5F9',
                                        background: idx % 2 === 0 ? 'white' : '#FAFAFA',
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#FAFAFA'}
                                    >
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{
                                                fontFamily: 'monospace',
                                                fontWeight: 700,
                                                color: '#4F46E5',
                                                background: '#EEF2FF',
                                                borderRadius: '8px',
                                                padding: '4px 12px',
                                                fontSize: '13px',
                                            }}>
                                                {t.id}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '14px 18px',
                                            fontWeight: 700,
                                            color: '#1E293B',
                                            fontSize: '15px'
                                        }}>
                                            ₱{t.total.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{
                                                background: s.bg,
                                                color: s.color,
                                                borderRadius: '8px',
                                                padding: '5px 14px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}>
                                                ● {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {transactions.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '52px',
                            color: '#CBD5E1'
                        }}>
                            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🧾</div>
                            <p style={{ fontSize: '14px', margin: 0 }}>No transactions recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Transactions;