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
        if (!subtotal || isNaN(subtotal)) { setError('Please enter a valid subtotal.'); return; }
        if (!selectedType) { setError('Please select a discount type.'); return; }
        if (!idNumber.trim()) { setError('ID number is required to apply discount.'); return; }
        const disc = DISCOUNT_TYPES.find(d => d.type === selectedType);
        const amt = parseFloat(subtotal) * disc.rate;
        setResult({ subtotal: parseFloat(subtotal), rate: disc.rate, amount: amt, final: parseFloat(subtotal) - amt, type: selectedType, id: idNumber });
        setError('');
    };

    const maskId = (id) => id.length > 4 ? '*'.repeat(id.length - 4) + id.slice(-4) : id;

    return (
        <div>
            <h1 style={s.h1}>Discount Application</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                <div style={s.card}>
                    <h2 style={s.h2}>Apply Discount</h2>

                    <label style={s.label}>Subtotal (₱)</label>
                    <input type="number" style={s.input} placeholder="Enter subtotal"
                        value={subtotal} onChange={e => setSubtotal(e.target.value)} />

                    <label style={{ ...s.label, marginTop: '14px' }}>Discount Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        {DISCOUNT_TYPES.map(d => (
                            <div key={d.type}
                                style={{ ...s.discOption, ...(selectedType === d.type ? s.discSelected : {}) }}
                                onClick={() => setSelectedType(d.type)}>
                                <div style={{ fontWeight: '700', fontSize: '13px' }}>{d.type}</div>
                                <div style={{ fontSize: '12px', opacity: 0.75 }}>{d.rate * 100}% off</div>
                            </div>
                        ))}
                    </div>

                    <label style={s.label}>ID Number (required)</label>
                    <input style={s.input} placeholder="Scan or enter ID number"
                        value={idNumber} onChange={e => setIdNumber(e.target.value)} />

                    {error && <p style={s.error}>{error}</p>}
                    <button style={{ ...s.btn, marginTop: '14px' }} onClick={applyDiscount}>Apply Discount</button>
                </div>

                <div style={s.card}>
                    <h2 style={s.h2}>Receipt Preview</h2>
                    {result ? (
                        <div style={s.receipt}>
                            <div style={s.receiptTitle}>RetailPOS System</div>
                            {[
                                ['Subtotal', `₱${result.subtotal.toFixed(2)}`],
                                [`Discount (${result.type})`, `-₱${result.amount.toFixed(2)}`],
                            ].map(([l, v]) => (
                                <div key={l} style={s.receiptRow}><span>{l}</span><span>{v}</span></div>
                            ))}
                            <div style={s.receiptTotal}>
                                <span>TOTAL</span><span>₱{result.final.toFixed(2)}</span>
                            </div>
                            <div style={s.receiptRow}><span>ID No.</span><span>{maskId(result.id)}</span></div>
                        </div>
                    ) : (
                        <p style={{ color: '#aaa', fontSize: '14px' }}>Receipt preview will appear here</p>
                    )}
                </div>

            </div>
        </div>
    );
}

const s = {
    h1: { fontSize: '24px', fontWeight: '700', marginBottom: '24px' },
    h2: { fontSize: '16px', fontWeight: '700', marginBottom: '16px' },
    card: { background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px' },
    discOption: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' },
    discSelected: { border: '2px solid #1b263b', background: '#f0f4f8' },
    error: { color: '#E24B4A', fontSize: '13px', marginTop: '8px' },
    btn: { width: '100%', padding: '12px', background: '#1b263b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    receipt: { background: '#f8fafc', borderRadius: '8px', padding: '20px', fontFamily: 'monospace' },
    receiptTitle: { textAlign: 'center', fontWeight: '700', marginBottom: '16px', fontSize: '15px', borderBottom: '1px dashed #ccc', paddingBottom: '10px' },
    receiptRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px' },
    receiptTotal: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: '700', fontSize: '16px', borderTop: '1px dashed #ccc', marginTop: '8px' },
};

export default Discounts;