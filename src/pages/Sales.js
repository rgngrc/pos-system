import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import ReceiptDisplay from '../components/ReceiptDisplay';

const DISCOUNT_TYPES = [
    { type: 'Senior Citizen', rate: 0.20 },
    { type: 'PWD', rate: 0.20 },
    { type: 'Athlete', rate: 0.10 },
    { type: 'Solo Parent', rate: 0.10 },
];

function Sales() {
    const { user, products, setProducts, auditLog, setAuditLog } = useContext(AuthContext);
    const isCashier = user?.role === 'Cashier';

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [error, setError] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [isReprint, setIsReprint] = useState(false);
    const [showPostVoidModal, setShowPostVoidModal] = useState(false);
    const [postVoidReason, setPostVoidReason] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    if (!isCashier) {
        return (
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E', fontSize: '14px', fontWeight: 500 }}>
                Only Cashiers can process sales.
            </div>
        );
    }

    const activeProducts = products.filter(p => p.active);
    const results = activeProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode === search
    );

    const addToCart = (product) => {
        if (product.stock === 0) { setError('Product is out of stock'); return; }
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            if (existing.qty + 1 > product.stock) { setError(`Only ${product.stock} available in stock`); return; }
            setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setSearch('');
        setError('');
    };

    const updateQty = (id, delta) => {
        const item = cart.find(i => i.id === id);
        const product = products.find(p => p.id === id);
        if (!item || !product) return;
        const newQty = item.qty + delta;
        if (newQty > product.stock) { setError(`Only ${product.stock} available in stock`); return; }
        if (newQty < 1) return;
        setCart(cart.map(i => i.id === id ? { ...i, qty: newQty } : i));
        setError('');
    };

    const voidItem = (id) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        const reason = prompt(`Reason for voiding "${item.name}"?`);
        if (!reason || !reason.trim()) return;
        setAuditLog(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: 'Void Item',
            status: 'Pending',
            actor: user?.username,
            actorName: user?.name,
            itemName: item.name,
            itemQty: item.qty,
            total: item.price * item.qty,
            reason: reason.trim(),
            timestamp: new Date().toISOString(),
        }]);
        setCart(cart.filter(i => i.id !== id));
        alert(`"${item.name}" voided and logged.`);
    };

    const cancelSale = () => {
        if (cart.length === 0) { alert('No sale to cancel'); return; }
        if (!window.confirm('Cancel entire sale? This action will be logged.')) return;
        const itemSummary = cart.map(i => `${i.name} x${i.qty}`).join(', ');
        const saleTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
        setAuditLog(prev => [...prev, {
            id: Date.now(),
            type: 'Canceled Sale',
            status: 'Canceled',
            actor: user?.username,
            actorName: user?.name,
            itemName: itemSummary,
            itemQty: cart.reduce((sum, i) => sum + i.qty, 0),
            total: saleTotal,
            reason: 'Sale canceled before payment',
            timestamp: new Date().toISOString(),
        }]);
        setCart([]);
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
        setError('');
        alert('Sale canceled and logged.');
    };

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discountAmount = discount ? subtotal * discount.rate : 0;
    const finalTotal = subtotal - discountAmount;

    const applyDiscount = () => {
        if (!selectedType) { setError('Please select a discount type'); return; }
        if (!idNumber.trim()) { setError('Please enter or scan an ID number'); return; }
        const disc = DISCOUNT_TYPES.find(d => d.type === selectedType);
        setDiscount({ ...disc, id: idNumber });
        setError('');
        alert(`${selectedType} discount applied (${(disc.rate * 100).toFixed(0)}% off)`);
    };

    const removeDiscount = () => {
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
    };

    const openPaymentModal = () => {
        if (cart.length === 0) { alert('Cart is empty'); return; }
        setPaymentAmount('');
        setPaymentMethod('Cash');
        setShowPaymentModal(true);
        setError('');
    };

    const processPayment = () => {
        const amount = parseFloat(paymentAmount) || 0;
        if (amount <= 0) { setError('Please enter a valid amount'); return; }
        if (amount < finalTotal) {
            setError(`Insufficient payment. Total: P${finalTotal.toLocaleString()}, Received: P${amount.toLocaleString()}`);
            return;
        }
        setShowPaymentModal(false);
        completeSale(amount);
    };

    const completeSale = (paidAmount) => {
        const txId = Date.now();
        const change = paidAmount - finalTotal;
        const newReceipt = {
            txId,
            items: cart.map(i => ({ ...i })),
            subtotal,
            discountAmount,
            finalTotal,
            discountType: discount?.type || null,
            discountId: discount?.id || null,
            paidAmount,
            change,
            paymentMethod,
            cashier: user?.username,
            cashierName: user?.name,
            date: new Date().toLocaleString(),
        };
        cart.forEach(item => {
            setAuditLog(prev => [...prev, {
                id: Date.now() + Math.random(),
                type: 'Completed Sale',
                status: 'Completed',
                actor: user?.username,
                actorName: user?.name,
                itemName: item.name,
                itemQty: item.qty,
                total: item.price * item.qty,
                reason: 'Sale completed',
                timestamp: new Date().toISOString(),
            }]);
        });
        setProducts(prev => prev.map(p => {
            const inCart = cart.find(i => i.id === p.id);
            return inCart ? { ...p, stock: Math.max(0, p.stock - inCart.qty) } : p;
        }));
        localStorage.setItem('lastReceipt', JSON.stringify(newReceipt));
        setReceipt(newReceipt);
        setIsReprint(false);
        setCart([]);
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
        setPaymentAmount('');
        setPaymentMethod('Cash');
        setError('');
    };

    const openPostVoid = () => {
        if (!localStorage.getItem('lastReceipt')) { alert('No recent completed sale to post-void'); return; }
        setPostVoidReason('');
        setShowPostVoidModal(true);
    };

    const submitPostVoid = () => {
        if (!postVoidReason.trim()) { alert('Please enter a reason for post-void'); return; }
        const saved = JSON.parse(localStorage.getItem('lastReceipt'));
        const productNames = saved.items.map(i => i.name).join(', ');
        setAuditLog(prev => [...prev, {
            id: Date.now(),
            type: 'Post-Void Request',
            status: 'Pending',
            actor: user?.username,
            actorName: user?.name,
            itemName: productNames,
            itemQty: saved.items.length,
            total: saved.finalTotal,
            reason: postVoidReason.trim(),
            timestamp: new Date().toISOString(),
            originalReceipt: saved,
            transactionId: saved.txId,
        }]);
        setShowPostVoidModal(false);
        setPostVoidReason('');
        alert('Post-void request submitted for supervisor approval');
    };

    const reprintReceipt = () => {
        const saved = localStorage.getItem('lastReceipt');
        if (!saved) { alert('No receipt to reprint'); return; }
        const rec = JSON.parse(saved);
        setAuditLog(prev => [...prev, {
            id: Date.now(),
            type: 'Receipt Reprint',
            status: 'Completed',
            actor: user?.username,
            actorName: user?.name,
            itemName: `Transaction #${rec.txId}`,
            itemQty: rec.items.length,
            total: rec.finalTotal,
            reason: 'Receipt reprinted',
            timestamp: new Date().toISOString(),
        }]);
        setReceipt(rec);
        setIsReprint(true);
    };

    const maskId = (id) =>
        id && id.length > 4 ? '*'.repeat(id.length - 4) + id.slice(-4) : id;

    const card = { background: 'white', borderRadius: '18px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', marginBottom: '16px' };
    const inp = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none', marginBottom: '10px' };
    const btnPrimary = { width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' };
    const btnSecondary = { width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: 'white', color: '#1E293B', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' };
    const btnDanger = { width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' };

    if (receipt) {
        return (
            <ReceiptDisplay
                receipt={receipt}
                isReprint={isReprint}
                maskId={maskId}
                onNewSale={() => { setReceipt(null); setCart([]); }}
                onReprint={reprintReceipt}
            />
        );
    }

    return (
        <div className="row g-4">
            <div className="col-lg-7">
                <div style={card}>
                    <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>Search Products</h5>
                    <input type="text" placeholder="Search by name or scan barcode..." value={search} onChange={e => setSearch(e.target.value)} style={inp} autoFocus />
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {results.length > 0
                            ? results.map(p => (
                                <div key={p.id} onClick={() => addToCart(p)}
                                    style={{ background: p.stock === 0 ? '#FEF2F2' : '#F8FAFC', border: p.stock === 0 ? '1px solid #FECACA' : '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', marginBottom: '10px', cursor: p.stock === 0 ? 'not-allowed' : 'pointer', opacity: p.stock === 0 ? 0.6 : 1 }}
                                    onMouseEnter={e => p.stock > 0 && (e.currentTarget.style.background = '#EEF2FF')}
                                    onMouseLeave={e => e.currentTarget.style.background = p.stock === 0 ? '#FEF2F2' : '#F8FAFC'}>
                                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                                        <span>P{p.price.toLocaleString()}</span>
                                        <span style={{ color: p.stock === 0 ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}
                                        </span>
                                    </div>
                                </div>
                            ))
                            : search
                                ? <div style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>No products found</div>
                                : <div style={{ color: '#CBD5E1', textAlign: 'center', padding: '40px', fontStyle: 'italic' }}>Start typing to search products...</div>
                        }
                    </div>
                </div>
            </div>

            <div className="col-lg-5">
                <div style={card}>
                    <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>Cart ({cart.length})</h5>
                    {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 600 }}>{error}</div>}

                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', minHeight: '100px' }}>
                        {cart.length > 0
                            ? cart.map(item => (
                                <div key={item.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.name}</div>
                                        <button onClick={() => voidItem(item.id)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>Void</button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                        <div>
                                            <button onClick={() => updateQty(item.id, -1)} style={{ background: '#E2E8F0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>-</button>
                                            <span style={{ margin: '0 10px', fontWeight: 700 }}>{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} style={{ background: '#E2E8F0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>+</button>
                                        </div>
                                        <div style={{ fontWeight: 700 }}>P{(item.price * item.qty).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))
                            : <div style={{ color: '#CBD5E1', textAlign: 'center', padding: '40px 20px', fontStyle: 'italic' }}>Cart is empty.</div>
                        }
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        <h6 style={{ fontWeight: 700, marginBottom: '10px', fontSize: '12px' }}>Apply Discount</h6>
                        {discount ? (
                            <div style={{ background: '#ECFDF5', border: '1px solid #86EFAC', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>✓ {discount.type}</div>
                                <div style={{ color: '#64748B' }}>ID: {maskId(discount.id)}</div>
                                <button onClick={removeDiscount} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, marginTop: '8px', width: '100%' }}>Remove</button>
                            </div>
                        ) : (
                            <>
                                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ ...inp, marginBottom: '8px' }} disabled={cart.length === 0}>
                                    <option value="">Select discount type...</option>
                                    {DISCOUNT_TYPES.map(d => <option key={d.type} value={d.type}>{d.type} ({(d.rate * 100).toFixed(0)}%)</option>)}
                                </select>
                                <input type="text" placeholder="Enter or scan ID..." value={idNumber} onChange={e => setIdNumber(e.target.value)} style={{ ...inp, marginBottom: '8px' }} disabled={cart.length === 0} />
                                <button onClick={applyDiscount} style={{ ...btnPrimary, marginBottom: 0, opacity: cart.length === 0 ? 0.5 : 1 }} disabled={cart.length === 0}>Apply Discount</button>
                            </>
                        )}
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span>Subtotal:</span><span style={{ fontWeight: 700 }}>P{subtotal.toLocaleString()}</span>
                        </div>
                        {discount && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#10B981', fontWeight: 700 }}>
                                <span>Discount:</span><span>-P{discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#667eea', color: 'white', padding: '10px', borderRadius: '6px', fontWeight: 800, fontSize: '16px', marginTop: '8px' }}>
                            <span>TOTAL:</span><span>P{finalTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* ALWAYS VISIBLE BUTTONS */}
                    <button onClick={openPaymentModal} style={{ ...btnPrimary, opacity: cart.length === 0 ? 0.5 : 1 }} disabled={cart.length === 0}>Proceed to Payment</button>
                    <button onClick={openPostVoid} style={btnSecondary}>Request Post-Void</button>
                    <button onClick={cancelSale} style={{ ...btnDanger, opacity: cart.length === 0 ? 0.5 : 1 }} disabled={cart.length === 0}>Cancel Sale</button>
                </div>
            </div>

            {/* Modals remain same */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
                        <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>Payment</h5>
                        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: '#94A3B8' }}>Subtotal:</span><span style={{ fontWeight: 700 }}>P{subtotal.toLocaleString()}</span>
                            </div>
                            {discount && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#10B981' }}>
                                    <span>Discount:</span><span style={{ fontWeight: 700 }}>-P{discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                                <span>Total Amount:</span><span>P{finalTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 600 }}>{error}</div>}
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>Payment Method:</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '14px', fontSize: '12px', outline: 'none' }}>
                            <option value="Cash">Cash</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="GCash">GCash</option>
                        </select>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>Amount Received:</label>
                        <input type="number" placeholder="Enter amount..." value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '13px', outline: 'none' }} autoFocus />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => { setShowPaymentModal(false); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button onClick={processPayment} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Complete Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {showPostVoidModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
                        <h5 style={{ fontWeight: 800, marginBottom: '8px' }}>Request Post-Void</h5>
                        <p style={{ color: '#64748B', marginBottom: '16px', fontSize: '13px' }}>Enter a reason for supervisor review.</p>
                        <textarea placeholder="Reason..." value={postVoidReason} onChange={e => setPostVoidReason(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', minHeight: '100px', marginBottom: '16px', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} autoFocus />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowPostVoidModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button onClick={submitPostVoid} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#667eea', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sales;