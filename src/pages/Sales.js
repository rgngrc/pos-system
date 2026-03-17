import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

// ✅ PRODUCTS_DB local constant REMOVED — now comes from shared context (US1 fix)
function Sales() {
    // ── UNCHANGED logic ───────────────────────────────────────────────────────
    const { products } = useContext(AuthContext); // US1: shared catalog from App.js
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [message, setMessage] = useState('');

    // ── US1: filter by active:true so inactive products never appear ──────────
    const results = products
        .filter(p => p.active) // ← US1 requirement: only active products
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode === search);

    // ── UNCHANGED cart logic ──────────────────────────────────────────────────
    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setSearch('');
    };

    const removeItem = (id) => setCart(cart.filter(i => i.id !== id));

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const completeSale = () => {
        setMessage(`Sale complete! ₱${total}`);
        setCart([]);
    };

    // ── UI helpers (display only) ─────────────────────────────────────────────
    const cardStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '22px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        border: '1px solid #F1F5F9'
    };

    const inputStyle = {
        borderRadius: '12px',
        border: '2px solid #E2E8F0',
        padding: '12px 16px 12px 44px',
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 800, color: '#1E293B', margin: 0, fontSize: '22px' }}>🛒 New Sale</h3>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0' }}>Only active products are searchable</p>
            </div>

            <div className="row g-3">
                <div className="col-md-8">
                    {/* Search Card */}
                    <div style={{ ...cardStyle, marginBottom: '16px' }}>
                        <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '14px', fontSize: '14px' }}>🔍 Product Search</h6>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '17px', pointerEvents: 'none' }}>🔍</span>
                            <input
                                style={inputStyle}
                                placeholder="Search by name or scan barcode..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onFocus={e => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.12)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#E2E8F0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {search && (
                            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {results.length > 0 ? results.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => addToCart(p)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '14px 18px',
                                            background: '#F8FAFC',
                                            borderRadius: '14px',
                                            border: '1.5px solid #E2E8F0',
                                            cursor: 'pointer',
                                            transition: 'all 0.18s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = '#EEF2FF';
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = '#F8FAFC';
                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#EEF2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>{p.name}</div>
                                                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px', fontFamily: 'monospace' }}>#{p.barcode}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: '#059669', fontSize: '16px' }}>₱{p.price}</div>
                                            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>tap to add</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '20px', background: '#FEF2F2', borderRadius: '14px', border: '1.5px solid #FECACA', color: '#EF4444', fontSize: '13.5px' }}>
                                        😔 No active products found for "<strong>{search}</strong>"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Card */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h6 style={{ fontWeight: 700, color: '#374151', margin: 0, fontSize: '14px' }}>🛒 Cart</h6>
                            {cart.length > 0 && <span style={{ background: '#EEF2FF', color: '#4F46E5', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 700 }}>{cart.length} item{cart.length > 1 ? 's' : ''}</span>}
                        </div>

                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: '14px', border: '1.5px dashed #E2E8F0' }}>
                                <div style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.4 }}>🛒</div>
                                <p style={{ color: '#CBD5E1', fontSize: '13.5px', margin: 0 }}>Cart is empty — search for products above</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {cart.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '13px 16px',
                                            background: idx % 2 === 0 ? '#F8FAFC' : 'white',
                                            borderRadius: '12px',
                                            border: '1.5px solid #F1F5F9'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '13px' }}>{item.qty}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '13.5px' }}>{item.name}</div>
                                                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '1px' }}>₱{item.price} × {item.qty}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontWeight: 800, color: '#059669', fontSize: '15px' }}>₱{item.price * item.qty}</span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                style={{
                                                    background: '#FEF2F2',
                                                    color: '#EF4444',
                                                    border: '1.5px solid #FECACA',
                                                    borderRadius: '8px',
                                                    padding: '5px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = '#EF4444';
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = '#FEF2F2';
                                                    e.currentTarget.style.color = '#EF4444';
                                                }}
                                            >
                                                Void
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="col-md-4">
                    <div style={{ ...cardStyle, position: 'sticky', top: '20px' }}>
                        <h6 style={{ fontWeight: 700, color: '#374151', marginBottom: '20px', fontSize: '14px' }}>💳 Order Summary</h6>

                        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '22px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 6px 20px rgba(102,126,234,0.4)' }}>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Total Amount</div>
                            <div style={{ color: 'white', fontSize: '34px', fontWeight: 900, letterSpacing: '-1px' }}>₱{total.toLocaleString()}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '6px' }}>{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</div>
                        </div>

                        <button
                            onClick={completeSale}
                            disabled={cart.length === 0}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: cart.length === 0 ? '#E2E8F0' : 'linear-gradient(135deg, #10B981, #059669)',
                                border: 'none',
                                borderRadius: '14px',
                                color: cart.length === 0 ? '#94A3B8' : 'white',
                                fontWeight: 700,
                                fontSize: '15px',
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                                marginBottom: '10px',
                                boxShadow: cart.length === 0 ? 'none' : '0 6px 18px rgba(16,185,129,0.4)',
                                transition: 'all 0.18s'
                            }}
                        >
                            ✅ Complete Sale
                        </button>

                        <button
                            onClick={() => setCart([])}
                            disabled={cart.length === 0}
                            style={{
                                width: '100%',
                                padding: '13px',
                                background: 'transparent',
                                border: '2px solid #E2E8F0',
                                borderRadius: '14px',
                                color: '#94A3B8',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.18s'
                            }}
                            onMouseEnter={e => {
                                if (cart.length > 0) {
                                    e.currentTarget.style.borderColor = '#EF4444';
                                    e.currentTarget.style.color = '#EF4444';
                                    e.currentTarget.style.background = '#FEF2F2';
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.color = '#94A3B8';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            🗑️ Cancel / Clear
                        </button>

                        {message && (
                            <div style={{ marginTop: '14px', background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: '12px', padding: '14px 16px', color: '#065F46', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🎉 {message}
                            </div>
                        )}

                        {cart.length > 0 && (
                            <div style={{ marginTop: '16px', borderTop: '1.5px solid #F1F5F9', paddingTop: '16px' }}>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748B', marginBottom: '5px' }}>
                                        <span>{item.name} ×{item.qty}</span>
                                        <span style={{ fontWeight: 600 }}>₱{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sales;