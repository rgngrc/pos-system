import React, { useState } from 'react';

const PRODUCTS_DB = [
    { id: 1, name: 'Rice (5kg)', barcode: '1001', price: 250, stock: 40 },
    { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85, stock: 10 },
    { id: 3, name: 'Sugar (1kg)', barcode: '1003', price: 65, stock: 20 },
    { id: 4, name: 'Canned Tuna', barcode: '1004', price: 35, stock: 50 },
];

function Sales() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [message, setMessage] = useState('');

    const results = search.length > 0
        ? PRODUCTS_DB.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode === search)
        : [];

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
        if (cart.length === 0) { setMessage('Cart is empty!'); return; }
        setMessage(`Sale complete! Total: ₱${total.toFixed(2)}`);
        setCart([]);
    };

    return (
        <div>
            <h1 style={s.h1}>New Sale</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

                <div>
                    <div style={s.card}>
                        <label style={s.label}>Search product or scan barcode</label>
                        <input style={{ ...s.input, width: '100%' }} placeholder="Product name or barcode..."
                            value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                        {results.map(p => (
                            <div key={p.id} style={s.searchResult} onClick={() => addToCart(p)}>
                                <span>{p.name}</span>
                                <span style={{ color: '#1D9E75', fontWeight: '700' }}>₱{p.price}</span>
                            </div>
                        ))}
                    </div>

                    <div style={s.card}>
                        <h2 style={s.h2}>Cart Items</h2>
                        {cart.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>No items added yet</p>}
                        {cart.map(item => (
                            <div key={item.id} style={s.cartRow}>
                                <span>{item.name} x{item.qty}</span>
                                <span>₱{(item.price * item.qty).toFixed(2)}</span>
                                <button style={s.voidBtn} onClick={() => removeItem(item.id)}>Void</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={s.card}>
                    <h2 style={s.h2}>Order Summary</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span>Subtotal</span><span>₱{total.toFixed(2)}</span>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', padding: '16px 0', borderTop: '2px solid #e2e8f0', marginTop: '12px' }}>
                        TOTAL: ₱{total.toFixed(2)}
                    </div>
                    {message && <p style={{ color: '#1D9E75', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>{message}</p>}
                    <button style={{ ...s.btn, width: '100%', marginTop: '16px' }} onClick={completeSale}>Complete Sale</button>
                    <button style={{ ...s.btnOutline, width: '100%', marginTop: '8px' }} onClick={() => { setCart([]); setMessage(''); }}>Cancel Sale</button>
                </div>

            </div>
        </div>
    );
}

const s = {
    h1: { fontSize: '24px', fontWeight: '700', marginBottom: '24px' },
    h2: { fontSize: '16px', fontWeight: '700', marginBottom: '14px' },
    card: { background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#4a5568' },
    input: { padding: '10px 14px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px' },
    searchResult: { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', marginTop: '6px', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
    cartRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f4f8', fontSize: '14px' },
    voidBtn: { padding: '3px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    btn: { padding: '12px', background: '#1b263b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
    btnOutline: { padding: '12px', background: 'white', color: '#1b263b', border: '1px solid #1b263b', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};

export default Sales;