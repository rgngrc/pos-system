import React, { useContext } from 'react';
import { AuthContext } from '../App';

function Dashboard() {
    const { user } = useContext(AuthContext);

    const cards = [
        { label: 'Sales Today',   value: '₱12,480', icon: '💰', accent: '#667eea', light: '#EEF2FF' },
        { label: 'Transactions',  value: '34',       icon: '🧾', accent: '#10B981', light: '#ECFDF5' },
        { label: 'Items Sold',    value: '128',      icon: '📦', accent: '#F59E0B', light: '#FFFBEB' },
    ];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '22px',
                padding: '30px 36px',
                marginBottom: '28px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(102,126,234,0.4)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', right: '-30px', top: '-30px',
                    width: '160px', height: '160px',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />
                <div>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.8 }}>
                        {greeting} 👋
                    </p>
                    <h2 style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.3px' }}>
                        {user?.name}
                    </h2>
                    <span style={{
                        display: 'inline-block',
                        background: 'rgba(255,255,255,0.18)',
                        borderRadius: '8px', padding: '4px 14px',
                        fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em',
                        border: '1px solid rgba(255,255,255,0.25)',
                    }}>
                        {user?.role}
                    </span>
                </div>
                <div style={{ fontSize: '64px', opacity: 0.7, userSelect: 'none' }}>🛍️</div>
            </div>

            {/* Stat Cards */}
            <div className="row">
                {cards.map(card => (
                    <div className="col-md-4 mb-3" key={card.label}>
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '24px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                                display: 'flex', alignItems: 'center', gap: '18px',
                                border: '1px solid #F1F5F9',
                                cursor: 'default',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.11)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)';
                            }}
                        >
                            <div style={{
                                width: '58px', height: '58px',
                                background: card.light,
                                borderRadius: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '28px', flexShrink: 0,
                            }}>
                                {card.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '11.5px', color: '#94A3B8', fontWeight: 600,
                                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px',
                                }}>
                                    {card.label}
                                </div>
                                <div style={{
                                    fontSize: '26px', fontWeight: 800,
                                    color: '#1E293B', letterSpacing: '-0.5px',
                                }}>
                                    {card.value}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Date Strip */}
            <div style={{
                marginTop: '8px',
                background: 'white',
                borderRadius: '16px',
                padding: '18px 24px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#64748B',
                fontSize: '13px',
            }}>
                <span style={{ fontSize: '18px' }}>📅</span>
                <span>
                    Today is <strong style={{ color: '#1E293B' }}>
                        {new Date().toLocaleDateString('en-PH', {
                            weekday: 'long', year: 'numeric',
                            month: 'long', day: 'numeric',
                        })}
                    </strong>
                </span>
            </div>
        </div>
    );
}

export default Dashboard;