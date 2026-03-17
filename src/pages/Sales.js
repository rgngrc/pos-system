import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';

const PRODUCTS_DB = [
    { id: 1, name: 'Rice (5kg)', barcode: '1001', price: 250 },
    { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85 },
];

function Sales() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [message, setMessage] = useState('');
    const [modal, setModal] = useState({ open: false, type: '', item: null, reason: '', error: '' });

    const { user, auditLog, setAuditLog } = useContext(AuthContext);

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

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const openVoidModal = (item) => {
        setModal({ open: true, type: 'void', item, reason: '', error: '' });
    };

    const openCancelModal = () => {
        setModal({ open: true, type: 'cancel', item: null, reason: '', error: '' });
    };

    const closeModal = () => setModal({ open: false, type: '', item: null, reason: '', error: '' });

    const confirmVoid = () => {
        if (!modal.reason.trim()) {
            setModal(m => ({ ...m, error: 'Reason is required.' }));
            return;
        }

        const cashierName = user?.name || user?.username || 'Unknown';
        const timestamp = new Date().toISOString();
        const amount = modal.item.price * modal.item.qty;

        setCart(cart.filter(i => i.id !== modal.item.id));
        setMessage(`Voided ${modal.item.name} (reason: ${modal.reason.trim()})`);
        setAuditLog([{
            id: `VOID-${Date.now()}`,
            type: 'Voided Item',
            cashier: cashierName,
            item: modal.item.name,
            qty: modal.item.qty,
            amount,
            reason: modal.reason.trim(),
            time: timestamp,
        }, ...auditLog]);
        closeModal();
    };

    const cancelSale = () => {
        if (cart.length === 0) {
            setMessage('No items to cancel.');
            closeModal();
            return;
        }

        const cashierName = user?.name || user?.username || 'Unknown';
        const timestamp = new Date().toISOString();
        const canceledTotal = total;

        setAuditLog([{
            id: `CANCEL-${Date.now()}`,
            type: 'Canceled Sale',
            cashier: cashierName,
            total: canceledTotal,
            items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, amount: i.price * i.qty })),
            time: timestamp,
        }, ...auditLog]);

        setCart([]);
        setMessage('Sale cancelled.');
        closeModal();
    };

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
                                        onClick={() => openVoidModal(item)}>Void</button>
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
                            onClick={openCancelModal}>
                            Cancel
                        </button>

                        {message && <div className="alert alert-success mt-2">{message}</div>}

                        {modal.open && (
                            <div
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    backgroundColor: 'rgba(0,0,0,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1050,
                                }}
                            >
                                <div className="card" style={{ minWidth: 320, maxWidth: 520 }}>
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            {modal.type === 'void' ? 'Void item' : 'Cancel sale'}
                                        </h5>
                                        <button type="button" className="btn-close" onClick={closeModal} />
                                    </div>
                                    <div className="card-body">
                                        <p>
                                            {modal.type === 'void'
                                                ? `Are you sure you want to void ${modal.item?.name} x${modal.item?.qty}?`
                                                : 'Are you sure you want to cancel the entire sale?'}
                                        </p>
                                        {modal.type === 'void' && (
                                            <>
                                                <label className="form-label">Reason</label>
                                                <textarea
                                                    className="form-control"
                                                    value={modal.reason}
                                                    onChange={e => setModal(m => ({ ...m, reason: e.target.value, error: '' }))}
                                                />
                                                {modal.error && (
                                                    <div className="text-danger small mt-1">{modal.error}</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="card-footer text-end">
                                        <button className="btn btn-outline-secondary me-2" onClick={closeModal}>
                                            Close
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={modal.type === 'void' ? confirmVoid : cancelSale}
                                        >
                                            {modal.type === 'void' ? 'Void' : 'Cancel'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sales;