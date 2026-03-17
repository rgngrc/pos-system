import React, { useContext } from 'react';
import { AuthContext } from '../App';

function Dashboard() {
    const { user } = useContext(AuthContext);

    const cards = [
        { label: 'Sales Today', value: '₱12,480' },
        { label: 'Transactions', value: '34' },
        { label: 'Items Sold', value: '128' },
    ];

    return (
        <div>
            <h3>Welcome, {user?.name}</h3>
            <p className="text-muted">Role: {user?.role}</p>

            <div className="row">
                {cards.map(card => (
                    <div className="col-md-4 mb-3" key={card.label}>
                        <div className="card p-3 shadow-sm">
                            <small className="text-muted">{card.label}</small>
                            <h4>{card.value}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;