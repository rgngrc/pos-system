import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

function Login() {
    const { login, users } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (!username || !password) {
            setError('Please enter username and password.');
            return;
        }

        const found = users.find(
            u => u.username === username && u.password === password
        );

        if (!found) {
            setError('Invalid username or password.');
            return;
        }

        if (!found.active) {
            setError('This account is deactivated. Contact administrator.');
            return;
        }

        login(found);
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card p-4 shadow" style={{ width: '380px' }}>
                <div className="text-center mb-3">
                    <h2>SariPh Retail Store</h2>
                    <p className="text-muted">Sign in to continue</p>
                </div>

                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        className="form-control"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <button className="btn btn-dark w-100" onClick={handleLogin}>
                    Sign In
                </button>

                <div className="mt-3 text-center text-muted small">
                    cashier1 / supervisor1 / admin1
                </div>
            </div>
        </div>
    );
}

export default Login;