import React, { useContext } from 'react';
import { AuthContext } from '../App';

function Transactions() {
    const { auditLog } = useContext(AuthContext);

    return (
        <div>
            <h3 className="mb-3">Transactions</h3>

            <div className="card p-3">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Cashier</th>
                            <th>Total</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLog.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center">
                                    No transactions logged yet.
                                </td>
                            </tr>
                        ) : (
                            auditLog.map(t => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td>{t.type}</td>
                                    <td>{t.cashier}</td>
                                    <td>₱{t.total}</td>
                                    <td>{new Date(t.time).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Transactions;