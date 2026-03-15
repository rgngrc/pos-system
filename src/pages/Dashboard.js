import React, { useContext } from 'react';
import { AuthContext } from '../App';

function Dashboard() {
    const { user } = useContext(AuthContext);
    return (
        <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                Welcome, {user?.name}
            </h1>
            <p style={{ color: '#718096', marginBottom: '32px' }}>Role: {user?.role}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Sales Today', value: '₱12,480', color: '#1D9E75' },
                    { label: 'Transactions', value: '34', color: '#378ADD' },
                    { label: 'Items Sold', value: '128', color: '#7F77DD' },
                ].map(card => (
                    <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>{card.label}</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>{card.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Dashboard;