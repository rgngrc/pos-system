import React, { useState } from 'react';

const INITIAL_PRODUCTS = [
    { id: 1, name: 'Rice (5kg)', barcode: '1001', price: 250, stock: 40, active: true },
    { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85, stock: 0, active: true },
    { id: 3, name: 'Sugar (1kg)', barcode: '1003', price: 65, stock: 20, active: false },
];

function Products() {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', barcode: '', price: '', stock: '' });
    const [error, setError] = useState('');

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search)
    );

    const addProduct = () => {
        if (!form.name || !form.barcode || !form.price || !form.stock) {
            setError('All fields are required.'); return;
        }
        if (products.some(p => p.barcode === form.barcode)) {
            setError('Barcode must be unique.'); return;
        }
        const newProduct = { id: Date.now(), ...form, price: +form.price, stock: +form.stock, active: true };
        setProducts([...products, newProduct]);
        setForm({ name: '', barcode: '', price: '', stock: '' });
        setError('');
    };

    const toggleActive = (id) => {
        setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    return (
        <div>
            <h1 style={s.h1}>Product Management</h1>

            <div style={s.card}>
                <h2 style={s.h2}>Add New Product</h2>
                <div style={s.grid4}>
                    {[
                        ['name', 'Product Name', 'text'],
                        ['barcode', 'Barcode', 'text'],
                        ['price', 'Price (₱)', 'number'],
                        ['stock', 'Stock Qty', 'number'],
                    ].map(([key, label, type]) => (
                        <div key={key}>
                            <label style={s.label}>{label}</label>
                            <input type={type} style={s.input} value={form[key]}
                                onChange={e => setForm({ ...form, [key]: e.target.value })} />
                        </div>
                    ))}
                </div>
                {error && <p style={s.error}>{error}</p>}
                <button style={s.btn} onClick={addProduct}>Add Product</button>
            </div>

            <div style={s.card}>
                <input style={{ ...s.input, marginBottom: '16px', width: '100%' }}
                    placeholder="Search by name or barcode..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <table style={s.table}>
                    <thead><tr>
                        {['Name', 'Barcode', 'Price', 'Stock', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td style={s.td}>{p.name}</td>
                                <td style={s.td}>{p.barcode}</td>
                                <td style={s.td}>₱{p.price}</td>
                                <td style={s.td}>
                                    {p.stock === 0 ? <span style={s.badgeRed}>Out of stock</span> : p.stock}
                                </td>
                                <td style={s.td}>
                                    <span style={p.active ? s.badgeGreen : s.badgeGray}>
                                        {p.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={s.td}>
                                    <button style={s.btnSm} onClick={() => toggleActive(p.id)}>
                                        {p.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const s = {
    h1: { fontSize: '24px', fontWeight: '700', marginBottom: '24px' },
    h2: { fontSize: '16px', fontWeight: '700', marginBottom: '16px' },
    card: { background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '12px' },
    label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' },
    input: { padding: '8px 12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '100%' },
    error: { color: '#E24B4A', fontSize: '13px', marginBottom: '8px' },
    btn: { padding: '10px 20px', background: '#1b263b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    btnSm: { padding: '4px 12px', background: '#415a77', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px 14px', background: '#f8fafc', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#4a5568', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '10px 14px', fontSize: '14px', borderBottom: '1px solid #f0f4f8' },
    badgeGreen: { background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    badgeGray: { background: '#f1f5f9', color: '#64748b', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    badgeRed: { background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
};

export default Products;