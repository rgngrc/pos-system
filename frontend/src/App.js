import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Sales from './pages/Sales';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

export const AuthContext = React.createContext(null);

const INITIAL_USERS = [
  { id: 1, username: 'cashier1', password: 'pass123', role: 'Cashier', name: 'Juan dela Cruz', active: true },
  { id: 2, username: 'supervisor1', password: 'pass123', role: 'Supervisor', name: 'Maria Santos', active: true },
  { id: 3, username: 'admin1', password: 'pass123', role: 'Administrator', name: 'Pedro Reyes', active: true },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Rice (5kg)', barcode: '1001', price: 250, stock: 40, active: true },
  { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85, stock: 3, active: true },
  { id: 3, name: 'Sugar (1kg)', barcode: '1003', price: 65, stock: 20, active: false },
  { id: 4, name: 'Sardines (can)', barcode: '1004', price: 28, stock: 0, active: true },
  { id: 5, name: 'Instant Noodles', barcode: '1005', price: 15, stock: 80, active: true },
];

const INACTIVITY_MS = 15 * 60 * 1000;

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [auditLog, setAuditLog] = useState([]);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [productLog, setProductLog] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState({});

  // Sales & transaction state — shared between Sales.js, Transactions.js, Dashboard.js
  const [transactions, setTransactions] = useState([]);   // US5: completed sales
  const [lastReceipt, setLastReceipt] = useState(null); // US11: reprint
  const [voidLog, setVoidLog] = useState([]);   // US7: voided items
  const [cancelLog, setCancelLog] = useState([]);   // US8: canceled sales
  const [postVoidRequests, setPostVoidRequests] = useState([]);   // US9: post-void requests

  const login = (userData) => setUser(userData);
  const logout = useCallback(() => setUser(null), []);

  // US4: Auto-logout after inactivity
  useEffect(() => {
    if (!user) return;
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setAuditLog(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          actor: user.username,
          action: 'Auto-logged out due to inactivity (15 min)',
        }]);
        logout();
      }, INACTIVITY_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      users, setUsers,
      auditLog, setAuditLog,
      products, setProducts,
      productLog, setProductLog,
      loginAttempts, setLoginAttempts,
      transactions, setTransactions,
      lastReceipt, setLastReceipt,
      voidLog, setVoidLog,
      cancelLog, setCancelLog,
      postVoidRequests, setPostVoidRequests,
    }}>
      <BrowserRouter>
        {user ? (
          <div className="d-flex min-vh-100 bg-light">
            <Sidebar />
            <div className="flex-grow-1 p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sales" element={
                  <ProtectedRoute roles={['Cashier']}><Sales /></ProtectedRoute>
                } />
                <Route path="/transactions" element={
                  <ProtectedRoute roles={['Cashier', 'Supervisor']}><Transactions /></ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute roles={['Administrator']}><Products /></ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute roles={['Administrator']}><Users /></ProtectedRoute>
                } />
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

// In your login function, add this deduplication logic:

const handleLogin = async (e) => {
  e.preventDefault();

  // Find the user
  const foundUser = users.find(u => u.username === username && u.password === password);

  if (!foundUser) {
    setLoginError('Invalid username or password');
    return;
  }

  if (!foundUser.active) {
    setLoginError('Account is deactivated');
    return;
  }

  // Check if we already logged this user in the last 10 seconds (prevent duplicates)
  const recentLogin = auditLog.find(log =>
    log.type === 'Login' &&
    log.actor === username &&
    log.reason === 'Successful login' &&
    new Date() - new Date(log.timestamp) < 10000
  );

  // Only add login if there's no recent duplicate
  if (!recentLogin) {
    setAuditLog(prev => [...prev, {
      id: Date.now(),
      type: 'Login',
      status: 'Completed',
      actor: username,
      actorName: foundUser.name,
      itemName: `${foundUser.role} login`,
      itemQty: 1,
      total: 0,
      reason: 'Successful login',  // ← Make sure this is included
      timestamp: new Date().toISOString(),
    }]);
  }

  // Set user and redirect
  setUser(foundUser);
  setUsername('');
  setPassword('');
  setLoginError('');
};