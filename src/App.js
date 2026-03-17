import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Sales from './pages/Sales';
import Discounts from './pages/Discounts';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';

export const AuthContext = React.createContext(null);

const INITIAL_USERS = [
  { id: 1, username: 'cashier1', password: 'pass123', role: 'Cashier', name: 'Juan dela Cruz', active: true },
  { id: 2, username: 'supervisor1', password: 'pass123', role: 'Supervisor', name: 'Maria Santos', active: true },
  { id: 3, username: 'admin1', password: 'pass123', role: 'Administrator', name: 'Pedro Reyes', active: true },
];

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [auditLog, setAuditLog] = useState([]);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, users, setUsers, auditLog, setAuditLog }}>
      <BrowserRouter>
        {user ? (
          <div className="d-flex min-vh-100 bg-light">
            <Sidebar />
            <div className="flex-grow-1 p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/users" element={<Users />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/discounts" element={<Discounts />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        )}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;