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
            setError('Please enter a valid subtotal.');
            return;
        }
        if (!selectedType) {
            setError('Please select a discount type.');
            return;
        }
        if (!idNumber.trim()) {
            setError('ID number is required.');
            return;
        }

        const disc = DISCOUNT_TYPES.find(d => d.type === selectedType);
        const amt = parseFloat(subtotal) * disc.rate;

        setResult({
            subtotal: parseFloat(subtotal),
            rate: disc.rate,
            amount: amt,
            final: parseFloat(subtotal) - amt,
            type: selectedType,
            id: idNumber
        });

        setError('');
    };

    const maskId = (id) =>
        id.length > 4 ? '*'.repeat(id.length - 4) + id.slice(-4) : id;

    return (
        <div>
            <h3 className="mb-3">Discount Application</h3>

            <div className="row">
                {/* LEFT SIDE */}
                <div className="col-md-6">
                    <div className="card p-3">
                        <h5>Apply Discount</h5>

                        <input
                            type="number"
                            className="form-control mb-2"
                            placeholder="Subtotal (₱)"
                            value={subtotal}
                            onChange={e => setSubtotal(e.target.value)}
                        />

                        <select
                            className="form-select mb-2"
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                        >
                            <option value="">Select Discount</option>
                            {DISCOUNT_TYPES.map(d => (
                                <option key={d.type} value={d.type}>
                                    {d.type} ({d.rate * 100}%)
                                </option>
                            ))}
                        </select>

                        <input
                            className="form-control"
                            placeholder="ID Number"
                            value={idNumber}
                            onChange={e => setIdNumber(e.target.value)}
                        />

                        {error && <div className="alert alert-danger mt-2">{error}</div>}

                        <button className="btn btn-dark mt-2 w-100" onClick={applyDiscount}>
                            Apply Discount
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="col-md-6">
                    <div className="card p-3">
                        <h5>Receipt Preview</h5>

                        {result ? (
                            <div className="border p-3 bg-light">
                                <h6 className="text-center mb-3">RetailPOS System</h6>

                                <div className="d-flex justify-content-between">
                                    <span>Subtotal</span>
                                    <span>₱{result.subtotal.toFixed(2)}</span>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <span>Discount ({result.type})</span>
                                    <span>-₱{result.amount.toFixed(2)}</span>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total</span>
                                    <span>₱{result.final.toFixed(2)}</span>
                                </div>

                                <div className="d-flex justify-content-between mt-2">
                                    <span>ID</span>
                                    <span>{maskId(result.id)}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted">Receipt preview will appear here</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Discounts;