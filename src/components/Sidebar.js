import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', roles: ['Cashier', 'Supervisor', 'Administrator'] },
    { path: '/sales', label: 'New Sale', roles: ['Cashier'] },
    { path: '/discounts', label: 'Discounts', roles: ['Cashier'] },
    { path: '/transactions', label: 'Transactions', roles: ['Cashier', 'Supervisor'] },
    { path: '/products', label: 'Products', roles: ['Administrator'] },
];

function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const visibleItems = NAV_ITEMS.filter(item =>
        item.roles.includes(user?.role)
    );

    return (
        <div className="bg-dark text-white p-3" style={{ width: '220px' }}>
            <h5 className="mb-4">SariPh Retail Store</h5>

            <div className="mb-3">
                <div className="fw-bold">{user?.name}</div>
                <small className="text-light">{user?.role}</small>
            </div>

            <ul className="nav flex-column">
                {visibleItems.map(item => (
                    <li key={item.path} className="nav-item">
                        <button
                            className={`btn w-100 text-start mb-2 ${location.pathname === item.path ? 'btn-secondary' : 'btn-outline-light'
                                }`}
                            onClick={() => navigate(item.path)}
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>

            <button className="btn btn-outline-light mt-auto w-100" onClick={logout}>
                Logout
            </button>
        </div>
    );
}

export default Sidebar;