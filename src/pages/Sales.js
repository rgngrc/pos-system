import React, { useState } from 'react';

const PRODUCTS_DB = [
    { id: 1, name: 'Rice (5kg)', barcode: '1001', price: 250 },
    { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85 },
];

function Sales() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [message, setMessage] = useState('');

    const results = PRODUCTS_DB.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode === search
    );

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

    return (
        <div>
            <h3 className="mb-3">New Sale</h3>

            <div className="row">
                <div className="col-md-8">
                    <div className="card p-3 mb-3">
                        <input className="form-control"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />

                        {results.map(p => (
                            <div key={p.id}
                                className="d-flex justify-content-between mt-2 p-2 border"
                                onClick={() => addToCart(p)}>
                                <span>{p.name}</span>
                                <span>₱{p.price}</span>
                            </div>
                        ))}
                    </div>

                    <div className="card p-3">
                        <h5>Cart</h5>
                        {cart.map(item => (
                            <div key={item.id} className="d-flex justify-content-between">
                                <span>{item.name} x{item.qty}</span>
                                <span>
                                    ₱{item.price * item.qty}
                                    <button className="btn btn-sm btn-danger ms-2"
                                        onClick={() => removeItem(item.id)}>Void</button>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card p-3">
                        <h5>Total</h5>
                        <h3>₱{total}</h3>

                        <button className="btn btn-dark w-100 mt-2" onClick={completeSale}>
                            Complete Sale
                        </button>

                        <button className="btn btn-outline-dark w-100 mt-2"
                            onClick={() => setCart([])}>
                            Cancel
                        </button>

                        {message && <div className="alert alert-success mt-2">{message}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sales;