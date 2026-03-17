import React, { useState } from 'react';

const DISCOUNT_TYPES = [
    { type: 'Senior Citizen', rate: 0.20 },
    { type: 'PWD', rate: 0.20 },
    { type: 'Athlete', rate: 0.10 },
    { type: 'Solo Parent', rate: 0.10 },
];

function Discounts() {
    const [subtotal, setSubtotal] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const applyDiscount = () => {
        if (!subtotal || isNaN(subtotal)) {
            setError('Enter valid subtotal');
            return;
        }
        if (!selectedType) {
            setError('Select discount');
            return;
        }
        if (!idNumber.trim()) {
            setError('ID required');
            return;
        }

        const disc = DISCOUNT_TYPES.find(d => d.type === selectedType);
        const amount = subtotal * disc.rate;

        setResult({
            subtotal: parseFloat(subtotal),
            amount,
            final: subtotal - amount,
            type: selectedType,
            id: idNumber,
            rate: disc.rate,
            date: new Date().toLocaleString()
        });

        setError('');
    };

    const maskId = (id) =>
        id && id.length > 4 ? '*'.repeat(id.length - 4) + id.slice(-4) : id;

    const cardStyle = {
        background: 'white',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #CBD5E1',
        marginBottom: '10px'
    };

    const buttonPrimary = {
        width: '100%',
        padding: '10px',
        borderRadius: '10px',
        border: 'none',
        background: '#6366F1',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '8px'
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <h3 style={{ fontWeight: 800, marginBottom: '15px' }}>🏷️ Discount</h3>

            <div className="row g-3">

                {/* LEFT FORM */}
                <div className="col-md-6">
                    <div style={cardStyle}>
                        <h6>Apply Discount</h6>

                        <input
                            type="number"
                            style={inputStyle}
                            placeholder="Subtotal"
                            value={subtotal}
                            onChange={e => setSubtotal(e.target.value)}
                        />

                        <select
                            style={inputStyle}
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                        >
                            <option value="">Select discount</option>
                            {DISCOUNT_TYPES.map(d => (
                                <option key={d.type} value={d.type}>
                                    {d.type} ({d.rate * 100}%)
                                </option>
                            ))}
                        </select>

                        <input
                            style={inputStyle}
                            placeholder="Enter ID number"
                            value={idNumber}
                            onChange={e => setIdNumber(e.target.value)}
                        />

                        <button style={buttonPrimary} onClick={applyDiscount}>
                            Apply Discount
                        </button>

                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </div>
                </div>

                {/* RIGHT RECEIPT */}
                <div className="col-md-6">
                    <div style={cardStyle}>
                        <h6>🧾 Receipt Preview</h6>

                        {result ? (
                            <div style={{
                                background: 'linear-gradient(160deg, #FAFAFA 0%, #F1F5F9 100%)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1.5px dashed #CBD5E1',
                                fontFamily: "'Courier New', monospace",
                            }}>

                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '18px',
                                    borderBottom: '1px dashed #CBD5E1',
                                    paddingBottom: '14px'
                                }}>
                                    <div style={{ fontSize: '22px' }}>🛍️</div>
                                    <div style={{ fontWeight: 800 }}>SariPh Retail Store</div>
                                    <div style={{ fontSize: '11px' }}>{result.date}</div>
                                </div>

                                <div style={{
                                    background: '#EEF2FF',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    textAlign: 'center',
                                    marginBottom: '12px',
                                    fontWeight: '600'
                                }}>
                                    {result.type} ({result.rate * 100}% OFF)
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Subtotal</span>
                                    <span>₱{result.subtotal.toFixed(2)}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: '#EF4444'
                                }}>
                                    <span>Discount</span>
                                    <span>-₱{result.amount.toFixed(2)}</span>
                                </div>

                                <hr />

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontWeight: 'bold'
                                }}>
                                    <span>TOTAL</span>
                                    <span>₱{result.final.toFixed(2)}</span>
                                </div>

                                <div style={{
                                    marginTop: '10px',
                                    fontSize: '12px',
                                    textAlign: 'right'
                                }}>
                                    ID: {maskId(result.id)}
                                </div>

                            </div>
                        ) : (
                            <p style={{ color: '#94A3B8' }}>
                                Fill form to see receipt
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Discounts;