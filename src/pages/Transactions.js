import React, { useState } from 'react';

const SAMPLE = [
    { id: 'TXN-1', total: 250, status: 'Completed' },
    { id: 'TXN-2', total: 100, status: 'Voided' },
];

function Transactions() {
    const [transactions] = useState(SAMPLE);

    return (
        <div>
            <h3 className="mb-3">Transactions</h3>

            <div className="card p-3">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>₱{t.total}</td>
                                <td>{t.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Transactions;