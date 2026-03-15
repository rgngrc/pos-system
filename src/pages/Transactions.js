import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

const SAMPLE_TRANSACTIONS = [
    { id: 'TXN-001', date: '2026-03-15 09:12', cashier: 'Juan dela Cruz', total: 250, status: 'Completed', items: [{ name: 'Rice (5kg)', qty: 1, price: 250 }] },
    { id: 'TXN-002', date: '2026-03-15 10:30', cashier: 'Juan dela Cruz', total: 185, status: 'Completed', items: [{ name: 'Cooking Oil', qty: 1, price: 85 }, { name: 'Sugar', qty: 1, price: 100 }] },
    { id: 'TXN-003', date: '2026-03-15 11:05', cashier: 'Juan dela Cruz', total: 0, status: 'Cancelled', items: [] },
    { id: 'TXN-004', date: '2026-03-15 13:22', cashier: 'Juan dela Cruz', total: 400, status: 'Void Requested', items: [{ name: 'Rice (5kg)', qty: 1, price: 250 }, { name: 'Sugar', qty: 2, price: 75 }] },
];

function Transactions() {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');
    const [reprint, setReprint] = useState(null);

    const filtered = filter === 'All' ? transactions : transactions.filter(t => t.status === filter);

    const approveVoid = (id) => {
        setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'Voided' } : t));
        setSelected(null);
    };

    const statusColor = {
        'Completed': s.badgeGreen,
        'Cancelled': s.badgeGray,
        'Void Requested': s.badgeAmber,
        'Voided': s.badgeRed,
    };

    return (
        <div>
            <h1 style={s.h1}>Transaction Log</h1>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['All', 'Completed', 'Cancelled', 'Void Requested', 'Voided'].map(f => (
                    <button key={f}
                        style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '13px', background: filter === f ? '#1b263b' : 'white', color: filter === f ? 'white' : '#4a5568' }}
                        onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>

            <div style={s.card}>
                <table style={s.table}>
                    <thead><tr>
                        {['ID', 'Date', 'Cashier', 'Total', 'Status', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {filtered.map(t => (
                            <tr key={t.id}>
                                <td style={s.td}>{t.id}</td>
                                <td style={s.td}>{t.date}</td>
                                <td style={s.td}>{t.cashier}</td>
                                <td style={s.td}>₱{t.total.toFixed(2)}</td>
                                <td style={s.td}><span style={statusColor[t.status]}>{t.status}</span></td>
                                <td style={s.td}>
                                    {t.status === 'Completed' && (
                                        <>
                                            <button style={s.btnSm} onClick={() => setReprint(t)}>Reprint</button>
                                            {user?.role === 'Cashier' && <button style={{ ...s.btnSm, background: '#fee2e2', color: '#991b1b', marginLeft: '6px' }} onClick={() => setSelected(t)}>Request Void</button>}
                                        </>
                                    )}
                                    {t.status === 'Void Requested' && user?.role === 'Supervisor' && (
                                        <button style={{ ...s.btnSm, background: '#dcfce7', color: '#166534' }} onClick={() => approveVoid(t.id)}>Approve Void</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {reprint && (
                <div style={{ minHeight: '400px', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', borderRadius: '12px' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '320px', fontFamily: 'monospace' }}>
                        <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '16px', color: '#E24B4A' }}>** REPRINT **</div>
                        <div style={{ textAlign: 'center', fontWeight: '700', marginBottom: '16px', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>RetailPOS System</div>
                        <div style={{ fontSize: '12px', marginBottom: '12px', color: '#4a5568' }}>{reprint.id} | {reprint.date}</div>
                        {reprint.items.map(i => (
                            <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                                <span>{i.name} x{i.qty}</span><span>₱{(i.price * i.qty).toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px dashed #ccc', marginTop: '10px', paddingTop: '10px' }}>
                            <span>TOTAL</span><span>₱{reprint.total.toFixed(2)}</span>
                        </div>
                        <button style={{ ...s.btnSm, marginTop: '16px', width: '100%' }} onClick={() => setReprint(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const s = {
    h1: { fontSize: '24px', fontWeight: '700', marginBottom: '24px' },
    card: { background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px 14px', background: '#f8fafc', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#4a5568', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '10px 14px', fontSize: '14px', borderBottom: '1px solid #f0f4f8' },
    btnSm: { padding: '4px 12px', background: '#f0f4f8', color: '#1b263b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    badgeGreen: { background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    badgeGray: { background: '#f1f5f9', color: '#64748b', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    badgeAmber: { background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    badgeRed: { background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
};

export default Transactions;