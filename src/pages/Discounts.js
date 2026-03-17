import React, { useState } from 'react';

// ✅ UNCHANGED — core logic
const DISCOUNT_TYPES = [
    { type: 'Senior Citizen', rate: 0.20 },
    { type: 'PWD',            rate: 0.20 },
    { type: 'Athlete',        rate: 0.10 },
    { type: 'Solo Parent',    rate: 0.10 },
];

function Discounts() {
    // ✅ ALL STATE AND LOGIC — COMPLETELY UNCHANGED
    const [subtotal, setSubtotal]         = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [idNumber, setIdNumber]         = useState('');
    const [result, setResult]             = useState(null);
    const [error, setError]               = useState('');

    const applyDiscount = () => {
        if (!subtotal || isNaN(subtotal)) { setError('Please enter a valid subtotal.'); return; }
        if (!selectedType) { setError('Please select a discount type.'); return; }
        if (!idNumber.trim()) { setError('ID number is required.'); return; }
        const disc = DISCOUNT_TYPES.find(d => d.type === selectedType);
        const amt  = parseFloat(subtotal) * disc.rate;
        setResult({
            subtotal: parseFloat(subtotal),
            rate: disc.rate, amount: amt,
            final: parseFloat(subtotal) - amt,
            type: selectedType, id: idNumber,
        });
        setError('');
    };

    const maskId = (id) =>
        id.length > 4 ? '*'.repeat(id.length - 4) + id.slice(-4) : id;

    // UI helpers
    const cardStyle = {
        background: 'white', borderRadius: '20px', padding: '26px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9',
    };
    const inputStyle = {
        borderRadius: '12px', border: '2px solid #E2E8F0',
        padding: '12px 16px', fontSize: '14px', width: '100%',
        outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Segoe UI', sans-serif",
    };
    const labelStyle = {
        display: 'block', fontSize: '11px', fontWeight: 700,
        color: '#94A3B8', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: '7px',
    };
    const typeIcons = {
        'Senior Citizen': '👴',
        'PWD':            '♿',
        'Athlete':        '🏅',
        'Solo Parent':    '👨‍👧',
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 800, color: '#1E293B', margin: 0, fontSize: '22px' }}>
                    🏷️ Discount Application
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0' }}>
                    Apply government-mandated discounts with ID verification
                </p>
            </div>

            {/* Discount Type Pills — display only, no logic */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {DISCOUNT_TYPES.map(d => (
                    <div key={d.type} style={{
                        background: selectedType === d.type
                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                            : '#F8FAFC',
                        color: selectedType === d.type ? 'white' : '#64748B',
                        borderRadius: '10px', padding: '7px 16px',
                        fontSize: '12.5px', fontWeight: 600,
                        border: selectedType === d.type ? 'none' : '1.5px solid #E2E8F0',
                        transition: 'all 0.2s', cursor: 'default',
                        boxShadow: selectedType === d.type
                            ? '0 4px 14px rgba(102,126,234,0.35)' : 'none',
                    }}>
                        {typeIcons[d.type]} {d.type} — {d.rate * 100}%
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* LEFT — Form */}
                <div className="col-md-6">
                    <div style={cardStyle}>
                        <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '20px', fontSize: '14px' }}>
                            Apply Discount
                        </h6>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Subtotal Amount (₱)</label>
                            <input
                                type="number"
                                style={inputStyle}
                                placeholder="0.00"
                                value={subtotal}
                                onChange={e => setSubtotal(e.target.value)}
                                onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.12)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Discount Type</label>
                            <select
                                style={{ ...inputStyle, background: 'white', cursor: 'pointer' }}
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.12)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                            >
                                <option value="">Select discount type...</option>
                                {DISCOUNT_TYPES.map(d => (
                                    <option key={d.type} value={d.type}>
                                        {typeIcons[d.type]} {d.type} ({d.rate * 100}% off)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>ID / Card Number</label>
                            <input
                                style={inputStyle}
                                placeholder="Enter valid ID number"
                                value={idNumber}
                                onChange={e => setIdNumber(e.target.value)}
                                onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.12)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                            />
                            <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '6px 0 0', paddingLeft: '2px' }}>
                                🔒 Last 4 digits will be shown on receipt
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                background: '#FEF2F2', border: '1.5px solid #FECACA',
                                borderRadius: '12px', padding: '12px 16px',
                                color: '#DC2626', fontSize: '13px', marginBottom: '16px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            onClick={applyDiscount}
                            style={{
                                width: '100%', padding: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none', borderRadius: '14px',
                                color: 'white', fontWeight: 700, fontSize: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(102,126,234,0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)'; }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            🏷️ Apply Discount
                        </button>
                    </div>
                </div>

                {/* RIGHT — Receipt */}
                <div className="col-md-6">
                    <div style={cardStyle}>
                        <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '20px', fontSize: '14px' }}>
                            🧾 Receipt Preview
                        </h6>

                        {result ? (
                            <div style={{
                                background: 'linear-gradient(160deg, #FAFAFA 0%, #F1F5F9 100%)',
                                borderRadius: '16px', padding: '24px',
                                border: '1.5px dashed #CBD5E1',
                                fontFamily: "'Courier New', monospace",
                            }}>
                                {/* Receipt Header */}
                                <div style={{ textAlign: 'center', marginBottom: '18px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '14px' }}>
                                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛍️</div>
                                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E293B', letterSpacing: '0.05em' }}>
                                        SariPh Retail Store
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>
                                        Official Discount Receipt
                                    </div>
                                </div>

                                {/* Discount badge */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    borderRadius: '10px', padding: '8px 16px',
                                    textAlign: 'center', marginBottom: '16px',
                                    color: 'white', fontSize: '12.5px', fontWeight: 700,
                                }}>
                                    {typeIcons[result.type]} {result.type} Discount — {result.rate * 100}% OFF
                                </div>

                                {/* Line items */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#374151' }}>
                                    <span>Subtotal</span>
                                    <span style={{ fontWeight: 600 }}>₱{result.subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', color: '#EF4444' }}>
                                    <span>Discount ({result.type})</span>
                                    <span style={{ fontWeight: 600 }}>-₱{result.amount.toFixed(2)}</span>
                                </div>

                                <div style={{ borderTop: '1.5px dashed #CBD5E1', paddingTop: '14px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 800, color: '#1E293B' }}>
                                        <span>TOTAL</span>
                                        <span style={{ color: '#059669' }}>₱{result.final.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Savings callout */}
                                <div style={{
                                    background: '#F0FDF4', border: '1.5px solid #BBF7D0',
                                    borderRadius: '10px', padding: '10px 14px',
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: '14px', fontSize: '12.5px',
                                }}>
                                    <span style={{ color: '#15803D', fontWeight: 600 }}>💚 You saved</span>
                                    <span style={{ color: '#15803D', fontWeight: 800, fontSize: '14px' }}>
                                        ₱{result.amount.toFixed(2)}
                                    </span>
                                </div>

                                {/* ID row */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    fontSize: '11.5px', color: '#94A3B8',
                                    borderTop: '1px dashed #E2E8F0', paddingTop: '12px',
                                }}>
                                    <span>🔐 ID on file</span>
                                    <span style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                                        {maskId(result.id)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: '#F8FAFC', borderRadius: '16px',
                                padding: '52px 24px', textAlign: 'center',
                                border: '1.5px dashed #E2E8F0',
                            }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>🧾</div>
                                <p style={{ color: '#CBD5E1', fontSize: '13.5px', margin: 0, fontWeight: 500 }}>
                                    Fill in the form and apply a discount to see the receipt preview
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Discounts;