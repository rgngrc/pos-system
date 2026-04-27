import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

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
                ⚠️ Only Cashiers can process sales.
            </div>
        );
    }

    const activeProducts = products.filter(p => p.active);
    const results = activeProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode === search
    );

    // ─── Cart Operations ──────────────────────────────────────────────────────

    const addToCart = (product) => {
        // Check if out of stock
        if (product.stock === 0) {
            setError('❌ Product is out of stock');
            return;
        }

        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            // Check if adding another would exceed stock
            if (existing.qty + 1 > product.stock) {
                setError(`❌ Only ${product.stock} available in stock`);
                return;
            }
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

        // Check stock limits
        if (newQty > product.stock) {
            setError(`❌ Only ${product.stock} available in stock`);
            return;
        }

        if (newQty < 1) return;

        setCart(cart.map(i =>
            i.id === id ? { ...i, qty: newQty } : i
        ));
        setError('');
    };

    const voidItem = (id) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        const reason = prompt(`Reason for voiding "${item.name}"?\n(e.g., Wrong Item, Damaged, Customer Changed Mind)`);
        if (!reason || !reason.trim()) return;

        // Log the voided item
        setAuditLog(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: 'Void Item',
            status: 'Pending',
            actor: user?.username,
            actorName: user?.name,
            itemName: item.name || 'Unknown Item',  // ← Ensure name is captured
            itemQty: item.qty,
            total: item.price * item.qty,
            reason: reason.trim(),
            timestamp: new Date().toISOString(),
        }]);

        // Remove from cart
        setCart(cart.filter(i => i.id !== id));
        alert(`✓ "${item.name}" voided and logged.`);
    };

    const cancelSale = () => {
        if (cart.length === 0) {
            alert('No sale to cancel');
            return;
        }
        if (!window.confirm('Cancel entire sale? This action will be logged.')) return;

        // Log each item in the canceled sale
        cart.forEach(item => {
            setAuditLog(prev => [...prev, {
                id: Date.now() + Math.random(),
                type: 'Canceled Sale',
                status: 'Pending',
                actor: user?.username,
                actorName: user?.name,
                itemName: item.name || 'Unknown Item',  // ← Ensure name is captured
                itemQty: item.qty,
                total: item.price * item.qty,
                reason: 'Sale canceled before payment',
                timestamp: new Date().toISOString(),
            }]);
        });

        setCart([]);
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
        setError('');
        alert('✓ Sale canceled and logged.');
    };

    // ─── Totals ───────────────────────────────────────────────────────────────

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discountAmount = discount ? subtotal * discount.rate : 0;
    const finalTotal = subtotal - discountAmount;

    // ─── Discount ─────────────────────────────────────────────────────────────

    const applyDiscount = () => {
        if (!selectedType) {
            setError('Please select a discount type');
            return;
        }
        if (!idNumber || idNumber.trim().length === 0) {
            setError('Please enter or scan an ID number');
            return;
        }

        const selectedDiscount = DISCOUNT_TYPES.find(d => d.type === selectedType);
        setDiscount({ ...selectedDiscount, id: idNumber });
        setError('');
        alert(`✓ ${selectedType} discount applied (${(selectedDiscount.rate * 100).toFixed(0)}% off)`);
    };

    const removeDiscount = () => {
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
    };

    // ─── Payment Processing ───────────────────────────────────────────────────

    const openPaymentModal = () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }
        setPaymentAmount('');
        setPaymentMethod('Cash');
        setShowPaymentModal(true);
        setError('');
    };

    const processPayment = () => {
        const amount = parseFloat(paymentAmount) || 0;

        if (amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amount < finalTotal) {
            setError(`❌ Insufficient payment. Total: ₱${finalTotal.toLocaleString()}, Received: ₱${amount.toLocaleString()}`);
            return;
        }

        setShowPaymentModal(false);
        completeSale(amount);
    };

    // ─── Complete Sale ────────────────────────────────────────────────────────

    const completeSale = (paidAmount) => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        // Create receipt record
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

        // Log each item as a completed sale
        cart.forEach(item => {
            setAuditLog(prev => [...prev, {
                id: Date.now() + Math.random(),
                type: 'Completed Sale',
                status: 'Completed',
                actor: user?.username,
                actorName: user?.name,
                itemName: item.name || 'Unknown Item',  // ← Ensure name is captured
                itemQty: item.qty,
                total: item.price * item.qty,
                reason: 'Sale completed',
                timestamp: new Date().toISOString(),
            }]);
        });

        // Update inventory
        setProducts(prev => prev.map(p => {
            const inCart = cart.find(i => i.id === p.id);
            return inCart ? { ...p, stock: Math.max(0, p.stock - inCart.qty) } : p;
        }));

        // Save receipt for reprinting
        localStorage.setItem('lastReceipt', JSON.stringify(newReceipt));
        setReceipt(newReceipt);
        setIsReprint(false);

        // Clear cart
        setCart([]);
        setDiscount(null);
        setSelectedType('');
        setIdNumber('');
        setPaymentAmount('');
        setPaymentMethod('Cash');
        setError('');
    };

    // ─── Post-Void (Supervisor Approval) ──────────────────────────────────────

    const openPostVoid = () => {
        const saved = localStorage.getItem('lastReceipt');
        if (!saved) {
            alert('No recent completed sale to post-void');
            return;
        }
        setShowPostVoidModal(true);
    };

    const submitPostVoid = () => {
        if (!postVoidReason.trim()) {
            alert('Please enter a reason for post-void');
            return;
        }

        const saved = localStorage.getItem('lastReceipt');
        const receipt = JSON.parse(saved);

        // Get list of product names from the receipt
        const productNames = receipt.items.map(item => item.name).join(', ');

        // Log post-void request with actual product names
        setAuditLog(prev => [...prev, {
            id: Date.now(),
            type: 'Post-Void Request',
            status: 'Pending',
            actor: user?.username,
            actorName: user?.name,
            itemName: productNames || 'Unknown Products',  // ← Use actual product names
            itemQty: receipt.items.length,
            total: receipt.finalTotal,
            reason: postVoidReason.trim(),
            timestamp: new Date().toISOString(),
            originalReceipt: receipt,
            transactionId: receipt.txId,  // ← Keep txId for reference
        }]);

        setShowPostVoidModal(false);
        setPostVoidReason('');
        alert('✓ Post-void request submitted for supervisor approval');
    };

    // ─── Reprint ──────────────────────────────────────────────────────────────

    const reprintReceipt = () => {
        const saved = localStorage.getItem('lastReceipt');
        if (!saved) {
            alert('No receipt to reprint');
            return;
        }

        const rec = JSON.parse(saved);

        // Log reprint action
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
        alert('✓ Receipt reprinted (marked as REPRINT)');
    };

    const maskId = (id) =>
        id && id.length > 4 ? '*'.repeat(id.length - 4) + id.slice(-4) : id;

    // ─── Styles ───────────────────────────────────────────────────────────────

    const card = { background: 'white', borderRadius: '18px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', marginBottom: '16px' };
    const inp = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none', marginBottom: '10px' };
    const btnPrimary = { width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' };
    const btnSecondary = { width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: 'white', color: '#1E293B', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' };
    const btnDanger = { width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' };

    // ─── Receipt Display ──────────────────────────────────────────────────────

    if (receipt) {
        return (
            <div style={card}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {isReprint && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '8px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>*** REPRINT ***</div>}
                    <h4 style={{ fontWeight: 800 }}>Store Receipt</h4>
                    <p style={{ color: '#94A3B8', fontSize: '12px' }}>{receipt.date}</p>
                    <p style={{ color: '#94A3B8', fontSize: '12px' }}>Cashier: {receipt.cashierName}</p>
                </div>

                <div style={{ borderTop: '2px dashed #E2E8F0', borderBottom: '2px dashed #E2E8F0', padding: '12px 0', marginBottom: '16px' }}>
                    {receipt.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                            <div>{item.name} x{item.qty}</div>
                            <div style={{ fontWeight: 700 }}>₱{(item.price * item.qty).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Subtotal:</span>
                        <span style={{ fontWeight: 700 }}>₱{receipt.subtotal.toLocaleString()}</span>
                    </div>
                    {receipt.discountType && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#10B981' }}>
                                <span>{receipt.discountType} ({(receipt.discountAmount / receipt.subtotal * 100).toFixed(0)}%):</span>
                                <span style={{ fontWeight: 700 }}>-₱{receipt.discountAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#94A3B8' }}>
                                <span>ID: {maskId(receipt.discountId)}</span>
                            </div>
                        </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '8px', borderRadius: '8px', fontWeight: 800, fontSize: '16px', marginTop: '12px' }}>
                        <span>TOTAL:</span>
                        <span>₱{receipt.finalTotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', marginTop: '8px' }}>
                        <span>Paid Amount:</span>
                        <span>₱{receipt.paidAmount.toLocaleString()}</span>
                    </div>
                    {receipt.change > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ECFDF5', padding: '8px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', marginTop: '8px', color: '#10B981' }}>
                            <span>Change:</span>
                            <span>₱{receipt.change.toLocaleString()}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                        <span>Payment Method:</span>
                        <span>{receipt.paymentMethod}</span>
                    </div>
                </div>

                <button onClick={() => { setReceipt(null); setCart([]); }} style={btnPrimary}>
                    ✓ New Sale
                </button>
                <button onClick={reprintReceipt} style={btnSecondary}>
                    🔄 Reprint Receipt
                </button>
            </div>
        );
    }

    // ─── Main Sales UI ────────────────────────────────────────────────────────

    return (
        <div className="row g-4">
            {/* Left: Search & Products */}
            <div className="col-lg-7">
                <div style={card}>
                    <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>🔍 Search Products</h5>
                    <input
                        type="text"
                        placeholder="Search by name or scan barcode..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={inp}
                        autoFocus
                    />
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {results.length > 0 ? results.map(p => (
                            <div key={p.id} onClick={() => addToCart(p)} style={{ background: p.stock === 0 ? '#FEF2F2' : '#F8FAFC', border: p.stock === 0 ? '1px solid #FECACA' : '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', marginBottom: '10px', cursor: p.stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: p.stock === 0 ? 0.6 : 1 }}
                                onMouseEnter={e => p.stock > 0 && (e.currentTarget.style.background = '#EEF2FF')}
                                onMouseLeave={e => e.currentTarget.style.background = p.stock === 0 ? '#FEF2F2' : '#F8FAFC'}>
                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                                    <span>₱{p.price.toLocaleString()}</span>
                                    <span style={{ color: p.stock === 0 ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                                        {p.stock === 0 ? '❌ Out of Stock' : `${p.stock} in stock`}
                                    </span>
                                </div>
                            </div>
                        )) : search ? <div style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>No products found</div> : <div style={{ color: '#CBD5E1', textAlign: 'center', padding: '40px', fontStyle: 'italic' }}>Start typing to search products...</div>}
                    </div>
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="col-lg-5">
                <div style={card}>
                    <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>🛒 Cart ({cart.length})</h5>

                    {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 600 }}>⚠️ {error}</div>}

                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                        {cart.length > 0 ? cart.map(item => (
                            <div key={item.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.name}</div>
                                    <button onClick={() => voidItem(item.id)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 600, transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}>
                                        Void
                                    </button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                    <div>
                                        <button onClick={() => updateQty(item.id, -1)} style={{ background: '#E2E8F0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#CBD5E1'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#E2E8F0'}>−</button>
                                        <span style={{ margin: '0 10px', fontWeight: 700 }}>{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} style={{ background: '#E2E8F0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#CBD5E1'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#E2E8F0'}>+</button>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>₱{(item.price * item.qty).toLocaleString()}</div>
                                </div>
                                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Max: {item.stock}</div>
                            </div>
                        )) : <div style={{ color: '#CBD5E1', textAlign: 'center', padding: '40px 20px', fontStyle: 'italic' }}>Cart is empty. Search and add products.</div>}
                    </div>

                    {cart.length > 0 && (
                        <>
                            {/* Discount Section */}
                            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                                <h6 style={{ fontWeight: 700, marginBottom: '10px', fontSize: '12px' }}>Apply Discount</h6>
                                {discount ? (
                                    <div style={{ background: '#ECFDF5', border: '1px solid #86EFAC', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '12px' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>✓ {discount.type}</div>
                                        <div style={{ color: '#64748B' }}>ID: {maskId(discount.id)}</div>
                                        <button onClick={removeDiscount} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, marginTop: '8px', width: '100%', transition: 'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}>
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ ...inp, marginBottom: '8px' }}>
                                            <option value="">Select discount type...</option>
                                            {DISCOUNT_TYPES.map(d => (
                                                <option key={d.type} value={d.type}>{d.type} ({(d.rate * 100).toFixed(0)}%)</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Enter or scan ID..."
                                            value={idNumber}
                                            onChange={e => setIdNumber(e.target.value)}
                                            style={{ ...inp, marginBottom: '8px' }}
                                        />
                                        <button onClick={applyDiscount} style={{ ...btnPrimary, marginBottom: '0' }}>
                                            Apply Discount
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Totals */}
                            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span>Subtotal:</span>
                                    <span style={{ fontWeight: 700 }}>₱{subtotal.toLocaleString()}</span>
                                </div>
                                {discount && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#10B981', fontWeight: 700 }}>
                                        <span>Discount:</span>
                                        <span>-₱{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#667eea', color: 'white', padding: '10px', borderRadius: '6px', fontWeight: 800, fontSize: '16px', marginTop: '8px' }}>
                                    <span>TOTAL:</span>
                                    <span>₱{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <button onClick={openPaymentModal} style={btnPrimary}>
                                💳 Proceed to Payment
                            </button>
                            <button onClick={openPostVoid} style={btnSecondary}>
                                ↩️ Request Post-Void
                            </button>
                            <button onClick={cancelSale} style={btnDanger}>
                                ✕ Cancel Sale
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
                        <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>💳 Payment</h5>

                        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                                <span color="#94A3B8">Subtotal:</span>
                                <span style={{ fontWeight: 700 }}>₱{subtotal.toLocaleString()}</span>
                            </div>
                            {discount && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: '#10B981' }}>
                                    <span>Discount:</span>
                                    <span style={{ fontWeight: 700 }}>-₱{discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                                <span>Total Amount:</span>
                                <span>₱{finalTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: 600 }}>⚠️ {error}</div>}

                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600 }}>Payment Method:</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '12px', outline: 'none' }}>
                            <option value="Cash">Cash</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="GCash">GCash</option>
                        </select>

                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600 }}>Amount Received:</label>
                        <input
                            type="number"
                            placeholder="Enter amount..."
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '13px', outline: 'none' }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowPaymentModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                Cancel
                            </button>
                            <button onClick={processPayment} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                onMouseLeave={e => e.currentTarget.style.background = '#10B981'}>
                                Complete Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post-Void Modal */}
            {showPostVoidModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
                        <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>Request Post-Void</h5>
                        <p style={{ color: '#64748B', marginBottom: '16px', fontSize: '13px' }}>Enter a reason for voiding this completed sale. A supervisor will review and approve/reject.</p>
                        <textarea
                            placeholder="Reason for post-void request..."
                            value={postVoidReason}
                            onChange={e => setPostVoidReason(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', minHeight: '100px', marginBottom: '16px', fontFamily: 'inherit', outline: 'none' }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowPostVoidModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                Cancel
                            </button>
                            <button onClick={submitPostVoid} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#667eea', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#764ba2'}
                                onMouseLeave={e => e.currentTarget.style.background = '#667eea'}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sales;