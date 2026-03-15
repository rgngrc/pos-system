import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

// Demo users (in real app this comes from backend)
const DEMO_USERS = [
    { username: 'cashier1', password: 'pass123', role: 'Cashier', name: 'Juan dela Cruz' },
    { username: 'supervisor1', password: 'pass123', role: 'Supervisor', name: 'Maria Santos' },
    { username: 'admin1', password: 'pass123', role: 'Administrator', name: 'Pedro Reyes' },
];

function Login() {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (!username || !password) {
            setError('Please enter username and password.');
            return;
        }
        const found = DEMO_USERS.find(
            u => u.username === username && u.password === password
        );
        if (found) {
            login(found);
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logo}>🏪</div>
                <h1 style={styles.title}>RetailPOS System</h1>
                <p style={styles.subtitle}>Sign in to continue</p>

                <div style={styles.field}>
                    <label style={styles.label}>Username</label>
                    <input
                        style={styles.input}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter username"
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        style={styles.input}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder="Enter password"
                    />
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button style={styles.btn} onClick={handleLogin}>Sign In</button>

                <div style={styles.hint}>
                    <p>Demo accounts (password: pass123)</p>
                    <p>cashier1 / supervisor1 / admin1</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { background: 'white', borderRadius: '16px', padding: '40px', width: '380px', border: '1px solid #e2e8f0' },
    logo: { fontSize: '40px', textAlign: 'center', marginBottom: '12px' },
    title: { fontSize: '22px', fontWeight: '700', textAlign: 'center', color: '#1b263b' },
    subtitle: { textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '28px' },
    field: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' },
    error: { color: '#E24B4A', fontSize: '13px', marginBottom: '12px' },
    btn: { width: '100%', padding: '12px', background: '#1b263b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
    hint: { marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#718096', textAlign: 'center', lineHeight: '1.8' },
};

export default Login;