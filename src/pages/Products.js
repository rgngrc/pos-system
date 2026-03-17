import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

const INITIAL_PRODUCTS = [
    { id: 1, name: 'Rice (5kg)', barcode: '1001', price: 250, stock: 40, active: true },
    { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85, stock: 0, active: true },
    { id: 3, name: 'Sugar (1kg)', barcode: '1003', price: 65, stock: 20, active: false },
];

function Products() {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'Administrator';
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', barcode: '', price: '', stock: '' });
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', barcode: '', price: '', stock: '' });

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search)
    );

    const addProduct = () => {
        if (!isAdmin) {
            setError('Only administrators can add products.');
            return;
        }
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
        if (!isAdmin) {
            setError('Only administrators can change product status.');
            return;
        }
        setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    const startEditing = (product) => {
        if (!isAdmin) return;
        setEditingId(product.id);
        setEditForm({
            name: product.name,
            barcode: product.barcode,
            price: product.price,
            stock: product.stock,
        });
        setError('');
    };

    const saveEdit = (id) => {
        if (!isAdmin) return;
        if (!editForm.name || !editForm.barcode || editForm.price === '' || editForm.stock === '') {
            setError('All fields are required to update product.');
            return;
        }
        if (products.some(p => p.barcode === editForm.barcode && p.id !== id)) {
            setError('Barcode must be unique.');
            return;
        }
        setProducts(products.map(p =>
            p.id === id ? { ...p, name: editForm.name, barcode: editForm.barcode, price: +editForm.price, stock: +editForm.stock } : p
        ));
        setEditingId(null);
        setError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setError('');
    };

    return (
        <div>
            <h3 className="mb-4">Product Management</h3>

            {isAdmin ? (
                <div className="card p-3 mb-4">
                    <h5>Add New Product</h5>
                    <div className="row g-2">
                        <div className="col-md-3">
                            <input className="form-control" placeholder="Name"
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control" placeholder="Barcode"
                                value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <input type="number" className="form-control" placeholder="Price"
                                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <input type="number" className="form-control" placeholder="Stock"
                                value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                        </div>
                    </div>

                    {error && <div className="alert alert-danger mt-2">{error}</div>}

                    <button className="btn btn-dark mt-2" onClick={addProduct}>Add Product</button>
                </div>
            ) : (
                <div className="alert alert-info mb-4">Log in as Administrator to modify products.</div>
            )}

            <div className="card p-3">
                <input className="form-control mb-3"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th><th>Barcode</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td>
                                    {editingId === p.id ? (
                                        <input className="form-control" value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                    ) : p.name}
                                </td>
                                <td>
                                    {editingId === p.id ? (
                                        <input className="form-control" value={editForm.barcode}
                                            onChange={e => setEditForm({ ...editForm, barcode: e.target.value })} />
                                    ) : p.barcode}
                                </td>
                                <td>
                                    {editingId === p.id ? (
                                        <input type="number" className="form-control" value={editForm.price}
                                            onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                                    ) : `₱${p.price}`}
                                </td>
                                <td>
                                    {editingId === p.id ? (
                                        <input type="number" className="form-control" value={editForm.stock}
                                            onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                                    ) : (p.stock === 0 ? <span className="text-danger">Out of stock</span> : p.stock)}
                                </td>
                                <td>{p.active ? 'Active' : 'Inactive'}</td>
                                <td>
                                    {isAdmin ? (
                                        editingId === p.id ? (
                                            <>
                                                <button className="btn btn-sm btn-success me-1"
                                                    onClick={() => saveEdit(p.id)}>Save</button>
                                                <button className="btn btn-sm btn-secondary"
                                                    onClick={cancelEdit}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-sm btn-primary me-1"
                                                    onClick={() => startEditing(p)}>Edit</button>
                                                <button className="btn btn-sm btn-secondary"
                                                    onClick={() => toggleActive(p.id)}>
                                                    {p.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </>
                                        )
                                    ) : (
                                        <span className="text-muted">Read-only</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Products;