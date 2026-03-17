import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

const DISCOUNT_TYPES = [
    { type: 'Senior Citizen', rate: 0.20 },
    { type: 'PWD', rate: 0.20 },
    { type: 'Athlete', rate: 0.10 },
    { type: 'Solo Parent', rate: 0.10 },
];

function Sales() {
    const { products } = useContext(AuthContext);

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [message, setMessage] = useState('');

    const [discount, setDiscount] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [error, setError] = useState('');

    const [receipt, setReceipt] = useState(null);
    const [isReprint, setIsReprint] = useState(false);

    const [voidLogs, setVoidLogs] = useState([]);
    const [cancelLogs, setCancelLogs] = useState([]);
    const [reprintLogs, setReprintLogs] = useState([]);

    const results = products
        .filter(p => p.active)
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.barcode === search
        );

    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            setCart(cart.map(i =>
                i.id === product.id ? { ...i, qty: i.qty + 1 } : i
            ));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setSearch('');
    };

    const removeItem = (id) => {
        const reason = prompt("Reason for void:");
        if (!reason) return;

        setVoidLogs([...voidLogs, {
            itemId: id,
            reason,
            time: new Date().toLocaleString()
        }]);

        setCart(cart.filter(i => i.id !== id));
    };

    const cancelSale = () => {
        if (!window.confirm("Cancel sale?")) return;

        setCancelLogs([...cancelLogs, {
            time: new Date().toLocaleString(),
            itemCount: cart.length
        }]);

        setCart([]);
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
    };

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discountAmount = discount ? subtotal * discount.rate : 0;
    const finalTotal = subtotal - discountAmount;

    const applyDiscount = () => {
        if (discount) {
            setError("Only one discount allowed");
            return;
        }
        if (!selectedType) {
            setError('Select discount type');
            return;
        }
        if (!idNumber.trim()) {
            setError('ID required');
            return;
        }

        const disc = DISCOUNT_TYPES.find(d => d.type === selectedType);

        setDiscount({
            type: selectedType,
            rate: disc.rate,
            id: idNumber
        });

        setError('');
    };

    const removeDiscount = () => {
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
    };

    const completeSale = () => {
        if (cart.length === 0) return;

        const newReceipt = {
            items: cart,
            subtotal,
            discountAmount,
            finalTotal,
            discountType: discount?.type || null,
            discountId: discount?.id || null,
            date: new Date().toLocaleString()
        };

        localStorage.setItem("lastReceipt", JSON.stringify(newReceipt));

        setReceipt(newReceipt);
        setIsReprint(false);

        setMessage(`Sale complete! ₱${finalTotal.toFixed(2)}`);

        setCart([]);
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
    };

    const reprintReceipt = () => {
        const saved = localStorage.getItem("lastReceipt");
        if (!saved) {
            alert("No receipt found");
            return;
        }

        const parsed = JSON.parse(saved);

        setReprintLogs([...reprintLogs, {
            time: new Date().toLocaleString()
        }]);

        setReceipt(parsed);
        setIsReprint(true);
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

    const buttonDanger = {
        padding: '6px 10px',
        borderRadius: '8px',
        border: 'none',
        background: '#EF4444',
        color: 'white',
        cursor: 'pointer'
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <h3 style={{ fontWeight: 800, marginBottom: '15px' }}>🛒 New Sale</h3>

            <div className="row g-3">

                <div className="col-md-8">

                    <div style={{ ...cardStyle, marginBottom: '16px' }}>
                        <h6>🔍 Product Search</h6>
                        <input
                            style={inputStyle}
                            placeholder="Search product..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />

                        {search && results.map(p => (
                            <div key={p.id} onClick={() => addToCart(p)} style={{
                                padding: '10px',
                                borderRadius: '10px',
                                background: '#F8FAFC',
                                marginTop: '5px',
                                cursor: 'pointer'
                            }}>
                                {p.name} — ₱{p.price}
                            </div>
                        ))}
                    </div>

                    <div style={cardStyle}>
                        <h6>🛒 Cart</h6>

                        {cart.length === 0 ? (
                            <p>Cart is empty</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                }}>
                                    <span>{item.name} x{item.qty}</span>
                                    <span>₱{item.price * item.qty}</span>
                                    <button style={buttonDanger} onClick={() => removeItem(item.id)}>Void</button>
                                </div>
                            ))
                        )}

                        <button style={buttonPrimary} onClick={cancelSale}>
                            Cancel Sale
                        </button>
                    </div>
                </div>

                <div className="col-md-4">

                    <div style={{ ...cardStyle, marginBottom: '16px' }}>
                        <h6>💳 Order Summary</h6>
                        <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
                        <p style={{ color: '#EF4444' }}>Discount: -₱{discountAmount.toFixed(2)}</p>
                        <h4>Total: ₱{finalTotal.toFixed(2)}</h4>
                    </div>

                    <div style={{ ...cardStyle, marginBottom: '16px' }}>
                        <h6>🏷️ Apply Discount</h6>

                        <select style={inputStyle} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
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

                        <button style={buttonPrimary} onClick={applyDiscount}>Apply Discount</button>
                        <button style={buttonDanger} onClick={removeDiscount}>Remove</button>

                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        {discount && (
                            <p style={{ color: 'green' }}>
                                {discount.type} applied (ID: {maskId(discount.id)})
                            </p>
                        )}
                    </div>

                    <div style={cardStyle}>
                        <button style={buttonPrimary} onClick={completeSale} disabled={cart.length === 0}>
                            Complete Sale
                        </button>

                        <button style={buttonPrimary} onClick={reprintReceipt}>
                            Reprint Receipt
                        </button>

                        {message && <p>{message}</p>}
                    </div>

                    {receipt && (
                        <div style={{ ...cardStyle, marginTop: '20px' }}>
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
                                    <div style={{ fontSize: '11px' }}>{receipt.date}</div>
                                </div>

                                {receipt.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.name} x{item.qty}</span>
                                        <span>₱{(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}

                                <hr />

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Subtotal</span>
                                    <span>₱{receipt.subtotal.toFixed(2)}</span>
                                </div>

                                {receipt.discountType && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#EF4444' }}>
                                            <span>{receipt.discountType}</span>
                                            <span>-₱{receipt.discountAmount.toFixed(2)}</span>
                                        </div>

                                        <div style={{ fontSize: '12px', textAlign: 'right' }}>
                                            ID: {maskId(receipt.discountId)}
                                        </div>
                                    </>
                                )}

                                <hr />

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>TOTAL</span>
                                    <span>₱{receipt.finalTotal.toFixed(2)}</span>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Sales;